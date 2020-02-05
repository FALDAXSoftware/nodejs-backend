/**
 * IPWhitelistController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const moment = require('moment');
var logger = require("./logger");

module.exports = {

  addWhiteListIPUser: async function (req, res) {
    try {

      var user_id = req.user.id;
      var {
        ip,
        days,
        is_permanent
      } = req.body;

      var addValue = {}
      var expire_time;

      addValue.ip = ip;
      addValue.user_id = user_id;
      addValue.user_type = 2;
      addValue.days = days;
      addValue.is_permanent = (is_permanent != "" && is_permanent == true ? true : false);

      if (days != '' && days != null) {
        if (days > 0) {
          expire_time = moment().add(days, 'days').valueOf();
          addValue.expire_time = expire_time;
        } else {
          return res.status(500).json({
            status: 500,
            "message": sails.__("Days greater 0").message,
            error_at:sails.__("Days greater 0").message
          })
        }
      } else {
        addValue.days = 0;
        addValue.expire_time = null;
      }

      var add_data = await IPWhitelist.addWhitelist(addValue);

      if (add_data) {
        return res.status(401).json({
          status: 500,
          "message": sails.__("IP in whitelist exists").message,
          error_at:sails.__("IP in whitelist exists").message
        })
      } else {
        // Send email notification
        var user_data = await Users.findOne({
          id: user_id
        });

        await Users
          .update({
            id: user_id,
            deleted_at: null
          })
          .set({
            is_whitelist_ip: true
          })
        var slug = "new_ip_whitelist";
        if (user_data.security_feature == true) {
          slug = "new_ip_whitelist_sf";
          await Users
            .update({
              id: user_data.id
            })
            .set({
              security_feature_expired_time: moment().utc().add(process.env.WITHDRAWLS_DURATION, 'minutes')
            })
        }
        let template = await EmailTemplate.findOne({
          slug
        });
        let user_language = (user_data.default_language ? user_data.default_language : 'en');
        let language_content = template.all_content[user_language].content;
        let language_subject = template.all_content[user_language].subject;
        let emailContent = await sails
          .helpers
          .utilities
          .formatEmail(language_content, {
            recipientName: user_data.first_name,
            newIPAddress: ip
          })

        sails
          .hooks
          .email
          .send("general-email", {
            content: emailContent
          }, {
            to: (user_data.email).trim(),
            subject: language_subject
          }, function (err) {
            if (!err) {
              return res.status(200).json({
                "status": 200,
                "message": sails.__("WhiteList IP Add Success").message
              });
            }
          })
      }
    } catch (error) {
      // console.log(error);
      // await logger.error(error.message)
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong").message,
          error_at:error.stack
        });
    }

  },

  getWhiteListIPUser: async function (req, res) {
    try {

      var user_id = req.user.id;
      var now = moment().valueOf();
      let {
        page,
        limit
      } = req.allParams();


      // var ipData = await IPWhitelist.find({
      //     where: {
      //       deleted_at: null,
      //       user_id: user_id,
      //       user_type : user_type,
      //       or: [{
      //         expire_time: {
      //           '>=': now
      //         }
      //       }, {
      //         expire_time: null
      //       }]
      //     }
      //   })
      //   .sort('created_at DESC')
      //   .paginate(page - 1, parseInt(limit));
      let params = {
        deleted_at: null,
        user_id: user_id,
        user_type: 2,
        or: [{
          expire_time: {
            '>=': now
          }
        }, {
          expire_time: null
        }]
      };
      let get_data = await IPWhitelist.getWhiteListData("", params, limit, page);

      if (get_data.data != undefined && get_data.data.length > 0) {
        return res.status(200).json({
          "status": 200,
          "message": sails.__("WhiteList IP info Success").message,
          "data": get_data.data,
          "total": get_data.total
        })
      } else {
        return res.status(200).json({
          "status": 200,
          "message": sails.__("WhiteList IP info Success Not Found").message,
          "data": []
        })
      }

    } catch (error) {
      // await logger.error(error.message)
      // console.log(error);
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong").message,
          error_at:error.stack
        });
    }
  },

  deleteUserWhitelistIP: async function (req, res) {
    try {

      var user_id = req.user.id;
      let {
        id
      } = req.allParams();
      var data = {
        deleted_at: null,
        id: id,
        user_id: user_id
      };
      var delete_data = await IPWhitelist.deleteWhiteListData(id, data);
      if (delete_data) {
        return res.status(200)
          .json({
            status: 200,
            "message": sails.__("WhiteList IP has been deleted successfully").message
          })
      } else {
        return res.status(200).json({
          "status": 204,
          "message": sails.__("WhiteList IP info Success Not Found").message,
        })
      }
    } catch (error) {
      // console.log(error);
      // await logger.error(error.message)
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong").message,
          error_at:error.stack
        });
    }
  }

};
