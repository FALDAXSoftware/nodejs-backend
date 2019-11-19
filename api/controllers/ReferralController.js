var logger = require('./logger');
module.exports = {

  //Get Referred user amount
  collectReferral: async function (req, res) {
    try {
      var user_id = req.user.id;
      var referralData = await Referral.find({
        deleted_at: null,
        is_collected: false,
        user_id
      });

      if (referralData != undefined && referralData != null && referralData.length > 0) {
        for (var i = 0; i < referralData.length; i++) {
          var walletUserData = await Wallet.findOne({
            deleted_at: null,
            user_id: referralData[i].user_id,
            coin_id: referralData[i].coin_id
          })

          if (walletUserData != undefined) {
            var walletUserData = await Wallet
              .update({
                user_id: referralData[i].user_id,
                coin_id: referralData[i].coin_id,
                deleted_at: null
              })
              .set({
                'balance': parseFloat(walletUserData.balance + referralData[i].amount),
                'placed_balance': parseFloat(walletUserData.balance + referralData[i].amount)
              });
            await Referral
              .update({
                "id": referralData[i].id
              })
              .set({
                is_collected: true
              });

            var userData = await Users.findOne({
              deleted_at: null,
              is_active: true,
              id: user_id
            })

            // Sending Notification to the user
            var userNotification = await UserNotification.findOne({
              user_id: userData.id,
              deleted_at: null,
              slug: 'referal'
            })
            if (userNotification != undefined) {
              if (userNotification.email == true || userNotification.email == "true") {
                if (userData.email != undefined)
                  await sails.helpers.notification.send.email("referal", userData)
              }
              if (userNotification.text == true || userNotification.text == "true") {
                if (userData.phone_number != undefined && userData.phone_number != null && userData.phone_number != '')
                  await sails.helpers.notification.send.text("referal", userData)
              }
            }

          } else {
            await Referral
              .update({
                "id": referralData[i].id
              })
              .set({
                is_collected: false
              });
          }
        }
        return res.json({
          "status": 200,
          "message": sails.__("Referral amount collect")
        });
      } else {
        return res.status(400).
        json({
          "status": 400,
          "message": sails.__("No Referral Data found")
        });
      }
    } catch (err) {
      await logger.error(err.message)
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  },

  getUserReferredAmounts: async function (req, res) {
    try {
      let {
        id
      } = req.allParams();

      let referredAmountData = await Referral.find({
        user_id: id
      })
      let userData = await Users.find({
        id: id
      })

      if (referredAmountData) {
        return res.json({
          "status": 200,
          "message": sails.__("Referral Amount Data"),
          "data": referredAmountData,
          userData
        });
      }
    } catch (err) {
      console.log('err', err)
      await logger.error(err.message)
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  },

  getReferalDetails: async function (req, res) {
    try {
      var referData = await AdminSetting.findOne({
        where: {
          deleted_at: null,
          slug: 'default_referral_percentage'
        }
      });

      console.log(referData);

      return res
        .status(200)
        .json({
          "status": 200,
          "message": "Referral Percentage has been retrieved successfully",
          data: referData
        })
    } catch (error) {
      console.log('err', error)
      await logger.error(error.message)
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  }
};
