/**
 * DashboardController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  get: async function (req, res) {
    try {
      let userCount = await Users.count({ is_verified: true });
      let coinCount = await Coins.count({ deleted_at: null });

      let AccHrDate = new Date();
      AccHrDate.setDate(AccHrDate.getDate() - 1)

      let AccountCreated24Hr = await Users.count({
        is_active: true,
        is_verified: true,
        created_at: { '<=': AccHrDate }
      })
      return res.json({
        "status": 200,
        "message": "Dashboard Data",
        coinCount, userCount, AccountCreated24Hr
      });
    } catch (e) {
      res.status(500).json({
        status: 500,
        "err": sails.__("Something Wrong")
      });
    }
  }
};
