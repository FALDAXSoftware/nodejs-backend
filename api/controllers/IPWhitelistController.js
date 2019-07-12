/**
 * IPWhitelistController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const moment = require('moment');

module.exports = {

  addWhiteListIPUser: async function (req, res) {

    try {

      var user_id = req.user.id;
      var {
        ip,
        days
      } = req.body;

      var addValue = {}
      var max_duration;

      addValue.ip = ip;
      addValue.user_id = user_id

      if (JSON.parse(days) != null) {
        if (JSON.parse(days) > 0) {
          max_duration = moment().add(days, 'days').format('YYYY-MM-DD 23:59:59');
          addValue.max_duration = max_duration;
        } else {
          return res.status(500).json({
            status: 500,
            "message": sails.__("Days greater 0")
          })
        }
      } else {
        addValue.max_duration = null;
      }

      var addIPData = await IPWhitelist.create(addValue);

      return res.status(200).json({
        status: 200,
        "message": sails.__("WhiteLsit IP Add Success")
      })

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

  getWhiteListIPUser: async function (req, res) {
    try {

      var user_id = req.user.id;
      var now = moment().format();
      let {
        page,
        limit
      } = req.allParams();

      var ipData = await IPWhitelist.find({
          where: {
            deleted_at: null,
            user_id: user_id,
            or: [{
              max_duration: {
                '>=': now
              }
            }, {
              max_duration: null
            }]
          }
        })
        .sort('created_at DESC')
        .paginate(page - 1, parseInt(limit));

      let IPCount = await IPWhitelist.count({
        where: {
          user_id: user_id,
          deleted_at: null
        }
      });

      if (ipData.length > 0 && ipData != undefined && ipData != null) {
        return res.status(200).json({
          "status": 200,
          "message": sails.__("WhiteLsit IP info Success"),
          "data": ipData,
          IPCount
        })
      } else {
        return res.status(200).json({
          "status": 204,
          "message": sails.__("WhiteLsit IP info Success Not Found"),
        })
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

  deleteUserWhitelistIP: async function (req, res) {
    try {

      var user_id = req.user.id;
      let {
        id
      } = req.allParams();

      var deleteData = await IPWhitelist.find({
        where: {
          deleted_at: null,
          id: id,
          user_id: user_id
        }
      })

      if (deleteData.length > 0 && deleteData != undefined && deleteData != null) {
        var deletedData = await IPWhitelist
          .update({
            id: id,
            deleted_at: null,
            user_id: user_id
          })
          .set({
            deleted_at: moment().format()
          });

        return res.status(200)
          .json({
            status: 200,
            "message": sails.__("WhiteList IP has been deleted successfully")
          })
      } else {
        return res.status(200).json({
          "status": 204,
          "message": sails.__("WhiteLsit IP info Success Not Found"),
        })
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
  }

};
