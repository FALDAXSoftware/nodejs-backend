/**
 * DashboardController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
var moment = require('moment');

module.exports = {
  // Web Apis

  /**
    * API for getting activity data
    * Renders this api when user activity data needs to be fecthed
    *
    * @param <>
    *
    * @return <User acticity data>
   */

  getActivity: async function (req, res) {
    try {
      let user_id = req.user.id;
      let activity = await sails
        .helpers
        .dashboard
        .getActivity(user_id);
      res.json({
        "status": 200,
        "message": sails.__("Activity retrived success"),
        data: activity
      });
    } catch (error) {
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  },

  /**
    * API for getting rising falling data
    * Renders this api when rising falling data needs to fetched
    *
    * @param <currency>
    *
    * @return <rising falling data or error>
   */

  getRisingFalling: async function (req, res) {
    try {
      // if (req.isSocket) {   if (req.query.currency) {     currency =
      // req.query.currency;   } else {     currency = 'USD';   }

      var currency = 'USD'

      let risingFalling = await sails
        .helpers
        .dashboard
        .getRisingFallingData(currency);
      res.json({
        "status": 200,
        "message": sails.__("Rising Falling data retrived success"),
        data: risingFalling
      });
    } catch (error) {
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  },

  /**
    * API for getting user portfolio data
    * Renders this api when user portfolio needs to fetched
    *
    * @param <>
    *
    * @return <User portfolio data or error data>
   */

  getPortfolio: async function (req, res) {
    try {
      let user_id = req.user.id;
      let portfolio = await sails
        .helpers
        .dashboard
        .getPortfolio(user_id);
      res.json({
        "status": 200,
        "message": sails.__("Portfolio retrived success"),
        data: portfolio
      });
    } catch (error) {
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  },

  /**
    * API for getting card data
    * Renders this api when dashboard is called
    *
    * @param <prevroom , room>
    *
    * @return <Card Data or error data>
   */

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
                return res
                  .status(403)
                  .json({
                    status: 403,
                    "message": sails.__("error")
                  });
              } else {
                sails
                  .sockets
                  .join(req.socket, room, async function (err) {
                    if (err) {
                      return res
                        .status(403)
                        .json({
                          status: 403,
                          "message": sails.__("error")
                        });
                    } else {
                      let cardDate = await sails
                        .helpers
                        .dashboard
                        .getCardData(room);
                      return res.json({
                        status: 200,
                        data: cardDate,
                        "message": sails.__("Card data retrived success")
                      });
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
                return res.json({
                  status: 200,
                  data: cardDate,
                  "message": sails.__("Card data retrived success")
                });
              }
            });
        }
      } else {
        return res
          .status(403)
          .json({
            status: 403,
            "message": sails.__("error")
          });
      }
    } catch (error) {
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  },

  // CMS all count api
  getAllCounts: async function (req, res) {
    try {
      let activeUsers = await Users.count({is_verified: true, is_active: true});
      let inactiveUsers = await Users.count({is_verified: true, is_active: false});
      let activeCoins = await Coins.count({deleted_at: null, is_active: true});
      let InactiveCoins = await Coins.count({deleted_at: null, is_active: false});
      let activePairs = await Pairs.count({deleted_at: null, is_active: true});
      let InactivePairs = await Pairs.count({deleted_at: null, is_active: false});
      let legalCountries = await Countries.count({legality: 1});
      let illegalCountries = await Countries.count({legality: 2});
      let neutralCountries = await Countries.count({legality: 3});
      let employeeCount = await Admin.count({is_active: true, deleted_at: null});
      let jobsCount = await Jobs.count({is_active: true, deleted_at: null});
      let withdrawReqCount = await WithdrawRequest.count({
        deleted_at: null,
        created_at: {
          '>=': moment()
            .subtract(7, 'days')
            .format()
        }
      });
      let kyc_approved = await KYC.count({isApprove: true, deleted_at: null, webhook_response: 'ACCEPT'})
      let total_kyc = await KYC.count({deleted_at: null})
      let kyc_disapproved = await KYC.count({isApprove: false, deleted_at: null})
      let kyc_pending = await KYC.count({deleted_at: null, webhook_response: null, isApprove: true})

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
        "message": sails.__("Dashboard Data retrieved success"),
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
        employeeCount,
        jobsCount,
        withdrawReqCount,
        kyc_approved,
        kyc_disapproved,
        total_kyc,
        kyc_pending
      });
    } catch (e) {
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  }
};
