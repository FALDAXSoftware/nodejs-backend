/**
 * JSTController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const moment = require('moment');
var logger = require('../controllers/logger')
const {
  Validator
} = require('node-input-validator');

module.exports = {

  /**
   * Amount of coins he want
   */
  getJSTPriceValue: async function (req, res) {
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
          "message": sails.__("Price retrieve success"),
          "data": jstResponseValue
        })

    } catch (error) {
      console.log("error", error);
      await logger.error(error.message)
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  },

  /**
   * Buy Order for creating Order
   *
   */
  createOrder: async function (req, res) {
    try {
      let req_body = req.body;

      let validator = new Validator(req_body, {
        // HandlInst: 'required',
        Symbol: 'required',
        Side: 'required|in:1,2', // 1:Buy, 2:Sell
        OrderQty: 'required|decimal',
        Currency: 'required',
        // ExecInst: 'required|in:A,B',
        OrdType: 'required|in:1,2'
      });

      let matched = await validator.check();
      if (!matched) {
        for (var key in validator.errors) {
          return res
            .status(400)
            .json({
              status: 400,
              "err": validator.errors[key].message
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
        return res
          .status(500)
          .json({
            "status": 500,
            "message": sails.__("panic button enabled")
          })
      }

      //Checking whether user can trade in the area selected in the KYC
      console.log("user_id", user_id);
      var geo_fencing_data = await sails
        .helpers
        .userTradeChecking(user_id);
      console.log("geo_fencing_data", geo_fencing_data);

      if (geo_fencing_data.response != true) {
        res.json({
          "status": 500,
          "message": sails.__(geo_fencing_data.msg)
        });
      } else {
        // Check for User Wallet
        let {
          crypto,
          currency
        } = await sails
          .helpers
          .utilities
          .getCurrencies((req_body.Symbol).replace("/", '-'));
        console.log("currency", currency);
        //Check for Asset1 Wallet
        let coinValue = await Coins.findOne({
          is_active: true,
          deleted_at: null,
          coin: currency
        })
        console.log("coinValue", coinValue);

        let walletCurrency = await Wallet.findOne({
          where: {
            deleted_at: null,
            coin_id: coinValue.id,
            is_active: true,
            user_id: user_id
          }
        });
        console.log("walletCurrency", walletCurrency);

        if (walletCurrency == undefined) {
          return res
            .status(201)
            .json({
              "status": 201,
              "message": sails.__("Create Currency Wallet")
            })
        } else {
          //Check for Asset2 Wallet
          let cryptoValue = await Coins.findOne({
            is_active: true,
            deleted_at: null,
            coin: crypto
          })
          console.log("cryptoValue", cryptoValue);
          console.log(user_id);
          let walletCrypto = await Wallet.findOne({
            where: {
              deleted_at: null,
              coin_id: cryptoValue.id,
              is_active: true,
              user_id: user_id
            }
          });
          console.log("walletCrypto", walletCrypto);

          if (walletCrypto == undefined) {
            return res
              .status(201)
              .json({
                "status": 201,
                "message": sails.__("Create Crypto Wallet")
              })
          }
          console.log(req_body)
          // Get JST Price 
          var get_jst_price = await sails.helpers.fixapi.getLatestPrice(req_body.Symbol, (req_body.Side == 1 ? "Buy" : "Sell"));
          console.log(get_jst_price)
          var priceValue = 0;
          if (req_body.Side == 1) {
            priceValue = get_jst_price[0].ask_price;
          } else {
            priceValue = get_jst_price[0].bid_price;
          }
          // Check Wallet Balance 
          let wallet = await sails
            .helpers
            .utilities
            .getSellWalletBalance(crypto, currency, user_id)
            .intercept("coinNotFound", () => {
              return new Error("coinNotFound");
            })
            .intercept("serverError", () => {
              return new Error("serverError")
            });
          // console.log("priceValue",priceValue);  
          // console.log("wallet",wallet);
          // console.log("LS",(priceValue * (req_body.OrderQty)).toFixed(sails.config.local.TOTAL_PRECISION));
          // console.log((priceValue * (req_body.OrderQty)).toFixed(sails.config.local.TOTAL_PRECISION) <= (wallet.placed_balance).toFixed(sails.config.local.TOTAL_PRECISION))
          // console.log("RS",(wallet.placed_balance).toFixed(sails.config.local.TOTAL_PRECISION));
          if ((priceValue * (req_body.OrderQty)).toFixed(sails.config.local.TOTAL_PRECISION) >= (wallet.placed_balance).toFixed(sails.config.local.TOTAL_PRECISION)) {
            return res
              .status(500)
              .json({
                status: 500,
                "err": sails.__("insufficent funds in wallet")
              });
          }
          let order_create = {
            // fill_price:req_body.fill_price,
            // price:req_body.price,
            // quantity:req_body.quantity,
            currency: req_body.Currency,
            // settle_currency:req_body.settle_currency,
            side: (req_body.Side == 1 ? "Buy" : "Sell"),
            order_type: "Market",
            order_status: "open",
            // is_partially_filled:req_body.is_partially_filled,
            fix_quantity: parseFloat(req_body.OrderQty),
            symbol: req_body.Symbol,
            user_id: user_id,
            // is_collected:req_body.is_collected,
            // filled:req_body.filled,
            // order_id:req_body.order_id,
            // execution_report:req_body.execution_report,
            // cl_order_id:req_body.cl_order_id,
            // exec_id:req_body.exec_id,
            // transact_time:req_body.transact_time,
            // settl_date:req_body.settl_date,
            // trade_date:req_body.trade_date,
            // settl_curr_amt:req_body.settl_curr_amt,
            // leaves_qty:req_body.leaves_qty,
            // faldax_fees:req_body.faldax_fees,
            // network_fees:req_body.network_fees
          };
          // console.log("order_create",order_create);
          var create_order = await JSTTradeHistory.create(order_create).fetch();
          // console.log("create_o/rder",create_order);
          let order_object = {
            ClOrdID: create_order.cl_order_id,
            HandlInst: "1",
            Symbol: req_body.Symbol,
            Side: req_body.Side, // 1:Buy, 2:Sell
            OrderQty: req_body.OrderQty,
            OrdType: req_body.OrdType,
            Currency: req_body.Currency,
            ExecInst: "B",
            TimeInForce: "0",
            SecurityType: "FOR",
            Product: "4"
          };
          var response = await sails.helpers.fixapi.buyOrder(order_object);
          // var response = {};
          console.log("response", response);
          if (response.status == 0) {
            return res
              .status(500)
              .json({
                status: 500,
                "err": sails.__("jst order not created")
              });
          } else {
            var jst_response_data = response.data;
            // calculate fees 
            var get_faldax_fee = await AdminSetting.findOne({
              slug: "faldax_fee"
            });
            jst_response_data.SettlCurrAmt = jst_response_data.LastPx * jst_response_data.OrderQty; // temp
            jst_response_data.SettlCurrency = req_body.Currency; // temp
            jst_response_data.CumQty = jst_response_data.OrderQty; // temp
            var faldax_fees = (jst_response_data.SettlCurrAmt) + (((jst_response_data.SettlCurrAmt) * get_faldax_fee.value) / 100);
            // console.log("get_faldax_fee",get_faldax_fee);
            // console.log("faldax_fees",faldax_fees);
            var get_network_fees = await sails.helpers.feesCalculation((jst_response_data.SettlCurrency).toLowerCase(), (jst_response_data.CumQty), (jst_response_data.SettlCurrAmt));

            // console.log("get_network_fees",get_network_fees);
            var network_fees = (jst_response_data.SettlCurrAmt) + (get_network_fees * (jst_response_data.SettlCurrAmt));
            // console.log("network_fees",network_fees);
            // update order
            var update_data = {
              fill_price: jst_response_data.SettlCurrAmt,
              price: jst_response_data.price,
              quantity: jst_response_data.CumQty,
              settle_currency: jst_response_data.SettlCurrency,
              is_partially_filled: (jst_response_data.OrdStatus == 1 ? true : false),
              // is_collected        : false,
              // filled              : jst_response_data.filled,
              order_id: jst_response_data.OrderID,
              execution_report: jst_response_data,
              exec_id: jst_response_data.ExecID,
              transact_time: jst_response_data.TransactTime,
              settl_date: jst_response_data.SettlDate,
              trade_date: jst_response_data.TradeDate,
              settl_curr_amt: jst_response_data.SettlCurrAmt,
              leaves_qty: jst_response_data.LeavesQty,
              faldax_fees: faldax_fees,
              network_fees: network_fees
            };
            var update_order = await JSTTradeHistory
              .update({
                id: create_order.id
              })
              .set(update_data).fetch();
            // Update wallet Balance
            let user_wallet = await Wallet.update({
              id: walletCurrency.id
            }).set({
              balance: (walletCurrency.balance + jst_response_data.SettlCurrAmt)
            });

            return res.json({
              "status": 200,
              "message": sails.__("jst order created"),
              "data": update_order
            });
          }
        }
      }



    } catch (error) {
      console.log("error", error);
      await logger.error(error.message)
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  },


};
