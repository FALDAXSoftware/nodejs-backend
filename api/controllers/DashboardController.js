/**
 * DashboardController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
var moment = require('moment');

module.exports = {
  getAllCounts: async function (req, res) {
    try {
      let userCount = await Users.count({ is_verified: true });
      let coinCount = await Coins.count({ deleted_at: null });
      let pairCount = await Pairs.count({ deleted_at: null });
      let legalCountries = await Countries.count({ legality: 1 });
      let illegalCountries = await Countries.count({ legality: 2 });
      let neutralCountries = await Countries.count({ legality: 3 });
      let blogsCount = await Blogs.count({
        deleted_at: null,
        created_at: { '>=': moment().subtract(1, 'months').format() }
      });
      let employeeCount = await employeeCount.count({ is_active: true, deleted_at: null })

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
        coinCount, userCount, AccountCreated24Hr, pairCount,
        legalCountries, illegalCountries, neutralCountries, blogsCount
      });
    } catch (e) {
      console.log('>>>>e,', e)
      res.status(500).json({
        status: 500,
        "err": sails.__("Something Wrong")
      });
    }
  }
};
