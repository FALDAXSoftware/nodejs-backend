/**
 * JSTController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const moment = require('moment');
// var logger = require('../controllers/logger')
const {
  Validator
} = require('node-input-validator');

module.exports = {

  /**
   * get conversion pair list
   */
  getJSTPairList: async function (req, res) {
    try {
      // await logger.info({
      //   "module": "JST",
      //   "user_id": "user_" + req.user.id,
      //   "url": req.url,
      //   "type": "Entry"
      // }, "Entered the function")
      var getJSTPair = await JSTPair.find({
        where: {
          deleted_at: null
        }
      });

      var coinList = await Coins.find({
        where: {
          deleted_at: null,
          is_active: true,
          is_jst_supported: true
        }
      })

      var faldax_fee = await AdminSetting.findOne({
        where: {
          deleted_at: null,
          slug: 'faldax_fee'
        }
      })
      // await logger.info({
      //   "module": "JST",
      //   "user_id": "user_" + req.user.id,
      //   "url": req.url,
      //   "type": "Success"
      // }, "JST Pair List")
      return res
        .status(200)
        .json({
          "status": 200,
          "message": sails.__("jst pair retrieve success").message,
          getJSTPair,
          coinList,
          faldax_fee
        })

    } catch (error) {
      // console.log("error", error);
      // await logger.error({
      //   "user_id": "user_" + req.user.id,
      //   "module": "JST",
      //   "url": req.url,
      //   "type": "Error"
      // }, error.message)
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
  Get Asset Pair List
  **/
  getPairList: async function (req, res) {
    try {

      var getJSTPair = await JSTPair.find({
        where: {
          deleted_at: null
        }
      });

      var coinList = await Coins.find({
        where: {
          deleted_at: null,
          is_active: true,
          is_jst_supported: true
        }
      })

      return res
        .status(200)
        .json({
          "status": 200,
          "message": sails.__("jst pair retrieve success").message,
          getJSTPair,
          coinList
        })

    } catch (error) {
      // console.log("error", error);
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
   * Amount of coins he want
   */
  getJSTPriceValue: async function (req, res) {
    try {
      // await logger.info({
      //   "module": "JST",
      //   "user_id": "user_" + req.user.id,
      //   "url": req.url,
      //   "type": "Entry"
      // }, "Entered the function")
      let req_body = req.body;
      let flag = req_body.flag;
      let validator = new Validator(req_body, {
        Symbol: 'required',
        Side: 'required|in:1,2', // 1:Buy, 2:Sell
        OrderQty: 'required|decimal',
        Currency: 'required',
        OrdType: 'required|in:1,2'
      });
      var jstResponseValue = await sails.helpers.fixapi.getJstValue(req_body);

      // Check for Offercode and if it is proper, don't add Faldax fees
      var user_id = req.user.id;
      let offer_code = req_body.offer_code;

      var currency_pair = (req_body.Symbol).split("/");
      let calculate_offer_amount = 0;
      if (req_body.original_pair == req_body.order_pair) {
        var asset1_value = await sails.helpers.fixapi.getLatestPrice(currency_pair[0] + 'USD', "Buy");
        // var asset1_usd_value = asset1_value[0].ask_price;
        var asset1_usd_value = 0.0
        var asset2_value = await sails.helpers.fixapi.getLatestPrice(currency_pair[1] + 'USD', "Buy");
        // var asset2_usd_value = asset2_value[0].ask_price;
        var asset2_usd_value = 0.0;
        calculate_offer_amount = asset1_usd_value;
      } else {
        var asset1_usd_value = asset1_value[0].bid_price;
        var asset2_value = await sails.helpers.fixapi.getLatestPrice(currency_pair[1] + 'USD', "Sell");
        // var asset2_usd_value = asset2_value[0].bid_price;
        var asset2_usd_value = 0.0
        calculate_offer_amount = asset2_usd_value;
      }

      let campaign_id = 0;
      let campaign_offer_id = 0;
      let offer_message = "";
      let offer_applied = false;
      var final_faldax_fees = jstResponseValue.faldax_fee
      var final_faldax_fees_actual = jstResponseValue.faldax_fee;
      jstResponseValue.faldax_fees_actual = final_faldax_fees_actual;
      jstResponseValue.limit_price = jstResponseValue.limit_price;
      if (offer_code && offer_code != "") {
        let check_offer_status = await sails.helpers.fixapi.checkOfferCodeStatus(offer_code, user_id, false);
        // campaign_id = check_offer_status.data.campaign_id;
        // campaign_offer_id = check_offer_status.data.id;
        offer_message = check_offer_status.message;
        // offer_applied = false;
        if (check_offer_status.status == "truefalse") {
          final_faldax_fees = 0.0;


          // Check Partially fees calulations
          var current_order_faldax_fees = parseFloat(final_faldax_fees_actual) * parseFloat(calculate_offer_amount);
          if (parseFloat(check_offer_status.discount_values) < parseFloat(current_order_faldax_fees)) {
            // offer_applied = true;
            var remaining_fees_fiat = parseFloat(current_order_faldax_fees) - parseFloat(check_offer_status.discount_values);
            var final_faldax_fees_crypto = remaining_fees_fiat / calculate_offer_amount;
            final_faldax_fees = final_faldax_fees_crypto;
            // console.log("Faladax Fee >>>>>>>>>>>>>",jstResponseValue.faldax_fee);
            var value = jstResponseValue.total_value;
            jstResponseValue.total_value = parseFloat(jstResponseValue.total_value) - parseFloat(final_faldax_fees);
            jstResponseValue.orderQuantity = parseFloat(value) - parseFloat(final_faldax_fees);
          } else {
            if (flag == 2) {
              var total_value = parseFloat(jstResponseValue.total_value).toFixed(8);
              if (req_body.Side == 1) {
                jstResponseValue.total_value = parseFloat(parseFloat(jstResponseValue.total_value) - parseFloat(jstResponseValue.faldax_fee)).toFixed(8);
                jstResponseValue.faldax_fee = 0.0;
                jstResponseValue.orderQuantity = parseFloat(jstResponseValue.total_value).toFixed(8);
                jstResponseValue.currency_value = parseFloat((parseFloat(jstResponseValue.currency_value) * (jstResponseValue.orderQuantity)) / parseFloat(total_value)).toFixed(8)
              } else if (req_body.Side == 2) {
                jstResponseValue.total_value = parseFloat(parseFloat(jstResponseValue.total_value) - parseFloat(jstResponseValue.faldax_fee)).toFixed(8);
                jstResponseValue.faldax_fee = 0.0;
                jstResponseValue.orderQuantity = parseFloat(jstResponseValue.total_value).toFixed(8);
                jstResponseValue.currency_value = parseFloat((parseFloat(jstResponseValue.currency_value) * (jstResponseValue.orderQuantity)) / parseFloat(total_value)).toFixed(8)
              }
            } else if (flag == 1) {
              if (req_body.Side == 1) {
                jstResponseValue.total_value = parseFloat(parseFloat(jstResponseValue.total_value) + parseFloat(jstResponseValue.faldax_fee)).toFixed(8);
                jstResponseValue.faldax_fee = 0.0;
                jstResponseValue.orderQuantity = parseFloat(jstResponseValue.original_value).toFixed(8);
                jstResponseValue.original_value = parseFloat(jstResponseValue.original_value).toFixed(8)
              } else if (req_body.Side == 2) {
                jstResponseValue.total_value = parseFloat(parseFloat(jstResponseValue.total_value) + parseFloat(jstResponseValue.faldax_fee)).toFixed(8);
                jstResponseValue.faldax_fee = 0.0;
                jstResponseValue.original_value = parseFloat(jstResponseValue.original_value).toFixed(8)
              }
            }
          }
        } else if (check_offer_status.status == true) {
          // offer_applied = true;
          final_faldax_fees = 0.0;
          if (flag == 2) {
            var total_value = jstResponseValue.total_value;
            jstResponseValue.total_value = parseFloat(jstResponseValue.total_value) - parseFloat(jstResponseValue.faldax_fee);
            jstResponseValue.faldax_fee = 0.0;
            jstResponseValue.orderQuantity = jstResponseValue.total_value;
          } else if (flag == 1) {
            var total_value = jstResponseValue.original_value;
            jstResponseValue.original_value = parseFloat(jstResponseValue.original_value) - parseFloat(jstResponseValue.faldax_fee);
            jstResponseValue.faldax_fee = 0.0;
            jstResponseValue.orderQuantity = jstResponseValue.original_value;
          }

        }
        // console.log("final_faldax_fees", final_faldax_f/ees);
      }
      jstResponseValue.faldax_fee = final_faldax_fees;
      // await logger.info({
      //   "module": "JST",
      //   "user_id": "user_" + req.user.id,
      //   "url": req.url,
      //   "type": "Success"
      // }, sails.__("Price retrieve success"))
      return res
        .status(200)
        .json({
          "status": 200,
          "message": sails.__("Price retrieve success").message,
          "data": jstResponseValue
        })

    } catch (error) {
      // console.log("error", error);
      // await logger.error({
      //   "user_id": "user_" + req.user.id,
      //   "module": "JST",
      //   "url": req.url,
      //   "type": "Error"
      // }, error.message)
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
   * Get JST value without auth
   */
  getJSTPriceValueAuth: async function (req, res) {
    try {
      let req_body = req.body;
      let flag = req_body.flag;
      let validator = new Validator(req_body, {
        Symbol: 'required',
        Side: 'required|in:1,2', // 1:Buy, 2:Sell
        OrderQty: 'required|decimal',
        Currency: 'required',
        OrdType: 'required|in:1,2'
      });

      var jstResponseValue = await sails.helpers.fixapi.getJstValue(req_body);

      return res
        .status(200)
        .json({
          "status": 200,
          "message": sails.__("Price retrieve success").message,
          "data": jstResponseValue
        })

    } catch (error) {
      // console.log("error", error);
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
   * Buy Order for creating Order
   *
   */
  createOrder: async function (req, res) {
    try {
      // await logger.info({
      //   "module": "JST",
      //   "user_id": "user_" + JSON.stringify(req.user.id),
      //   "url": req.url,
      //   "type": "Entry"
      // }, "Entered the function")
      let req_body = req.body;

      let validator = new Validator(req_body, {
        // HandlInst: 'required',
        Symbol: 'required',
        Side: 'required|in:1,2', // 1:Buy, 2:Sell
        OrderQty: 'required|decimal',
        Quantity: 'required|decimal',
        Currency: 'required',
        OriginalQuantity: 'required',
        // ExecInst: 'required|in:A,B',
        OrdType: 'required|in:1,2',
        faldax_fees: 'required|decimal',
        network_fees: 'required|decimal',
        buy_currency_amount: 'required|decimal',
        sell_currency_amount: 'required|decimal',
        limit_price: 'required|decimal',
        flag: 'required|in:1,2',
        subtotal: 'required|decimal'
      });
      var final_faldax_fees = req_body.faldax_fees;
      var final_ntwk_fees = req_body.network_fees;
      var final_faldax_fees_actual = req_body.faldax_fees_actual;


      var quantityValue = 0;
      if (req_body.original_pair == req_body.order_pair) {
        quantityValue = (req_body.OriginalQuantity != req_body.Quantity) ? (req_body.Quantity) : (parseFloat(req_body.Quantity) + parseFloat(final_faldax_fees) + parseFloat(final_ntwk_fees))
      } else {
        quantityValue = req_body.OrderQty
      }
      quantityValue = parseFloat(quantityValue).toFixed(sails.config.local.TOTAL_PRECISION)

      let matched = await validator.check();
      if (!matched) {
        for (var key in validator.errors) {
          // await logger.info({
          //   "module": "JST",
          //   "user_id": "user_" + req.user.id,
          //   "url": req.url,
          //   "type": "Success"
          // }, validator.errors[key].message)
          return res
            .status(400)
            .json({
              status: 400,
              "message": validator.errors[key].message
            });
        }
      }

      var user_id = req.user.id;
      // Checking for if panic button in one or not
      var panic_button_details = await AdminSetting.findOne({
        where: {
          deleted_at: null,
          slug: 'panic_status'
        }
      });

      if (panic_button_details.value == true || panic_button_details.value == "true") {
        // await logger.error({
        //   "user_id": "user_" + req.user.id,
        //   "module": "JST Panic Button",
        //   "url": req.url,
        //   "type": "Error"
        // }, sails.__("panic button enabled").message)
        return res
          .status(500)
          .json({
            "status": 500,
            "message": sails.__("panic button enabled").message,
            error_at: sails.__("panic button enabled").message
          })
      }

      //Checking whether user can trade in the area selected in the KYC

      var geo_fencing_data = await sails
        .helpers
        .userTradeChecking(user_id);


      if (geo_fencing_data.response != true) {
        // await logger.error({
        //   "user_id": "user_" + req.user.id,
        //   "module": "JST GeoFencing",
        //   "url": req.url,
        //   "type": "Error"
        // }, sails.__(geo_fencing_data.msg))
        res.json({
          "status": 500,
          "message": sails.__(geo_fencing_data.msg).message,
          error_at: sails.__(geo_fencing_data.msg).message
        });
      } else {
        // Check Security
        let check_security = await sails.helpers.checkSecurity(user_id, req_body.otp);

        if (check_security.status != 200) {
          // await logger.error({
          //   "user_id": "user_" + req.user.id,
          //   "module": "JST Security Status",
          //   "url": req.url,
          //   "type": "Error"
          // }, check_security.message)
          return res
            // .status(check_security.status)
            .status(500)
            .json({
              "status": check_security.status,
              "message": check_security.message,
              error_at: check_security.message
            });
        }


        // Check for User Wallet
        let {
          crypto,
          currency
        } = await sails
          .helpers
          .utilities
          .getCurrencies((req_body.original_pair).replace("/", '-'));

        var coinValue = await Coins.findOne({
          is_active: true,
          deleted_at: null,
          coin: currency
        })

        var walletCurrency = await Wallet.findOne({
          where: {
            deleted_at: null,
            coin_id: coinValue.id,
            user_id: user_id
          }
        });

        if (walletCurrency == undefined || (walletCurrency.send_address == "" && walletCurrency.receive_address == "") || (walletCurrency.send_address == null && walletCurrency.receive_address == null)) {
          // await logger.info({
          //   "module": "JST",
          //   "user_id": "user_" + req.user.id,
          //   "url": req.url,
          //   "type": "Success"
          // }, sails.__("Create Currency Wallet").message)
          return res
            .status(201)
            .json({
              "status": 201,
              "message": sails.__("Create Currency Wallet").message
            })
        }

        var cryptoValue = await Coins.findOne({
          is_active: true,
          deleted_at: null,
          coin: crypto
        })

        var walletCrypto = await Wallet.findOne({
          where: {
            deleted_at: null,
            coin_id: cryptoValue.id,
            user_id: user_id
          }
        });

        if (walletCrypto == undefined || (walletCrypto.send_address == "" && walletCrypto.receive_address == "") || (walletCrypto.send_address == null && walletCrypto.receive_address == null)) {
          // await logger.info({
          //   "module": "JST",
          //   "user_id": "user_" + req.user.id,
          //   "url": req.url,
          //   "type": "Success"
          // }, sails.__("Create Crypto Wallet").message)
          return res
            .status(201)
            .json({
              "status": 201,
              "message": sails.__("Create Crypto Wallet").message
            })
        }

        if (req_body.OriginalQuantity < cryptoValue.jst_min_coin_limit) {
          // await logger.error({
          //   "user_id": "user_" + req.user.id,
          //   "module": "JST Create Order",
          //   "url": req.url,
          //   "type": "Error"
          // }, sails.__("Minimum Order Limit not satisfied").message)
          return res
            .status(500)
            .json({
              "status": 500,
              "message": sails.__("Minimum Order Limit not satisfied").message,
              error_at: sails.__("Minimum Order Limit not satisfied").message
            })
        }

        var wallet;
        // Check Wallet Balance
        if (req_body.original_pair == req_body.order_pair) {
          wallet = await sails
            .helpers
            .utilities
            .getWalletBalance(crypto, currency, user_id)
            .intercept("coinNotFound", () => {
              return new Error("coinNotFound");
            })
            .intercept("serverError", () => {
              return new Error("serverError")
            });
        } else {
          wallet = await sails
            .helpers
            .utilities
            .getSellWalletBalance(crypto, currency, user_id)
            .intercept("coinNotFound", () => {
              return new Error("coinNotFound");
            })
            .intercept("serverError", () => {
              return new Error("serverError")
            });
        }
        var balanceChecking = 0;
        // if (req_body.original_pair == req_body.order_pair) {
        balanceChecking = req_body.OrderQty
        // } else {
        //   balanceChecking = req_body.Quantity
        // }
        // if ((balanceChecking) > (wallet.placed_balance).toFixed(sails.config.local.TOTAL_PRECISION)) {
        if (parseFloat(balanceChecking) > parseFloat((wallet.placed_balance).toFixed(sails.config.local.TOTAL_PRECISION))) {
          // await logger.error({
          //   "user_id": "user_" + req.user.id,
          //   "module": "JST Create Order",
          //   "url": req.url,
          //   "type": "Error"
          // }, sails.__("insufficent funds in wallet").message)
          return res
            .status(500)
            .json({
              status: 500,
              "message": sails.__("insufficent funds in wallet").message,
              error_at: sails.__("insufficent funds in wallet").message
            });
        }
        // if (req_body.original_pair != req_body.order_pair && req_body.Side == 2 && req_body.flag == 1) {
        //   req_body.buy_currency_amount = (parseFloat(req_body.Quantity) + parseFloat(req_body.faldax_fees_actual) + parseFloat(req_body.network_fees));
        // }


        req_body.OrdType = '2'; // Make Limit Order Only
        let order_create = {
          currency: crypto,
          side: (req_body.Side == 1 ? "Buy" : "Sell"),
          order_type: (req_body.OrdType == '2' ? "Limit" : "Market"),
          order_status: "open",
          fix_quantity: parseFloat(quantityValue),
          symbol: req_body.Symbol,
          user_id: user_id,
          faldax_fees: req_body.faldax_fees,
          network_fees: req_body.network_fees,
          buy_currency_amount: req_body.buy_currency_amount,
          sell_currency_amount: req_body.sell_currency_amount,
          limit_price: req_body.limit_price,
          subtotal: parseFloat(req_body.subtotal)
        };

        var create_order = await JSTTradeHistory.create(order_create).fetch();

        // console.log("create_o/rder",create_order);
        let order_object = {
          ClOrdID: create_order.cl_order_id,
          HandlInst: "1",
          Symbol: (req_body.Symbol).replace("/", ""),
          Side: (req_body.Side).toString(), // 1:Buy, 2:Sell
          OrderQty: (quantityValue).toString(),
          OrdType: (req_body.OrdType).toString(),
          Price: (req_body.limit_price).toString(),
          // Currency: crypto,
          // ExecInst: "B",
          // TimeInForce: "0",
          TimeInForce: "3",
          SecurityType: "FOR"
          // Product: "4",
          // MinQty:quantityValue+10
        };
        var get_market_snapshotfor_execution = await sails.helpers.fixapi.getSnapshotPrice(req_body.Symbol, (req_body.Side == 1 ? "Buy" : "Sell"), quantityValue, req_body.flag, "create_order");
        var response = await sails.helpers.fixapi.buyOrder(order_object);
        var update_data = {
          order_id: response.data.OrderID
        };
        var update_order = await JSTTradeHistory
          .update({
            id: create_order.id
          })
          .set(update_data).fetch();
        // var response = {};
        if (response == undefined || response.status == 0) {
          var user_id = req.user.id;
          var userData = await Users.findOne({
            select: ['email', 'first_name', 'phone_number'],
            where: {
              deleted_at: null,
              is_active: true,
              id: user_id
            }
          })

          if (userData != undefined) {
            await sails.helpers.notification.send.email("jst_order_failed", userData)
          }
          // await logger.error({
          //   "user_id": "user_" + req.user.id,
          //   "module": "JST Create Order",
          //   "url": req.url,
          //   "type": "Error"
          // }, sails.__("jst order not created").message)
          return res
            .status(500)
            .json({
              status: 500,
              "message": sails.__("jst order not created").message,
              error_at: sails.__("jst order not created").message
            });
        } else {
          var jst_response_data = response.data; // JST Response Success Data
          // Check cases for Order execution
          var order_completed = false;
          var order_status = 'open';
          switch (jst_response_data.ExecType) {
            case "F":
              order_completed = true;
              break;

            case "4":
              order_completed = false;
              break;

            case "8":
              order_completed = false;
              break;
          }


          switch (jst_response_data.OrdStatus) {
            case "1":
              order_status = 'partially_filled';
              break;

            case "2":
              order_status = 'filled';
              break;

            case "4":
              order_status = 'cancelled';
              break;

            case "8":
              order_status = 'failed';
              break;
          }




          if (order_completed == false || order_status == 'cancelled' || order_status == 'failed') {
            var reason_text = '';
            switch (jst_response_data.OrdStatus.OrdRejReason != "") {
              case 0:
                reason_text = 'Unknown Error';
                break;
              case 1:
                reason_text = 'Currency pair is not supported';
                break;
              case 2:
                reason_text = 'Orders may not be entered while the venue is closed';
                break;
              case 3:
                reason_text = 'The order is not in the book';
                break;
              case 4:
                reason_text = 'Order quantity is outside of the allowable range';
                break;
              case 5:
                reason_text = 'Order price is outside of the allowable range';
                break;
              case 6:
                reason_text = 'Duplicate Order';
                break;
              case 7:
                reason_text = 'Duplicate of a verbally communicated order';
                break;
              case 8:
                reason_text = 'Term currency orders are not supported';
                break;
            }
            var update_data = {
              fill_price: jst_response_data.SettlCurrAmt,
              quantity: jst_response_data.CumQty,
              is_partially_filled: (jst_response_data.OrdStatus == 1 ? true : false),
              order_id: jst_response_data.OrderID,
              execution_report: jst_response_data,
              transact_time: jst_response_data.TransactTime,
              settl_date: jst_response_data.SettlDate,
              trade_date: jst_response_data.TradeDate,
              order_status: order_status,
              reason: (jst_response_data.Text ? jst_response_data.Text : ""),
              exec_id: jst_response_data.ExecID
            };


            var update_order = await JSTTradeHistory
              .update({
                id: create_order.id
              })
              .set(update_data).fetch();

            var user_id = req.user.id;
            var userData = await Users.findOne({
              select: ['email', 'first_name', 'phone_number'],
              where: {
                deleted_at: null,
                is_active: true,
                id: user_id
              }
            })

            if (userData != undefined) {
              await sails.helpers.notification.send.email("jst_order_failed", userData)
            }
            // await logger.error({
            //   "user_id": "user_" + req.user.id,
            //   "module": "JST Create Order",
            //   "url": req.url,
            //   "type": "Error"
            // }, sails.__("jst order not created").message)
            return res
              .status(500)
              .json({
                "status": 500,
                // "message": sails.__("jst order not created") + "Due to : " + (reason_text),
                "message": sails.__("jst order not created").message,
                "data": update_order[0],
                error_at: sails.__("jst order not created").message
              });
          }

          // Get JST Fiat Value
          var currency_pair = (req_body.Symbol).split("/");
          let calculate_offer_amount = 0;
          if (req_body.original_pair == req_body.order_pair) {
            var asset1_value = await sails.helpers.fixapi.getLatestPrice(currency_pair[0] + 'USD', "Buy");
            // var asset1_usd_value = asset1_value[0].ask_price;
            var asset1_usd_value = 0.0;
            var asset2_value = await sails.helpers.fixapi.getLatestPrice(currency_pair[1] + 'USD', "Buy");
            // var asset2_usd_value = asset2_value[0].ask_price;
            var asset2_usd_value = 0.0;
            calculate_offer_amount = asset1_usd_value;
          } else {
            var asset1_value = await sails.helpers.fixapi.getLatestPrice(currency_pair[0] + 'USD', "Sell");
            // var asset1_usd_value = asset1_value[0].bid_price;
            var asset1_usd_value = 0.0;
            var asset2_value = await sails.helpers.fixapi.getLatestPrice(currency_pair[1] + 'USD', "Sell");
            // var asset2_usd_value = asset2_value[0].bid_price;
            var asset2_usd_value = 0.0;
            calculate_offer_amount = asset2_usd_value;
          }

          // Check for Offercode and if it is proper, don't add Faldax fees
          let offer_code = req_body.offer_code;
          let campaign_id = 0;
          let campaign_offer_id = 0;
          let offer_message = "";
          let offer_applied = false;
          if (offer_code && offer_code != "") {
            let check_offer_status = await sails.helpers.fixapi.checkOfferCodeStatus(offer_code, user_id, false);
            if (check_offer_status.status != false) {
              campaign_id = check_offer_status.data.campaign_id;
              campaign_offer_id = check_offer_status.data.id;
            }
            offer_message = check_offer_status.message;
            offer_applied = false;
            if (check_offer_status.status == "truefalse") {
              final_faldax_fees = 0.0;
              // Check Partially fees calulations
              var current_order_faldax_fees = parseFloat(final_faldax_fees_actual) * parseFloat(calculate_offer_amount);
              if (parseFloat(check_offer_status.discount_values) < parseFloat(current_order_faldax_fees)) {
                offer_applied = true;
                var remaining_fees_fiat = parseFloat(current_order_faldax_fees) - parseFloat(check_offer_status.discount_values);
                var final_faldax_fees_crypto = remaining_fees_fiat / calculate_offer_amount;
                final_faldax_fees = final_faldax_fees_crypto;
              } else {
                offer_applied = true;
                final_faldax_fees = 0.0;
              }
            } else if (check_offer_status.status == true) {
              offer_applied = true;
              final_faldax_fees = 0.0;
            }
          }

          // Calculate fees deduction
          var faldax_fees = 0;
          var network_fees = 0;
          var final_value = 0;
          var final_fees_deducted_crypto = 0;
          var final_fees_currency = 0;
          let difference_faldax_commission = 0;

          if (req_body.original_pair == req_body.order_pair) { // Buy order
            var final_amount = (req_body.OriginalQuantity != req_body.Quantity) ? (req_body.Quantity) : (parseFloat(req_body.Quantity) + parseFloat(final_faldax_fees) + parseFloat(final_ntwk_fees));
            // final_fees_deducted_crypto = parseFloat(final_amount) - parseFloat(final_faldax_fees) - parseFloat(final_ntwk_fees);
            final_fees_deducted_crypto = parseFloat(req_body.buy_currency_amount);
            final_fees_currency = parseFloat(req_body.sell_currency_amount);
            // difference_faldax_commission = parseFloat(req_body.sell_currency_amount) - parseFloat(jst_response_data.SettlCurrAmt);
            difference_faldax_commission = parseFloat(req_body.sell_currency_amount) - parseFloat(jst_response_data.SettlCurrAmt);
          } else {
            // var final_amount = parseFloat(req_body.Quantity) + parseFloat(final_faldax_fees) + parseFloat(final_ntwk_fees);
            var final_amount = parseFloat(req_body.Quantity) + parseFloat(final_faldax_fees) + parseFloat(final_ntwk_fees);
            final_fees_deducted_crypto = parseFloat(req_body.sell_currency_amount);
            // final_fees_currency = parseFloat(req_body.Quantity) - parseFloat(final_faldax_fees) - parseFloat(final_ntwk_fees);
            final_fees_currency = parseFloat(req_body.buy_currency_amount);
            difference_faldax_commission = parseFloat(jst_response_data.SettlCurrAmt) - parseFloat(req_body.subtotal);
          }

          // Update Faldax Wallet Address with Fees and Commission, if any
          // If buy order
          if (req_body.original_pair == req_body.order_pair) {
            // Update Crypto wallet
            let wallet_data = {
              id: cryptoValue.id,
              type: 'add',
              amount: parseFloat(final_faldax_fees) + parseFloat(final_ntwk_fees)
            }
            await sails.helpers.wallet.updateAdminWallets(wallet_data);
            // Update Currency wallet
            if (difference_faldax_commission > 0) {
              let wallet_data = {
                id: coinValue.id,
                type: 'add',
                amount: parseFloat(difference_faldax_commission)
              }
              await sails.helpers.wallet.updateAdminWallets(wallet_data);
            }
          } else {
            // Update Currency wallet
            let wallet_data = {
              id: coinValue.id,
              type: 'add',
              amount: parseFloat(final_faldax_fees) + parseFloat(final_ntwk_fees)
            }
            await sails.helpers.wallet.updateAdminWallets(wallet_data);
            // Update Currency wallet
            if (difference_faldax_commission > 0) {
              let wallet_data = {
                id: coinValue.id,
                type: 'add',
                amount: parseFloat(difference_faldax_commission)
              }
              await sails.helpers.wallet.updateAdminWallets(wallet_data);
            }
          }
          // update order
          var update_data = {
            fill_price: jst_response_data.SettlCurrAmt,
            price: final_amount,
            quantity: req_body.OriginalQuantity,
            settle_currency: jst_response_data.SettlCurrency,
            is_partially_filled: (jst_response_data.OrdStatus == 1 ? true : false),
            order_id: jst_response_data.OrderID,
            execution_report: jst_response_data,
            exec_id: jst_response_data.ExecID,
            transact_time: jst_response_data.TransactTime,
            settl_date: jst_response_data.SettlDate,
            trade_date: jst_response_data.TradeDate,
            settl_curr_amt: jst_response_data.SettlCurrAmt,
            leaves_qty: jst_response_data.LeavesQty,
            faldax_fees: final_faldax_fees,
            faldax_fees_actual: final_faldax_fees_actual,
            network_fees: final_ntwk_fees,
            asset1_usd_value: asset1_usd_value,
            asset2_usd_value: asset2_usd_value,
            order_status: order_status,
            reason: (jst_response_data.Text ? jst_response_data.Text : ""),
            amount_after_fees_deduction: req_body.OriginalQuantity,
            offer_code: offer_code,
            campaign_id: campaign_id,
            campaign_offer_id: campaign_offer_id,
            offer_message: offer_message,
            offer_applied: offer_applied,
            difference_faldax_commission: difference_faldax_commission.toFixed(sails.config.local.TOTAL_PRECISION)
          };
          var update_order = await JSTTradeHistory
            .update({
              id: create_order.id
            })
            .set(update_data).fetch();

          update_order[0].flag = 1;
          update_order[0].faldax_fees = final_faldax_fees_actual;
          //Adding Data in referral table
          let referredData = await sails
            .helpers
            .tradding
            .getRefferedAmount(update_order, update_order[0].user_id, update_order[0].order_id);

          var first_coin = crypto;
          var second_coin = currency;
          var first_coin_balance = '';
          var second_coin_balance = '';
          var coin1type = '';
          var coin2type = '';
          // console.log("walletCurrency.balance", walletCurrency.balance);
          // console.log("walletCrypto.balance", walletCrypto.balance);
          // console.log("final_fees_currency", final_fees_currency)
          // console.log("final_fees_deducted_crypto", final_fees_deducted_crypto)
          // Update wallet Balance
          if (req_body.original_pair == req_body.order_pair) { // Buy order
            var update_user_wallet_asset1 = await Wallet.update({
              id: walletCurrency.id
            }).set({
              balance: (walletCurrency.balance - (final_fees_currency)),
              placed_balance: (walletCurrency.placed_balance) - (final_fees_currency)
            }).fetch();

            var update_user_wallet_asset2 = await Wallet.update({
              id: walletCrypto.id
            }).set({
              balance: (walletCrypto.balance + final_fees_deducted_crypto),
              placed_balance: (walletCrypto.placed_balance + final_fees_deducted_crypto)
            }).fetch();

            first_coin = crypto;
            second_coin = currency;
            first_coin_balance = final_fees_deducted_crypto;
            second_coin_balance = final_fees_currency;
          } else { // Sell order
            // var convert_to_exchange = jst_response_data.SettlCurrAmt;
            var update_user_wallet_asset1 = await Wallet.update({
              id: walletCurrency.id
            }).set({
              balance: (walletCurrency.balance + final_fees_currency),
              placed_balance: (walletCurrency.placed_balance + final_fees_currency)
            }).fetch();

            var update_user_wallet_asset2 = await Wallet.update({
              id: walletCrypto.id
            }).set({
              balance: (walletCrypto.balance - final_fees_deducted_crypto),
              placed_balance: (walletCrypto.placed_balance - final_fees_deducted_crypto)
            }).fetch();
            first_coin = currency;
            second_coin = crypto;
            first_coin_balance = final_fees_currency;
            second_coin_balance = final_fees_deducted_crypto;
          }
          // Send Email
          var userData = await Users.findOne({
            select: ['email', 'first_name', 'phone_number'],
            where: {
              deleted_at: null,
              is_active: true,
              id: user_id
            }
          })

          if (userData != undefined) {
            userData.firstCoin = first_coin;
            userData.secondCoin = second_coin;
            userData.firstAmount = first_coin_balance.toFixed(sails.config.local.TOTAL_PRECISION);
            userData.secondAmount = second_coin_balance.toFixed(sails.config.local.TOTAL_PRECISION);
            await sails.helpers.notification.send.email("jst_order_success", userData)
          }

          // await logger.info({
          //   "module": "JST Create Order",
          //   "user_id": "user_" + req.user.id,
          //   "url": req.url,
          //   "type": "Success"
          // }, sails.__("jst order created"))
          return res.json({
            "status": 200,
            "message": sails.__("jst order created").message,
            "data": update_order[0]
          });
        }
      }

    } catch (error) {
      console.log("error", error);
      // await logger.error(error.message)

      // Send Email
      var user_id = req.user.id;
      var userData = await Users.findOne({
        select: ['email', 'first_name', 'phone_number'],
        where: {
          deleted_at: null,
          is_active: true,
          id: user_id
        }
      })

      if (userData != undefined) {
        await sails.helpers.notification.send.email("jst_order_failed", userData)
      }
      // await logger.error({
      //   "user_id": "user_" + req.user.id,
      //   "module": "JST Create Order",
      //   "url": req.url,
      //   "type": "Error"
      // }, sails.__("Something Wrong").message)

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
  Check Offercode is valid or not
  **/
  checkCampaignOfferStatus: async function (req, res) {
    // await logger.info({
    //   "module": "Campaign",
    //   "user_id": "user_" + req.user.id,
    //   "url": req.url,
    //   "type": "Entry"
    // }, "Entered the function")
    let req_body = req.body;
    let validator = new Validator(req_body, {
      offer_code: 'required'
    });

    let matched = await validator.check();
    if (!matched) {
      for (var key in validator.errors) {
        return res
          .status(400)
          .json({
            status: 400,
            "message": validator.errors[key].message
          });
      }
    }
    var user_id = req.user.id;

    let check_offer_status = await sails.helpers.fixapi.checkOfferCodeStatus(req_body.offer_code, user_id, true);
    // await logger.info({
    //   "module": "Campaigns",
    //   "user_id": "user_" + req.user.id,
    //   "url": req.url,
    //   "type": "Success"
    // }, check_offer_status.message)
    if (check_offer_status.status == true || check_offer_status.status == "truefalse") {
      return res.json({
        "status": 200,
        "message": check_offer_status.message,
        "data": check_offer_status.data
      });
    } else {
      // await logger.error({
      //   "user_id": "user_" + req.user.id,
      //   "module": "Campaigns",
      //   "url": req.url,
      //   "type": "Error"
      // }, check_offer_status.message)
      return res
        .status(500)
        .json({
          status: 500,
          "err": check_offer_status.message,
          error_at: check_offer_status.message
        });
    }
  },
  /**
  Get Socket value of JST
  **/
  getSocketJSTValue: async function (req, res) {
    try {
      // await logger.info({
      //   "module": "JST Socket Value",
      //   "user_id": "user_" + req.user.id,
      //   "url": req.url,
      //   "type": "Entry"
      // }, "Entered the function")

      var Symbol = req.query.Symbol;
      var Side = req.query.Side;
      var OrderQty = req.query.OrderQty;
      var Currency = req.query.Currency;
      var OrdType = req.query.OrdType;
      var flag = req.query.flag;
      var offer_code = req.query.offer_code;
      var order_pair = req.query.order_pair;
      var original_pair = req.query.original_pair;
      var usd_value = req.query.usd_value;
      if (Symbol == "XRP/ETH" || Symbol == "LTC/ETH") {
        return res.json({
          status: 200,
          data: [],
          message: sails.__("Pair does not supported").message,
          err: sails.__("Pair does not supported").message
        });
      }
      Symbol = Symbol.replace("/", "");
      var req_body = {
        "Symbol": Symbol,
        "Side": Side,
        "OrderQty": OrderQty,
        "Currency": Currency,
        "OrdType": OrdType,
        "flag": flag,
        "offer_code": offer_code,
        "order_pair": order_pair,
        "original_pair": original_pair,
        "usd_value": usd_value
      }


      if (req.isSocket) {
        var user_id = req.user.id;
        req_body.user_id = user_id;
        var jstResponseValue = await sails.helpers.fixapi.getJstValue(req_body);
        jstResponseValue.faldax_fee = jstResponseValue.faldax_fee;
        // await logger.info({
        //   "module": "JST",
        //   "user_id": "user_" + req.user.id,
        //   "url": req.url,
        //   "type": "Success"
        // }, sails.__("User Trade Success").message)
        return res.json({
          status: 200,
          data: jstResponseValue,
          "message": sails.__("User Trade Success").message
        });
      } else {
        // await logger.info({
        //   "module": "JST",
        //   "user_id": "user_" + req.user.id,
        //   "url": req.url,
        //   "type": "Success"
        // }, sails.__("error").message)
        return res
          .status(403)
          .json({
            status: 403,
            "message": sails.__("error").message
          });
      }


    } catch (error) {
      // console.log("error", error);
      // await logger.error({
      //   "user_id": "user_" + req.user.id,
      //   "module": "JST",
      //   "url": req.url,
      //   "type": "Error"
      // }, error.message)
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
