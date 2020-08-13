/**
 * DashboardController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
var moment = require('moment');
var twilio = require('twilio');
var logger = require('./logger');

module.exports = {

  sendSMS: async function (req, res) {
    var accountSid = 'ACc4a225cca20e133fb09056a937e81876'; // Your Account SID from www.twilio.com/console
    var authToken = '3737ee85c8b7dd4fbccc9bfe532bf99f'; // Your Auth Token from www.twilio.com/console

    var client = new twilio(accountSid, authToken);

    client.messages.create({
      body: 'Hello from Node',
      to: '+919727331128', // Text this number
      from: '+13522689310' // From a valid Twilio number
    })
      .then((message) => { });
  },

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
        "message": sails.__("Activity retrived success").message,
        data: activity
      });
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

      var currency = 'USD'

      let risingFalling = await sails
        .helpers
        .dashboard
        .getRisingFallingData(currency);
      res.json({
        "status": 200,
        "message": sails.__("Rising Falling data retrived success").message,
        data: risingFalling
      });
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
        "message": sails.__("Portfolio retrived success").message,
        data: portfolio
      });
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
                    "message": sails.__("error").message
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
                          "message": sails.__("error").message
                        });
                    } else {
                      let cardDate = await sails
                        .helpers
                        .dashboard
                        .getCardData(room);
                      return res.json({
                        status: 200,
                        data: cardDate,
                        "message": sails.__("Card data retrived success").message
                      });
                    }
                  });
              }
            });
        } else {
          sails
            .sockets
            .join(req.socket, room, async function (error) {
              if (error) {
                return res
                  .status(500)
                  .json({
                    status: 500,
                    "err": sails.__("Something Wrong").message,
                    error_at: error.stack
                  });
              } else {
                let cardDate = await sails
                  .helpers
                  .dashboard
                  .getCardData(room);
                return res.json({
                  status: 200,
                  data: cardDate,
                  "message": sails.__("Card data retrived success").message
                });
              }
            });
        }
      } else {
        return res
          .status(403)
          .json({
            status: 403,
            "message": sails.__("error").message
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

  // CMS all count api
  getAllCounts: async function (req, res) {
    try {
      let today = moment().format();
      let dataBefore = moment()
        .startOf('hour')
        .format();

      let monthDate = moment().subtract(30, 'days').format();
      let activeUsers = await Users.count({
        // is_verified: true,
        is_active: true,
        deleted_at: null
      });
      let inactiveUsers = await Users.count({
        is_active: false,
        deleted_at: null
      });
      let deletedUsers = await Users.count({
        deleted_at: {
          '!=': null
        }
      });
      let activeCoins = await Coins.count({
        deleted_at: null,
        is_active: true
      });
      let InactiveCoins = await Coins.count({
        deleted_at: null,
        is_active: false
      });
      let activePairs = await Pairs.count({
        deleted_at: null,
        is_active: true
      });
      let InactivePairs = await Pairs.count({
        deleted_at: null,
        is_active: false
      });
      let legalCountries = await Countries.count({
        legality: 1
      });
      let illegalCountries = await Countries.count({
        legality: 2
      });
      let neutralCountries = await Countries.count({
        legality: 3
      });
      let PartialCountries = await Countries.count({
        legality: 4
      });
      let activeEmployeeCount = await Admin.count({
        is_active: true,
        deleted_at: null
      });
      let inactiveEmployeeCount = await Admin.count({
        is_active: false,
        deleted_at: null
      });
      let jobsCount = await Jobs.count({
        is_active: true,
        deleted_at: null
      });
      let inactiveJobCount = await Jobs.count({
        is_active: false,
        deleted_at: null
      })
      let tradeHistoryData = await TradeHistory.count({
        where: {
          deleted_at: null,
          created_at: [{
            '>=': dataBefore
          },
          {
            '<=': today
          }
          ]
        }
      })
      let withdrawReqCount = await WithdrawRequest.count({
        deleted_at: null,
        created_at: {
          '>=': moment()
            .subtract(7, 'days')
            .format()
        }
      });

      let userSignUpCountValue = await Users.count({
        deleted_at: null,
        is_active: true,
        created_at: {
          '>=': moment().subtract(1, 'days').format()
        }
      })

      let open2Farequest = await UserForgotTwofactors.count({
        where: {
          deleted_at: null,
          status: 'open'
        }
      })

      let approved2Farequest = await UserForgotTwofactors.count({
        where: {
          deleted_at: null,
          status: 'closed'
        }
      })

      let disapproved2Farequest = await UserForgotTwofactors.count({
        where: {
          deleted_at: null,
          status: 'rejected'
        }
      })

      let query = "SELECT symbol, count(quantity) FROM trade_history GROUP BY symbol ORDER BY count(quantity) DESC"

      let transactionCount = await sails.sendNativeQuery(query, [])
      var transactionValue = transactionCount.rows;

      let feesQuery = "SELECT symbol, sum(user_fee) as user_fee, sum(requested_fee) as requested_fee FROM trade_history WHERE created_at >= '" + moment().subtract(30, 'days').format('YYYY-MM-DD HH:mm:ss') + "' GROUP BY symbol ORDER BY sum(user_fee) DESC"
      let feesTransactionCount = await sails.sendNativeQuery(feesQuery, [])
      var feesTransactionValue = feesTransactionCount.rows;

      let walletFeesQuery = `SELECT coins.coin_code, sum(wallet_history.faldax_fee) as faldax_fee, sum(wallet_history.residual_amount) as residual_amount
                                FROM wallet_history LEFT JOIN coins
                                ON wallet_history.coin_id = coins.id
                                WHERE wallet_history.created_at >= '${moment().subtract(30, 'days').format('YYYY-MM-DD HH:mm:ss')}'  AND wallet_history.deleted_at IS NULL
                                AND coins.is_active = 'true' AND coins.deleted_at IS NULL
                                GROUP BY coins.coin_code
                                ORDER BY sum(faldax_fee) DESC`

      let walletFeesTransactionCount = await sails.sendNativeQuery(walletFeesQuery, [])
      var walletFeesTransactionValue = walletFeesTransactionCount.rows;

      let withdrawReqCountValue = await WithdrawRequest.count({
        deleted_at: null,
        is_approve: null,
      });
      let q = {}
      if (req.query.kyc_start_date && req.query.kyc_end_date) {
        q = {
          updated_at: {
            ">=": req.query.kyc_start_date,
            "<=": req.query.kyc_end_date
          }
        }
      }
      let kyc_approved = await KYC.count({
        //is_approve: true,
        deleted_at: null,
        ...q,
        direct_response: 'ACCEPT',
      })
      // let total_kyc = await KYC.count({
      //   deleted_at: null,
      //   ...q
      // })
      let kyc_disapproved = await KYC.count({
        //is_approve: false,
        direct_response: 'DENY',
        deleted_at: null,
        ...q
      })
      let kyc_pending = await KYC.count({
        //deleted_at: null,
        where: {
          deleted_at: null,
          or: [
            {
              direct_response: 'MANUAL_REVIEW'
            },
            {
              direct_response: null
            }
          ],
          ...q
        }
        //is_approve: true,
      })

      total_kyc = kyc_approved + kyc_disapproved + kyc_pending

      let AccHrDate = new Date();
      AccHrDate.setDate(AccHrDate.getDate() - 1)

      let AccountCreated24Hr = await Users.count({
        is_active: true,
        is_verified: true,
        created_at: {
          '<=': AccHrDate
        }
      })

      let TierList = [2, 3, 4]
      var TierData = []
      for (var i = 0; i < TierList.length; i++) {
        let approveTier = `SELECT count(id) FROM tier_main_request WHERE deleted_at IS NULL AND tier_step = ${TierList[i]} AND approved = 'true'`
        let Value = await sails.sendNativeQuery(approveTier, [])

        var data = {}
        data[TierList[i]] = Value.rows[0];
        TierData.push(data)

        let disApproveTier = `SELECT count(id) FROM tier_main_request WHERE deleted_at IS NULL AND tier_step = ${TierList[i]} AND approved = 'false'`
        let disApproveValue = await sails.sendNativeQuery(disApproveTier, [])

        var data = {}
        data[TierList[i]] = disApproveValue.rows[0];
        TierData.push(data)

        let unApproveTier = `SELECT count(id) FROM tier_main_request WHERE deleted_at IS NULL AND tier_step = ${TierList[i]} AND approved IS NULL`
        let unApproveValue = await sails.sendNativeQuery(unApproveTier, [])

        var data = {}
        data[TierList[i]] = unApproveValue.rows[0];
        TierData.push(data)
      }
      return res.json({
        "status": 200,
        "message": sails.__("Dashboard Data retrieved success").message,
        activeCoins,
        InactiveCoins,
        activeUsers,
        inactiveUsers,
        deletedUsers,
        AccountCreated24Hr,
        activePairs,
        InactivePairs,
        legalCountries,
        illegalCountries,
        neutralCountries,
        PartialCountries,
        activeEmployeeCount,
        inactiveEmployeeCount,
        jobsCount,
        inactiveJobCount,
        withdrawReqCount,
        kyc_approved,
        kyc_disapproved,
        total_kyc,
        kyc_pending,
        tradeHistoryData,
        withdrawReqCountValue,
        userSignUpCountValue,
        transactionValue,
        feesTransactionValue,
        walletFeesTransactionValue,
        TierData,
        open2Farequest,
        approved2Farequest,
        disapproved2Farequest
      });
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

  getLine1Count: async function (req, res) {
    try {
      let legalCountries = await Countries.count({
        legality: 1
      });
      let illegalCountries = await Countries.count({
        legality: 2
      });

      let q = {}
      if (req.query.kyc_start_date && req.query.kyc_end_date) {
        q = {
          updated_at: {
            ">=": req.query.kyc_start_date,
            "<=": req.query.kyc_end_date
          }
        }
      }

      let kyc_approved = await KYC.count({
        deleted_at: null,
        ...q,
        direct_response: 'ACCEPT',
      })

      let kyc_disapproved = await KYC.count({
        direct_response: 'DENY',
        deleted_at: null,
        ...q
      })
      let kyc_pending = await KYC.count({
        where: {
          deleted_at: null,
          or: [
            {
              direct_response: 'MANUAL_REVIEW'
            },
            {
              direct_response: null
            }
          ],
          ...q
        }
      })

      total_kyc = kyc_approved + kyc_disapproved + kyc_pending

      return res.json({
        "status": 200,
        "message": sails.__("Dashboard Data retrieved success").message,
        legalCountries,
        illegalCountries,
        kyc_approved,
        kyc_disapproved,
        total_kyc,
        kyc_pending
      });

    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong").message,
          error_at: error.stack
        });
    }
  },

  getLine2Count: async function (req, res) {
    try {

      let feesQuery = "SELECT symbol, sum(user_fee) as user_fee, sum(requested_fee) as requested_fee FROM trade_history WHERE created_at >= '" + moment().subtract(30, 'days').format('YYYY-MM-DD HH:mm:ss') + "' GROUP BY symbol ORDER BY sum(user_fee) DESC"
      let feesTransactionCount = await sails.sendNativeQuery(feesQuery, [])
      var feesTransactionValue = feesTransactionCount.rows;
      console.log("feesTransactionValue", feesTransactionValue)

      let walletFeesQuery = `SELECT coins.coin_code, sum(wallet_history.faldax_fee) as faldax_fee, sum(wallet_history.residual_amount) as residual_amount
                              FROM wallet_history LEFT JOIN coins
                              ON wallet_history.coin_id = coins.id
                              WHERE wallet_history.created_at >= '${moment().subtract(30, 'days').format('YYYY-MM-DD HH:mm:ss')}'  AND wallet_history.deleted_at IS NULL
                              AND coins.is_active = 'true' AND coins.deleted_at IS NULL
                              GROUP BY coins.coin_code
                              ORDER BY sum(faldax_fee) DESC`

      let walletFeesTransactionCount = await sails.sendNativeQuery(walletFeesQuery, [])
      var walletFeesTransactionValue = walletFeesTransactionCount.rows;

      console.log("walletFeesTransactionValue", walletFeesTransactionValue)

      return res.json({
        "status": 200,
        "message": sails.__("Dashboard Data retrieved success").message,
        feesTransactionValue,
        walletFeesTransactionValue,
      });
    } catch (error) {
      console.log(error)
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong").message,
          error_at: error.stack
        });
    }
  },

  getLine3Count: async function (req, res) {
    try {

      console.log("INSIDE FUNVTIOM")

      let query = "SELECT symbol, count(quantity) FROM trade_history WHERE created_at >= '" + moment().subtract(30, 'days').format('YYYY-MM-DD HH:mm:ss') + "' GROUP BY symbol ORDER BY count(quantity) DESC"

      console.log("query", query)

      let transactionCount = await sails.sendNativeQuery(query, [])
      var transactionValue = transactionCount.rows;

      console.log("transactionValue", transactionValue)

      return res
        .status(200)
        .json({
          "status": 200,
          "message": sails.__("Dashboard Data retrieved success").message,
          transactionValue
        });

    } catch (error) {
      console.log("error", error);

      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong").message,
          error_at: error.stack
        });
    }
  },

  getLine4Count: async function (req, res) {
    try {
      let activeUsers = await Users.count({
        is_active: true,
        deleted_at: null
      });
      let inactiveUsers = await Users.count({
        is_active: false,
        deleted_at: null
      });
      let deletedUsers = await Users.count({
        deleted_at: {
          '!=': null
        }
      });

      let activeCoins = await Coins.count({
        deleted_at: null,
        is_active: true
      });
      let InactiveCoins = await Coins.count({
        deleted_at: null,
        is_active: false
      });

      let activeEmployeeCount = await Admin.count({
        is_active: true,
        deleted_at: null
      });
      let inactiveEmployeeCount = await Admin.count({
        is_active: false,
        deleted_at: null
      });
      let jobsCount = await Jobs.count({
        is_active: true,
        deleted_at: null
      });
      let inactiveJobCount = await Jobs.count({
        is_active: false,
        deleted_at: null
      });

      return res.json({
        "status": 200,
        "message": sails.__("Dashboard Data retrieved success").message,
        activeCoins,
        InactiveCoins,
        activeUsers,
        inactiveUsers,
        deletedUsers,
        jobsCount,
        inactiveJobCount,
        activeEmployeeCount,
        inactiveEmployeeCount
      });

    } catch (error) {
      console.log("error", error);

      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong").message,
          error_at: error.stack
        });
    }
  },

  getLine5Count: async function (req, res) {
    try {

      let withdrawReqCountValue = await WithdrawRequest.count({
        deleted_at: null,
        is_approve: null,
      });

      let withdrawReqCount = await WithdrawRequest.count({
        deleted_at: null,
        created_at: {
          '>=': moment()
            .subtract(7, 'days')
            .format()
        }
      });

      let userSignUpCountValue = await Users.count({
        deleted_at: null,
        is_active: true,
        created_at: {
          '>=': moment().subtract(1, 'days').format()
        }
      })

      return res.json({
        "status": 200,
        "message": sails.__("Dashboard Data retrieved success").message,
        // AccountCreated24Hr,
        withdrawReqCount,
        withdrawReqCountValue,
        userSignUpCountValue
      });

    } catch (error) {
      console.log("error", error);
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong").message,
          error_at: error.stack
        });
    }
  },

  getLine6Count: async function (req, res) {
    try {
      let TierList = [2, 3, 4]
      var TierData = []
      for (var i = 0; i < TierList.length; i++) {
        let approveTier = `SELECT count(id) FROM tier_main_request WHERE deleted_at IS NULL AND tier_step = ${TierList[i]} AND approved = 'true'`
        let Value = await sails.sendNativeQuery(approveTier, [])

        var data = {}
        data[TierList[i]] = Value.rows[0];
        TierData.push(data)

        let disApproveTier = `SELECT count(id) FROM tier_main_request WHERE deleted_at IS NULL AND tier_step = ${TierList[i]} AND approved = 'false'`
        let disApproveValue = await sails.sendNativeQuery(disApproveTier, [])

        var data = {}
        data[TierList[i]] = disApproveValue.rows[0];
        TierData.push(data)

        let unApproveTier = `SELECT count(id) FROM tier_main_request WHERE deleted_at IS NULL AND tier_step = ${TierList[i]} AND approved IS NULL`
        let unApproveValue = await sails.sendNativeQuery(unApproveTier, [])

        var data = {}
        data[TierList[i]] = unApproveValue.rows[0];
        TierData.push(data)
      }

      let open2Farequest = await UserForgotTwofactors.count({
        where: {
          deleted_at: null,
          status: 'open'
        }
      })

      let approved2Farequest = await UserForgotTwofactors.count({
        where: {
          deleted_at: null,
          status: 'closed'
        }
      })

      let disapproved2Farequest = await UserForgotTwofactors.count({
        where: {
          deleted_at: null,
          status: 'rejected'
        }
      })

      return res.json({
        "status": 200,
        "message": sails.__("Dashboard Data retrieved success").message,
        TierData,
        open2Farequest,
        approved2Farequest,
        disapproved2Farequest
      });

    } catch (error) {
      console.log("error", error);
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
