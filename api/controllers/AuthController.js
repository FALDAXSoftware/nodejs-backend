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
        let user = await Users.findOne({ email_verify_token: req.body.email_verify_token });
        if (user) {
          let hubspotcontact = await sails
            .helpers
            .hubspot
            .contacts
            .create(user.first_name, user.last_name, user.email)
            .tolerate("serverError", () => {
              throw new Error("serverError");
            });
          await Users
            .update({ id: user.id, deleted_at: null })
            .set({ email: user.email, is_verified: true, email_verify_token: null, hubspot_id: hubspotcontact });
          await KYC
            .update({ user_id: user.id })
            .set({ first_name: user.first_name, last_name: user.last_name });
          // Create Receive Address
          // await sails
          //   .helpers
          //   .wallet
          //   .receiveAddress(user, req.body.test_key
          //     ? req.body.test_key
          //     : "false");
          return res.json({
            message: "Verification successfull.",
            "status": 200,
            "message": sails.__('Verify User')
          });
        } else {
          return res
            .status(400)
            .json({
              "status": 400,
              "err": sails.__('Invalid Token')
            });
        }
      }
    } catch (error) {
      return res
        .status(500)
        .json({
          "status": 500,
          "err": sails.__("Something Wrong")
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

        var user_detail = await Users.findOne({ email: query.email, deleted_at: null });

        if (user_detail) {

          Users
            .comparePassword(query.password, user_detail, async function (err, valid) {
              if (err) {
                return res.json(403, {
                  "status": 403,
                  err: 'Forbidden'
                });
              }

              if (!valid) {
                return res
                  .status(401)
                  .json({
                    "status": 401,
                    "err": sails.__("Invalid email or password")
                  });
              } else {
                if (user_detail.is_verified == false) {
                  return res
                    .status(402)
                    .json({
                      "status": 402,
                      "err": sails.__("Account_Not_Verified")
                    });
                }
                if (user_detail) {
                  if (user_detail.is_new_email_verified == false) {
                    return res
                      .status(405)
                      .json({
                        "status": 405,
                        "err": sails.__("To continue, please verify your new email address.")
                      });
                  }
                }
                if (user_detail.is_twofactor && user_detail.twofactor_secret) {
                  if (!req.body.otp) {
                    return res
                      .status(201)
                      .json({
                        "status": 201,
                        "err": sails.__("Please enter OTP to continue")
                      });
                  }
                  let verified = speakeasy
                    .totp
                    .verify({ secret: user_detail.twofactor_secret, encoding: 'base32', token: req.body.otp, window: 2 });
                  if (!verified) {
                    return res
                      .status(402)
                      .json({
                        "status": 402,
                        "err": sails.__("invalid otp")
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
                // Login History Save
                var ip;
                if (req.headers['x-forwarded-for']) {
                  ip = req
                    .headers['x-forwarded-for']
                    .split(",")[0];
                } else if (req.connection && req.connection.remoteAddress) {
                  ip = req.connection.remoteAddress;
                } else {
                  ip = req.ip;
                }
                // Check For New Ip
                let loginData = await LoginHistory.find({ user: user_detail.id, ip: ip });
                if (loginData.length > 0 || req.body.test_key == sails.config.local.test_key || req.body.device_type == 1 || req.body.device_type == 2) {
                  await LoginHistory.create({
                    user: user_detail.id,
                    ip: ip,
                    created_at: new Date(),
                    device_type: req.body.device_type,
                    jwt_token: token,
                    device_token: req.body.device_token
                      ? req.body.device_token
                      : null
                  });

                  return res.json({
                    status: 200,
                    user: user_detail,
                    token,
                    message: "Welcome back, " + user_detail.first_name + "!"
                  });
                } else {
                  let verifyToken = randomize("Aa0", 15);
                  await Users
                    .update({ id: user_detail["id"] })
                    .set({ email: user_detail["email"], new_ip_verification_token: verifyToken, new_ip: ip });

                  let slug = "new_ip_verification"
                  let template = await EmailTemplate.findOne({ slug });
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
                              "err": sails.__("New device confirmation email sent to your email.")
                            });
                        } else {
                          return res
                            .status(500)
                            .json({
                              "status": 500,
                              "err": sails.__("Something Wrong")
                            });
                        }
                      });
                }
              }
            });
          // if (user_detail.is_verified == false) {   return res     .status(402) .json({
          // "status": 402, "err": "To login please activate your account" }); } if
          // (user_detail) {   if (user_detail.is_new_email_verified == false) { return
          // res       .status(405)       .json({ "status": 405, "err": "To continue,
          // please verify your new email address." });   } }
          if (user_detail.is_active == false) {
            return res
              .status(403)
              .json({
                "status": 403,
                "err": sails.__("Contact Admin")
              });
          }
        } else {
          res
            .status(401)
            .json({
              "status": 401,
              "err": sails.__("Invalid email or password")
            });
          return;
        }
      } else {
        res
          .status(401)
          .json({
            "status": 401,
            "err": sails.__("Email or password is not sent")
          });
        return;
      }
    } catch (error) {
      return res
        .status(500)
        .json({
          "status": 500,
          "err": sails.__("Something Wrong")
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
      var ip;
      if (req.headers['x-forwarded-for']) {
        ip = req
          .headers['x-forwarded-for']
          .split(",")[0];
      } else if (req.connection && req.connection.remoteAddress) {
        ip = req.connection.remoteAddress;
      } else {
        ip = req.ip;
      }
      if (req.body.token) {

        let user_detail = await Users.findOne({ new_ip: ip, new_ip_verification_token: req.body.token });

        if (user_detail) {
          // await Users.update({   id: user_detail.id }).set({   new_ip: null,
          // new_ip_verification_token: null,   email: user_detail.email });
          await LoginHistory.create({
            user: user_detail.id,
            ip: ip,
            created_at: new Date(),
            device_type: req.body.device_type,
            jwt_token: token,
            device_token: req.body.device_token
              ? req.body.device_token
              : null
          });
          var token = await sails
            .helpers
            .jwtIssue(user_detail.id);
          return res.json({
            status: 200,
            user: user_detail,
            token,
            message: "Welcome back, " + user_detail.first_name + "!"
          });
        }
      }
      return res
        .status(401)
        .json({
          "status": 401,
          "err": sails.__("Invalid verification token")
        });
    } catch (error) {
      return res
        .status(500)
        .json({
          "status": 500,
          "err": sails.__("Something Wrong")
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
    let { email } = req.allParams();
    let user = await Users.findOne({ email: email, deleted_at: null });
    if (!user) {
      return res
        .status(401)
        .json({
          "status": 401,
          "err": sails.__("Invalid Email")
        });
    }
    if (!user.is_active) {
      return res
        .status(403)
        .json({
          "status": 403,
          "err": sails.__("Contact Admin")
        });
    }

    await Users
      .update({ id: user.id })
      .set({
        email: user.email,
        auth_code: randomize('0', 6)
      });

    // send code in email

    let slug = "verification_code"
    let template = await EmailTemplate.findOne({ slug });
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
        }, function (err) {
          if (!err) {
            return res.json({
              "status": 200,
              "message": sails.__("Authentication code sent to email successfully")
            });
          } else {
            return res
              .status(500)
              .json({
                "status": 500,
                "err": sails.__("Something Wrong")
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
    let { email, otp } = req.allParams();
    let user = await Users.findOne({ email: email, deleted_at: null });
    if (!user) {
      return res
        .status(401)
        .json({
          "status": 401,
          "err": sails.__("Invalid Email")
        });
    }
    if (!user.is_verified) {
      return res
        .status(403)
        .json({
          "status": 403,
          "err": sails.__("Activate Account")
        });
    }
    if (!user.is_active) {
      return res
        .status(403)
        .json({
          "status": 403,
          "err": sails.__("Contact Admin")
        });
    }
    if (user.twofactor_secret != otp) {
      return res
        .status(401)
        .json({
          "status": 401,
          "err": sails.__("invalid otp")
        });
    }
    await User
      .update({ id: user.id })
      .set({ is_twofactor: true, twofactor_secret: null, email: user.email, auth_code: null });
    var token = await sails
      .helpers
      .jwtIssue(user_detail.id);
    return res.json({
      status: 200,
      user: user,
      token,
      message: sails.__("Login successfull.")
    });
  },

  sendVerificationCodeEmail: async function (req, res) {
    if (req.body.email) {
      let user = await Users.findOne({ email: req.body.email, is_active: true });
      if (user) {
        delete user.email_verify_token;
        let email_verify_code = randomize('0', 6);
        await Users
          .update({ email: user.email })
          .set({ email: user.email, email_verify_token: email_verify_code });

        let slug = "signup_for_mobile"
        let template = await EmailTemplate.findOne({ slug });
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
                  "message": sails.__("verification code")
                });
              }
            })
      } else {
        return res
          .status(401)
          .json({
            "status": 401,
            "err": sails.__("This email id is not registered with us.")
          });
      }
    } else {
      return res
        .status(500)
        .json({
          "status": 500,
          "err": sails.__("Email is required.")
        });
    }
  },

  resetPassword: async function (req, res) {
    try {
      if (req.body.reset_token && req.body.password) {

        var reset_token = req.body.reset_token;

        let user_details = await Users.findOne({ reset_token });
        if (user_details == undefined) {
          return res
            .status(400)
            .json({
              "status": 400,
              "err": sails.__("Reset Token expired.")
            });
        } else {
          let updateUsers = await Users
            .update({ email: user_details.email, deleted_at: null })
            .set({ email: user_details.email, password: req.body.password, reset_token: null, reset_token_expire: null })
            .fetch();
          if (updateUsers) {
            return res.json({
              "status": 200,
              "message": sails.__("Password updated Successfully")
            });
          } else {
            throw "Update password Error"
          }
        }
      } else {
        return res
          .status(500)
          .json({
            "status": 500,
            "err": sails.__("Reset Token or Password is not present.")
          });
      }
    } catch (e) {
      return res
        .status(500)
        .json({
          "status": 500,
          "err": sails.__("Something Wrong")
        });
    }
  },

  forgotPassword: async function (req, res) {
    try {
      const user_details = await Users.findOne({ email: req.body.email, deleted_at: null, is_active: true });
      if (!user_details) {
        return res
          .status(401)
          .json({
            "status": 401,
            err: sails.__("This email id is not registered with us.")
          });
      }
      if (user_details.is_active == false) {
        return res
          .status(401)
          .json({
            "status": 401,
            err: sails.__("Contact Admin")
          });
      }
      let reset_token = randomize('Aa0', 10);
      let reset_token_expire = new Date().getTime() + 300000;

      let new_user = {
        email: req.body.email,
        reset_token,
        reset_token_expire
      }
      var updatedUser = await Users
        .update({ email: req.body.email, deleted_at: null })
        .set(new_user)
        .fetch();

      console.log(updatedUser);

      let slug = "forgot_password"
      let template = await EmailTemplate.findOne({ slug });
      let emailContent = await sails
        .helpers
        .utilities
        .formatEmail(template.content, {
          recipientName: updatedUser.first_name,
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
            if (!err) {
              return res.json({
                "status": 200,
                "message": sails.__("Reset password link sent to your email successfully.")
              });
            }
          })
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({
          "status": 500,
          "err": sails.__("Something Wrong")
        });
    }
  },

  logOut: async function (req, res) {
    try {
      let { jwt_token, user_id } = req.allParams();

      if (jwt_token && user_id) {
        let logged_user = await LoginHistory.find({ jwt_token, user: user_id })
        if (logged_user.length <= 0) {
          return res
            .status(200)
            .json({
              status: 200,
              message: sails.__("User Log out success")
            });
        }
      }

      let user = await LoginHistory.find({ device_token: req.body.device_token });

      let logged_user = await LoginHistory
        .update({ device_token: req.body.device_token, jwt_token })
        .set({ is_logged_in: false, device_token: null, jwt_token: null, updated_at: new Date() })
        .fetch();

      if (logged_user) {
        return res.json({
          status: 200,
          message: sails.__("User Log out successfully.")
        });
      } else {
        return res
          .status(200)
          .json({
            status: 200,
            message: sails.__("User Log out successfully.")
          });
      }
    } catch (e) {
      console.log(e);
      res
        .status(500)
        .json({ "status": 500, "err": e });
      return;
    }
  }
};
