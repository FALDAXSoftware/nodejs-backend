/**
 * SimplexController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

var requestIp = require('request-ip');
const uuidv1 = require('uuid/v1');
var request = require('request')

module.exports = {
  // -------------------------- Web API ------------------------ //
  // Get Value for the coin on the basis of the amount passed
  getUserQouteDetails: async function (req, res) {
    try {
      var data = req.body;
      var ip = requestIp.getClientIp(req);
      var user_id = req.user.id;
      // user_id = 1712;
      data.client_ip = ip;
      data.end_user_id = user_id;

      var panic_button_details = await AdminSetting.findOne({
        where: {
          deleted_at: null,
          slug: 'panic_status'
        }
      });

      // Checking for if panic button in one or not
      if (panic_button_details.value == false || panic_button_details.value == "false") {
        //Checking whether user can trade in the area selected in the KYC
        // var geo_fencing_data = await sails
        //   .helpers
        //   .userTradeChecking(user_id);


        // if (geo_fencing_data.response == true) {
        var qouteDetail = await sails.helpers.simplex.getQouteDetails(data);
        var coinDetails = await Coins.findOne({
          where: {
            deleted_at: null,
            coin: data.digital_currency,
            is_active: true
          }
        })

        var createMsg = '';
        var walletDetails = await Wallet.findOne({
          where: {
            deleted_at: null,
            user_id: user_id,
            coin_id: coinDetails.id
          }
        })

        if (walletDetails == undefined) {
          createMsg = 'Please create you address to continue'
        }
        return res
          .status(200)
          .json({
            "status": 200,
            "message": sails.__("qoute details success"),
            "data": qouteDetail,
            walletDetails,
            createMsg,
            coinDetails
          });

        // } else {
        //   // Whatever the response of user trade checking
        //   res.json({
        //     "status": 200,
        //     "message": sails.__(geo_fencing_data.msg)
        //   });
        // }
      } else {
        return res
          .status(500)
          .json({
            "status": 500,
            "message": sails.__("panic button enabled")
          })
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

  // Get partner data value on the basis of the information passed by the user
  getPartnerData: async function (req, res) {
    try {

      var data = req.body;
      var user_id = req.user.id;
      console.log(data, user_id);
      // var user_id = 1712;

      var payment_id = uuidv1();
      var order_id = uuidv1();

      var main_details = {};
      var account_details = {};
      account_details.app_provider_id = 'faldax';
      account_details.app_version_id = '1.3.1';
      account_details.app_end_user_id = JSON.stringify(user_id);

      var signupDetails = {
        "ip": "203.88.135.122", // Write req.ip here
        "location": "21.1667,72.8333", // Here Langtitude and Longtitude location
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
      pay_details.original_http_ref_url = "https://www.wallex.com/";

      transaction_details.payment_details = pay_details;

      main_details.account_details = account_details;
      main_details.transaction_details = transaction_details;

      console.log(main_details);

      // Checking for panic button details
      var panic_button_details = await AdminSetting.findOne({
        where: {
          deleted_at: null,
          slug: 'panic_status'
        }
      })

      if (panic_button_details.value == false || panic_button_details.value == "false") {
        //Checking whether user can trade in the area selected in the KYC
        // var geo_fencing_data = await sails
        //   .helpers
        //   .userTradeChecking(user_id);


        // if (geo_fencing_data.response == true) {

        var dataUpdate = await sails.helpers.simplex.getPartnerDataInfo(main_details);
        console.log(dataUpdate);
        console.log(main_details);
        if (dataUpdate.is_kyc_update_required == true) {
          console.log(user_id);
          var dataObject = {
            "version": 1,
            "partner": "faldax",
            "payment_flow_type": "wallet",
            "return_url_success": sails.config.local.SUCCESS_URL,
            "return_url_fail": sails.config.local.FAIL_URL,
            "payment_id": payment_id,
            "quote_id": data.quote_id,
            "user_id": user_id,
            "destination_wallet[address]": data.address,
            "destination_wallet[currency]": data.currency,
            "fiat_total_amount[amount]": parseFloat(data.fiat_amount),
            "fiat_total_amount[currency]": data.fiat_currency,
            "digital_total_amount[amount]": parseFloat(data.total_amount),
            "digital_total_amount[currency]": data.currency,
            "action": "https://sandbox.test-simplexcc.com/payments/new"
          }
          var now = new Date();

          let tradeHistory = await SimplexTradeHistory.create({
            'payment_id': payment_id,
            "quote_id": data.quote_id,
            'currency': data.currency,
            "settle_currency": data.fiat_currency,
            "quantity": parseFloat(data.fiat_amount),
            "user_id": user_id,
            "symbol": data.currency + '-' + data.fiat_currency,
            "side": 'Buy',
            "created_at": now,
            "updated_at": now,
            "maximum_time": now,
            "fill_price": parseFloat(data.total_amount),
            "limit_price": 0,
            "stop_price": 0,
            "price": 0,
            "simplex_payment_status": 1,
            "trade_type": 3,
            "order_status": "filled",
            "order_type": "Market",
            "address": data.address,
            "is_processed": false
          }).fetch();

          console.log(tradeHistory);
          return res
            .status(200)
            .json({
              "status": 200,
              "message": sails.__("payment details success"),
              "data": dataObject
            })
        } else {
          return res
            .status(400)
            .json({
              "status": 400,
              "message": sails.__("payment fail")
            })
        }

        // } else {
        //   // Whatever the response of user trade checking
        //   res.json({
        //     "status": 200,
        //     "message": sails.__(geo_fencing_data.msg)
        //   });
        // }
      } else {
        return res
          .status(500)
          .json({
            "status": 500,
            "message": sails.__("panic button enabled")
          })
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
      var key = await AdminSetting.findOne({
        where: {
          deleted_at: null,
          slug: 'access_token'
        }
      });
      key = await sails.helpers.getDecryptData(key.value);
      await request.delete('https://sandbox.test-simplexcc.com/wallet/merchant/v2/events/' + event_id, {
        headers: {
          'Authorization': 'ApiKey ' + key,
          'Content-Type': 'application/json'
        },
      }, function (err, res, body) {
        console.log(res.body);
      });

    } catch (err) {
      console.log(err);
      await logger.error(err.message)
    }
  },

  // Passing events for checking the status of the payment
  checkPaymentStatus: async function () {
    try {
      console.log("Inside this method????????")
      var data = await sails.helpers.simplex.getEventData();
      var tradeData = await SimplexTradeHistory.find({
        where: {
          deleted_at: null,
          trade_type: 3,
          simplex_payment_status: 1,
          is_processed: false
        }
      }).sort('id DESC');

      console.log("Trade Data >>>>>", tradeData);

      for (var i = 0; i < tradeData.length; i++) {
        for (var j = 0; j < data.events.length; j++) {
          var payment_data = JSON.stringify(data.events[j].payment);
          payment_data = JSON.parse(payment_data);
          console.log("Condition ??????", payment_data.id == tradeData[i].payment_id && payment_data.status == "pending_simplexcc_payment_to_partner")
          console.log(payment_data.id == tradeData[i].payment_id);
          console.log(payment_data.id)
          console.log(tradeData[i].payment_id)
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

              console.log("Trade History Data >>>>>>>>>>>.", tradeHistoryData);

              let referredData = await sails
                .helpers
                .tradding
                .getRefferedAmount(tradeHistoryData, tradeHistoryData.user_id, tradeData[i].id);

              console.log("Deleteing the event in if")

              await this.deleteEvent(data.events[j].event_id)
            }
          } else if (payment_data.id == tradeData[i].payment_id) {
            console.log("ELSE IF >>>>>>>>>>>>>")
            if (payment_data.status == "pending_simplexcc_approval") {
              console.log("IF ????????????")
              var tradeHistoryData = await SimplexTradeHistory
                .update({
                  id: tradeData[i].id
                })
                .set({
                  simplex_payment_status: 2,
                  is_processed: true
                }).fetch();

              var referData = await Referral.findOne({
                where: {
                  deleted_at: null,
                  txid: tradeData[i].id
                }
              })
              console.log("Refer Data >>>>>>>>>", referData);

              if (referData == undefined) {
                let referredData = await sails
                  .helpers
                  .tradding
                  .getRefferedAmount(tradeHistoryData, tradeHistoryData.user_id, tradeData[i].id);

              }

              console.log("Deleteing the event in else")

              await this.deleteEvent(data.events[j].event_id)
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

  // ------------------------ CMS API -------------------------- //
  getSimplexTokenValue: async function (req, res) {
    try {
      var access_token_value = await AdminSetting.findOne({
        deleted_at: null,
        slug: 'access_token'
      });

      var key = await sails.helpers.getDecryptData(access_token_value.value);

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

      console.log(key_value);

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
  }
}
