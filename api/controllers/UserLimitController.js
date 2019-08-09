/**
 * UserLimitController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
var moment = require('moment');
module.exports = {
  // ---------------------------Web Api------------------------------
  // -------------------------------CMS Api--------------------------
  getAllUserLimit: async function (req, res) {
    try {
      const {
        user_id
      } = req.allParams();

      if (user_id) {
        let query = 'FROM coins LEFT JOIN (SELECT * FROM user_limit WHERE user_id = ' + user_id + ' AND deleted_at IS NULL) AS specific_user_limit ON coins.id = specific_user_limit.coin_id WHERE coins.deleted_at IS NULL AND coins.is_active = true';

        let limitData = await sails.sendNativeQuery("Select coins.id as coin_table_id,coins.coin_code,coins.coin,specific_user_limit.*" + query, [])

        limitData = limitData.rows;

        if (limitData.length > 0) {
          return res.json({
            "status": 200,
            "message": sails.__("User Limit list"),
            "data": limitData
          });
        } else {
          return res.json({
            "status": 200,
            "message": sails.__("No User Limit Data List"),
            "data": limitData
          });
        }
      } else {
        return res
          .status(500)
          .json({
            status: 500,
            "err": "User id not found"
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

  updateUserLimit: async function (req, res) {
    try {
      if (req.body.user_id && req.body.coin_id) {
        const limit_details = await UserLimit.findOne({
          user_id: req.body.user_id,
          coin_id: req.body.coin_id,
          deleted_at: null
        });
        var updatedLimit;

        if (limit_details == undefined || limit_details == null || !limit_details) {
          // if (req.body.monthly_withdraw_crypto !== null && req.body.monthly_withdraw_fiat !== null && req.body.daily_withdraw_crypto !== null && req.body.daily_withdraw_fiat !== null)
          updatedLimit = await UserLimit.create({
            ...req.body
          }).fetch();
          if (!updatedLimit) {
            return res.json({
              "status": 500,
              "message": sails.__("Something Wrong")
            });
          }
          return res.json({
            "status": 200,
            "message": sails.__('Create User Limit')
          });
        } else {
          if (req.body.monthly_withdraw_crypto == null && req.body.monthly_withdraw_fiat == null && req.body.daily_withdraw_crypto == null && req.body.daily_withdraw_fiat == null) {
            updatedLimit = await UserLimit
              .update({
                user_id: req.body.user_id,
                coin_id: req.body.coin_id
              })
              .set({
                deleted_at: moment().format()
              })
              .fetch();
            if (!updatedLimit) {
              return res.json({
                "status": 500,
                "message": sails.__("Something Wrong")
              });
            }
            return res.json({
              "status": 200,
              "message": sails.__('Delete User Limit')
            });
          } else {
            updatedLimit = await UserLimit
              .update({
                user_id: req.body.user_id,
                coin_id: req.body.coin_id
              })
              .set(req.body)
              .fetch();
            if (!updatedLimit) {
              return res.json({
                "status": 500,
                "message": sails.__("Something Wrong")
              });
            }
            // User Limit Increased/Decreased Information Email

            let user = await Users.find({
              select: ['first_name', 'email'],
              where: {
                id: req.body.user_id
              }
            });

            let slug = "user_limit_updation"
            let template = await EmailTemplate.findOne({
              slug
            });
            let emailContent = await sails
              .helpers
              .utilities
              .formatEmail(template.content, {
                recipientName: user[0].first_name,
              });
            sails
              .hooks
              .email
              .send("general-email", {
                content: emailContent
              }, {
                to: user[0].email,
                subject: "User Limit Updation"
              }, function (err) {
                if (!err) {
                  return res.json({
                    "status": 200,
                    "message": sails.__("Update User Limit")
                  });
                }
              })
          }
        }
      } else {
        return res.json({
          "status": 500,
          "message": sails.__("User Id and Coin ID necessary")
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
  }
};
