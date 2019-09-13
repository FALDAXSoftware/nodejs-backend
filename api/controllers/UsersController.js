/**
 * UserController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
var UploadFiles = require('../services/UploadFiles');
var bcrypt = require('bcrypt');
var fetch = require('node-fetch');
var randomize = require('randomatic');
var speakeasy = require('speakeasy');
var QRCode = require('qrcode');
var csc = require('country-state-city');
const moment = require('moment');

module.exports = {
  //------------------Web APi------------------------------------------------//

  /**
   * API for creating user
   * Renders this api when user needs to be created
   *
   * @param <email , password, firstname, lastname>
   *
   * @return <Coin node Info or error data>
   */

  create: async function (req, res) {
    try {
      var referred_id = null;
      let email = req
        .body
        .email
        .toLowerCase();

      var existedUser = await Users.findOne({
        email,
        deleted_at: null,
        is_active: true
      });
      if (existedUser) {
        return res
          .status(401)
          .json({
            status: 401,
            "err": sails.__("email exits")
          });
      }
      if (req.body.referral_code) {
        var referredUser = await Users.findOne({
          referral_code: req.body.referral_code
        });
        if (!referredUser) {
          return res
            .status(401)
            .json({
              status: 401,
              "err": sails.__("invalid referal")
            });
        } else {
          referred_id = parseInt(referredUser.id);
        }
      }
      let email_verify_token = randomize('Aa0', 10);
      let email_verify_code = randomize('0', 6);
      if (req.body.email && req.body.password) {
        var user_detail = await Users.create({
          email: email,
          password: req.body.password,
          full_name: req.body.first_name + ' ' + req.body.last_name,
          first_name: req.body.first_name,
          last_name: req.body.last_name,
          referral_code: randomize('Aa0', 10),
          date_format: 'DD/MM/YYYY',
          created_at: new Date(),
          referred_id: referred_id,
          device_type: req.body.device_type,
          account_tier: 1,
          account_class: 4,
          email_verify_token: (req.body.device_type == 1 || req.body.device_type == 2) ?
            email_verify_code : email_verify_token
        }).fetch();

        var now = moment.now();

        var notificationList = await Notifications.find({
          where: {
            deleted_at: null
          }
        });

        for (var i = 0; i < notificationList.length; i++) {
          var object = {};
          object.slug = notificationList[i].slug;
          object.title = notificationList[i].title;
          object.created_at = new Date();
          object.user_id = user_detail.id
          if (notificationList[i].is_necessary == "true" || notificationList[i].is_necessary == true) {
            object.email = true
          } else {
            object.email = false
          }
          object.text = false;
          var data = await UserNotification.create({
            ...object
          }).fetch();
        }

        var userFavouritesData = await UserFavourites.createEach([{
          user_id: user_detail.id,
          pair_from: "BTC",
          pair_to: "ETH",
          priority: 1,
          created: now,
          updated: now,
          deleted: null
        }, {
          user_id: user_detail.id,
          pair_from: "BTC",
          pair_to: "XRP",
          priority: 2,
          created: now,
          updated: now,
          deleted: null
        }, {
          user_id: user_detail.id,
          pair_from: "BTC",
          pair_to: "LTC",
          priority: 3,
          created: now,
          updated: now,
          deleted: null
        }, {
          user_id: user_detail.id,
          pair_from: "ETH",
          pair_to: "BAT",
          priority: 4,
          created: now,
          updated: now,
          deleted: null
        }, {
          user_id: user_detail.id,
          pair_from: "BTC",
          pair_to: "BCH",
          priority: 5,
          created: now,
          updated: now,
          deleted: null
        }]).fetch();

        if (user_detail) {
          //   Create Recive Address
          await sails.helpers.wallet.receiveAddress(user_detail);
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
              recipientName: user_detail.first_name,
              token: sails.config.urlconf.APP_URL + '/login?token=' + email_verify_token,
              tokenCode: (req.body.device_type == 1 || req.body.device_type == 2) ?
                email_verify_code : email_verify_token
            })
          if (template) {
            sails
              .hooks
              .email
              .send("general-email", {
                content: emailContent
              }, {
                to: user_detail.email,
                subject: "Signup Verification"
              }, function (err) {
                if (!err) {
                  return res.json({
                    "status": 200,
                    "message": (req.body.device_type == 1 || req.body.device_type == 2) ?
                      sails.__("verification code") : sails.__("verification link")
                  });
                }
              });
          }
          // return res
          //   .json({
          //     status: 200,
          //     email_verify_token,
          //     "message": "Success"
          //   });
        } else {
          return res
            .status(401)
            .json({
              status: 401,
              "err": sails.__("Something Wrong")
            });
        }
      } else {
        res
          .status(401)
          .json({
            status: 401,
            "err": sails.__("email password not sent")
          });
        return;
      }

    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  },

  /**
   * API for updating use email id
   * Renders this api when user needs to be update email
   *
   * @param <new_email>
   *
   * @return <Coin node Info or error data>
   */

  updateEmail: async function (req, res) {
    try {
      let newEmail = req
        .body
        .new_email
        .toLowerCase();
      var existedUser = await Users.findOne({
        id: req.user.id,
        is_active: true,
        deleted_at: null
      });
      var existedEmail = await Users.find({
        email: newEmail
      });

      if (existedEmail && existedEmail.length > 0) {
        return res
          .status(401)
          .json({
            status: 401,
            "err": sails.__("email already registered")
          });
      }

      let new_email_token = randomize('0', 6);

      var user = await Users
        .update({
          id: req.user.id,
          deleted_at: null
        })
        .set({
          requested_email: newEmail,
          email: existedUser.email,
          new_email_token: new_email_token
        })
        .fetch();
      if (user) {
        let slug = "new_email_confirmation"
        let template = await EmailTemplate.findOne({
          slug
        });
        let emailContent = await sails
          .helpers
          .utilities
          .formatEmail(template.content, {
            recipientName: existedUser.first_name,
            tokenCode: new_email_token
          });
        sails
          .hooks
          .email
          .send("general-email", {
            content: emailContent
          }, {
            to: existedUser.email,
            subject: "New Email Confirmation"
          }, function (err) {
            if (!err) {
              return res.json({
                "status": 200,
                "message": sails.__("confirm otp")
              });
            }
          })
      }
    } catch (error) {
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  },

  /**
   * API for confirming new email
   * Renders this api when user needs to confirm new email
   *
   * @param <new email token>
   *
   * @return <Coin node Info or error data>
   */

  confirmNewEmail: async function (req, res) {
    try {
      if (req.body.new_email_token) {
        let user = await Users.findOne({
          new_email_token: req.body.new_email_token
        });
        if (user) {
          let requested_email = user.requested_email;
          if (user["hubspot_id"] && user["hubspot_id"] != null) {
            await sails
              .helpers
              .hubspot
              .contacts
              .updateEmail(user["hubspot_id"], requested_email);
          }

          let re_new_email_token = randomize('Aa0', 10);

          await Users
            .update({
              id: user.id,
              new_email_token: req.body.new_email_token,
              deleted_at: null
            })
            .set({
              email: requested_email,
              new_email_token: null,
              email_verify_token: re_new_email_token,
              requested_email: null,
              is_new_email_verified: false
            })
            .fetch();

          let slug = "new_email_verification"
          let template = await EmailTemplate.findOne({
            slug
          });
          let emailContent = await sails
            .helpers
            .utilities
            .formatEmail(template.content, {
              recipientName: user.first_name,
              token: sails.config.urlconf.APP_URL + '/login?emailCode=' + re_new_email_token
            });
          sails
            .hooks
            .email
            .send("general-email", {
              content: emailContent
            }, {
              to: requested_email,
              subject: "New Email Verification"
            }, function (err) {
              if (!err) {
                return res.json({
                  "status": 200,
                  "new_email_token": re_new_email_token,
                  "message": sails.__("verification link")
                });
              }
            })
        } else {
          return res
            .status(400)
            .json({
              "status": 400,
              "err": sails.__("invalid otp")
            });
        }
      } else {
        return res
          .status(500)
          .json({
            status: 500,
            "err": "Invalid Params"
          });
      }
    } catch (error) {
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  },

  /**
   * API for verifying the email
   * Renders this api when user's email need to verified
   *
   * @param <email verify token>
   *
   * @return <Coin node Info or error data>
   */

  verifyNewEmail: async function (req, res) {
    try {
      if (req.body.new_email_verify_token) {
        let user = await Users.findOne({
          email_verify_token: req.body.new_email_verify_token
        });
        if (user) {

          await Users
            .update({
              id: user.id,
              deleted_at: null
            })
            .set({
              email: user.email,
              is_new_email_verified: true,
              email_verify_token: null
            });

          var token = await sails
            .helpers
            .jwtIssue(user.id);

          // Send email if Security Feature Enabled
          if (user.security_feature == true) {
            var slug = "new_email_verification_sf";
            await Users
              .update({
                id: user.id
              })
              .set({
                security_feature_expired_time: moment().utc().add(process.env.WITHDRAWLS_DURATION, 'minutes')
              })

            let template = await EmailTemplate.findOne({
              slug
            });
            let emailContent = await sails
              .helpers
              .utilities
              .formatEmail(template.content, {
                recipientName: user.first_name
              });
            sails
              .hooks
              .email
              .send("general-email", {
                content: emailContent
              }, {
                to: user.email,
                subject: "New Email Updated"
              }, function (err) {
                if (!err) {
                  return res.json({
                    "status": 200,
                    user,
                    token,
                    "message": "Welcome back, " + user.first_name + "!"
                  });
                }
              })
          } else {
            return res.json({
              "status": 200,
              user,
              token,
              "message": "Welcome back, " + user.first_name + "!"
            });
          }
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
   * API for adding particular users IP
   * Renders this api when user needs to add IP
   *
   * @param <ip>
   *
   * @return <userdetails>
   */

  addWhiteListIP: async function (req, res) {
    try {
      var user_id = req.user.id;
      var requestData = req.body;
      var userData = await Users.findOne({
        id: user_id,
        deleted_at: null,
        is_active: true
      });

      if (userData != undefined) {
        var emailData = await Users.update({
          id: user_id,
          deleted_at: null,
          is_active: true
        }).set({
          email: userData.email,
          whitelist_ip: requestData.ip
        });

        return res.status(200).json({
          "status": 200,
          "message": sails.__("WhiteList IP Add Success"),
          "data": emailData
        });
      } else {
        return res
          .status(500)
          .json({
            status: 500,
            "err": sails.__("Something Wrong")
          });
      }
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  },

  /**
   * API for getting particular users IP list
   * Renders this api when user whitelist IP needs to be fetched
   *
   * @param
   *
   * @return <UserDetails>
   */

  getWhiteListIP: async function (req, res) {
    try {
      var user_id = req.user.id;
      var userData = await Users.findOne({
        select: [
          'whitelist_ip'
        ],
        where: {
          id: user_id,
          deleted_at: null,
          is_active: true
        }
      });

      if (userData != undefined) {
        return res.status(200).json({
          "status": 200,
          "message": sails.__("WhiteList IP info Success"),
          "data": userData
        });
      } else {
        return res
          .status(500)
          .json({
            status: 500,
            "err": sails.__("Something Wrong")
          });
      }
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  },

  /**
   * API for getting particular users details
   * Renders this api when user details needs to be fetched
   *
   * @param <email , password, firstname, lastname>
   *
   * @return <Coin node Info or error data>
   */

  getAllUserDetails: async function (req, res) {
    let {
      user_id
    } = req.allParams();
    try {
      let query = " from users WHERE id=" + user_id;

      let usersData = await sails.sendNativeQuery("Select * " + query, [])

      usersData = usersData.rows;
      usersData[0].UUID = usersData[0].account_class + '-' + usersData[0].account_tier + '-' + usersData[0].id;
      if (usersData) {
        return res.json({
          "status": 200,
          "message": sails.__("Users Data"),
          "data": usersData
        });
      }
    } catch (err) {
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  },

  getUserDetails: async function (req, res) {
    let id = req.user.id;
    let usersData = await Users.find({
      id: id
    });
    if (usersData.length > 0) {

      if (usersData[0].country) {
        let AllCountries = csc.getAllCountries();
        usersData[0]["countryJsonId"] = null;
        for (let index = 0; index < AllCountries.length; index++) {
          const element = AllCountries[index];
          if (element.name == usersData[0].country) {
            usersData[0]["countryJsonId"] = element.id
          }
        }

        if (usersData[0].state) {
          let allStates = csc.getStatesOfCountry(usersData[0]["countryJsonId"]);
          usersData[0]["stateJsonId"] = null;
          for (let index = 0; index < allStates.length; index++) {
            const element = allStates[index];
            if (element.name == usersData[0].state) {
              usersData[0]["stateJsonId"] = element.id
            }
          }
        }
      }
    }
    let userKyc = await KYC.findOne({
      user_id: id
    });
    usersData[0].is_kyc_done = 0;
    if (userKyc) {
      if (userKyc.steps == 3) {
        usersData[0].is_kyc_done = 1;
        if (userKyc.direct_response == "ACCEPT" && userKyc.webhook_response == "ACCEPT") {
          usersData[0].is_kyc_done = 2;
        }
      }
    }
    var dataResponse = await sails
      .helpers
      .userTradeChecking(usersData[0].id);
    usersData[0].is_allowed = dataResponse.response;
    if (usersData) {
      return res.json({
        "status": 200,
        "message": sails.__("Users Data"),
        "data": usersData
      });
    }
  },

  // getReferred: async function (req, res) {
  //   let {
  //     page,
  //     limit
  //   } = req.allParams();

  //   let id = req.user.id;
  //   let usersData = await Users.find({
  //     select: ['email'],
  //     where: {
  //       referred_id: id
  //     }
  //   }).sort('id DESC').paginate(parseInt(page) - 1, parseInt(limit));

  //   console.log('usersData', usersData)

  //   if (usersData) {
  //     return res.json({
  //       "status": 200,
  //       "message": sails.__("User referred Data"),
  //       "data": usersData
  //     });
  //   }
  // },

  // For Get Login History
  getLoginHistory: async function (req, res) {
    let history = await LoginHistory
      .find({
        user: req.user.id
      })
      .sort('created_at DESC')
      .limit(10);
    return res.json({
      "status": 200,
      "message": sails.__("Users Login History"),
      "data": history
    });
  },

  update: async function (req, res) {
    try {
      const user_details = await Users.findOne({
        id: req.user.id
      });
      if (!user_details) {
        return res
          .status(401)
          .json({
            "status": 401,
            "err": 'Invalid email'
          });
      }
      var user = req.body;
      user['email'] = user_details['email'];
      delete user.profile;

      if (req.body.first_name) {
        user.full_name = req.body.first_name + ' ' + user.last_name;
      } else if (req.body.last_name) {
        user.full_name = user.first_name + ' ' + req.body.last_name;
      } else {
        user.full_name = req.body.first_name + ' ' + req.body.last_name;
      }

      req
        .file('profile_pic')
        .upload(async function (err, uploadedFiles) {
          try {
            if (uploadedFiles.length > 0) {

              let filename = uploadedFiles[0].filename;
              var name = filename.substring(filename.indexOf("."));
              let timestamp = new Date()
                .getTime()
                .toString();
              var uploadFileName = timestamp + name;
              var uploadProfile = await UploadFiles.upload(uploadedFiles[0].fd, 'profile/' + uploadFileName);
              if (uploadProfile) {
                user.profile_pic = 'profile/' + uploadFileName;
                if (user_details["hubspot_id"] && user_details["hubspot_id"] != null) {
                  await sails
                    .helpers
                    .hubspot
                    .contacts
                    .update(user_details["hubspot_id"], user.first_name, user.last_name, user.street_address + (user.street_address_2 ?
                        ", " + user.street_address_2 :
                        ''), user.country ?
                      user.country :
                      user_details["country"], user.state ?
                      user.state :
                      user_details["state"], user.city_town ?
                      user.city_town :
                      user_details["city_town"], user.postal_code);
                }
                var updatedUsers = await Users
                  .update({
                    email: user.email,
                    deleted_at: null
                  })
                  .set(user)
                  .fetch();
                delete updatedUsers.password
                return res.json({
                  "status": 200,
                  "message": sails.__("User Update")
                });
              }
            } else {
              if (user.remove_pic == 'true') {
                delete user.remove_pic;
                await Users
                  .update({
                    email: user.email
                  })
                  .set({
                    email: user.email,
                    profile_pic: null
                  });
              }
              if (user_details["hubspot_id"] && user_details["hubspot_id"] != null) {
                await sails
                  .helpers
                  .hubspot
                  .contacts
                  .update(user_details["hubspot_id"], user.first_name, user.last_name, user.street_address + (user.street_address_2 ?
                      ", " + user.street_address_2 :
                      ''), user.country ?
                    user.country :
                    user_details["country"], user.state ?
                    user.state :
                    user_details["state"], user.city_town ?
                    user.city_town :
                    user_details["city_town"], user.postal_code);
              }

              var updatedUsers = await Users
                .update({
                  email: user.email,
                  deleted_at: null
                })
                .set(user);

              return res.json({
                "status": 200,
                "message": sails.__("User Update")
              });
            }
          } catch (e) {
            throw e;
          }
        });
    } catch (error) {
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  },

  changePassword: async function (req, res) {
    try {
      if (!req.body.current_password || !req.body.new_password || !req.body.confirm_password) {
        return res
          .status(401)
          .json({
            status: 401,
            "err": sails.__("password provide")
          });
      }
      if (req.body.new_password != req.body.confirm_password) {
        return res
          .status(401)
          .json({
            status: 401,
            "err": sails.__("password must match")
          });
      }
      if (req.body.current_password == req.body.new_password) {
        return res
          .status(401)
          .json({
            status: 401,
            "err": sails.__("current new must not be same")
          });
      }

      const user_details = await Users.findOne({
        id: req.user.id
      });
      if (!user_details) {
        return res
          .status(401)
          .json({
            status: 401,
            "err": sails.__("User not found")
          });
      }
      let compareCurrent = await bcrypt.compare(req.body.current_password, user_details.password);
      if (!compareCurrent) {
        return res
          .status(401)
          .json({
            status: 401,
            "err": sails.__("Old password not correct")
          });
      }

      var updatedUsers = await Users
        .update({
          id: req.user.id
        })
        .set({
          email: user_details.email,
          password: req.body.new_password
        })
        .fetch();

      if (updatedUsers) {
        // Send email notification
        var slug = "profile_change_password";
        if (user_details.security_feature == true) {
          slug = "profile_change_password_sf";
          await Users
            .update({
              id: req.user.id
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
                "message": sails.__("password change success")
              });
            }
          })
      } else {
        return res
          .status(401)
          .json({
            "status": 401,
            err: sails.__("Something Wrong")
          });
      }
    } catch (error) {
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  },

  getReferred: async function (req, res) {
    let id = req.user.id;
    let usersData = await Users.find({
      select: [
        'email', 'full_name', 'fiat', 'created_at'
      ],
      where: {
        referred_id: id
      }
    }).sort('created_at DESC');

    var users = await Users.findOne({
      deleted_at: null,
      id: id
    });
    var referredData = await Referral.find({
      deleted_at: null,
      user_id: id,
      is_collected: true,
    });

    var leftReferredData = await Referral.find({
      deleted_at: null,
      user_id: id,
      is_collected: false
    })

    var currencyData = await CurrencyConversion.find({
      deleted_at: null
    })

    var m = 0;
    sum = [];
    for (var i = 0; i < referredData.length; i++) {
      for (var j = 0; j < currencyData.length; j++) {
        if (referredData[i].coin_id == currencyData[j].coin_id) {
          referredData[i].quote = currencyData[j].quote;
        }
      }
    }

    var sumValue = 0;
    for (var i = 0; i < leftReferredData.length; i++) {
      for (var j = 0; j < currencyData.length; j++) {
        if (leftReferredData[i].coin_id == currencyData[j].coin_id) {
          leftReferredData[i].quote = currencyData[j].quote;
        }
      }
    }

    if (usersData) {
      return res.json({
        "status": 200,
        "message": sails.__("User referred Data"),
        "data": usersData,
        referredData,
        leftReferredData
      });
    }
  },

  // For Get Login History
  getLoginHistory: async function (req, res) {
    let {
      page,
      limit
    } = req.allParams();
    let history = await LoginHistory
      .find({
        user: req.user.id
      })
      .sort('created_at DESC')
      .paginate(page - 1, parseInt(limit));

    let historyCount = await LoginHistory.count({
      where: {
        user: req.user.id
      }
    });

    return res.json({
      "status": 200,
      "message": sails.__("Users Login History"),
      "data": history,
      historyCount
    });
  },
  // Setup two factor code
  setupTwoFactor: async function (req, res) {
    try {
      let user_id = req.user.id;
      let user = await Users.findOne({
        id: user_id,
        is_active: true,
        is_verified: true,
        deleted_at: null
      });
      if (!user) {
        return res
          .status(401)
          .json({
            "status": 401,
            "err": sails.__("user inactive")
          });
      }
      const secret = speakeasy.generateSecret({
        length: 10
      });
      await Users
        .update({
          id: user.id
        })
        .set({
          "email": user.email,
          "twofactor_secret": secret.base32
        });
      let url = speakeasy.otpauthURL({
        secret: secret.ascii,
        label: 'FALDAX( ' + user.email + ')'
      });
      QRCode.toDataURL(encodeURI(url), function (err, data_url) {
        return res.json({
          status: 200,
          message: sails.__("Qr code sent"),
          tempSecret: secret.base32,
          dataURL: data_url,
          otpauthURL: secret.otpauth_url
        })
      });
    } catch (error) {
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  },

  // Verify Two Factor
  verifyTwoFactor: async function (req, res) {
    try {
      let user_id = req.user.id;
      let {
        otp
      } = req.allParams();
      let user = await Users.findOne({
        id: user_id,
        is_active: true,
        is_verified: true,
        deleted_at: null
      });
      if (!user) {
        return res
          .status(401)
          .json({
            "status": 401,
            "err": sails.__("user inactive")
          });
      }

      if (user.is_twofactor == true) {
        return res
          .status(401)
          .json({
            "status": 401,
            "err": sails.__("2 factor already enabled")
          });
      }

      let verified = speakeasy
        .totp
        .verify({
          secret: user.twofactor_secret,
          encoding: "base32",
          token: otp
        });

      if (verified) {
        var random_string = await sails
          .helpers
          .randomStringGenerator(10);

        await Users
          .update({
            id: user.id
          })
          .set({
            email: user.email,
            is_twofactor: true,
            twofactor_backup_code: random_string
          });
        // Send email notification
        var slug = "2fa_enable_disable";
        let template = await EmailTemplate.findOne({
          slug
        });
        let emailContent = await sails
          .helpers
          .utilities
          .formatEmail(template.content, {
            recipientName: user.first_name,
            status: "ENABLED"
          })

        sails
          .hooks
          .email
          .send("general-email", {
            content: emailContent
          }, {
            to: (user.email).trim(),
            subject: "2 Factor Authentication Enabled"
          }, function (err) {
            console.log("err", err);
            if (!err || err == null) {
              return res.json({
                status: 200,
                message: sails.__("2 factor enabled"),
                twofactor_backup_code: random_string
              });
            }
          })
      } else {
        return res
          .status(401)
          .json({
            err: sails.__("invalid otp")
          });
      }

    } catch (error) {
      console.log("error", error);
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  },

  disableTwoFactor: async function (req, res) {
    try {
      let user_id = req.user.id;
      let user = await Users.findOne({
        id: user_id,
        is_active: true,
        is_verified: true,
        deleted_at: null
      });
      if (!user) {
        return res
          .status(401)
          .json({
            "status": 401,
            "err": sails.__("user inactive")
          });
      }
      if (user.is_twofactor == false) {
        return res
          .status(401)
          .json({
            "status": 401,
            "err": sails.__("2 factor already disabled")
          });
      }
      await Users
        .update({
          id: user.id,
          deleted_at: null
        })
        .set({
          email: user.email,
          is_twofactor: false,
          twofactor_secret: null
        });

      // Send email notification
      var slug = "2fa_enable_disable";
      if (user.security_feature == true) {
        slug = "2fa_enable_disable_sf";
        await Users
          .update({
            id: user.id
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
          recipientName: user.first_name,
          status: "DISABLED"
        })

      sails
        .hooks
        .email
        .send("general-email", {
          content: emailContent
        }, {
          to: (user.email).trim(),
          subject: "2 Factor Authentication Disabled"
        }, function (err) {
          if (!err) {
            return res.json({
              status: 200,
              message: sails.__("2 factor disabled")
            });
          }
        })

    } catch (error) {
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  },

  deleteUser: async function (req, res) {
    let user_id = req.user.id;
    let userEmail = req.email;

    let user = await Users.findOne({
      id: user_id,
      email: userEmail,
      deleted_at: null
    });

    if (!user) {
      res
        .status(401)
        .json({
          "status": 401,
          "err": sails.__("User not found")
        });
    }

    await Users
      .update({
        id: user.id
      })
      .set({
        email: user.email,
        deleted_by: 1, //deleted by user
        deleted_at: new Date()
      });

    res.json({
      status: 200,
      message: sails.__("user_delete_success")
    });
  },

  getUserTickets: async function (req, res) {
    try {
      let tickets = await sails
        .helpers
        .hubspot
        .tickets
        .getUsersTickets(req.user.id);
      res.json({
        status: 200,
        tickets: tickets.reverse(),
        message: "Ticket"
      });
    } catch (err) {
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  },

  //------------------CMS APi------------------------------------------------//

  getUserPaginate: async function (req, res) {
    try {
      let {
        page,
        limit,
        data,
        sort_col,
        sort_order,
        country
      } = req.allParams();
      let whereAppended = false;
      let query = " from users LEFT JOIN (SELECT referred_id, COUNT(id) as no_of_referrals FROM use" +
        "rs GROUP BY referred_id) as reffral ON users.id = reffral.referred_id";
      if ((data && data != "")) {
        query += " WHERE"
        whereAppended = true;
        if (data && data != "" && data != null) {
          query = query + " (LOWER(users.first_name) LIKE '%" + data.toLowerCase() + "%' OR LOWER(users.last_name) LIKE '%" + data.toLowerCase() + "%' OR LOWER(users.full_name) LIKE '%" + data.toLowerCase() + "%' OR LOWER(users.email) LIKE '%" + data.toLowerCase() + "%' OR LOWER(users.state) LIKE '%" + data.toLowerCase() + "%' OR LOWER(users.postal_code) LIKE '%" + data.toLowerCase() + "%' OR LOWER(users.country) LIKE '%" + data.toLowerCase() + "%'";
        }
        query += ")"
      }

      if (country && country != "") {
        if (whereAppended) {
          query += " AND "
        } else {
          query += " WHERE "
        }
        whereAppended = true;
        query += "  users.country='" + country + "'";
      }

      countQuery = query;
      if (sort_col && sort_order) {
        let sortVal = (sort_order == 'descend' ?
          'DESC' :
          'ASC');
        query += " ORDER BY users." + sort_col + " " + sortVal;
      } else {
        query += " ORDER BY users.created_at DESC";
      }

      query += " limit " + limit + " offset " + (parseInt(limit) * (parseInt(page) - 1));

      let usersData = await sails.sendNativeQuery("Select users.*, CONCAT(users.account_class, '-', users.id) AS UUID, reffral.no_o" +
        "f_referrals" + query, [])

      usersData = usersData.rows;

      let userCount = await sails.sendNativeQuery("Select COUNT(id)" + countQuery, [])
      userCount = userCount.rows[0].count;

      if (usersData) {
        return res.json({
          "status": 200,
          "message": sails.__("Users list"),
          "data": usersData,
          userCount
        });
      }
    } catch (err) {
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  },

  updateUserDetails: async function (req, res) {
    let {
      user_id,
      email,
      percentage
    } = req.allParams();
    var updateUserData;
    if (user_id && email) {
      updateUserData = await Users
        .update({
          id: user_id
        })
        .set({
          email: email,
          referal_percentage: percentage
        })
        .fetch();
    } else {
      updateUserData = await AdminSetting
        .update({
          slug: 'default_referral_percentage'
        })
        .set({
          value: percentage
        })
        .fetch();
    }

    if (updateUserData) {
      return res.json({
        "status": 200,
        "message": sails.__("user referral updated")
      });
    } else {
      return res.json({
        "status": 200,
        "message": sails.__("User not found")
      });
    }
  },

  updateSendCoinFee: async function (req, res) {
    try {
      let {
        send_coin_fee
      } = req.body;

      updateCoinFee = await AdminSetting
        .update({
          slug: 'default_send_coin_fee'
        })
        .set({
          value: send_coin_fee
        })
        .fetch();

      if (updateCoinFee) {
        return res.json({
          "status": 200,
          "message": sails.__("Withdrawal fee update success")
        });
      }
    } catch (err) {
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  },

  userActivate: async function (req, res) {
    try {
      let {
        user_id,
        email,
        is_active,
        is_verified
      } = req.body;

      if (typeof is_active == 'boolean') {
        var usersData = await Users
          .update({
            id: user_id
          })
          .set({
            email: email,
            is_active
          })
          .fetch();
      } else {
        usersData = await Users
          .update({
            id: user_id
          })
          .set({
            email: email,
            is_verified
          })
          .fetch();
      }

      if (usersData && typeof usersData === 'object' && usersData.length > 0) {
        return res.json({
          "status": 200,
          "message": sails.__("User Status Updated")
        });
      } else {
        return res.json({
          "status": 401,
          "message": sails.__("User not found")
        });
      }
    } catch (err) {
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  },

  getCountriesData: async function (req, res) {
    fetch(' https://restcountries.eu/rest/v2/all', {
        method: "GET"
      })
      .then(resData => resData.json())
      .then(resData => {
        res.json({
          status: 200,
          data: resData
        })
      })
      .catch(err => {
        return res
          .status(500)
          .json({
            status: 500,
            "err": sails.__("Something Wrong")
          });
      })
  },

  getCountries: async function (req, res) {
    let countriesResponse = [];
    let countries = await Countries
      .find({
        is_active: true
      })
      .populate('state');
    countries.forEach(country => {
      let temp = {
        name: country.name,
        legality: country.legality,
        color: country.color
      };
      countriesResponse.push(temp);
      country
        .state
        .forEach(state => {
          if (state.is_active) {
            let stateTemp = {
              name: state.name,
              region: country.name,
              legality: state.legality,
              color: state.color
            }
            countriesResponse.push(stateTemp);
          }
        });
    });
    res.json({
      state: 200,
      message: sails.__("Countries retirved success"),
      countries: countriesResponse
    });
  },

  getUserReferredAdmin: async function (req, res) {
    try {
      let {
        page,
        limit,
        data,
        user_id,
        sort_col,
        sort_order
      } = req.allParams();
      let query = " from users LEFT JOIN (SELECT COUNT(id) as total_referal, referred_id FROM users" +
        " GROUP BY referred_id) reffered_data ON users.id = reffered_data.referred_id LEFT JOIN users as refered_by_user ON refered_by_user.id = users.referred_id";
      query += " WHERE users.is_verified='true'";
      if (user_id) {
        query += " AND users.referred_id =" + user_id;
      }
      if ((data && data != "")) {
        query = query + "AND LOWER(users.first_name) LIKE '%" + data.toLowerCase() + "%' OR LOWER(users.last_name) LIKE '%" + data.toLowerCase() + "%' OR LOWER(users.email) LIKE '%" + data.toLowerCase() + "%' OR LOWER(users.full_name) LIKE '%" + data.toLowerCase() + "%'";
        if (!isNaN(data)) {
          query += " OR reffered_data.total_referal=" + data;
        }
      }

      countQuery = query;

      if (sort_col && sort_order) {
        let sortVal = (sort_order == 'descend' ?
          'DESC' :
          'ASC');
        query += " ORDER BY " + sort_col + " " + sortVal;
      }

      query += " limit " + limit + " offset " + (parseInt(limit) * (parseInt(page) - 1));
      let usersData = await sails.sendNativeQuery("Select users.*,reffered_data.total_referal,refered_by_user.email as refered_by" + query, [])

      usersData = usersData.rows;

      let referralCount = await sails.sendNativeQuery("Select COUNT(users.id)" + countQuery, [])
      referralCount = referralCount.rows[0].count;

      if (usersData) {
        return res.json({
          "status": 200,
          "message": sails.__("Referral Users Data"),
          "data": usersData,
          referralCount
        });
      }
    } catch (err) {
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  },

  getUserloginHistoryAdmin: async function (req, res) {
    try {
      let {
        page,
        limit,
        data,
        user_id,
        start_date,
        end_date
      } = req.allParams();
      let q = {
        deleted_at: null,
        user: user_id
      }
      if (start_date && end_date) {
        q['created_at'] = {
          '>=': await sails
            .helpers
            .dateFormat(start_date) + " 00:00:00",
          '<=': await sails
            .helpers
            .dateFormat(end_date) + " 23:59:59"
        };
      }
      if (data) {
        let allHistoryData = await LoginHistory
          .find({
            where: {
              ...q,
              or: [{
                ip: {
                  contains: data
                }
              }]
            }
          })
          .sort("created_at DESC")
          .paginate(page - 1, parseInt(limit));
        let allHistoryCount = await LoginHistory.count({
          where: {
            ...q,
            or: [{
              ip: {
                contains: data
              }
            }]
          }
        });

        if (allHistoryData) {
          return res.json({
            "status": 200,
            "message": sails.__("History list"),
            "data": allHistoryData,
            allHistoryCount
          });
        }
      } else {
        let allHistoryData = await LoginHistory
          .find({
            where: {
              ...q
            }
          })
          .sort("created_at DESC")
          .paginate(page - 1, parseInt(limit));

        let allHistoryCount = await LoginHistory.count({
          where: {
            ...q
          }
        });

        if (allHistoryData) {
          return res.json({
            "status": 200,
            "message": sails.__("History list"),
            "data": allHistoryData,
            allHistoryCount
          });
        }
      }
    } catch (err) {
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  },

  addUser: async function (req, res) {
    try {
      let {
        generate_wallet_coins,
        kyc_done,
        ...user
      } = req.allParams();
      let existedUser = await Users.findOne({
        deleted_at: null,
        email: user.email
      });
      if (existedUser == undefined) {
        let hubspotcontact = await sails
          .helpers
          .hubspot
          .contacts
          .create(user.first_name, user.last_name, user.email)
          .tolerate("serverError", () => {
            throw new Error("serverError");
          });
        let generatedUser = await Users
          .create({
            ...user,
            hubspot_id: hubspotcontact,
            is_active: true,
            is_verified: true,
            password: user.password
          })
          .fetch();
        if (kyc_done == true) {
          await KYC.create({
            first_name: user.first_name,
            last_name: user.last_name,
            steps: 3,
            status: true,
            direct_response: "ACCEPT",
            webhook_response: "ACCEPT",
            user_id: generatedUser.id
          });
        }
        // if (generate_wallet_coins.length > 0) {
        //   // create receive address
        //   for (let index = 0; index < generate_wallet_coins.length; index++) {
        //     const element = generate_wallet_coins[index];
        //     await sails
        //       .helpers
        //       .wallet
        //       .receiveOneAddress(element, generatedUser);
        //   }
        // }
        return res.json({
          status: 200,
          message: sails.__("user created success")
        });
      } else {
        return res
          .status(500)
          .json({
            status: 500,
            "err": sails.__("email already registered")
          });
      }
    } catch (error) {
      console.log('error', error)
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  },

  getTicketsAdmin: async function (req, res) {
    const {
      user_id
    } = req.allParams();
    try {
      let tickets = await sails
        .helpers
        .hubspot
        .tickets
        .getUsersTickets(user_id);
      res.json({
        status: 200,
        tickets: tickets.reverse(),
        message: "Ticket"
      });
    } catch (err) {
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  },
  // Change Security Feature Status
  changeSFStatus: async function (req, res) {
    try {
      let {
        security_feature
      } = req.body;
      var update_data;
      var message;
      var status;
      // security_feature = new Boolean(security_feature);
      if (security_feature == true || security_feature == "true") {
        update_data = {
          security_feature: security_feature,
          // security_feature_expired_time : moment().utc()
        };
        message = sails.__("SF Status Enabled");
        status = "Enabled";
      } else {
        update_data = {
          security_feature: security_feature,
          // security_feature_expired_time : null
        };
        message = sails.__("SF Status Disabled");
        status = "Disabled";
      }
      var user_details = await Users
        .update({
          id: req.user.id
        })
        .set(update_data)
        .fetch();

      // Send email notification
      var slug = 'security_feature_enable_disable';
      var template = await EmailTemplate.findOne({
        slug
      });
      var emailContent = await sails
        .helpers
        .utilities
        .formatEmail(template.content, {
          recipientName: user_details[0].first_name,
          status: status
        })

      await sails
        .hooks
        .email
        .send("general-email", {
          content: emailContent
        }, {
          to: (user_details[0].email).trim(),
          subject: "Security Feature"
        }, function (err) {
          if (!err) {
            return res.json({
              "status": 200,
              "message": message
            });
          } else {
            return res
              .status(500)
              .json({
                status: 500,
                "err": sails.__("Something Wrong")
              });
          }
        })
    } catch (error) {
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  },

  // Change Whitelist IP status
  changeWhitelistIPStatus: async function (req, res) {
    let user_id = req.user.id;
    let {
      status
    } = req.body;
    let user = await Users.findOne({
      id: user_id,
      deleted_at: null
    });

    if (!user) {
      res
        .status(401)
        .json({
          "status": 401,
          "err": sails.__("User not found")
        });
    }

    var user_details = await Users
      .update({
        id: user.id
      })
      .set({
        is_whitelist_ip: status
      })
      .fetch();

    // Send email notification
    var slug = 'own_whitelist_enable_disable';
    var template = await EmailTemplate.findOne({
      slug
    });
    var emailContent = await sails
      .helpers
      .utilities
      .formatEmail(template.content, {
        recipientName: user_details[0].first_name,
        status: (status == true || status == "true" ? "Enabled" : "Disabled")
      })

    await sails
      .hooks
      .email
      .send("general-email", {
        content: emailContent
      }, {
        to: (user_details[0].email).trim(),
        subject: "IP Whitelist status changed"
      }, function (err) {
        if (!err) {
          if (status == true || status == "true") {
            res.json({
              status: 200,
              message: sails.__("Whitelist ip enabled")
            });
          } else {
            res.json({
              status: 200,
              message: sails.__("Whitelist ip disabled")
            });
          }
        } else {
          return res
            .status(500)
            .json({
              status: 500,
              "err": sails.__("Something Wrong")
            });
        }
      })

  },
  // Regenrate Backup code
  regenerateBackupcode: async function (req, res) {
    let user_id = req.user.id;
    let user = await Users.findOne({
      id: user_id,
      deleted_at: null
    });

    if (!user) {
      res
        .status(401)
        .json({
          "status": 401,
          "err": sails.__("User not found")
        });
    }

    if (!user.is_twofactor) {
      res
        .status(500)
        .json({
          "status": 500,
          "err": sails.__("Twofactor not enabled")
        });
    }

    let {
      otp
    } = req.body;

    let verified = speakeasy
      .totp
      .verify({
        secret: user.twofactor_secret,
        encoding: "base32",
        token: otp
      });
    if (verified) {
      var random_string = await sails
        .helpers
        .randomStringGenerator(10);
      await Users
        .update({
          id: user_id
        })
        .set({
          twofactor_backup_code: random_string
        });
      res.json({
        status: 200,
        message: sails.__("Twofactor backup code is generated"),
        twofactor_backup_code: random_string
      });
    } else {
      return res
        .status(401)
        .json({
          status: 401,
          err: sails.__("invalid otp")
        });
    }


  },


  /**
   * API for getting User's security status 2fa/security feature
   * Renders this api when user whitelist IP needs to be fetched
   *
   * @param
   *
   * @return <UserDetails>
   */

  getSecurityStatus: async function (req, res) {
    try {
      var user_id = req.user.id;
      var userData = await Users.findOne({
        select: [
          'is_twofactor', 'security_feature'
        ],
        where: {
          id: user_id
        }
      });

      if (userData != undefined) {
        return res.status(200).json({
          "status": 200,
          "message": sails.__("Record found"),
          "data": userData
        });
      } else {
        return res
          .status(500)
          .json({
            status: 500,
            "err": sails.__("Something Wrong")
          });
      }
    } catch (err) {
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  },

  /**
   * API for Add User's Thresholds limits
   * Renders this api when user whitelist IP needs to be fetched
   *
   * @param
   *
   * @return <UserDetails>
   */
  addOrUpdateUserThresholds: async function (req, res) {
    try {
      var user_id = req.user.id;
      var assets = req.body;

      let users_thresholds = await UserThresholds.findOne({
        deleted_at: null,
        user_id: user_id
      });

      if (users_thresholds != undefined) {
        await UserThresholds
          .update({
            id: users_thresholds.id
          })
          .set({
            asset: assets
          })
      } else {
        await UserThresholds
          .create({
            user_id: user_id,
            asset: assets
          })
      }

      // var data = await UserNotification.findOne({
      //   where: {
      //     slug: "thresold_notification",
      //     user_id: user_id,
      //     deleted_at: null
      //   }
      // })

      // if (data) {
      //   await UserNotification
      //     .update({
      //       slug: "thresold_notification",
      //       user_id: user_id,
      //       deleted_at: null
      //     }).set({
      //       text: req.body.text_status,
      //       email: req.body.email_status
      //     })
      // } else {
      //   await UserNotification.create({
      //     slug: "thresold_notification",
      //     user_id: user_id,
      //     text: req.body.text_status,
      //     email: req.body.email_status,
      //     created_at: Date.now()
      //   })
      // }

      return res.status(200).json({
        "status": 200,
        "message": sails.__("Threshold updated"),
        "data": assets
      });
    } catch (err) {
      console.log("err", err);
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  },

  /**
   * API to get User's Thresholds limits
   * Renders this api when user whitelist IP needs to be fetched
   *
   * @param
   *
   * @return <UserDetails>
   */
  getUserThresholds: async function (req, res) {
    try {
      var user_id = req.user.id;
      var get_coins = await sails.sendNativeQuery("SELECT id as coin_id, coin FROM coins WHERE is_active=true and deleted_at IS NULL");
      let users_thresholds = await UserThresholds.findOne({
        deleted_at: null,
        user_id: user_id
      });
      var all_coins = get_coins.rows;
      var check_all;
      var newarray = [];
      if (users_thresholds != undefined && (users_thresholds.asset != null || users_thresholds.asset != "") && (users_thresholds.asset).length > 0) {
        var assets = users_thresholds.asset;

        all_coins.map(obj => {
          var singledata = {};
          let exisiting = assets.find(each_value => each_value['coin_id'] === obj.coin_id);
          //console.log(exisiting);
          singledata.coin = obj.coin;
          singledata.coin_id = obj.coin_id;
          if (exisiting != undefined) {
            singledata.upper_limit = exisiting.upper_limit;
            singledata.lower_limit = exisiting.lower_limit;
            singledata.is_sms_notification = exisiting.is_sms_notification;
            singledata.is_email_notification = exisiting.is_email_notification;
          } else {
            singledata.upper_limit = 0;
            singledata.lower_limit = 0;
            singledata.is_sms_notification = false;
            singledata.is_email_notification = false;
          }
          newarray.push(singledata);
        })
      } else {

        all_coins.map(obj => {
          var singledata = {};
          singledata.coin_id = obj.coin_id;
          singledata.coin = obj.coin;
          singledata.upper_limit = 0;
          singledata.lower_limit = 0;
          singledata.is_sms_notification = false;
          singledata.is_email_notification = false;
          newarray.push(singledata);
        })
      }
      return res.status(200).json({
        "status": 200,
        "message": sails.__("Threshold listed"),
        "data": newarray
      });
    } catch (err) {
      console.log("err", err);
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  },
  // Get JST Price
  getJSTPrice: async function (req, res) {
    try {
      var req_body = req.body;
      console.log(req.body)
      var symbol = req_body.symbol;
      var quantity = req_body.quantity;
      var side = req_body.side;
      var coin = symbol.split("/");
      var get_price = await sails.helpers.fixapi.getPrice(coin[0], side );



      var price;
      if (side == "Buy") {
        price = get_price.Ask;
      } else {
        price = get_price.Bid;
      }
      var get_faldax_fee = await AdminSetting.findOne({
        slug: "faldax_fee"
      });

      var get_fees = await sails.helpers.feesCalculation(coin[0].toLowerCase(), quantity, price);
      var actual_price = (price);
      get_price.price = actual_price;
      var network_fees = actual_price + (get_fees*actual_price);
      var faldax_fees = actual_price + ( (actual_price*get_faldax_fee.value)/100);
      get_price.network_fees = parseFloat(network_fees).toFixed(process.env.TOTAL_PRECISION);
      get_price.faldax_fees = parseFloat(faldax_fees).toFixed(process.env.TOTAL_PRECISION);
      return res.status(200).json({
        "status": 200,
        "message": sails.__("Price listed"),
        "data": get_price
      });
    } catch (err) {
      console.log("err", err);
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  }

};
