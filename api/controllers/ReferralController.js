module.exports = {
  getUserReferredAmounts: async function (req, res) {
    try {
      let { id } = req.allParams();

      let referredAmountData = await referral.find({ user_id: id })
      let userData = await Users.find({ id: id })

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
