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
      let query = `FROM coins LEFT JOIN user_limit ON coins.id=user_limit.coin_id 
                  WHERE user_limit.user_id = ${req.user.id} AND user_limit.deleted_at = NULL 
                  AND coins.deleted_at = NULL AND coins.is_active = true`

      let limitData = await sails.sendNativeQuery("Select *" + query, [])
  
      if (limitData.length > 0) {
        return res.json({
          "status": 200,
          "message": sails.__("User Limit list"),
          "data": limitData.rows
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
        if (req.body.user_id && req.body.coin_id) {
          const limit_details = await UserLimit.findOne({user_id: req.body.user_id, coin_id: req.body.coin_id , deleted_at : null});
          var updatedLimit;
          if(limit_details == undefined || limit_details == null || !limit_details){
            if(req.body.monthly_withdraw_crypto !== null && req.body.monthly_withdraw_fiat !== null && req.body.daily_withdraw_crypto !== null && req.body.daily_withdraw_fiat !== null)
            updatedLimit = await UserLimit
              .create(req.body);
            
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
            }else{
            if(req.body.monthly_withdraw_crypto == null && req.body.monthly_withdraw_fiat == null && req.body.daily_withdraw_crypto == null && req.body.daily_withdraw_fiat == null)  {
              updatedLimit = await UserLimit
                .update({user_id: req.body.user_id, coin_id: req.body.coin_id})
                .set({deleted_at : Date.now()})
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
              }else{
              updatedLimit = await UserLimit
                .update({user_id: req.body.user_id, coin_id : req.body.coin_id})
                .set(req.body)
                .fetch();
                if (!updatedLimit) {
                  return res.json({
                    "status": 500,
                    "message": sails.__("Something Wrong")
                  });
                }
                return res.json({
                  "status": 200,
                  "message": sails.__('Update User Limit')
                });
            }
          }
        } else {
          return res.json({
            "status" : 500,
            "message": sails.__("User Id and Coin ID necessary")
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
  