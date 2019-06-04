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

    let coins = await Coins.find({deleted_at: null, is_active: true});
    let coinArray = [];
    for (let index = 0; index < coins.length; index++) {
      const element = coins[index];
      coinArray.push(element.coin)
    }
    //  for loop for res.data insert in table
    if (currencyData.data) {
      for (var i = 0; i < currencyData.data.length; i++) {
        if (coinArray.includes(currencyData.data[i].symbol)) {
          let existCurrencyData = await CurrencyConversion.findOne({deleted_at: null, symbol: currencyData.data[i].symbol})
          if (existCurrencyData) {
            var currency_data = await CurrencyConversion
              .update({
              coin_id: coins[coinArray.indexOf(currencyData.data[i].symbol)].id
            })
              .set({quote: currencyData.data[i].quote})
              .fetch();
          } else {
            var currency_data = await CurrencyConversion
              .create({
              coin_id: coins[coinArray.indexOf(currencyData.data[i].symbol)].id,
              quote: currencyData.data[i].quote,
              symbol: currencyData.data[i].symbol,
              created_at: new Date()
            })
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
    // console.log("req",req);

    try {
      let query = `SELECT 
                    coins.coin_name, coins.coin_code, coins.created_at, coins.id, 
                    coins.coin, wallets.balance, wallets.placed_balance, wallets.receive_address , currency_conversion.quote 
                    FROM coins 
                    INNER JOIN wallets ON coins.id = wallets.coin_id 
                    LEFT JOIN currency_conversion ON coins.id = currency_conversion.coin_id 
                    WHERE wallets.user_id = ${req.user.id} AND length(wallets.receive_address) > 0 AND coins.is_active=true AND coins.deleted_at IS NULL`
      let nonWalletQuery = `SELECT 
                    coins.coin_name, coins.coin_code, coins.created_at, coins.id, 
                    coins.coin,currency_conversion.quote 
                    FROM coins 
                    LEFT JOIN wallets ON coins.id = wallets.coin_id 
                    LEFT JOIN currency_conversion ON coins.id = currency_conversion.coin_id 
                    WHERE coins.is_active=true AND coins.deleted_at IS NULL AND (wallets.id IS NULL OR (length(wallets.receive_address) = 0 AND wallets.user_id = ${req.user.id}) )`

      let balanceWalletData = await sails.sendNativeQuery(query, []);

      let nonBalanceWalletData = await sails.sendNativeQuery(nonWalletQuery, []);

      return res.json({
        status: 200,
        message: sails.__("Balance retrieved success"),
        balanceData: balanceWalletData.rows,
        nonBalanceData: nonBalanceWalletData.rows,
        currency_list: sails.config.local.CURRENCY_LIST
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

      var monthlyData = moment()
        .startOf('month')
        .format();

      var limitAmount;
      var limitAmountMonthly;

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

          let userData = await Users.findOne({deleted_at: null, id: user_id, is_active: true});
          //If user wise limit is not found than search according to tier wise
          let limitTierData = await Limit.findOne({deleted_at: null, tier_step: userData.account_tier, coin_id: coin.id});
          limitAmount = limitTierData.daily_withdraw_crypto;
          limitAmountMonthly = limitTierData.monthly_withdraw_crypto;
        } else if (userTierData.length > 0) {
          limitAmount = userTierData[0].daily_withdraw_crypto;
          limitAmountMonthly = userTierData[0].monthly_withdraw_crypto;
        } else {
          limitAmount = null;
          limitAmountMonthly = null;
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

        // Getting total value of monthly withdraw
        let walletHistoryDataMonthly = await WalletHistory
          .sum('amount')
          .where({
            user_id: user_id,
            deleted_at: null,
            coin_id: coin.id,
            transaction_type: 'send',
            created_at: {
              '>=': monthlyData,
              '<=': today
            }
          })

        // Limited amount is greater than the total sum of day
        if (limitAmount >= walletHistoryData || (limitAmount == null || limitAmount == undefined)) {

          //If total amount + amount to be send is less than limited amount
          if ((parseFloat(walletHistoryData) + parseFloat(amount)) <= limitAmount || (limitAmount == null || limitAmount == undefined)) {

            //Checking monthly limit is greater than the total sum of month
            if (limitAmountMonthly >= walletHistoryDataMonthly || (limitAmountMonthly == null || limitAmountMonthly == undefined)) {

              // If total amount monthly + amount to be send is less than limited amount of
              // month
              if ((parseFloat(walletHistoryDataMonthly) + parseFloat(amount)) <= limitAmountMonthly || (limitAmountMonthly == null || limitAmountMonthly == undefined)) {

                let wallet = await Wallet.findOne({deleted_at: null, coin_id: coin.id, is_active: true, user_id: user_id});

                //Checking if wallet is found or not
                if (wallet) {

                  //If placed balance is greater than the amount to be send
                  if (wallet.placed_balance >= parseFloat(amount)) {

                    //If coin is of bitgo type
                    if (coin.type == 1) {

                      // If after all condition user has accepted to wait for 2 days then request need
                      // to be added in the withdraw request table
                      if (req.body.confirm_for_wait === undefined) {

                        //Check for warm wallet minimum thresold
                        if (warmWalletData.balance >= coin.min_thresold && (warmWalletData.balance - amount) >= 0 && (warmWalletData.balance - amount) >= coin.min_thresold) {
                          //Execute Transaction
                          var bitgo = new BitGoJS.BitGo({env: sails.config.local.BITGO_ENV_MODE, accessToken: sails.config.local.BITGO_ACCESS_TOKEN});
                          var bitgoWallet = await bitgo
                            .coin(coin.coin_code)
                            .wallets()
                            .get({id: coin.warm_wallet_address});
                          let params = {
                            amount: amount * 1e8,
                            address: sendWalletData.receiveAddress.address,
                            walletPassphrase: sails.config.local.BITGO_PASSPHRASE
                          };

                          // Send to hot warm wallet and make entry in diffrent table for both warm to
                          // receive and receive to destination
                          let transaction = await bitgoWallet.send(params);

                          //Here remainning ebtry as well as address change
                          let walletHistory = {
                            coin_id: wallet.coin_id,
                            source_address: sendWalletData.receiveAddress.address,
                            destination_address: destination_address,
                            user_id: user_id,
                            amount: amount,
                            transaction_type: 'send',
                            transaction_id: transaction.txid,
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

                          // Adding the transaction details in transaction table This is entry for sending
                          // from warm wallet to hot send wallet
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

                          return res.json({
                            status: 200,
                            message: sails.__("Token send success")
                          });
                        } else {
                          if (req.body.confirm_for_wait === undefined) {
                            return res
                              .status(201)
                              .json({
                                status: 201,
                                message: sails.__('withdraw request confirm')
                              })
                          } else {
                            return res
                              .status(200)
                              .json({
                                status: 200,
                                "err": sails.__("Transfer could not happen")
                              });
                          }
                        }
                      } else {
                        if (req.body.confirm_for_wait == true || req.body.confirm_for_wait === "true") {
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
                        } else {
                          return res
                            .status(201)
                            .json({
                              status: 201,
                              message: sails.__('withdraw request confirm')
                            })
                        }
                      }
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
                    message: sails.__("Monthly Limit Exceeded Using Amount")
                  })
              }
            } else {
              return res
                .status(400)
                .json({
                  status: 400,
                  message: sails.__("Monthly Limit Exceeded")
                })
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

      if (receiveCoin !== 1) {
        return res.json({
          status: 200,
          message: sails.__("receive address success"),
          receiveCoin
        });
      } else {
        return res
          .status(500)
          .json({
            status: 500,
            "err": sails.__("Something Wrong")
          });
      }
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
      let coinData = await Coins.findOne({
        select: [
          "id", "coin_code", "coin_icon", "coin_name"
        ],
        where: {
          coin_code: coinReceive,
          deleted_at: null
        }
      });
      // Explicitly call toJson of Model
      coinData = JSON.parse(JSON.stringify(coinData));

      let walletTransData = await WalletHistory.find({user_id: req.user.id, coin_id: coinData.id, deleted_at: null});
      let coinFee = await AdminSetting.findOne({
        where: {
          slug: 'default_send_coin_fee',
          deleted_at: null
        }
      });

      var currencyConversionData = await CurrencyConversion.findOne({coin_id: coinData.id, deleted_at: null})

      let walletUserData = await Wallet.findOne({user_id: req.user.id, coin_id: coinData.id, deleted_at: null, is_active: true})
      if (walletUserData) {
        if (walletUserData.receive_address === '') {
          walletUserData['flag'] = 1;
        } else {
          walletUserData['flag'] = 0;
        }
        walletUserData['coin_code'] = coinData.coin_code;
        walletUserData['coin_icon'] = coinData.coin_icon;
        walletUserData['coin'] = coinData.coin;
        walletUserData['coin_name'] = coinData.coin_name;
      } else {
        walletUserData.push({"flag": 2});
      }

      // let walletTransCount = await WalletHistory.count({ user_id: req.user.id,
      // coin_id: coinData.id, deleted_at: null });
      if (walletTransData) {
        return res.json({
          status: 200,
          message: sails.__("wallet data retrieved success"),
          walletTransData,
          // walletTransCount,
          walletUserData,
          'default_send_Coin_fee': coinFee.value,
          currencyConversionData
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
  },

  /**
      * API for getting wallet receive address for single coin only
      * Renders page for user clicks create wallet
      *
      * @param <coin name>
      *
      * @return <Success message for successfully created wallet or error>
     */
  createReceiveAddressCoin: async function (req, res) {
    try {
      var {coin_code} = req.allParams();
      var user_id = req.user.id;
      var userData = await Users.findOne({deleted_at: null, is_active: true, id: user_id});
      var walletDataCreate = await sails
        .helpers
        .wallet
        .receiveOneAddress(coin_code, userData);
      if (walletDataCreate == 1) {
        return res.json({
          status: 500,
          message: sails.__("Address already Create Success"),
          data: walletDataCreate
        })
      } else if (walletDataCreate) {
        return res.json({
          status: 200,
          message: sails.__("Address Create Success"),
          data: walletDataCreate
        })
      } else {
        return res.json({
          status: 500,
          message: sails.__("Address Not Create Success"),
          data: walletDataCreate
        })
      }
    } catch (error) {
      console.log(error)
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  }
};
