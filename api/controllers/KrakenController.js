/**
 * KrakenController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const BitGoJS = require('bitgo');

module.exports = {

  //Get Order Book Data
  getOrderBookData: async function (req, res) {
    try {
      var orderData = await sails
        .helpers
        .kraken
        .getOrderBook();

      return res.json({
        status: 200,
        "data": 1
      });
    } catch (err) {
      console.log(err);
      return res.json({
        status: 500,
        "err": sails.__("Something Wrong")
      });
    }
  },

  //Add order
  addOrder: async function (req, res) {
    try {
      var {
        pair,
        type,
        ordertype,
        volume
      } = req.body;

      var addedData = await sails
        .helpers
        .kraken
        .addStandardOrder(pair, type, ordertype, volume);

      return res.json({
        status: 200,
        "data": addedData
      });
    } catch (err) {
      console.log(err);
      return res.json({
        status: 500,
        "err": sails.__("Something Wrong")
      });
    }
  },

  //Get Deposit Address
  depositAddress: async function (req, res) {
    try {
      var {
        symbol
      } = req.allParams();

      var depositAdd = await sails
        .helpers
        .kraken
        .getDepositAddress(symbol);

      return res.json({
        status: 200,
        "data": depositAdd
      });
    } catch (err) {
      console.log(err);
      return res.json({
        status: 500,
        "err": sails.__("Something Wrong")
      });
    }
  },

  //Get recent Deposit status
  getDepositStatus: async function (req, res) {
    try {
      var {
        symbol
      } = req.allParams();

      var depositStatus = await sails
        .helpers
        .kraken
        .getRecentDepositStatus(symbol);

      return res.json({
        status: 200,
        "data": depositStatus
      });
    } catch (err) {
      console.log(err);
      return res.json({
        status: 500,
        "err": sails.__("Something Wrong")
      });
    }
  },

  //Get withdrawl Information
  getWithdrawlInformation: async function (req, res) {
    try {
      var {
        asset,
        amount
      } = req.allParams()

      var withdrwalInfo = await sails
        .helpers
        .kraken
        .getWithdrawlInfo(asset, amount);

      return res.json({
        status: 200,
        "data": withdrwalInfo
      });
    } catch (err) {
      console.log(err);
      return res.json({
        status: 500,
        "err": sails.__("Something Wrong")
      });
    }
  },

  //Withdraw Funds
  getWithdrawlFunds: async function (req, res) {
    try {
      var {
        asset,
        amount
      } = req.allParams()

      var withdrawlFunds = await sails
        .helpers
        .kraken
        .withdrawFunds(asset, amount);

      return res.json({
        status: 200,
        "data": withdrawlFunds
      });
    } catch (err) {
      console.log(err);
      return res.json({
        status: 500,
        "err": sails.__("Something Wrong")
      });
    }
  },

  //Get Recent withdrawl Status
  getRecentWithdrawlStatus: async function (req, res) {
    try {
      var {
        asset
      } = req.allParams();

      var withdrawStatus = await sails
        .helpers
        .kraken
        .recentWithdrawlStatus(asset);

      return res.json({
        status: 200,
        "data": withdrawStatus
      });
    } catch (err) {
      console.log(err);
      return res.json({
        status: 500,
        "err": sails.__("something Wrong")
      });
    }
  },

  //Withdrawl Cancellation LEFT
  withdrwalCancellationStatus: async function (req, res) {
    try {
      var {
        asset,
        refid
      } = req.body;

      var cancelStatus = await sails
        .helpers
        .kraken
        .getWithdrawlCancel(asset, refid);

      return res.json({
        status: 200,
        "data": cancelStatus
      });
    } catch (err) {
      console.log(err);
      return res.json({
        status: 500,
        "err": sails.__("Something Wrong")
      });
    }
  },

  //Query for trade INFO
  queryTradeInformation: async function (req, res) {
    try {
      var {
        txid
      } = req.allParams();

      var result = await sails
        .helpers
        .kraken
        .queryTradeInfo(txid);

      return res.json({
        status: 200,
        "data": result
      });
    } catch (err) {
      console.log(err);
      return res.json({
        status: 500,
        "err": sails.__("Something Wrong")
      });
    }
  },

  performConversion: async function (req, res) {
    try {

      let {
        pair,
        type,
        volume,
        includeFees
      } = req.allParams();
      let {
        crypto,
        currency
      } = await sails
        .helpers
        .utilities
        .getCurrencies(pair);

      var cryptoLimit = await Coins.findOne({
        deleted_at: null,
        is_active: true,
        coin: crypto
      });

      if (volume < cryptoLimit.min_limit) {
        return res.status(500).json({
          status: 500,
          err: sails.__("Minimum amount requiried")
        });
      }
      let userId = req.user.id;
      let pairDetails = await Pairs.findOne({
        name: pair,
        deleted_at: null,
        is_active: true
      });
      let feesDetails = await AdminSetting.findOne({
        deleted_at: null,
        slug: 'faldax_fee'
      });
      let faldaxFees = parseFloat(feesDetails.value);

      let feesDetailsKraken = await AdminSetting.findOne({
        deleted_at: null,
        slug: 'kraken_fee'
      });
      let krakenFees = parseFloat(feesDetailsKraken.value);


      var geo_fencing_data = await sails
        .helpers
        .userTradeChecking(userId);

      if (geo_fencing_data.response == true) {
        if (pairDetails) {
          let currencyAmount = 0;
          if (type == "buy") {
            currencyAmount = volume * pairDetails.ask_price
            // currencyAmount = 0.002 * '5530.00000';
          } else if (type == "sell") {
            currencyAmount = volume * pairDetails.bid_price;
            // currencyAmount = 0.002 * '5530.00000';
          }
          let walletCurrencyBalance = null;
          let walletCryptoBalance = null;
          walletCurrencyBalance = await sails
            .helpers
            .utilities
            .getWalletBalance(crypto, currency, userId)
            .tolerate("coinNotFound", () => {
              throw new Error("coinNotFound");
            })
            .tolerate("serverError", () => {
              throw new Error("serverError")
            });
          walletCryptoBalance = await sails
            .helpers
            .utilities
            .getWalletBalance(currency, crypto, userId)
            .tolerate("coinNotFound", () => {
              throw new Error("coinNotFound");
            })
            .tolerate("serverError", () => {
              throw new Error("serverError")
            });

          if (walletCurrencyBalance != undefined && walletCryptoBalance != undefined) {
            if ((type == "buy" && currencyAmount <= walletCurrencyBalance.placed_balance) || (type == "sell" && volume <= walletCryptoBalance.placed_balance)) {
              var addedData = await sails
                .helpers
                .kraken
                .addStandardOrder(pairDetails.kraken_pair, type, "market", volume)
                .tolerate("orderError", () => {
                  throw new Error("orderError");
                });

              if (addedData) {
                if (addedData.error && addedData.error.length > 0) {
                  // Error
                  throw new Error("serverError")
                } else {
                  if (addedData.result) {

                    if (addedData.result.txid && addedData.result.txid.length > 0) {
                      let now = new Date();

                      let transactionId = addedData.result.txid[0];

                      let tradeInfoData = await sails
                        .helpers
                        .kraken
                        .queryTradeInfo(transactionId);
                      let totalFees = 0;
                      totalFees = (tradeInfoData.result[transactionId].vol * krakenFees) / 100;
                      totalFees = totalFees + ((tradeInfoData.result[transactionId].vol * faldaxFees) / 100)
                      let tradeHistoryData = {
                        order_type: "Market",
                        fill_price: tradeInfoData.result[transactionId].price,
                        quantity: tradeInfoData.result[transactionId].vol,
                        side: type == "buy" ?
                          "Buy" : "Sell",
                        created_at: now,
                        updated_at: now,
                        user_id: req.user.id,
                        maximum_time: now,
                        limit_price: 0,
                        stop_price: 0,
                        price: 0,
                        order_status: "filled",
                        currency: currency,
                        settle_currency: crypto,
                        symbol: pair
                      }
                      var resultData = {
                        ...tradeHistoryData
                      }
                      resultData.is_market = true;
                      resultData.fix_quantity = volume;
                      resultData.maker_fee = 0.0;
                      resultData.taker_fee = totalFees;
                      resultData.user_fee = totalFees;
                      resultData.requested_fee = 0.0;

                      let activity = await sails
                        .helpers
                        .tradding
                        .activity
                        .add(resultData);

                      let tradeHistory = await sails
                        .helpers
                        .tradding
                        .trade
                        .add(resultData);

                      //Adding Data in referral table
                      let referredData = await sails
                        .helpers
                        .tradding
                        .getRefferedAmount(tradeHistory, req.user.id, transactionId);

                      if (type == "buy") {
                        await Wallet
                          .update({
                            id: walletCurrencyBalance.id
                          })
                          .set({
                            balance: (walletCurrencyBalance.balance - tradeInfoData.result[transactionId].cost),
                            placed_balance: (walletCurrencyBalance.placed_balance - tradeInfoData.result[transactionId].cost)
                          });

                        await Wallet
                          .update({
                            id: walletCryptoBalance.id
                          })
                          .set({
                            balance: (walletCryptoBalance.balance + (tradeInfoData.result[transactionId].vol - totalFees)),
                            placed_balance: (walletCryptoBalance.placed_balance + (tradeInfoData.result[transactionId].vol - totalFees))
                          });

                      } else if (type == "sell") {
                        await Wallet
                          .update({
                            id: walletCurrencyBalance.id
                          })
                          .set({
                            balance: (walletCurrencyBalance.balance + (tradeInfoData.result[transactionId].cost - (tradeInfoData.result[transactionId].cost * (faldaxFees / 100)))),
                            placed_balance: (walletCurrencyBalance.placed_balance + (tradeInfoData.result[transactionId].cost - (tradeInfoData.result[transactionId].cost * (faldaxFees / 100))))
                          });

                        await Wallet
                          .update({
                            id: walletCryptoBalance.id
                          })
                          .set({
                            balance: (walletCryptoBalance.balance - tradeInfoData.result[transactionId].vol),
                            placed_balance: (walletCryptoBalance.placed_balance - tradeInfoData.result[transactionId].vol)
                          });
                      }

                      return res.json({
                        status: 200,
                        message: sails.__("Order Success")
                      });
                    }
                  }
                }
              }

            } else {
              return res
                .status(500)
                .json({
                  status: 500,
                  message: sails.__("Insufficient balance to place order")
                });
            }
          } else {
            return res
              .status(500)
              .json({
                status: 500,
                message: "No User Wallet has been found."
              });
          }
        } else {
          console.log("invalid pair");
          return res
            .status(500)
            .json({
              status: 500,
              "err": sails.__("Something Wrong")
            });
        }
      } else {
        res.json({
          "status": 200,
          "message": sails.__(geo_fencing_data.msg)
        });
      }
    } catch (error) {
      console.log("error", error);

      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  }

}
