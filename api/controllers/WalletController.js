/**
 * WalletController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const BitGoJS = require('bitgo');
var moment = require('moment');

module.exports = {
  // call currency conversion helper
  getConversionData: async function (req, res) {
    var currencyData = await sails
      .helpers
      .dashboard
      .getCurrencyConversion();
    console.log('>>>>>>>>currencyData', currencyData);

    // for loop for res.data insert in table
    if (currencyData.data) {
      for (var i = 0; i <= currencyData.data.length; i++) {
        let coins = await Coins.findOne({coin: currencyData.data[i].symbol, deleted_at: null, is_active: true});
        console.log('>>>>>>>coins', coins)
        if (coins) {
          let existCurrencyData = await CurrencyConversion.findOne({deleted_at: null, symbol: currencyData.data[i].symbol})
          console.log('>>>>>>existCurrencyData', existCurrencyData)
          if (existCurrencyData) {
            var currency_data = await CurrencyConversion
              .update({coin_id: coins.id})
              .set({quote: currencyData.data[i].quote})
              .fetch();
          } else {
            var currency_data = await CurrencyConversion
              .create({coin_id: coins.id, quote: currencyData.data[i].quote, symbol: currencyData.data[i].symbol, created_at: new Date()})
              .fetch();
          }
        } else {
          console.log('>>>>>>>>>>>>else');
        }
      }
      console.log('>>>>>>>>>>>>coins_detail', currency_data)
    }
  },

  /**
      * Get wallet coin Data
      * Renders page for user when wallet screen is opened
      *
      * @param <currency>
      *
      * @return <Success message for successfully fetched data or error>
     */
  getCoinBalanceForWallet: async function (req, res) {
    try {
      let {currency} = req.body;
      var balanceCoin = [];
      var nonBalanceCoin = [];
      var total = 0;
      var flag = false;

      let query = `select * from coins JOIN wallets ON coins.id = wallets.coin_id WHERE wallets.user_id = ${req.user.id} AND coins.is_active=true AND coins.deleted_at IS NULL`

      let walletData = await sails.sendNativeQuery(query, [])
      //conversion using coin market cap is remaining

      console.log('>>>>>>>>walletData', walletData)
      // if (currency == "USD") {     currency = "USD,USD,USD"; } else if (currency ==
      // "INR") {     currency = "INR,INR,INR"; } else if (currency == "EUR") {
      // currency = "EUR,EUR,EUR"; } let currencyArray = currency.split(","); let
      // coins = await Coins     .find({         deleted_at: null, "wallet_address": {
      //             "!": null         }     })     .sort('id', 'DESC');

      return res.json({
        status: 200,
        message: sails.__("Balance retrieved success"),
        //balanceData, data
      });

    } catch (error) {
      console.log('wallet error', error);
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  },

  /**
    * API for sending coin to another address
    * Renders page for user wants to send coin
    *
    * @param <amount, destination_address, coin_code>
    *
    * @return <Success message for successfully send coin or error>
   */
  sendCoin: async function (req, res) {
    try {
      let {amount, destination_address, coin_code} = req.allParams();
      let user_id = req.user.id;

      var today = moment().format();
      var yesterday = moment()
        .startOf('day')
        .format();

      var limitAmount;

      let coin = await Coins.findOne({deleted_at: null, is_active: true, coin_code: coin_code});

      let warmWalletData = await sails
        .helpers
        .wallet
        .getWalletAddressBalance(coin.warm_wallet_address, coin_code);

      let sendWalletData = await sails
        .helpers
        .wallet
        .getWalletAddressBalance(coin.hot_send_wallet_address, coin_code);

      //If coin is found
      if (coin) {

        //Fetching value for limit according to user wise limit
        let userTierData = await UserLimit.find({deleted_at: null, user_id: user_id, coin_id: coin.id})
        if (userTierData.length == 0 || userTierData == undefined) {

          //If user wise limit is not found than search according to tier wise
          let userData = await KYC.findOne({deleted_at: null, user_id: user_id});
          let limitTierData = await Limit.findOne({deleted_at: null, tier_step: userData.steps, coin_id: coin.id});
          limitAmount = limitTierData.daily_withdraw_crypto;
        } else {
          limitAmount = userTierData[0].daily_withdraw_crypto;
        }

        //Getting total value of daily withdraw
        let walletHistoryData = await WalletHistory
          .sum('amount')
          .where({
            user_id: user_id,
            deleted_at: null,
            coin_id: coin.id,
            transaction_type: 'send',
            created_at: {
              '>=': yesterday,
              '<=': today
            }
          });

        //Limited amount is greater than the total sum
        if (limitAmount >= walletHistoryData) {

          //If total amount + amount to be send is less than limited amount
          if ((parseFloat(walletHistoryData) + parseFloat(amount)) <= limitAmount) {
            let wallet = await Wallet.findOne({deleted_at: null, coin_id: coin.id, is_active: true, user_id: user_id});
            if (wallet) {
              if (wallet.placed_balance >= parseInt(amount)) {
                if (coin.type == 1) {
                  if (!req.body.confirm_for_wait) {
                    //Check for warm wallet minimum thresold
                    if (warmWalletData.balance >= coin.min_thresold && (warmWalletData.balance - amount) >= coin.min_thresold) {
                      //Execute Transaction
                      var bitgo = new BitGoJS.BitGo({env: sails.config.local.BITGO_ENV_MODE, accessToken: sails.config.local.BITGO_ACCESS_TOKEN});
                      var bitgoWallet = await bitgo
                        .coin(coin.coin_code)
                        .wallets()
                        .get({id: coin.wallet_address});
                      let params = {
                        amount: amount * 1e8,
                        address: sendWalletData.receiveAddress.address,
                        walletPassphrase: sails.config.local.BITGO_PASSPHRASE
                      };

                      // Send to hot warm wallet and make entry in diffrent table for both warm to
                      // receive and receive to destination
                      bitgoWallet
                        .send(params)
                        .then(async function (transaction) {
                          //Here remainning ebtry as well as address change
                          let walletHistory = {
                            coin_id: wallet.coin_id,
                            source_address: sendWalletData.receiveAddress.address,
                            destination_address: destination_address,
                            user_id: user_id,
                            amount: amount,
                            transaction_type: 'send',
                            transaction_id: transaction.id,
                            is_executed: false
                          }

                          // Make changes in code for receive webhook and then send to receive address
                          // Entry in wallet history
                          await WalletHistory.create({
                            ...walletHistory
                          });
                          // update wallet balance
                          await Wallet
                            .update({id: wallet.id})
                            .set({
                              balance: wallet.balance - amount,
                              placed_balance: wallet.placed_balance - amount
                            });

                          // Adding the transaction details in transaction table 

                          
                          // This is entry for sending from warm wallet to hot send wallet
                          let addObject = {
                            coin_id: coin.id,
                            source_address: warmWalletData.receiveAddress.address,
                            destination_address: sendWalletData.receiveAddress.address,
                            user_id: user_id,
                            amount: amount,
                            transaction_type: 'send',
                            is_executed: true
                          }

                          await TransactionTable.create({
                            ...addObject
                          });

                          //This is for sending from hot send wallet to destination address
                          let addObjectSendData = {
                            coin_id: coin.id,
                            source_address: sendWalletData.receiveAddress.address,
                            destination_address: destination_address,
                            user_id: user_id,
                            amount: amount,
                            transaction_type: 'send',
                            is_executed: false
                          }

                          await TransactionTable.create({
                            ...addObjectSendData
                          });

                          return res.json({
                            status: 200,
                            message: sails.__("Token send success")
                          });
                        })
                        .catch(error => {
                          return res
                            .status(500)
                            .json({
                              status: 500,
                              message: sails._("Insufficent balance")
                            });
                        });
                    }
                  } else {
                    return res
                      .status(201)
                      .json({
                        status: 201,
                        message: sails.__('withdraw request confirm')
                      })
                  }
                } else {
                  //Insert request in withdraw request
                  var requestObject = {
                    source_address: warmWalletData.receiveAddress.address,
                    destination_address: sendWalletData.receiveAddress.address,
                    user_id: user_id,
                    amount: amount,
                    transaction_type: 'send',
                    is_approve: false,
                    coin_id: coin.id,
                    is_executed: false
                  }

                  await WithdrawRequest.create({
                    ...requestObject
                  });

                  return res.json({
                    status: 200,
                    message: sails.__("Request sumbit success")
                  });

                }
              } else {
                return res
                  .status(400)
                  .json({
                    status: 400,
                    message: sails.__("Insufficent balance wallet")
                  });

              }
            } else {
              return res
                .status(400)
                .json({
                  status: 400,
                  message: sails.__("Wallet Not Found")
                });
            }
          } else {
            return res
              .status(400)
              .json({
                status: 400,
                message: sails.__("Daily Limit Exceeded Using Amount")
              })
          }
        } else {
          return res
            .status(400)
            .json({
              status: 400,
              message: sails.__("Daily Limit Exceeded")
            })
        }

      } else {
        return res
          .status(400)
          .json({
            status: 400,
            message: sails.__("Coin not found")
          });

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

  /**
      * API for getting receiving address
      * Renders page for user wants to receive coin
      *
      * @param <coin>
      *
      * @return <Success message for successfully fetched coin address or error>
     */
  getReceiveCoin: async function (req, res) {
    try {
      var {coin} = req.allParams();
      var user_id = req.user.id;
      var receiveCoin = await sails
        .helpers
        .wallet
        .receiveCoin(coin, user_id);

      return res.json({
        status: 200,
        message: sails.__("receive address success"),
        receiveCoin
      });
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  },

  /**
      * API for getting wallet transaction history
      * Renders page for user when wallet details page is fetched
      *
      * @param <coin name>
      *
      * @return <Success message for successfully fetched wallet history or error>
     */

  getWalletTransactionHistory: async function (req, res) {
    try {
      let {coinReceive} = req.body;
      let coinData = await Coins.findOne({coin: coinReceive, deleted_at: null});
      let walletTransData = await WalletHistory.find({user_id: req.user.id, coin_id: coinData.id, deleted_at: null});
      let coinFee = await AdminSetting.find({
        where: {
          slug: 'default_send_coin_fee',
          deleted_at: null
        }
      });

      if (walletTransData.length > 0) {
        walletTransData[0]['coin_code'] = coinData.coin_code;
        walletTransData[0]['coin_icon'] = coinData.coin_icon;
        walletTransData[0]['coin'] = coinData.coin;
        walletTransData[0]['coin_name'] = coinData.coin_name;
      }

      let walletUserData = await Wallet.find({user_id: req.user.id, coin_id: coinData.id, deleted_at: null, is_active: true})
      if (walletUserData.length > 0) {
        walletUserData[0]['coin_code'] = coinData.coin_code;
        walletUserData[0]['coin_icon'] = coinData.coin_icon;
        walletUserData[0]['coin'] = coinData.coin;
        walletUserData[0]['coin_name'] = coinData.coin_name;
      }

      let walletTransCount = await WalletHistory.count({user_id: req.user.id, coin_id: coinData.id, deleted_at: null});
      if (walletTransData) {
        return res.json({
          status: 200,
          message: sails.__("wallet data retrieved success"),
          walletTransData,
          walletTransCount,
          walletUserData,
          coinFee
        });
      } else {
        return res.json({
          status: 200,
          message: sails.__("No Data")
        })
      }
    } catch (err) {
      console.log('err', err)
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  }
};
