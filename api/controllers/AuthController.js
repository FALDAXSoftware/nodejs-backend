/**
 * AuthController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
var randomize = require('randomatic');
var speakeasy = require('speakeasy');

module.exports = {
  // Verify User Api
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
          await sails
            .helpers
            .wallet
            .receiveAddress(user, req.body.test_key
              ? req.body.test_key
              : "false");
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
      console.log('error', error)
      return res.status(500).json({ "status": 500, "err": sails.__("Something Wrong") });
    }
  },

  // Login User
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
          if (user_detail.is_verified == false) {
            return res
              .status(402)
              .json({ "status": 402, "err": "To login please activate your account" });
          }
          if (user_detail) {
            if (user_detail.is_new_email_verified == false) {
              return res
                .status(405)
                .json({ "status": 405, "err": "To continue, please verify your new email address." });
            }
          }
          if (user_detail.is_active == false) {
            return res
              .status(403)
              .json({
                "status": 403,
                "err": sails.__("Contact Admin")
              });
          }
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
                  .json({ "status": 401, "err": 'Invalid email or password' });
              } else {
                if (user_detail.is_twofactor && user_detail.twofactor_secret) {
                  if (!req.body.otp) {
                    return res
                      .status(201)
                      .json({ "status": 201, "err": 'Please enter OTP to continue' });
                  }
                  let verified = speakeasy
                    .totp
                    .verify({ secret: user_detail.twofactor_secret, encoding: 'base32', token: req.body.otp, window: 2 });
                  if (!verified) {
                    return res
                      .status(402)
                      .json({ "status": 402, "err": 'Invalid OTP' });
                  }
                }

                var dataResponse = await sails
                  .helpers
                  .userTradeChecking(user_detail.id);
                user_detail.is_allowed = dataResponse;

                delete user_detail.password;
                // Create Recive Address await sails.helpers.wallet.receiveAddress(user_detail);
                // Generating JWT Token
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
                if (loginData.length > 0 || req.body.test_key == sails.config.local.test_key) {
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
                  sails
                    .hooks
                    .email
                    .send("NewIpVerification", {
                      homelink: sails.config.urlconf.APP_URL,
                      recipientName: user_detail.first_name,
                      token: verifyToken,
                      ip: ip,
                      senderName: "Faldax"
                    }, {
                        to: user_detail["email"],
                        subject: "New Device Confirmation"
                      }, function (err) {
                        if (!err) {
                          return res
                            .status(401)
                            .json({ "status": 401, "err": "New device confirmation email sent to your email." });
                        } else {
                          console.log(err);
                          return res
                            .status(500)
                            .json({
                              "status": 500,
                              "err": sails.__("Something Wrong")
                            });
                        }
                      })
                }
              }
            });
        } else {
          res
            .status(401)
            .json({ "status": 401, "err": "Invalid email or password" });
          return;
        }
      } else {
        res
          .status(401)
          .json({ "status": 401, "err": "Email or password is not sent" });
        return;
      }
    } catch (error) {
      return res.status(500).json({ "status": 500, "err": sails.__("Something Wrong") });
    }
  },

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
        .json({ "status": 401, "err": "Invalid verification token" });
    } catch (error) {
      return res.status(500).json({ "status": 500, "err": sails.__("Something Wrong") });
    }
  },

  //   Send auth code in email
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
    sails
      .hooks
      .email
      .send("verificationCode", {
        homelink: sails.config.urlconf.APP_URL,
        recipientName: user.first_name,
        code: user.auth_code,
        senderName: "Faldax"
      }, {
          to: user.email,
          subject: "Authentication Code"
        }, function (err) {
          if (!err) {
            return res.json({ "status": 200, "message": "Authentication code sent to email successfully" });
          } else {
            return res.status(500).json({ "status": 500, "err": sails.__("Something Wrong") });
          }
        })
  },

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
        .json({ "status": 401, "err": "Invalid OTP" });
    }
    await User
      .update({ id: user.id })
      .set({ is_twofactor: true, twofactor_secret: null, email: user.email, auth_code: null });
    var token = await sails
      .helpers
      .jwtIssue(user_detail.id);
    return res.json({ status: 200, user: user, token, message: "Login successfull." });
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
        sails
          .hooks
          .email
          .send("signupCode", {
            homelink: sails.config.urlconf.APP_URL,
            recipientName: user.first_name,
            tokenCode: email_verify_code,
            senderName: "Faldax"
          }, {
              to: req.body.email,
              subject: "Signup Verification"
            }, function (err) {
              if (!err) {
                return res.json({ "status": 200, "message": "Verification code sent to email successfully" });
              }
            })
      } else {
        return res
          .status(401)
          .json({ "status": 401, "err": "This email id is not registered with us." });
      }
    } else {
      return res
        .status(500)
        .json({ "status": 500, "err": "Email is required." });
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
            .json({ "status": 400, "err": "Reset Token expired." });
        } else {
          let updateUsers = await Users
            .update({ email: user_details.email, deleted_at: null })
            .set({ email: user_details.email, password: req.body.password, reset_token: null, reset_token_expire: null })
            .fetch();
          if (updateUsers) {
            return res.json({ "status": 200, "message": "Password updated Successfully" });
          } else {
            throw "Update password Error"
          }
        }
      } else {
        return res
          .status(500)
          .json({ "status": 500, "err": "Reset Token or Password is not present." });
      }
    } catch (e) {
      return res.status(500).json({ "status": 500, "err": sails.__("Something Wrong") });
    }
  },

  forgotPassword: async function (req, res) {
    try {
      const user_details = await Users.findOne({ email: req.body.email, deleted_at: null, is_active: true });
      if (!user_details) {
        return res
          .status(401)
          .json({ "status": 401, err: 'This email is not registered with us.' });
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

      sails
        .hooks
        .email
        .send("forgotPassword", {
          homelink: sails.config.urlconf.APP_URL,
          recipientName: user_details.first_name,
          token: sails.config.urlconf.APP_URL + '/reset-password?reset_token=' + reset_token,
          senderName: "Faldax"
        }, {
            to: user_details.email,
            subject: "Forgot Password"
          }, function (err) {
            if (!err) {
              return res.json({ "status": 200, "message": "Reset password link sent to your email successfully." });
            }
          })
    } catch (error) {
      return res.status(500).json({ "status": 500, "err": sails.__("Something Wrong") });
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
            .json({ status: 200, message: "User Log out successfully." });
        }
      }

      let user = await LoginHistory.find({ device_token: req.body.device_token });

      let logged_user = await LoginHistory
        .update({ device_token: req.body.device_token, jwt_token })
        .set({ is_logged_in: false, device_token: null, jwt_token: null, updated_at: new Date() })
        .fetch();

      if (logged_user) {
        return res.json({ status: 200, message: "User Log out successfully." });
      } else {
        return res
          .status(200)
          .json({ status: 200, message: "User Log out successfully." });
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
