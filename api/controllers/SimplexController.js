/**
 * SimplexController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

var requestIp = require('request-ip');
const uuidv1 = require('uuid/v1');
var request = require('request')
var logger = require("./logger")
const iplocation = require("iplocation").default;

module.exports = {
  // -------------------------- Web API ------------------------ //
  getLatitude: async function (ip) {
    var value = await iplocation(ip);
    return value;
  },

  // Get Value for the coin on the basis of the amount passed
  getUserQouteDetails: async function (req, res) {
    try {

      var data = req.body;
      var ip = requestIp.getClientIp(req);
      var user_id = req.user.id;
      data.client_ip = ip;
      data.end_user_id = user_id;
      // Call SImplex 
      data.action = '/simplex/simplex-details';
      data.method = 'POST';
      var call_simplex = await sails.helpers.simplex.sbBackend(data);
      if( call_simplex.status == 200 && call_simplex.data.digital_money.amount < 0 ){
        call_simplex.data.digital_money.amount = 0;
      }
      return res.json(call_simplex);

    } catch (err) {
      console.log(err);
      await logger.error(err.message)
      return res.json({
        status: 500,
        "err": sails.__("Something Wrong")
      });
    }
  },

  getQouteDetails: async function (req, res) {
    try {
      var data = req.body;
      var ip = requestIp.getClientIp(req);
      // var user_id = req.user.id;
      // user_id = 1712;
      data.client_ip = ip;
      data.end_user_id = "14569251558";

      var qouteDetail = await sails.helpers.simplex.getQouteDetails(data);

      return res
        .status(200)
        .json({
          "status": 200,
          "message": sails.__("qoute details success"),
          "data": qouteDetail
        });

    } catch (err) {
      console.log(err);
      await logger.error(err.message)
      return res.json({
        status: 500,
        "err": sails.__("Something Wrong")
      });
    }
  },

  // Get partner data value on the basis of the information passed by the user
  getPartnerData: async function (req, res) {
    try {

      var data = req.body;
      var user_id = req.user.id;
      var ip = requestIp.getClientIp(req);

      // Checking for if panic button in one or not
      var panic_button_details = await AdminSetting.findOne({
        where: {
          deleted_at: null,
          slug: 'panic_status'
        }
      });

      if (panic_button_details.value == true || panic_button_details.value == "true") {
        return res
          .status(500)
          .json({
            "status": 500,
            "message": sails.__("panic button enabled")
          })
      }

      //Checking whether user can trade in the area selected in the KYC

      var geo_fencing_data = await sails
        .helpers
        .userTradeChecking(user_id);


      if (geo_fencing_data.response != true) {
        res.json({
          "status": 500,
          "message": sails.__(geo_fencing_data.msg)
        });
      } else {
        // Check Security
        let check_security = await sails.helpers.checkSecurity(user_id, data.otp);
        if (check_security.status != 200) {
          return res
            // .status(check_security.status)
            .status(500)
            .json({
              "status": 500,
              "err": check_security.message
            });
        }

        var payment_id = uuidv1();
        var order_id = uuidv1();

        var main_details = {};
        var account_details = {};
        account_details.app_provider_id = 'faldax';
        account_details.app_version_id = '1.3.1';
        account_details.app_end_user_id = JSON.stringify(user_id);
        var dataValue = await module.exports.getLatitude(ip);
        var latValue = dataValue.latitude + ',' + dataValue.longitude;

        var signupDetails = {
          "ip": ip, // Write req.ip here
          "location": latValue, // Here Langtitude and Longtitude location
          "timestamp": new Date()
        }


        account_details.signup_login = signupDetails;

        var pay_details = {};

        var transaction_details = {};

        pay_details.quote_id = data.quote_id;
        pay_details.payment_id = payment_id;
        pay_details.order_id = order_id;

        var fiat_details = {
          "currency": data.fiat_currency,
          "amount": parseFloat(data.fiat_amount)
        }

        var requested_details = {
          "currency": data.digital_currency,
          "amount": parseFloat(data.total_amount)
        }

        var destination_wallet = {
          "currency": data.digital_currency,
          "address": data.address
        };

        pay_details.fiat_total_amount = fiat_details;
        pay_details.requested_digital_amount = requested_details;
        pay_details.destination_wallet = destination_wallet;
        pay_details.original_http_ref_url = sails.config.local.SIMPLEX_HTTP_REF_URL;

        transaction_details.payment_details = pay_details;

        main_details.account_details = account_details;
        main_details.transaction_details = transaction_details;


        // Call SImplex 
        data.main_details = main_details;
        data.action = '/simplex/get-partner-data';
        data.method = 'POST';
        var call_simplex = await sails.helpers.simplex.sbBackend(data);
        return res.json(call_simplex);
      }

    } catch (err) {
      console.log(err);
      await logger.error(err.message)
      return res.json({
        status: 500,
        "err": sails.__("Something Wrong")
      });
    }
  },

  deleteEvent: async function (event_id) {
    try {
      var keyValue = sails.config.local.SIMPLEX_ACCESS_TOKEN
      key = await sails.helpers.getDecryptData(keyValue);
      await request.delete(sails.config.local.SIMPLEX_URL + "events/" + event_id, {
        headers: {
          'Authorization': 'ApiKey ' + key,
          'Content-Type': 'application/json'
        },
      }, function (err, res, body) {
      });

    } catch (err) {
      console.log(err);
      await logger.error(err.message)
    }
  },

  // Passing events for checking the status of the payment
  checkPaymentStatus: async function () {
    try {
      var data = await sails.helpers.simplex.getEventData();
      var tradeData = await SimplexTradeHistory.find({
        where: {
          deleted_at: null,
          trade_type: 3,
          simplex_payment_status: 1,
          is_processed: false
        }
      }).sort('id DESC');

      for (var i = 0; i < tradeData.length; i++) {
        for (var j = 0; j < data.events.length; j++) {
          var payment_data = JSON.stringify(data.events[j].payment);
          payment_data = JSON.parse(payment_data);
          if (payment_data.id == tradeData[i].payment_id && payment_data.status == "pending_simplexcc_payment_to_partner") {
            var feesFaldax = await AdminSetting.findOne({
              where: {
                deleted_at: null,
                slug: 'simplex_faldax_fees'
              }
            })
            var coinData = await Coins.findOne({
              where: {
                deleted_at: null,
                is_active: true,
                coin: tradeData[i].currency
              }
            });
            var walletData = await Wallet.findOne({
              coin_id: coinData.id,
              deleted_at: null,
              receive_address: tradeData[i].address,
              user_id: tradeData[i].user_id
            })
            if (walletData != undefined) {
              var balanceData = parseFloat(walletData.balance) + (tradeData[i].fill_price)
              var placedBalanceData = parseFloat(walletData.placed_balance) + (tradeData[i].fill_price)
              var walletUpdate = await Wallet
                .update({
                  coin_id: coinData.id,
                  deleted_at: null,
                  receive_address: tradeData[i].address,
                  user_id: tradeData[i].user_id
                })
                .set({
                  balance: balanceData,
                  placed_balance: placedBalanceData
                });

              var walletUpdated = await Wallet.findOne({
                where: {
                  deleted_at: null,
                  coin_id: coinData.id,
                  user_id: 36,
                  is_admin: true
                }
              })
              if (walletUpdated != undefined) {
                var balance = parseFloat(walletUpdated.balance) + (tradeData[i].fill_price);
                var placed_balance = parseFloat(walletUpdated.placed_balance) + (tradeData[i].fill_price);
                var walletUpdated = await Wallet
                  .update({
                    deleted_at: null,
                    coin_id: coinData.id,
                    user_id: 36,
                    is_admin: true
                  })
                  .set({
                    balance: balance,
                    placed_balance: placed_balance
                  })
              }
            }
            if (tradeData[i].simplex_payment_status == 1) {
              var tradeHistoryData = await SimplexTradeHistory
                .update({
                  id: tradeData[i].id
                })
                .set({
                  simplex_payment_status: 2,
                  is_processed: true
                })
                .fetch();

              let referredData = await sails
                .helpers
                .tradding
                .getRefferedAmount(tradeHistoryData, tradeHistoryData.user_id, tradeData[i].id);

              await this.deleteEvent(data.events[j].event_id)
            }
          } else if (payment_data.id == tradeData[i].payment_id) {
            if (payment_data.status == "pending_simplexcc_approval") {
              var tradeHistoryData = await SimplexTradeHistory
                .update({
                  id: tradeData[i].id
                })
                .set({
                  simplex_payment_status: 2,
                  is_processed: true
                }).fetch();

              await this.deleteEvent(data.events[j].event_id)

              var referData = await Referral.findOne({
                where: {
                  deleted_at: null,
                  txid: tradeData[i].id
                }
              })

              if (referData != undefined) {
                let referredData = await sails
                  .helpers
                  .tradding
                  .getRefferedAmount(tradeHistoryData, tradeHistoryData.user_id, tradeData[i].id);

              }
            } else if (payment_data.status == "cancelled") {
              var tradeHistoryData = await SimplexTradeHistory
                .update({
                  id: tradeData[i].id
                })
                .set({
                  simplex_payment_status: 3,
                  is_processed: true
                });
              await this.deleteEvent(data.events[j].event_id)
            }
          }
        }
      }
    } catch (err) {
      console.log(err);
      await logger.error(err.message)
    }
  },

  // get simplex supported coin list
  getSimplexCoinList: async function (req, res) {
    try {
      var coinList = await Coins.find({
        where: {
          deleted_at: null,
          is_active: true,
          is_simplex_supported: true
        }
      });

      var fiatValue = {};

      fiatValue = [{
        id: 1,
        coin: "USD",
        coin_icon: "https://s3.us-east-2.amazonaws.com/production-static-asset/coin/usd.png"
      },
      {
        id: 2,
        coin: "EUR",
        coin_icon: "https://s3.us-east-2.amazonaws.com/production-static-asset/coin/euro.png"
      }
      ]

      var object = {
        coinList,
        fiat: fiatValue
      }

      return res
        .status(200)
        .json({
          "status": 200,
          "message": sails.__("coin list retrieve success"),
          object
        })
    } catch (error) {
      console.log(error);
      await logger.error(error.message)
      return res.json({
        status: 500,
        "err": sails.__("Something Wrong")
      });
    }
  },

  getSimplexList: async function (req, res) {
    try {
      var coinList = await Coins.find({
        where: {
          deleted_at: null,
          is_active: true,
          is_simplex_supported: true
        }
      });

      var fiatValue = {};

      fiatValue = [{
        id: 1,
        coin: "USD",
        coin_icon: "https://s3.us-east-2.amazonaws.com/production-static-asset/coin/usd.png"
      },
      {
        id: 2,
        coin: "EUR",
        coin_icon: "https://s3.us-east-2.amazonaws.com/production-static-asset/coin/euro.png"
      }
      ]

      var object = {
        coinList,
        fiat: fiatValue
      }

      return res
        .status(200)
        .json({
          "status": 200,
          "message": sails.__("coin list retrieve success"),
          object
        })
    } catch (error) {
      console.log(error);
      await logger.error(error.message)
      return res.json({
        status: 500,
        "err": sails.__("Something Wrong")
      });
    }
  },

  // ------------------------ CMS API -------------------------- //
  getSimplexTokenValue: async function (req, res) {
    try {
      var access_token_value = sails.config.local.SIMPLEX_ACCESS_TOKEN;

      var key = await sails.helpers.getDecryptData(access_token_value);

      return res
        .status(200)
        .json({
          status: 200,
          message: sails.__("simplex token retrieve success"),
          data: key
        })
    } catch (err) {
      console.log(err);
      await logger.error(err.message)
      return res.json({
        status: 500,
        "err": sails.__("Something Wrong")
      });
    }
  },

  updateSimplexTokenValue: async function (req, res) {
    try {
      var data = req.body;

      var key_value = await sails.helpers.getEncryptData(data.access_token);

      var updateTokenValue = await AdminSetting
        .update({
          deleted_at: null,
          slug: 'access_token'
        })
        .set({
          value: key_value
        });

      return res
        .status(200)
        .json({
          status: 200,
          message: sails.__("simplex token update success")
        })

    } catch (err) {
      console.log(err);
      await logger.error(err.message)
      return res.json({
        status: 500,
        "err": sails.__("Something Wrong")
      });
    }
  },

  /* Test */
  simplexAPICall: async function (req, res) {

    try {
      var key_value = await sails.helpers.simplex.sbBackend({ id: 1434, res: res });

      // return key_value.data;
      // console.log("key_value",JSON.parse(key_value));
      // if( key_value == "OK")
      // {
      return res
        .status(200)
        .json({
          status: key_value.status,
          message: "Simplex api call",
          data: key_value.data
        })
      // }      


      // return res.send({status:1})


    } catch (err) {
      // console.log(err);
      await logger.error(err.message)
      return res.json({
        status: 500,
        "err": sails.__("Something Wrong")
      });
    }
  },


  // deleteAllEvents: async function (req, res) {
  //   try {
  //     var data = await sails.helpers.simplex.getEventData();
  //     for (var i = 0; i < data.length; i++) {
  //       await this.deleteEvent(data.events[i].event_id)
  //     }
  //   } catch (err) {
  //     console.log(err);
  //   }
  // }
}
