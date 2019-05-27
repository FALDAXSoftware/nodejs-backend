/**
 * UserLimitController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
    // ---------------------------Web Api------------------------------
    // -------------------------------CMS Api--------------------------
    getAllUserLimit: async function (req, res) {
      // req.setLocale('en')
      let {user_id} = req.allParams();
      let userLimitData = await UserLimit
        .find({
        where: {
          deleted_at: null,
          user_id: user_id
        }
      })
        .sort("id ASC");
  
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
    },
  
    updateUserLimit: async function (req, res) {
      try {
        if (req.body.id) {
          const limit_details = await UserLimit.findOne({id: req.body.id, deleted_at : null});
          var updatedLimit;
          if(limit_details == undefined || limit_details == null || !limit_details){
            updatedLimit = await UserLimit
              .create(req.body);
          }else{
            if(req.body.monthly_withdraw_crypto == null && req.body.monthly_withdraw_fiat == null && req.body.daily_withdraw_crypto == null && req.body.daily_withdraw_fiat == null)  {
              updatedLimit = await UserLimit
                .update({id: req.body.id})
                .set({deleted_at : Date.now()})
                .fetch();
                if (!updatedLimit) {
                  return res.json({
                    "status": 200,
                    "message": sails.__("Something Wrong")
                  });
                }
                return res.json({
                  "status": 200,
                  "message": sails.__('Delete Limit')
                });
              }else{
              updatedLimit = await Limit
                .update({id: req.body.id})
                .set(req.body)
                .fetch();
                if (!updatedLimit) {
                  return res.json({
                    "status": 200,
                    "message": sails.__("Something Wrong")
                  });
                }
                return res.json({
                  "status": 200,
                  "message": sails.__('Update Limit')
                });
            }
          }
        } else {
          var updatedLimit = await Limit
              .create(req.body);
          return res
            .status(200)
            .json({
              'status': 200,
              'message': sails._("limit id added sucess")
            })
        }
      } catch (error) {
        console.log(error);
        res
          .status(500)
          .json({
            status: 500,
            "err": sails.__("Something Wrong")
          });
        return;
      }
    }
  };
  