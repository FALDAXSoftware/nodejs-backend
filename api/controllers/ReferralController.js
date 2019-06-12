module.exports = {

  //Get Referred user amount
  collectReferral: async function (req, res) {
    try {

      var user_id = req.user.id;
      var referralData = await Referral.find({deleted_at: null, is_collected: false, user_id: user_id});

      console.log(referralData.length);
      if (referralData != undefined && referralData != null && referralData.length > 0) {
        for (var i = 0; i < referralData.length; i++) {
          var walletUserData = await Wallet.findOne({deleted_at: null, user_id: referralData[i].user_id, coin_id: referralData[i].coin_id})
          console.log(walletUserData)
          if (walletUserData != undefined) {
            var walletUserData = await Wallet
              .update({user_id: referralData[i].user_id, coin_id: referralData[i].coin_id, deleted_at: null})
              .set({
                'balance': parseFloat(walletUserData.balance + referralData[i].amount),
                'placed_balance': parseFloat(walletUserData.balance + referralData[i].amount)
              });
            await Referral
              .update({"id": referralData[i].id})
              .set({is_collected: true});
          } else {
            await Referral
              .update({"id": referralData[i].id})
              .set({is_collected: false});
          }
        }
        return res.json({
          "status": 200,
          "message": sails.__("Referral amount collect")
        });
      } else {
        console.log("Inside else ::: ");
        return res.json({
          "status": 400,
          "message": sails.__("No Referral Data found")
        });
      }

    } catch (err) {
      console.log("Error in referral :: ", err);
    }
  },

  getUserReferredAmounts: async function (req, res) {
    try {
      let {id} = req.allParams();

      let referredAmountData = await referral.find({user_id: id})
      let userData = await Users.find({id: id})

      if (referredAmountData) {
        return res.json({
          "status": 200,
          "message": sails.__("Referral Amount Data"),
          "data": referredAmountData,
          userData
        });
      }
    } catch (err) {
      console.log('>>>err', err)
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  }
};
