/**
 * DashboardController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
var moment = require('moment');

module.exports = {
  // Web Apis
  getActivity: async function (req, res) {
    try {
      let user_id = req.user.id;
      let activity = await sails
        .helpers
        .dashboard
        .getActivity(user_id);
      res.json({ "status": 200, "message": "Activity retrived successfully.", data: activity });
    } catch (error) {
      res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  },

  getRisingFalling: async function (req, res) {
    try {
      // if (req.isSocket) {
      //   if (req.query.currency) {
      //     currency = req.query.currency;
      //   } else {
      //     currency = 'USD';
      //   }

      var currency='USD'

        let risingFalling = await sails
          .helpers
          .dashboard
          .getRisingFallingData(currency);
        res.json({"status": 200, "message": "Rising Falling data retrived successfully.", data: risingFalling});
      // }
    } catch (error) {
      res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  },

  getPortfolio: async function (req, res) {
    try {
      let user_id = req.user.id;
      let portfolio = await sails
        .helpers
        .dashboard
        .getPortfolio(user_id);
      res.json({ "status": 200, "message": "Portfolio retrived successfully.", data: portfolio });
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
  getCardData: async function (req, res) {
    try {
      let room = req.query.room;
      if (req.isSocket) {
        if (req.query.prevRoom) {
          let prevRoom = req.query.prevRoom;
          sails
            .sockets
            .leave(req.socket, prevRoom, async function (leaveErr) {
              if (leaveErr) {
                console.log('>>>leaveErr', leaveErr);
                return res
                  .status(403)
                  .json({ status: 403, "message": "Error occured" });
              } else {
                sails
                  .sockets
                  .join(req.socket, room, async function (err) {
                    if (err) {
                      console.log('>>>err', err);
                      return res
                        .status(403)
                        .json({ status: 403, "message": "Error occured" });
                    } else {
                      let cardDate = await sails
                        .helpers
                        .dashboard
                        .getCardData(room);
                      return res.json({ status: 200, data: cardDate, "message": "Card data retrived successfully." });
                    }
                  });
              }
            });
        } else {
          sails
            .sockets
            .join(req.socket, room, async function (err) {
              if (err) {
                return res
                  .status(500)
                  .json({
                    status: 500,
                    "err": sails.__("Something Wrong")
                  });
              } else {
                let cardDate = await sails
                  .helpers
                  .dashboard
                  .getCardData(room);
                return res.json({ status: 200, data: cardDate, "message": "Card data retrived successfully." });
              }
            });
        }
      } else {
        return res
          .status(403)
          .json({ status: 403, "message": "Error occured" });
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
  // CMS api
  getAllCounts: async function (req, res) {
    try {
      let activeUsers = await Users.count({ is_verified: true, is_active: true });
      let inactiveUsers = await Users.count({ is_verified: true, is_active: false });
      let activeCoins = await Coins.count({ deleted_at: null, is_active: true });
      let InactiveCoins = await Coins.count({ deleted_at: null, is_active: false });
      let activePairs = await Pairs.count({ deleted_at: null, is_active: true });
      let InactivePairs = await Pairs.count({ deleted_at: null, is_active: false });
      let legalCountries = await Countries.count({ legality: 1 });
      let illegalCountries = await Countries.count({ legality: 2 });
      let neutralCountries = await Countries.count({ legality: 3 });
      let blogsCount = await Blogs.count({
        deleted_at: null,
        created_at: {
          '>=': moment()
            .subtract(1, 'months')
            .format()
        }
      });
      let employeeCount = await Admin.count({ is_active: true, deleted_at: null });
      let jobsCount = await Jobs.count({ is_active: true, deleted_at: null });
      let coinReqCount = await AddCoinRequest.count({
        deleted_at: null,
        created_at: {
          '>=': moment()
            .subtract(1, 'months')
            .format()
        }
      });
      let subscriberCount = await Subscribe.count({ deleted_at: null });
      let withdrawReqCount = await WithdrawRequest.count({
        deleted_at: null,
        created_at: {
          '>=': moment()
            .subtract(7, 'days')
            .format()
        }
      });
      let lastSevenInquiry = await Inquiry.count({
        deleted_at: null,
        created_at: {
          '>=': moment()
            .subtract(7, 'days')
            .format()
        }
      });
      let lastThirtyInquiry = await Inquiry.count({
        deleted_at: null,
        created_at: {
          '>=': moment()
            .subtract(1, 'months')
            .format()
        }
      })
      let kyc_approved = await KYC.count({ isApprove: true, deleted_at: null, webhook_response: 'ACCEPT' })
      let total_kyc = await KYC.count({ deleted_at: null })
      let kyc_disapproved = await KYC.count({ isApprove: false, deleted_at: null })
      let kyc_pending = await KYC.count({ deleted_at: null, webhook_response: null, isApprove: true })

      let AccHrDate = new Date();
      AccHrDate.setDate(AccHrDate.getDate() - 1)

      let AccountCreated24Hr = await Users.count({
        is_active: true,
        is_verified: true,
        created_at: {
          '<=': AccHrDate
        }
      })
      return res.json({
        "status": 200,
        "message": "Dashboard Data",
        activeCoins,
        InactiveCoins,
        activeUsers,
        inactiveUsers,
        AccountCreated24Hr,
        activePairs,
        InactivePairs,
        legalCountries,
        illegalCountries,
        neutralCountries,
        blogsCount,
        employeeCount,
        jobsCount,
        coinReqCount,
        subscriberCount,
        withdrawReqCount,
        lastSevenInquiry,
        lastThirtyInquiry,
        kyc_approved,
        kyc_disapproved,
        total_kyc,
        kyc_pending
      });
    } catch (e) {
      console.log('>>>>e,', e)
      res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  }
};
