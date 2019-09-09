/**
 * TierController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {

  // ------------------------------ WEB API ----------------------------
  getUserTierList: async function (req, res) {
    try {
      var user_id = req.user.id;
      var tierDetails = await Tiers.find({
        where: {
          deleted_at: null
        }
      }).sort('id ASC');

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
        }
      }

      if (tierDetails) {
        return res
          .status(200)
          .json({
            "status": 200,
            "message": sails.__("tier details retrieve success"),
            "data": tierDetails
          })
      } else {
        return res
          .status(201)
          .json({
            "status": 201,
            "message": sails.__("no tier details retrieve success")
          })
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

  // ------------------------ CMS API --------------------------------------------
  getTierList: async function (req, res) {
    try {
      var tierDetails = await Tiers.find({
        where: {
          deleted_at: null
        }
      });

      if (tierDetails) {
        return res
          .status(200)
          .json({
            "status": 200,
            "message": sails.__("tier details retrieve success"),
            "data": tierDetails
          })
      } else {
        return res
          .status(201)
          .json({
            "status": 201,
            "message": sails.__("no tier details retrieve success")
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

  updateTierList: async function (req, res) {
    try {
      var data = req.body;

      for (let index = 0; index < data.length; index++) {
        var tierData = await Tiers.findOne({
          deleted_at: null,
          id: data[index].id
        });

        if (tierData != undefined) {
          var updateTierData = await Tiers
            .update({
              deleted_at: null,
              id: data[index].id
            })
            .set({
              minimum_activity_thresold: data[index].minimum_activity_thresold,
              daily_withdraw_limit: data[index].daily_withdraw_limit,
              monthly_withdraw_limit: data[index].monthly_withdraw_limit,
              requirements: data[index].requirements
            });
        }

      }

      var tierUpdateData = await Tiers.find({
        deleted_at: null
      });

      return res
        .status(200)
        .json({
          "status": 200,
          "message": sails.__("tier update success"),
          "data": tierUpdateData
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
  }

}
