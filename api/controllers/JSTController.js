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
        Quantity: 'required|decimal',
        Currency: 'required',
        OriginalQuantity: 'required',
        // ExecInst: 'required|in:A,B',
        OrdType: 'required|in:1,2'
      });

      var quantityValue = 0;
      if (req_body.original_pair == req_body.order_pair) {
        quantityValue = req_body.Quantity
      } else {
        quantityValue = req_body.OrderQty
      }

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

        if (walletCurrency == undefined) {
          return res
            .status(201)
            .json({
              "status": 201,
              "message": sails.__("Create Currency Wallet")
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

        if (walletCrypto == undefined) {
          return res
            .status(201)
            .json({
              "status": 201,
              "message": sails.__("Create Crypto Wallet")
            })
        }

        if (req_body.OriginalQuantity < cryptoValue.jst_min_coin_limit) {
          return res
            .status(500)
            .json({
              "status": 500,
              "message": sails.__("Minimum Order Limit not satisfied")
            })
        }
        // Get JST Price 
        var priceValue = 0;
        // if (req_body.original_pair == req_body.order_pair) {
        //   req_body.Side = 1;
        // }else{
        //   req_body.Side = 2;
        // }
        // var get_jst_price = await sails.helpers.fixapi.getLatestPrice(req_body.Symbol, (req_body.Side == 1 ? "Buy" : "Sell"));
        if (req_body.original_pair == req_body.order_pair) { // Check if Pair same as original, then it should be Buy ELSE Sell 
          var get_jst_price = await sails.helpers.fixapi.getLatestPrice(req_body.Symbol, "Buy");
          priceValue = get_jst_price[0].ask_price;
        } else {
          var get_jst_price = await sails.helpers.fixapi.getLatestPrice(req_body.Symbol, "Sell");
          priceValue = get_jst_price[0].bid_price;
        }

        // if (req_body.Side == 1) {
        //   priceValue = get_jst_price[0].ask_price;
        // } else {
        //   priceValue = get_jst_price[0].bid_price;
        // }
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
        console.log("user_id",user_id);
        console.log("balanceChecking",balanceChecking);
        console.log("wallet.placed_balance",wallet.placed_balance);
        if ((balanceChecking) > (wallet.placed_balance).toFixed(sails.config.local.TOTAL_PRECISION)) {
          return res
            .status(500)
            .json({
              status: 500,
              "message": sails.__("insufficent funds in wallet")
            });
        }

        let order_create = {
          currency: crypto,
          side: (req_body.Side == 1 ? "Buy" : "Sell"),
          order_type: "Market",
          order_status: "open",
          fix_quantity: parseFloat(quantityValue),
          symbol: req_body.Symbol,
          user_id: user_id
        };
        var create_order = await JSTTradeHistory.create(order_create).fetch();
        // console.log("create_o/rder",create_order);
        let order_object = {
          ClOrdID: create_order.cl_order_id,
          HandlInst: "1",
          Symbol: req_body.Symbol,
          Side: (req_body.Side).toString(), // 1:Buy, 2:Sell
          OrderQty: quantityValue,
          OrdType: req_body.OrdType,
          Currency: crypto,
          ExecInst: "B",
          TimeInForce: "0",
          SecurityType: "FOR",
          Product: "4"
        };
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
          return res
            .status(500)
            .json({
              status: 500,
              "message": sails.__("jst order not created")
            });
        } else {
          var jst_response_data = response.data;
          // calculate fees 
          var get_faldax_fee = await AdminSetting.findOne({
            slug: "faldax_fee"
          });
          // Check cases for Order execution
          var order_completed = false;
          var order_status = 'open';
          switch (jst_response_data.ExecType) {
            case "F":
              order_completed = true;
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
            };


            var update_order = await JSTTradeHistory
              .update({
                id: create_order.id
              })
              .set(update_data).fetch();

            return res.json({
              "status": 500,
              "message": sails.__("jst order not created") + "Due to : " + (reason_text),
              "data": update_order[0]
            });
          }

          // Get JST Fiat Value
          var currency_pair = (req_body.Symbol).split("/");
          if (req_body.original_pair == req_body.order_pair) {
            var asset1_value = await sails.helpers.fixapi.getLatestPrice(currency_pair[0] + '/USD', "Buy");
            var asset1_usd_value = asset1_value[0].ask_price;
            var asset2_value = await sails.helpers.fixapi.getLatestPrice(currency_pair[1] + '/USD', "Buy");
            var asset2_usd_value = asset2_value[0].ask_price;
          } else {
            var asset1_value = await sails.helpers.fixapi.getLatestPrice(currency_pair[0] + '/USD', "Sell");
            var asset1_usd_value = asset1_value[0].bid_price;
            var asset2_value = await sails.helpers.fixapi.getLatestPrice(currency_pair[1] + '/USD', "Sell");
            var asset2_usd_value = asset2_value[0].bid_price;
          }



          // Calculate fees deduction 
          var faldax_fees = 0;
          var network_fees = 0;
          var final_value = 0;
          var final_fees_deducted_crypto = 0;
          var final_fees_currency = 0;
          var final_faldax_fees = 0;
          var final_ntwk_fees = 0;
          if (req_body.original_pair == req_body.order_pair) { // Buy order
            var final_amount = jst_response_data.CumQty;
            final_faldax_fees = (final_amount * ((get_faldax_fee.value) / 100));
            var get_network_fees = await sails.helpers.feesCalculation((currency_pair[0]).toLowerCase(), (jst_response_data.CumQty), (final_amount));
            final_ntwk_fees = get_network_fees;
            final_fees_deducted_crypto = parseFloat(final_amount) - parseFloat(final_faldax_fees) - parseFloat(final_ntwk_fees);
            final_fees_currency = parseFloat(jst_response_data.SettlCurrAmt)
          } else {
            final_fees_deducted_crypto = parseFloat(jst_response_data.CumQty);
            var final_amount = jst_response_data.SettlCurrAmt;
            final_faldax_fees = (final_amount * ((get_faldax_fee.value) / 100));
            var get_network_fees = await sails.helpers.feesCalculation((currency_pair[1]).toLowerCase(), (jst_response_data.CumQty), (final_amount));
            final_ntwk_fees = get_network_fees;
            final_fees_currency = parseFloat(jst_response_data.SettlCurrAmt) - parseFloat(final_faldax_fees) - parseFloat(final_ntwk_fees);
          }

          var amount_after_fees_deduction = (final_value) - (network_fees) - (faldax_fees);
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
            network_fees: final_ntwk_fees,
            asset1_usd_value: asset1_usd_value,
            asset2_usd_value: asset2_usd_value,
            order_status: order_status,
            reason: (jst_response_data.Text ? jst_response_data.Text : ""),
            amount_after_fees_deduction: req_body.OriginalQuantity
          };
          var update_order = await JSTTradeHistory
            .update({
              id: create_order.id
            })
            .set(update_data).fetch();

          update_order[0].flag = 1;
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
          // Update wallet Balance
          if (req_body.original_pair == req_body.order_pair) { // Buy order
            var update_user_wallet_asset1 = await Wallet.update({
              id: walletCurrency.id
            }).set({
              balance: (walletCurrency.balance - final_fees_currency),
              placed_balance: (walletCurrency.placed_balance) - final_fees_currency
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
            select:['email','first_name','phone_number'],
            where:{
              deleted_at: null,
              is_active: true,
              id: user_id
            }            
          })
          
          if( userData != undefined ){
            userData.firstCoin = first_coin;
            userData.secondCoin = second_coin;
            userData.firstAmount = first_coin_balance;
            userData.secondAmount = second_coin_balance;
            console.log("Acc userData",userData);
            await sails.helpers.notification.send.email("jst_order_success", userData)
          }
          
          return res.json({
            "status": 200,
            "message": sails.__("jst order created"),
            "data": update_order[0]
          });
        }
      }

    } catch (error) {
      console.log("error", error);
      await logger.error(error.message)
      
       // Send Email 
       var user_id = req.user.id;
       var userData = await Users.findOne({
        select:['email','first_name','phone_number'],
        where:{
          deleted_at: null,
          is_active: true,
          id: user_id
        }            
      })
      
      if( userData != undefined ){
        await sails.helpers.notification.send.email("jst_order_failed", userData)
      }
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  },


};
