/**
 * AuthController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 * @routes      ::
 * post /login
 * post /users/verify-user
 * post /users/verify-new-ip'
 * post /users/send-verification-email
 * post /users/forgotPassword
 * put /users/resetPassword
 * post /users/send-otp-email
 * post /logout
 */
var randomize = require('randomatic');
var speakeasy = require('speakeasy');
const moment = require('moment');
var requestIp = require('request-ip');
var logger = require('./logger');


module.exports = {
  // Verify User Api

  /**
   * API for verifying user
   * Renders this api when user needs to be verified
   *
   * @param <email_verify_token ,email, password, firstname, lastname>
   *
   * @return <verification success message or error data>
   */

  verifyUser: async function (req, res) {
    try {

      if (req.body.email_verify_token) {
        let user = await Users.findOne({
          email_verify_token: req.body.email_verify_token
        });
        if (user) {
          var today = moment().utc().format();
          var yesterday = moment(user.signup_token_expiration).format();
          if (yesterday < today) {
            return res.status(400).json({
              "status": 400,
              "err": sails.__("Verification Expired").message
            })
          }
          let hubspotcontact = await sails
            .helpers
            .hubspot
            .contacts
            .create(user.first_name, user.last_name, user.email)
            .tolerate("serverError", () => {
              throw new Error("serverError");
            });
          await Users
            .update({
              id: user.id,
              deleted_at: null
            })
            .set({
              email: user.email,
              is_verified: true,
              is_new_email_verified: true,
              email_verify_token: null,
              // hubspot_id: hubspotcontact
            });
          await KYC
            .update({
              user_id: user.id
            })
            .set({
              first_name: user.first_name,
              last_name: user.last_name
            });
          // Create Receive Address
          await sails
            .helpers
            .wallet
            .receiveAddress(user);
          return res.json({
            message: sails.__("Verification successfull.").message,
            "status": 200,
            "message": sails.__('Verify User').message
          });
        } else {
          return res
            .status(400)
            .json({
              "status": 400,
              "err": sails.__('Invalid Token').message
            });
        }
      }
    } catch (error) {
      // await logger.error(error.message)
      return res
        .status(500)
        .json({
          "status": 500,
          "err": sails.__("Something Wrong").message,
          error_at: error.stack
        });
    }
  },

  /**
   * API for user login
   * Renders this api when user needs to login
   *
   * @param <email , password>
   *
   * @return <login success message and login token or error data>
   */

  login: async function (req, res) {
    try {

      if (req.body.email && req.body.password) {
        let query = {
          email: req
            .body
            .email
            .toLowerCase(),
          password: req.body.password
        }

        var user_detail = await Users.findOne({
          email: query.email
        });

        if (user_detail) {
          if (user_detail.deleted_at && user_detail.deleted_by == 2) {
            return res.status(403).json({
              "status": 403,
              err: sails.__('Deleted By Admin').message
            });
          }
          if (user_detail.deleted_at && user_detail.deleted_by == 1) {
            return res.status(403).json({
              "status": 403,
              err: sails.__('Deleted By User').message
            });
          }

          Users
            .comparePassword(query.password, user_detail, async function (err, valid) {
              if (err) {
                return res.status(403).json({
                  "status": 403,
                  err: sails.__('Forbidden').message
                });
              }

              if (!valid) {
                return res
                  .status(401)
                  .json({
                    "status": 401,
                    "err": sails.__("Invalid email or password").message
                  });
              } else {
                if (user_detail.is_verified == false) {
                  return res
                    .status(402)
                    .json({
                      "status": 402,
                      "err": sails.__("Account_Not_Verified").message
                    });
                }
                if (user_detail) {
                  if (user_detail.is_new_email_verified == false) {
                    return res
                      .status(405)
                      .json({
                        "status": 405,
                        "err": sails.__("To continue, please verify your new email address.").message
                      });
                  }
                }
                // if (user_detail.is_twofactor && user_detail.twofactor_secret) {
                //   if (!req.body.otp) {
                //     return res
                //       .status(201)
                //       .json({
                //         "status": 201,
                //         "err": sails.__("Please enter OTP to continue").message
                //       });
                //   }
                //   let verified = speakeasy
                //     .totp
                //     .verify({
                //       secret: user_detail.twofactor_secret,
                //       encoding: 'base32',
                //       token: req.body.otp,
                //       window: 2
                //     });
                //   if (!verified) {
                //     return res
                //       .status(402)
                //       .json({
                //         "status": 402,
                //         "err": sails.__("invalid otp").message
                //       });
                //   }
                // }
                // If Enter 2fa backup code
                if (req.body.twofactor_backup_code) {
                  if (!req.body.twofactor_backup_code) {
                    return res
                      .status(201)
                      .json({
                        "status": 201,
                        "err": sails.__("Please enter Twofa Backup code to continue").message
                      });
                  }
                  if (user_detail.twofactor_backup_code != req.body.twofactor_backup_code) {
                    return res
                      .status(402)
                      .json({
                        "status": 402,
                        "err": sails.__("Invalid twofa backup code").message
                      });
                  }
                } else if (user_detail.is_twofactor && user_detail.twofactor_secret) {
                  if (!req.body.otp) {
                    return res
                      .status(201)
                      .json({
                        "status": 201,
                        "err": sails.__("Please enter OTP to continue").message
                      });
                  }
                  let verified = speakeasy
                    .totp
                    .verify({
                      secret: user_detail.twofactor_secret,
                      encoding: 'base32',
                      token: req.body.otp,
                      window: 2
                    });
                  if (!verified) {
                    return res
                      .status(402)
                      .json({
                        "status": 402,
                        "err": sails.__("invalid otp").message
                      });
                  }
                }

                var dataResponse = await sails
                  .helpers
                  .userTradeChecking(user_detail.id);
                user_detail.is_allowed = dataResponse;

                delete user_detail.password;
                // Create Receive Address await
                // sails.helpers.wallet.receiveAddress(user_detail); Generating JWT Token
                var token = await sails
                  .helpers
                  .jwtIssue(user_detail.id);
                var ip = requestIp.getClientIp(req); // on localhost > 127.0.0.1

                var check_any_whitelistip = {
                  user_id: user_detail.id,
                  user_type: 2,
                  deleted_at: null
                };

                var check_whitelist_data = await IPWhitelist.find(check_any_whitelistip);

                if (user_detail.is_whitelist_ip == true && check_whitelist_data.length > 0) {
                  check_any_whitelistip.ip = ip;

                  var check_whitelist = await IPWhitelist.findOne(check_any_whitelistip);
                  if (check_whitelist != undefined) {
                    if (check_whitelist.days != 0) {
                      var current_datetime = moment().valueOf();
                      if (current_datetime > check_whitelist.expire_time) {
                        return res
                          .status(401)
                          .json({
                            "status": 401,
                            "err": sails.__("Time for whitelist has been expired.").message
                          });
                      }
                    }
                  } else {
                    return res
                      .status(401)
                      .json({
                        "status": 401,
                        "err": sails.__("Your IP has not been whitelisted. Please whitelist your IP to continue.").message
                      });
                  }
                }

                // Check For New Ip
                let loginData = await LoginHistory.find({
                  user: user_detail.id,
                  ip: ip
                });
                if (loginData.length > 0 || req.body.device_type == 1 || req.body.device_type == 2) {
                  var today = moment().utc().format();
                  var yesterday = moment(user_detail.device_token_expiration).format();
                  if (yesterday < today) {
                    return res.status(400).json({
                      "status": 400,
                      "err": sails.__("Verification Expired").message
                    })
                  }
                  await LoginHistory.create({
                    user: user_detail.id,
                    ip: ip,
                    created_at: new Date(),
                    device_type: req.body.device_type,
                    jwt_token: token,
                    device_token: req.body.device_token ?
                      req.body.device_token : null
                  });

                  return res.status(200).json({
                    status: 200,
                    user: user_detail,
                    token,
                    message: sails.__("Welcome back").message + ", " + user_detail.first_name + "!"
                  });
                } else {
                  let verifyToken = randomize("Aa0", 15);
                  await Users
                    .update({
                      id: user_detail["id"]
                    })
                    .set({
                      email: user_detail["email"],
                      new_ip_verification_token: verifyToken,
                      new_ip: ip,
                      device_token_expiration: moment().utc().add(process.env.DEVICE_TOKEN_DURATION, 'minutes')
                    });

                  let slug = "new_ip_verification"
                  let template = await EmailTemplate.findOne({
                    slug
                  });

                  // Notification Sending for users
                  var userNotification = await UserNotification.findOne({
                    user_id: user_detail["id"],
                    deleted_at: null,
                    slug: 'login_new_ip'
                  })
                  if (userNotification != undefined) {
                    if (userNotification.email == true || userNotification.email == "true") {
                      if (user_detail.email != undefined)
                        await sails.helpers.notification.send.email("login_new_ip", user_detail)
                    }
                    if (userNotification.text == true || userNotification.text == "true") {
                      if (user_detail.phone_number && user_detail.phone_number != undefined && user_detail.phone_number != null && user_detail.phone_number != '')
                        await sails.helpers.notification.send.text("login_new_ip", user_detail)
                    }
                  }

                  let emailContent = await sails.helpers.utilities.formatEmail(template.content, {
                    homeLink: sails.config.urlconf.APP_URL,
                    recipientName: user_detail.first_name,
                    token: verifyToken,
                    ip: ip
                  })

                  sails
                    .hooks
                    .email
                    .send("general-email", {
                      content: emailContent
                    }, {
                      to: user_detail["email"],
                      subject: "New Device Confirmation"
                    }, function (err) {
                      if (!err) {
                        return res
                          .status(202)
                          .json({
                            "status": 202,
                            "err": sails.__("New device confirmation email sent to your email.").message
                          });
                      } else {
                        return res
                          .status(500)
                          .json({
                            "status": 500,
                            "err": sails.__("Something Wrong").message,
                            error_at: sails.__("Something Wrong").message
                          });
                      }
                    });
                }
              }
            });

          // please verify your new email address." });   } }
          if (user_detail.is_active == false) {
            return res
              .status(403)
              .json({
                "status": 403,
                "err": sails.__("Contact Admin").message
              });
          }
        } else {
          res
            .status(401)
            .json({
              "status": 401,
              "err": sails.__("Invalid email or password").messsage
            });
          return;
        }
      } else {
        res
          .status(401)
          .json({
            "status": 401,
            "err": sails.__("Email or password is not sent").message
          });
        return;
      }
    } catch (error) {
      // console.log('login ', error);
      // await logger.error(error.message)
      return res
        .status(500)
        .json({
          "status": 500,
          "err": sails.__("Something Wrong").message,
          "error_at": error.stack
        });
    }
  },

  /**
   * API for verifying user login by new ip
   * Renders this api when user logins form new device
   *
   * @param <token , email ,password>
   *
   * @return <login success message and jwt token or error data>
   */

  verifyNewIp: async function (req, res) {
    try {
      // var ip;
      // if (req.headers['x-forwarded-for']) {
      //   ip = req
      //     .headers['x-forwarded-for']
      //     .split(",")[0];
      // } else if (req.connection && req.connection.remoteAddress) {
      //   ip = req.connection.remoteAddress;
      // } else {
      //   ip = req.ip;
      // }
      var ip = requestIp.getClientIp(req); // on localhost > 127.0.0.1
      if (req.body.token) {

        let user_detail = await Users.findOne({
          new_ip: ip,
          new_ip_verification_token: req.body.token
        });



        if (user_detail) {

          if (user_detail.deleted_at && user_detail.deleted_by == 2) {
            return res.status(403).json({
              "status": 403,
              err: sails.__('Deleted By Admin').message
            });
          }
          if (user_detail.deleted_at && user_detail.deleted_by == 1) {
            return res.status(403).json({
              "status": 403,
              err: sails.__('Deleted By User').message
            });
          }

          if (user_detail.is_verified == false || user_detail.is_verified == "false") {
            return res.status(403).json({
              "status": 403,
              err: sails.__("account not not verified by admin").message
            })
          }

          if (user_detail.is_twofactor && user_detail.twofactor_secret) {

            await Users
              .update({
                id: user_detail.id
              }).set({
                new_ip_verification_token: null
              })

            await LoginHistory.create({
              user: user_detail.id,
              ip: ip,
              created_at: new Date()
            });
            return res.status(201).json({
              "status": 201,
              message: sails.__("account verify success").message
            })
          }
          // await Users.update({   id: user_detail.id }).set({   new_ip: null,
          // new_ip_verification_token: null,   email: user_detail.email });
          await LoginHistory.create({
            user: user_detail.id,
            ip: ip,
            created_at: new Date(),
            device_type: req.body.device_type,
            jwt_token: token,
            device_token: req.body.device_token ?
              req.body.device_token : null
          });
          var token = await sails
            .helpers
            .jwtIssue(user_detail.id);
          return res.json({
            status: 200,
            user: user_detail,
            token,
            message: sails.__("Welcome back").message + ", " + user_detail.first_name + "!"
          });
        }
      }
      return res
        .status(401)
        .json({
          "status": 401,
          "err": sails.__("Invalid verification token").message
        });
    } catch (error) {
      // await logger.error(error.message)
      return res
        .status(500)
        .json({
          "status": 500,
          "err": sails.__("Something Wrong").message,
          error_at: error.stack
        });
    }
  },

  /**
   * API for sending otp to email
   * Renders this api when user needs to be verified through email
   *
   * @param <email>
   *
   * @return <mail to user with otp or error data>
   */

  sendOtpEmail: async function (req, res) {
    let {
      email
    } = req.allParams();
    let user = await Users.findOne({
      email: email,
      deleted_at: null
    });
    if (!user) {
      return res
        .status(401)
        .json({
          "status": 401,
          "err": sails.__("Invalid Email").message
        });
    }
    if (!user.is_active) {
      return res
        .status(403)
        .json({
          "status": 403,
          "err": sails.__("Contact Admin").message
        });
    }

    await Users
      .update({
        id: user.id
      })
      .set({
        email: user.email,
        auth_code: randomize('0', 6)
      });

    // send code in email

    let slug = "verification_code"
    let template = await EmailTemplate.findOne({
      slug
    });
    let emailContent = await sails
      .helpers
      .utilities
      .formatEmail(template.content, {
        recipientName: admin_details.name,
        code: user.auth_code
      });
    sails
      .hooks
      .email
      .send("general-email", {
        content: emailContent
      }, {
        to: user.email,
        subject: "Authentication Code"
      }, function (error) {
        if (!error) {
          return res.json({
            "status": 200,
            "message": sails.__("Authentication code sent to email successfully").message
          });
        } else {
          return res
            .status(500)
            .json({
              "status": 500,
              "err": sails.__("Something Wrong").message,
              error_at: error.stack
            });
        }
      })
  },

  /**
   * API for verifying user email otp
   * Renders this api when user needs to be verified through email otp
   *
   * @param <email , otp>
   *
   * @return <Coin node Info or error data>
   */

  verifyEmailOtp: async function (req, res) {
    let {
      email,
      otp
    } = req.allParams();
    let user = await Users.findOne({
      email: email,
      deleted_at: null
    });
    if (!user) {
      return res
        .status(401)
        .json({
          "status": 401,
          "err": sails.__("Invalid Email").message
        });
    }
    if (!user.is_verified) {
      return res
        .status(403)
        .json({
          "status": 403,
          "err": sails.__("Activate Account").message
        });
    }
    if (!user.is_active) {
      return res
        .status(403)
        .json({
          "status": 403,
          "err": sails.__("Contact Admin").message
        });
    }
    if (user.twofactor_secret != otp) {
      return res
        .status(401)
        .json({
          "status": 401,
          "err": sails.__("invalid otp").message
        });
    }
    await User
      .update({
        id: user.id
      })
      .set({
        is_twofactor: true,
        twofactor_secret: null,
        email: user.email,
        auth_code: null
      });
    var token = await sails
      .helpers
      .jwtIssue(user_detail.id);
    return res.json({
      status: 200,
      user: user,
      token,
      message: sails.__("Login successfull.").message
    });
  },

  sendVerificationCodeEmail: async function (req, res) {
    if (req.body.email) {
      let user = await Users.findOne({
        email: req.body.email,
        is_active: true
      });
      if (user) {
        delete user.email_verify_token;
        let email_verify_code = randomize('0', 6);
        await Users
          .update({
            email: user.email
          })
          .set({
            email: user.email,
            email_verify_token: email_verify_code
          });

        let slug = "signup_for_mobile"
        let template = await EmailTemplate.findOne({
          slug
        });
        let emailContent = await sails
          .helpers
          .utilities
          .formatEmail(template.content, {
            recipientName: user.first_name,
            tokenCode: email_verify_code
          });
        sails
          .hooks
          .email
          .send("general-email", {
            content: emailContent
          }, {
            to: req.body.email,
            subject: "Signup Verification"
          }, function (err) {
            if (!err) {
              return res.json({
                "status": 200,
                "message": sails.__("verification code").message
              });
            }
          })
      } else {
        return res
          .status(401)
          .json({
            "status": 401,
            "err": sails.__("This email id is not registered with us.").message
          });
      }
    } else {
      return res
        .status(500)
        .json({
          "status": 500,
          "err": sails.__("Email is required.").message,
          error_at: sails.__("Email is required.").message
        });
    }
  },

  resetPassword: async function (req, res) {
    try {
      if (req.body.reset_token && req.body.password) {

        var reset_token = req.body.reset_token;

        let user_details = await Users.findOne({
          reset_token
        });
        if (user_details == undefined) {
          return res
            .status(400)
            .json({
              "status": 400,
              "err": sails.__("Reset Token expired.").message
            });
        } else {
          var today = moment().utc().format();
          var yesterday = moment(user_details.forgot_token_expiration).format();
          if (yesterday < today) {
            return res.status(400).json({
              "status": 400,
              "err": sails.__("Reset Token expired.").message
            })
          }
          let updateUsers = await Users
            .update({
              email: user_details.email,
              deleted_at: null
            })
            .set({
              email: user_details.email,
              password: req.body.password,
              reset_token: null,
              reset_token_expire: null
            })
            .fetch();
          if (updateUsers) {
            // Send email notification
            var slug = "profile_change_password";
            if (user_details.security_feature == true) {
              slug = "profile_change_password_sf";
              await Users
                .update({
                  id: user_details.id
                })
                .set({
                  security_feature_expired_time: moment().utc().add(process.env.WITHDRAWLS_DURATION, 'minutes')
                })
            }
            let template = await EmailTemplate.findOne({
              slug
            });
            let emailContent = await sails
              .helpers
              .utilities
              .formatEmail(template.content, {
                recipientName: user_details.first_name
              })

            sails
              .hooks
              .email
              .send("general-email", {
                content: emailContent
              }, {
                to: (user_details.email).trim(),
                subject: template.name
              }, function (err) {
                if (!err) {
                  return res.json({
                    "status": 200,
                    "message": sails.__("Password updated Successfully").message
                  });
                } else {
                  throw "Update password Error"
                }
              })

          } else {
            throw "Update password Error"
          }
        }
      } else {
        return res
          .status(500)
          .json({
            "status": 500,
            "err": sails.__("Reset Token or Password is not present.").message,
            error_at: sails.__("Reset Token or Password is not present.").message
          });
      }
    } catch (error) {
      // await logger.error(error.message)
      return res
        .status(500)
        .json({
          "status": 500,
          "err": sails.__("Something Wrong").message,
          error_at: error.stack
        });
    }
  },

  forgotPassword: async function (req, res) {
    try {
      const user_details = await Users.findOne({
        email: req.body.email,
        deleted_at: null,
        is_active: true
      });
      if (!user_details) {
        return res
          .status(401)
          .json({
            "status": 401,
            err: sails.__("This email id is not registered with us.").message
          });
      }
      if (user_details.is_active == false) {
        return res
          .status(401)
          .json({
            "status": 401,
            err: sails.__("Contact Admin").message
          });
      }
      if (user_details.is_verified == false || user_details.is_new_email_verified == false) {
        return res
          .status(401)
          .json({
            "status": 401,
            err: sails.__("This email id is verified.").message
          });
      }
      let reset_token = randomize('Aa0', 10);
      let reset_token_expire = new Date().getTime() + 300000;

      let new_user = {
        email: req.body.email,
        reset_token,
        reset_token_expire,
        forgot_token_expiration: forgot_token_expiration
      }
      var updatedUser = await Users
        .update({
          email: req.body.email,
          deleted_at: null
        })
        .set(new_user)
        .fetch();

      // Email sending stopped for performance testing


      let slug = "forgot_password"
      let template = await EmailTemplate.findOne({
        slug
      });
      let emailContent = await sails
        .helpers
        .utilities
        .formatEmail(template.content, {
          recipientName: updatedUser[0].first_name,
          token: sails.config.urlconf.APP_URL + '/reset-password?reset_token=' + reset_token
        })

      sails
        .hooks
        .email
        .send("general-email", {
          content: emailContent
        }, {
          to: user_details.email,
          subject: "Forgot Password"
        }, function (err) {
          console.log("err", err);
          if (!err) {
            return res.json({
              "status": 200,
              "message": sails.__("Reset password link sent to your email successfully.").message
            });
          } else {
            return res
              .status(500)
              .json({
                "status": 500,
                "err": sails.__("Something Wrong").message,
                error_at: sails.__("Something Wrong").message
              });
          }
        })
    } catch (error) {
      // console.log('error', error)
      // await logger.error(error.message)
      return res
        .status(500)
        .json({
          "status": 500,
          "err": sails.__("Something Wrong").message,
          error_at: error.stack
        });
    }
  },

  logOut: async function (req, res) {
    try {
      let {
        jwt_token,
        user_id
      } = req.allParams();

      if (jwt_token && user_id) {
        let logged_user = await LoginHistory.find({
          jwt_token,
          user: user_id
        })
        if (logged_user.length <= 0) {
          return res
            .status(200)
            .json({
              status: 200,
              message: sails.__("User Log out success").message
            });
        }
      }

      let user = await LoginHistory.find({
        device_token: req.body.device_token
      });

      let logged_user = await LoginHistory
        .update({
          device_token: req.body.device_token,
          jwt_token
        })
        .set({
          is_logged_in: false,
          device_token: null,
          jwt_token: null,
          updated_at: new Date()
        })
        .fetch();

      if (logged_user) {
        return res.json({
          status: 200,
          message: sails.__("User Log out successfully.").message
        });
      } else {
        return res
          .status(200)
          .json({
            status: 200,
            message: sails.__("User Log out successfully.").message
          });
      }
    } catch (error) {
      // await logger.error(error.message)
      res
        .status(500)
        .json({
          "status": 500,
          "err": error,
          error_at: error.stack
        });
      return;
    }
  },
  resendVerificationEmail: async function (req, res) {
    if (req.body.email) {
      let user = await Users.findOne({
        email: req.body.email,
        deleted_at: null
        // is_verified: false
        // is_new_email_verified: true
      });
      if (user) {
        if (user.is_verified && user.is_new_email_verified) {
          return res
            .status(500)
            .json({
              "status": 500,
              "err": sails.__("Email is already verified").message,
              error_at: sails.__("Email is already verified").message
            });
        }
        delete user.email_verify_token;
        let email_verify_code = randomize('0', 6);
        await Users
          .update({
            id: user.id
          })
          .set({
            email_verify_token: email_verify_code,
            signup_token_expiration: moment().utc().add(process.env.TOKEN_DURATION, 'minutes')
          });

        let slug = "";
        if (req.body.device_type == 1 || req.body.device_type == 2) {
          slug = "signup_for_mobile"
        } else {
          slug = "signup_for_web"
        }
        let template = await EmailTemplate.findOne({
          slug
        });
        let emailContent = await sails
          .helpers
          .utilities
          .formatEmail(template.content, {
            recipientName: user.first_name,
            token: sails.config.urlconf.APP_URL + '/login?token=' + email_verify_code,
            tokenCode: (req.body.device_type == 1 || req.body.device_type == 2) ?
              email_verify_code : email_verify_code
          });
        sails
          .hooks
          .email
          .send("general-email", {
            content: emailContent
          }, {
            to: req.body.email,
            subject: "Signup Verification"
          }, function (err) {
            if (!err) {
              return res.json({
                "status": 200,
                "message": sails.__("verification code").message
              });
            }
          })
      } else {
        return res
          .status(401)
          .json({
            "status": 401,
            "err": sails.__("This email id is not registered with us.").message
          });
      }
    } else {
      return res
        .status(500)
        .json({
          "status": 500,
          "err": sails.__("Email is required.").message,
          error_at: sails.__("Email is required.").message
        });
    }
  },
  // Forgot Two Factors
  forgotTwofactors: async function (req, res) {
    if (req.body.email) {
      let user = await Users.findOne({
        email: req.body.email
      });

      if (user) {
        if (!user.is_verified) {
          return res
            .status(500)
            .json({
              "status": 500,
              "err": sails.__("Account_Not_Verified").message,
              error_at: sails.__("Account_Not_Verified").message
            });
        }

        let check_exist = await UserForgotTwofactors.findOne({
          user_id: user.id,
          status: "open"
        });
        if (check_exist != undefined) {
          return res
            .status(500)
            .json({
              "status": 500,
              "err": sails.__("Twofactors already requested").message,
              error_at: sails.__("Twofactors already requested").message
            });
        }

        req
          .file('uploaded_file')
          .upload(async function (err, uploadedFiles) {
            if (uploadedFiles.length > 0) {
              let filename = uploadedFiles[0].filename;
              let extention = filename.split('.').pop();
              var valid_extention = ["jpg", "jpeg", "png"];
              if (valid_extention.indexOf(extention) < 0) {
                return res
                  .status(401)
                  .json({
                    "status": 401,
                    "err": sails.__("Extention required").message
                  });
              }
              var name = filename.substring(filename.indexOf("."));
              let timestamp = new Date()
                .getTime()
                .toString();
              var uploadFileName = timestamp + name;
              var uploadFile = await UploadFiles.upload(uploadedFiles[0].fd, 'temp_users_images_twofactors/' + uploadFileName);
              var store_filename = 'temp_users_images_twofactors/' + uploadFileName;
              var data = {
                user_id: user.id,
                uploaded_file: store_filename,
                status: "open"
              };
              var add = await UserForgotTwofactors.create(data);
              return res.json({
                "status": 200,
                "message": sails.__("Your request for twofactors is sent").message
              });
            } else {
              return res
                .status(500)
                .json({
                  "status": 500,
                  "err": sails.__("Image Required").message,
                  error_at: sails.__("Image Required").message
                });
            }
          });
      } else {
        return res
          .status(401)
          .json({
            "status": 401,
            "err": sails.__("This email id is not registered with us.").message
          });
      }
    } else {
      return res
        .status(500)
        .json({
          "status": 500,
          "err": sails.__("Email is required.").message,
          error_at: sails.__("Email is required.").message
        });
    }
  },

};
