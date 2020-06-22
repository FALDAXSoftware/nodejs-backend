var logger = require('./logger');
module.exports = {

  //Get Referred user amount
  collectReferral: async function (req, res) {
    try {
      var user_id = req.user.id;
      // var referralData = await Referral.find({
      //   deleted_at: null,
      //   is_collected: false,
      //   user_id
      // });

      var referralQuery = `SELECT SUM(amount), coin_name
                            FROM referral
                            WHERE deleted_at IS NULL AND is_collected = 'false'
                            AND user_id = ${user_id}
                            GROUP BY coin_name;`

      let referralData = await sails.sendNativeQuery(referralQuery, []);
      referralData = referralData.rows;

      console.log("referralData", referralData)

      var flag = 0;
      var coinArray = [];

      if (referralData != undefined && referralData != null && referralData.length > 0) {
        for (var i = 0; i < referralData.length; i++) {
          console.log("referralData", referralData[i])
          var coinData = await Coins.findOne({
            where: {
              deleted_at: null,
              is_active: true,
              coin: referralData[i].coin_name
            }
          })

          var walletUserData = await Wallet.findOne({
            deleted_at: null,
            user_id: user_id,
            coin_id: coinData.id
          })

          console.log("walletUserData", walletUserData.balance)
          console.log("referralData[i].amount", referralData[i].sum)

          if (walletUserData != undefined) {
            var walletUserData = await Wallet
              .update({
                user_id: user_id,
                coin_id: coinData.id,
                deleted_at: null
              })
              .set({
                'balance': parseFloat(parseFloat(walletUserData.balance) + parseFloat(referralData[i].sum)),
                'placed_balance': parseFloat(parseFloat(walletUserData.balance) + parseFloat(referralData[i].sum))
              });

            let updateQuery = `UPDATE referral
                                SET is_collected = true
                                WHERE deleted_at IS NULL AND is_collected = 'false'
                                AND user_id = ${user_id} AND coin_name = '${referralData[i].coin_name}'`
            var updateSql = await sails.sendNativeQuery(updateQuery, [])

            // await Referral
            //   .update({
            //     "id": referralData[i].id
            //   })
            //   .set({
            //     is_collected: true
            //   });
          } else {
            flag = 1;

            if (coinArray.indexOf(coinData.coin_code) == -1) {
              coinArray.push(coinData.coin_code)
            }
            await Referral
              .update({
                "id": referralData[i].id
              })
              .set({
                is_collected: false
              });
          }
        }
        var msg = ''
        if (flag == 1) {
          msg = "Please generate your "
          for (var i = 0; i < coinArray.length; i++) {
            if (i == 0)
              msg += "" + coinArray[i]
            else
              msg += ", " + coinArray[i]
          }
          msg += " to collect referral. "
        } else {
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

        }

        return res.json({
          "status": 200,
          "message": msg + sails.__("Referral amount collect").message
        });
      } else {
        return res.status(400).
          json({
            "status": 400,
            "message": sails.__("No Referral Data found").message
          });
      }
    } catch (error) {
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
          "message": sails.__("Referral Amount Data").message,
          "data": referredAmountData,
          userData
        });
      }
    } catch (error) {
      // console.log('err', error)
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

  getReferalDetails: async function (req, res) {
    try {
      var referData = await AdminSetting.findOne({
        where: {
          deleted_at: null,
          slug: 'default_referral_percentage'
        }
      });

      return res
        .status(200)
        .json({
          "status": 200,
          "message": sails.__("Referral Percentage has been retrieved successfully").message,
          data: referData
        })
    } catch (error) {
      // console.log('err', error)
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
};
