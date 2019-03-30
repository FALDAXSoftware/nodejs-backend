/**
 * UserController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
var uuidv1 = require('uuid/v1');
var UploadFiles = require('../services/UploadFiles');
var bcrypt = require('bcrypt');
var fetch = require('node-fetch');
var randomize = require('randomatic');
var speakeasy = require('speakeasy');
var QRCode = require('qrcode');

module.exports = {

  //------------------Web APi------------------------------------------------//
  create: async function (req, res) {
    try {

      var referred_id = null;
      let email = req
        .body
        .email
        .toLowerCase();

      var existedUser = await Users.findOne({ email, deleted_at: null });
      if (existedUser) {
        return res
          .status(401)
          .json({ status: 401, "err": 'Email address already exists' });
      }
      if (req.body.referral_code) {
        var referredUser = await Users.findOne({ referral_code: req.body.referral_code });
        if (!referredUser) {
          return res
            .status(401)
            .json({ status: 401, "err": 'Invalid referral code.' });
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
          created_at: new Date(),
          referred_id: referred_id,
          device_type: req.body.device_type,
          email_verify_token: (req.body.device_type == 1 || req.body.device_type == 2)
            ? email_verify_code
            : email_verify_token
        }).fetch();

        if (user_detail) {
          //   Create Recive Address await sails   .helpers   .wallet
          // .receiveAddress(user_detail);
          sails
            .hooks
            .email
            .send((req.body.device_type == 1 || req.body.device_type == 2)
              ? "signupCode"
              : "signup", {
                homelink: sails.config.urlconf.APP_URL,
                recipientName: user_detail.first_name,
                token: sails.config.urlconf.APP_URL + '/login?token=' + email_verify_token,
                tokenCode: (req.body.device_type == 1 || req.body.device_type == 2)
                  ? email_verify_code
                  : email_verify_token,
                senderName: "Faldax"
              }, {
                to: user_detail.email,
                subject: "Signup Verification"
              }, function (err) {
                console.log(err);
                if (!err) {
                  return res.json({
                    "status": 200,
                    "email_verify_token": email_verify_token,
                    "message": (req.body.device_type == 1 || req.body.device_type == 2)
                      ? "Verification code sent to email successfully"
                      : "Verification link sent to email successfully"
                  });
                }
              })
        } else {
          res
            .status(401)
            .json({ status: 401, "err": "Something went wrong" });
          return;
        }
      } else {
        res
          .status(401)
          .json({ status: 401, "err": "email or password or phone_number is not sent" });
        return;
      }
    } catch (error) {
      console.log('error>>>>>>>>>>', error)
      res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")

        });
      return;
    }
  },

  getAllUserDetails: async function (req, res) {
    let { user_id } = req.allParams();
    try {
      let usersData = await Users.find({
        where: {
          id: user_id,
          deleted_at: null
        }
      });
      if (usersData) {
        return res.json({ "status": 200, "message": "Users Data", "data": usersData });
      }
    } catch (err) {
      console.log('error>>>>>>>>>>', err)
      res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
      return;
    }
  },

  getUserDetails: async function (req, res) {
    let id = req.user.id;
    let usersData = await Users.find({ id: id });
    let userKyc = await KYC.findOne({ user_id: id });
    usersData[0].is_kyc_done = false;
    if (userKyc) {
      if (userKyc.steps == 3) {
        usersData[0].is_kyc_done = true;
      }
    }
    var dataResponse = await sails
      .helpers
      .userTradeChecking(usersData[0].id);
    usersData[0].is_allowed = dataResponse.response;
    if (usersData) {
      return res.json({ "status": 200, "message": "Users Data", "data": usersData });
    }
  },

  getReferred: async function (req, res) {
    let id = req.user.id;
    let usersData = await Users.find({
      select: ['email'],
      where: {
        referred_id: id
      }
    });

    if (usersData) {
      return res.json({ "status": 200, "message": "User referred Data", "data": usersData });
    }
  },

  // For Get Login History
  getLoginHistory: async function (req, res) {
    let history = await LoginHistory
      .find({ user: req.user.id })
      .sort('created_at DESC')
      .limit(10);
    return res.json({ "status": 200, "message": "Users Login History", "data": history });
  },

  update: async function (req, res) {
    try {
      const user_details = await Users.findOne({ id: req.user.id });
      if (!user_details) {
        return res
          .status(401)
          .json({ "status": 401, "err": 'Invalid email' });
      }
      var user = req.body;
      user['email'] = user_details['email'];
      delete user.profile;
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

                var updatedUsers = await Users
                  .update({ email: user.email, deleted_at: null })
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
                  .update({ email: user.email })
                  .set({ email: user.email, profile_pic: null });
              }
              var updatedUsers = await Users
                .update({ email: user.email, deleted_at: null })
                .set(user);

              return res.json({
                "status": 200,
                "message": sails.__("User Update")
              });
            }
          } catch (e) {
            console.log('>>>>>>>>>>>>>>>error>>>>>>', e)
            throw e;
          }
        });
    } catch (error) {
      console.log('>>>>>>>>>>>>>>>error', error)
      res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
      return;
    }
  },

  changePassword: async function (req, res) {
    try {
      if (!req.body.current_password || !req.body.new_password || !req.body.confirm_password) {
        return res
          .status(401)
          .json({ status: 401, "err": 'Please provide current password, new password, confirm password' });
      }
      if (req.body.new_password != req.body.confirm_password) {
        return res
          .status(401)
          .json({ status: 401, "err": 'New and confirm password should match' });
      }
      if (req.body.current_password == req.body.new_password) {
        return res
          .status(401)
          .json({ status: 401, "err": 'Current and new password should not be same.' });
      }

      const user_details = await Users.findOne({ id: req.user.id });
      if (!user_details) {
        return res
          .status(401)
          .json({ status: 401, "err": 'User not found' });
      }
      let compareCurrent = await bcrypt.compare(req.body.current_password, user_details.password);
      if (!compareCurrent) {
        return res
          .status(401)
          .json({ status: 401, "err": "Old password is incorrect" });
      }

      var updatedUsers = await Users
        .update({ id: req.user.id })
        .set({ email: user_details.email, password: req.body.new_password })
        .fetch();

      if (updatedUsers) {
        return res.json({ "status": 200, "message": "Password changed successfully" });
      } else {
        return res
          .status(401)
          .json({ "status": 401, err: 'Something went wrong! Could not able to update the password' });
      }
    } catch (error) {
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
    return;
  },

  getReferred: async function (req, res) {
    let id = req.user.id;
    let usersData = await Users.find({
      select: ['email'],
      where: {
        referred_id: id
      }
    });

    if (usersData) {
      return res.json({ "status": 200, "message": "User referred Data", "data": usersData });
    }
  },

  // For Get Login History
  getLoginHistory: async function (req, res) {
    let { page, limit } = req.allParams();
    let history = await LoginHistory
      .find({ user: req.user.id })
      .sort('created_at DESC')
      .paginate(page - 1, parseInt(limit));

    let historyCount = await LoginHistory.count({
      where: {
        user: req.user.id
      }
    });

    return res.json({ "status": 200, "message": "Users Login History", "data": history, historyCount });
  },

  setupTwoFactor: async function (req, res) {
    try {
      let user_id = req.user.id;
      let user = await Users.findOne({ id: user_id, is_active: true, is_verified: true, deleted_at: null });
      if (!user) {
        return res
          .status(401)
          .json({ "status": 401, "err": "User not found or it's not active" });
      }
      const secret = speakeasy.generateSecret({ length: 10 });
      await Users
        .update({ id: user.id })
        .set({ "email": user.email, "twofactor_secret": secret.base32 });
      let url = speakeasy.otpauthURL({
        secret: secret.ascii,
        label: 'FALDAX( ' + user.email + ')'
      });
      QRCode.toDataURL(url, function (err, data_url) {
        return res.json({ status: 200, message: "Qr code sent", tempSecret: secret.base32, dataURL: data_url, otpauthURL: secret.otpauth_url })
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

  verifyTwoFactor: async function (req, res) {
    try {
      let user_id = req.user.id;
      let { otp } = req.allParams();
      let user = await Users.findOne({ id: user_id, is_active: true, is_verified: true, deleted_at: null });
      if (!user) {
        return res
          .status(401)
          .json({ "status": 401, "err": "User not found or it's not active" });
      }
      if (user.is_twofactor == true) {
        return res
          .status(401)
          .json({ "status": 401, "err": "Two factor authentication is already enabled" });
      }

      let verified = speakeasy
        .totp
        .verify({ secret: user.twofactor_secret, encoding: "base32", token: otp, window: 2 });
      if (verified) {
        await Users
          .update({ id: user.id })
          .set({ email: user.email, is_twofactor: true });
        return res.json({ status: 200, message: "Two factor authentication has been enabled" });
      }
      return res
        .status(401)
        .json({ err: "Invalid OTP" });
    } catch (error) {
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
      let user = await Users.findOne({ id: user_id, is_active: true, is_verified: true, deleted_at: null });
      if (!user) {
        return res
          .status(401)
          .json({ "status": 401, "err": "User not found or it's not active" });
      }
      if (user.is_twofactor == false) {
        return res
          .status(401)
          .json({ "status": 401, "err": "Two factor authentication is already disabled" });
      }
      await Users
        .update({ id: user.id, deleted_at: null })
        .set({ email: user.email, is_twofactor: false, twofactor_secret: null });
      return res.json({ status: 200, message: "Two factor authentication has been disabled" });
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

    let user = await Users.findOne({ id: user_id, email: userEmail, deleted_at: null });

    if (!user) {
      res
        .status(401)
        .json({
          "status": 401,
          "err": sails.__("User not found")
        });
    }

    await Users
      .update({ id: user.id })
      .set({ email: user.email, deleted_at: new Date() });

    res.json({
      status: 200,
      message: sails.__("user_delete_success")
    });
  },
  //------------------CMS APi------------------------------------------------//

  getUserPaginate: async function (req, res) {
    try {
      let { page, limit, data } = req.allParams();
      let query = " from users";
      if ((data && data != "")) {
        query += " WHERE"
        if (data && data != "" && data != null) {
          query = query + " LOWER(first_name) LIKE '%" + data.toLowerCase() + "%'" +
            "OR LOWER(last_name) LIKE '%" + data.toLowerCase() + "%'" +
            "OR LOWER(full_name) LIKE '%" + data.toLowerCase() + "%'" +
            "OR LOWER(email) LIKE '%" + data.toLowerCase() + "%'" +
            "OR LOWER(country) LIKE '%" + data.toLowerCase() + "%'";
        }
      }
      countQuery = query;
      query = query + " limit " + limit + " offset " + (parseInt(limit) * (parseInt(page) - 1))
      let usersData = await sails.sendNativeQuery("Select *" + query, [])

      usersData = usersData.rows;

      let userCount = await sails.sendNativeQuery("Select COUNT(id)" + countQuery, [])
      userCount = userCount.rows[0].count;

      if (usersData) {
        return res.json({ "status": 200, "message": "Users list", "data": usersData, userCount });
      }
    } catch (err) {
      return res.status(500).json({ status: 500, "err": sails.__("Something Wrong") });
    }
  },

  updateUserDetails: async function (req, res) {
    let { user_id, email, referal_percentage } = req.body;

    var updateUserData = await Users
      .update({ id: user_id })
      .set({ email: email, referal_percentage: referal_percentage })
      .fetch();

    if (updateUserData) {
      return res.json({ "status": 200, "message": "User Referral Percentage Updated." });
    } else {
      return res.json({ "status": 200, "message": "User(id) not found" });
    }
  },

  userActivate: async function (req, res) {
    let { user_id, email, is_active } = req.body;

    let usersData = await Users
      .update({ id: user_id })
      .set({ email: email, is_active: is_active })
      .fetch();

    if (usersData && typeof usersData === 'object' && usersData.length > 0) {
      return res.json({ "status": 200, "message": "User Status Updated" });
    } else {
      return res.json({ "status": 200, "message": "User(id) not found" });
    }
  },

  getCountriesData: async function (req, res) {
    fetch(' https://restcountries.eu/rest/v2/all', { method: "GET" })
      .then(resData => resData.json())
      .then(resData => {
        res.json({ status: 200, data: resData })
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
      .find({ is_active: true })
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
    res.json({ state: 200, message: "Countries retirved successfully", countries: countriesResponse });
  },

  getUserReferredAdmin: async function (req, res) {
    try {
      let { page, limit, id } = req.allParams();

      let usersData = await Users
        .find({ referred_id: id, is_verified: true })
        .sort("id ASC")
        .paginate(page, parseInt(limit));
      let usersDataCount = await Users.count({ referred_id: id, is_verified: true });
      if (usersData) {
        return res.json({ "status": 200, "message": "Users Data", "data": usersData, usersDataCount });
      }
    } catch (err) {
      console.log('>>>>>>>>>>>', err)
    }
  },

  getUserloginHistoryAdmin: async function (req, res) {
    let { page, limit, data, user_id, start_date, end_date } = req.allParams();
    let q = {
      deleted_at: null,
      user: user_id
    }
    if (start_date && end_date) {
      q['created_at'] = {
        '>=': start_date,
        '<=': end_date
      };
    }
    if (data) {
      let allHistoryData = await LoginHistory.find({
        where: {
          ...q,
          or: [
            {
              ip: {
                contains: data
              }
            }
          ]
        }
      })
        .sort("created_at DESC")
        .paginate(page - 1, parseInt(limit));
      let allHistoryCount = await LoginHistory.count({
        where: {
          ...q,
          or: [
            {
              ip: {
                contains: data
              }
            }
          ]
        }
      });
      if (allHistoryData) {
        return res.json({
          "status": 200,
          "message": sails.__("Coin list"),
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
  }
};
