/**
 * TierController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
var request = require('request');
var logger = require("./logger")

module.exports = {

  // ------------------------------ WEB API ----------------------------
  getUserTierList: async function (req, res) {
    try {
      var user_id = req.user.id;
      var tierDetails = await Tiers.find({
        where: {
          deleted_at: null
        }
      }).sort('tier_step ASC');

      var userData = await Users.findOne({
        where: {
          deleted_at: null,
          is_active: true,
          id: user_id
        }
      });

      for (let index = 0; index < tierDetails.length; index++) {
        if (tierDetails[index].tier_step == userData.account_tier) {
          tierDetails[index].is_active = true;
          if (index != 0)
            for (var i = 1; i <= index; i++) {
              tierDetails[index - i].is_verified = true;
            }
        }
      }

      if (tierDetails) {
        return res
          .status(200)
          .json({
            "status": 200,
            "message": sails.__("tier details retrieve success").message,
            "data": tierDetails
          })
      } else {
        return res
          .status(201)
          .json({
            "status": 201,
            "message": sails.__("no tier details retrieve success").message
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
          error_at: error.stack
        });
    }
  },

  // Upgrade User Tier
  upgradeUserTier: async function (req, res) {
    try {
      var {
        tier_step,
        id,
        status,
        user_id
      } = req.allParams();

      if (tier_step == 2 || tier_step == 3 || tier_step == 4) {
        var upgradeTier = await TierRequest.find({
          where: {
            deleted_at: null,
            user_id: user_id,
            id: id
          }
        });
        console.log(upgradeTier)
        if (upgradeTier.length > 0) {
          console.log("status", status)
          if (status == true || status == "true") {
            var upgradeData = await TierRequest
              .update({
                deleted_at: null,
                user_id: user_id,
                id: id
              })
              .set({
                tier_step: tier_step,
                is_approved: true
              })
          } else if (status == false || status == "false") {
            var upgradeData = await TierRequest
              .update({
                deleted_at: null,
                user_id: user_id,
                id: id
              })
              .set({
                tier_step: tier_step,
                is_approved: false
              })
          }
        } else {
          var upgradeData = await TierRequest
            .create({
              tier_step: tier_step,
              user_id: user_id,
              is_approved: null
            })
        }
        return res
          .status(200)
          .json({
            "status": 200,
            "message": sails.__("tier upgrade request success").message
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
          error_at: error.stack
        });
    }
  },

  // ------------------------ CMS API --------------------------------------------

  // Get Admin User List for Tier Upgradation
  getUserTierRequest: async function (req, res) {
    try {

      let {
        page,
        limit,
        data,
        step,
        start_date,
        end_date,
        sort_col,
        sort_order,
        status
      } = req.allParams();

      var query;
      if (status == 1) {
        query = `FROM tier_request LEFT JOIN users ON tier_request.user_id = users.id 
                          WHERE tier_request.is_approved IS NULL AND tier_request.deleted_at IS NULL
                          AND users.deleted_at IS NULL AND tier_request.tier_step = ${step}`
      } else if (status == 2) {
        query = `FROM tier_request LEFT JOIN users ON tier_request.user_id = users.id 
                        WHERE tier_request.is_approved = 'true' AND tier_request.deleted_at IS NULL
                        AND users.deleted_at IS NULL AND tier_request.tier_step = ${step}`
      } else if (status == 3) {
        query = `FROM tier_request LEFT JOIN users ON tier_request.user_id = users.id 
                        WHERE tier_request.is_approved = 'false' AND tier_request.deleted_at IS NULL
                        AND users.deleted_at IS NULL AND tier_request.tier_step = ${step}`
      }

      if (data && data != "" && data != null) {
        query += " AND (LOWER(users.email) LIKE '%" + data.toLowerCase() + "%' OR LOWER(users.first_name) LIKE '%" + data.toLowerCase() + "%'  OR LOWER(users.last_name) LIKE '%" + data.toLowerCase() + "%'  OR LOWER(tier_request.unique_key) LIKE '%" + data.toLowerCase() + "%')";
      }

      if (start_date && end_date) {
        query += whereAppended ?
          " AND " :
          " WHERE ";

        query += " tier_request.created_at >= '" + await sails
          .helpers
          .dateFormat(start_date) + " 00:00:00' AND tier_request.created_at <= '" + await sails
            .helpers
            .dateFormat(end_date) + " 23:59:59'";
      }

      countQuery = query;

      if (sort_col && sort_order) {
        let sortVal = (sort_order == 'descend' ?
          'DESC' :
          'ASC');
        query += " ORDER BY " + sort_col + " " + sortVal;
      }

      query += " limit " + limit + " offset " + (parseInt(limit) * (parseInt(page) - 1))
      console.log(`SELECT tier_request.id, tier_request.user_id ,tier_request.tier_step, tier_request.unique_key,
      tier_request.is_approved, users.email, users.first_name, users.last_name ` + query)
      tradeData = await sails.sendNativeQuery(`SELECT tier_request.id, tier_request.user_id ,tier_request.tier_step, tier_request.unique_key,
      tier_request.is_approved, users.email, users.first_name, users.last_name, tier_request.ssn ` + query, [])

      tradeData = tradeData.rows;

      tradeCount = await sails.sendNativeQuery("Select COUNT(tier_request.id)" + countQuery, [])
      tradeCount = tradeCount.rows[0].count;

      // var getUserApprovedTierData = await sails.sendNativeQuery("SELECT tier_request.id, tier_request.user_id ,tier_request.tier_step, tier_request.is_approved, users.email, users.first_name, users.last_name FROM tier_request LEFT JOIN users ON tier_request.user_id = users.id WHERE tier_request.is_approved = true AND tier_request.deleted_at IS NULL");
      // getUserApprovedTierData = getUserApprovedTierData.rows;

      // var getUserRejectedTierData = await sails.sendNativeQuery("SELECT tier_request.id, tier_request.user_id ,tier_request.tier_step, tier_request.is_approved, users.email, users.first_name, users.last_name FROM tier_request LEFT JOIN users ON tier_request.user_id = users.id WHERE tier_request.is_approved = false AND tier_request.deleted_at IS NULL");
      // getUserRejectedTierData = getUserRejectedTierData.rows;

      return res
        .status(200)
        .json({
          "status": 200,
          "message": sails.__("tier data retrieve").message,
          tradeData
        })

    } catch (error) {
      // console.log(error);
      // await logger.error(error.message)
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong").message,
          error_at: error.stack
        });
    }
  },

  updateUserTierRequest: async function (req, res) {
    try {
      var {
        id,
        status
      } = req.allParams();

      var tierData = await TierRequest.findOne({
        where: {
          deleted_at: null,
          id: id
        }
      });

      if (tierData != undefined) {

        var tierApproveData = await TierRequest
          .update({
            deleted_at: null,
            id: id
          })
          .set({
            is_approved: status
          })
          .fetch();

        if (status == true || status == "true") {
          var tier_step
          if (tierData.tier_step != 4)
            tier_step = parseInt(tierData.tier_step) + 1;
          else
            tier_step = 4;
          var userData = await Users
            .update({
              deleted_at: null,
              is_active: true,
              id: tierApproveData.user_id
            }).set({
              account_tier: tier_step
            });
        }

        return res
          .status(200)
          .json({
            "status": 200,
            "message": sails.__("request changed successfully").message
          })

      } else {
        return res
          .status(201)
          .json({
            "status": 201,
            "message": sails.__("no request found").message
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
          error_at: error.stack
        });
    }
  },

  getTierList: async function (req, res) {
    try {
      var tierDetails = await Tiers.find({
        where: {
          deleted_at: null
        }
      }).sort('id DESC');

      if (tierDetails) {
        return res
          .status(200)
          .json({
            "status": 200,
            "message": sails.__("tier details retrieve success").message,
            "data": tierDetails
          })
      } else {
        return res
          .status(201)
          .json({
            "status": 201,
            "message": sails.__("no tier details retrieve success").message
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
          error_at: error.stack
        });
    }
  },

  updateTierList: async function (req, res) {
    try {
      var data = req.body;

      var tierData = await Tiers.findOne({
        deleted_at: null,
        id: data.id
      });


      if (tierData != undefined) {
        var updateTierData = await Tiers
          .update({
            deleted_at: null,
            id: data.id
          })
          .set({
            minimum_activity_thresold: data.minimum_activity_thresold,
            daily_withdraw_limit: data.daily_withdraw_limit,
            monthly_withdraw_limit: data.monthly_withdraw_limit,
            requirements: data.requirements
          });
      }

      var tierUpdateData = await Tiers.find({
        deleted_at: null,
        id: data.id
      });

      return res
        .status(200)
        .json({
          "status": 200,
          "message": sails.__("tier update success").message,
          "data": tierUpdateData
        })

    } catch (error) {
      // console.log(error);
      // await logger.error(error.message)
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong").message,
          error_at: error.stack
        });
    }
  },

  // Get Tier Data on basis fo the id
  getTierData: async function (req, res) {
    try {
      var {
        id
      } = req.allParams();

      var tierData = await Tiers.findOne({
        where: {
          deleted_at: null,
          id: id
        }
      });

      if (tierData) {
        return res
          .status(200)
          .json({
            status: 200,
            "message": sails.__("tier data retrieve success").message,
            "data": tierData
          });
      } else {
        return res
          .status(201)
          .json({
            status: 201,
            "message": sails.__("no tier data found").message
          });
      }

    } catch (error) {
      // console.log(error);
      // await logger.error(error.message)
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong").message,
          error_at: error.stack
        });
    }
  }
}
