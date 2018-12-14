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
      let employeeCount = await Admin.count({ is_active: true, deleted_at: null });
      let jobsCount = await Jobs.count({ is_active: true, deleted_at: null });
      let coinReqCount = await AddCoinRequest.count({ deleted_at: null });
      let subscriberCount = await Subscribe.count({ deleted_at: null });
      let withdrawReqCount = await WithdrawRequest.count({
        deleted_at: null,
        created_at: { '>=': moment().subtract(7, 'days').format() }
      });
      let lastSevenInquiry = await Inquiry.count({
        deleted_at: null,
        created_at: { '>=': moment().subtract(7, 'days').format() }
      });
      let lastThirtyInquiry = await Inquiry.count({
        deleted_at: null,
        created_at: { '>=': moment().subtract(1, 'months').format() }
      })
      let kyc_approved = await KYC.count({ isApprove: true, deleted_at: null })
      let total_kyc = await KYC.count({ deleted_at: null })
      let kyc_disapproved = await KYC.count({ isApprove: false, deleted_at: null })
      let kyc_pending = await KYC.count({ deleted_at: null, direct_response: null, step: 3 })



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
        legalCountries, illegalCountries, neutralCountries, blogsCount,
        employeeCount, jobsCount, coinReqCount, subscriberCount, withdrawReqCount,
        lastSevenInquiry, lastThirtyInquiry, kyc_approved, kyc_disapproved, total_kyc
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
