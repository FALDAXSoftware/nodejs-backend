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
   * get conversion pair list
   */
  getJSTPairList: async function (req, res) {
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
          "message": sails.__("jst pair retrieve success"),
          getJSTPair,
          coinList
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
      
      var geo_fencing_data = await sails
        .helpers
        .userTradeChecking(user_id);
      

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
        
        //Check for Asset1 Wallet
        let coinValue = await Coins.findOne({
          is_active: true,
          deleted_at: null,
          coin: currency
        })
        

        let walletCurrency = await Wallet.findOne({
          where: {
            deleted_at: null,
            coin_id: coinValue.id,
            is_active: true,
            user_id: user_id
          }
        });
        

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
          
          let walletCrypto = await Wallet.findOne({
            where: {
              deleted_at: null,
              coin_id: cryptoValue.id,
              is_active: true,
              user_id: user_id
            }
          });
          

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
          var priceValue = 0;
          if (req_body.original_pair == req_body.order_pair) {
            req_body.Side = 1;
          }else{
            req_body.Side = 2;
          }
          // var get_jst_price = await sails.helpers.fixapi.getLatestPrice(req_body.Symbol, (req_body.Side == 1 ? "Buy" : "Sell"));
          if (req_body.original_pair == req_body.order_pair) { // Check if Pair same as original, then it should be Buy ELSE Sell 
            var get_jst_price = await sails.helpers.fixapi.getLatestPrice(req_body.Symbol, "Buy");
            priceValue = get_jst_price[0].ask_price;                
          }else{
            var get_jst_price = await sails.helpers.fixapi.getLatestPrice(req_body.Symbol, "Sell");
            priceValue = get_jst_price[0].bid_price;                
          }
          
          // if (req_body.Side == 1) {
          //   priceValue = get_jst_price[0].ask_price;
          // } else {
          //   priceValue = get_jst_price[0].bid_price;
          // }
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
          // Check wallet balance is sufficient or not
          if ((priceValue * (req_body.OrderQty)).toFixed(sails.config.local.TOTAL_PRECISION) >= (wallet.placed_balance).toFixed(sails.config.local.TOTAL_PRECISION)) {
            return res
              .status(500)
              .json({
                status: 500,
                "err": sails.__("insufficent funds in wallet")
              });
          }
          
          let order_create = {
            currency: req_body.Currency,
            side: (req_body.Side == 1 ? "Buy" : "Sell"),
            order_type: "Market",
            order_status: "open",
            fix_quantity: parseFloat(req_body.OrderQty),
            symbol: req_body.Symbol,
            user_id: user_id
          };
          // console.log("order_create",order_create);
          var create_order = await JSTTradeHistory.create(order_create).fetch();
          // console.log("create_o/rder",create_order);
          let order_object = {
            ClOrdID: create_order.cl_order_id,
            HandlInst: "1",
            Symbol: req_body.Symbol,
            Side: (req_body.Side).toString(), // 1:Buy, 2:Sell
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
          if (response == undefined || response.status == 0) {
            return res
              .status(500)
              .json({
                status: 500,
                "err": sails.__("jst order not created")
              });
          } else {
            // Get JST Fiat Value
            var currency_pair = (req_body.Symbol).split("/");
            if (req_body.original_pair == req_body.order_pair) {
              var asset1_value = await sails.helpers.fixapi.getLatestPrice(currency_pair[0] + '/USD', "Buy" );
              var asset1_usd_value = asset1_value[0].ask_price;
              var asset2_value = await sails.helpers.fixapi.getLatestPrice(currency_pair[1] + '/USD', "Buy" );
              var asset2_usd_value = asset2_value[0].ask_price;
            }else{
              var asset1_value = await sails.helpers.fixapi.getLatestPrice(currency_pair[0] + '/USD', "Sell" );
              var asset1_usd_value = asset1_value[0].bid_price;
              var asset2_value = await sails.helpers.fixapi.getLatestPrice(currency_pair[1] + '/USD', "Sell" );
              var asset2_usd_value = asset2_value[0].bid_price;
            }
            
            var jst_response_data = response.data;
            console.log("jst_response_data",jst_response_data);
            // calculate fees 
            var get_faldax_fee = await AdminSetting.findOne({
              slug: "faldax_fee"
            });
            // jst_response_data.SettlCurrAmt = jst_response_data.LastPx * jst_response_data.OrderQty; // temp
            // jst_response_data.SettlCurrency = req_body.Currency; // temp
            // jst_response_data.CumQty = jst_response_data.OrderQty; // temp
            // var jst_calculations_object = {
            //   "Symbol": req_body.Symbol,
            //   "Side": req_body.Side,
            //   "OrderQty": req_body.OrderQty,
            //   "flag": req_body.flag,
            //   "original_pair":req_body.original_pair,
            //   "order_pair":req_body.order_pair
            // };

            // Calculate fees deduction 
            var faldax_fees = 0;
            var network_fees = 0;
            if( req_body.original_pair == req_body.order_pair ){ // Buy order
              var amount_settled = jst_response_data.LastPx; // Which price settled on   
              var currency1_settled = amount_settled;  // First currency value on 1 quantity
              var currency2_settled = 1/amount_settled; // Calculate second currency 
              var currency2_quantity_amount = currency2_settled*req_body.OrderQty
              faldax_fees = (jst_response_data.SettlCurrAmt) + (((jst_response_data.SettlCurrAmt) * get_faldax_fee.value) / 100);
              var get_network_fees = await sails.helpers.feesCalculation((currency_pair[0]).toLowerCase(), (jst_response_data.CumQty), (jst_response_data.SettlCurrAmt));
              network_fees = (jst_response_data.SettlCurrAmt) + (get_network_fees * (jst_response_data.SettlCurrAmt));
            }else{
              var amount_settled = jst_response_data.LastPx; // Which price settled on   
              var currency1_settled = amount_settled;  // First currency value on 1 quantity
              var currency2_settled = 1/amount_settled; // Calculate second currency 
              var currency2_quantity_amount = currency2_settled*req_body.OrderQty
              faldax_fees = (currency2_quantity_amount) + (((currency2_quantity_amount) * get_faldax_fee.value) / 100);
              var get_network_fees = await sails.helpers.feesCalculation((currency_pair[1]).toLowerCase(), (jst_response_data.CumQty), (currency2_quantity_amount));
              network_fees = (currency2_quantity_amount) + (get_network_fees * (currency2_quantity_amount));
            }

            
            // var faldax_fees = (jst_response_data.SettlCurrAmt) + (((jst_response_data.SettlCurrAmt) * get_faldax_fee.value) / 100);
            // var get_network_fees = await sails.helpers.feesCalculation((jst_response_data.SettlCurrency).toLowerCase(), (jst_response_data.CumQty), (jst_response_data.SettlCurrAmt));
            // var network_fees = (jst_response_data.SettlCurrAmt) + (get_network_fees * (jst_response_data.SettlCurrAmt));
            var amount_after_fees_deduction = (jst_response_data.SettlCurrAmt)-(network_fees)-(faldax_fees);
            console.log("amount_after_fees_deduction",amount_after_fees_deduction);
            // update order
            var update_data = {
              fill_price: jst_response_data.SettlCurrAmt,
              price: jst_response_data.price,
              quantity: jst_response_data.CumQty,
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
              faldax_fees: faldax_fee,
              network_fees: network_fees,
              asset1_usd_value: asset1_usd_value,
              asset2_usd_value: asset2_usd_value,
              amount_after_fees_deduction:amount_after_fees_deduction
            };
            var update_order = await JSTTradeHistory
              .update({
                id: create_order.id
              })
              .set(update_data).fetch();
            // Update wallet Balance
            // if( req_body.original_pair == req_body.order_pair ){ // Buy order
            //   var update_user_wallet_asset1 = await Wallet.update({
            //     id: walletCurrency.id
            //   }).set({
            //     balance: (walletCurrency.balance + jst_response_data.SettlCurrAmt)
            //   });  
            // }else{ // Sell order
            //   var convert_to_exchange = jst_response_data.SettlCurrAmt;
            //   var update_user_wallet_asset1 = await Wallet.update({
            //     id: walletCurrency.id
            //   }).set({
            //     balance: (walletCurrency.balance + jst_response_data.SettlCurrAmt)
            //   });  
            // }
            

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
