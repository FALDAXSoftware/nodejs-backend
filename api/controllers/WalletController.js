/**
 * WalletController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const BitGoJS = require('bitgo');
var moment = require('moment');
var speakeasy = require('speakeasy');
var logger = require("./logger")



module.exports = {

  getMonthlyDailyValue: async function (req, res) {
    try {
      var {
        user_id,
        coin_code
      } = req.allParams();

      var today = moment().utc().format();

      var yesterday = moment()
        .startOf('day')
        .format();

      console.log(yesterday);

      var monthlyData = moment()
        .startOf('month')
        .format();

      console.log(monthlyData);

      let coin = await Coins.findOne({
        deleted_at: null,
        is_active: true,
        coin_code: coin_code
      });

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

      console.log(walletHistoryData)

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
        });

      console.log(walletHistoryDataMonthly);

      return res.json({
        walletHistoryData,
        walletHistoryDataMonthly
      })

      console.log(walletHistoryDataMonthly)
    } catch (error) {
      console.log(error);
    }
  },

  // call currency conversion helper
  getConversionData: async function (req, res) {
    // var currencyData = await sails
    //   .helpers
    //   .dashboard
    //   .getCurrencyConversion();

    let coins = await Coins.find({
      deleted_at: null,
      is_active: true
    });
    let coinArray = [];
    for (let index = 0; index < coins.length; index++) {
      const element = coins[index];
      coinArray.push(element.coin)
    }
    //  for loop for res.data insert in table
    if (currencyData.data) {
      for (var i = 0; i < currencyData.data.length; i++) {
        if (coinArray.includes(currencyData.data[i].symbol)) {
          let existCurrencyData = await CurrencyConversion.findOne({
            deleted_at: null,
            symbol: currencyData.data[i].symbol
          })
          if (existCurrencyData) {
            var currency_data = await CurrencyConversion
              .update({
                coin_id: coins[coinArray.indexOf(currencyData.data[i].symbol)].id
              })
              .set({
                quote: currencyData.data[i].quote
              })
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
                    coins.coin_name, coins.coin_code, coins.created_at, coins.id, coins.coin_icon,
                    coins.coin, wallets.balance, wallets.placed_balance, wallets.receive_address , currency_conversion.quote
                    FROM coins
                    INNER JOIN wallets ON coins.id = wallets.coin_id
                    LEFT JOIN currency_conversion ON coins.id = currency_conversion.coin_id
                    WHERE wallets.user_id = ${req.user.id} AND length(wallets.receive_address) > 0 AND coins.is_active=true AND coins.deleted_at IS NULL`
      let nonWalletQuery = `SELECT coins.coin_name, coins.coin_code, coins.coin_icon,coins.created_at, coins.id, coins.coin,currency_conversion.quote FROM coins LEFT JOIN currency_conversion ON coins.id = currency_conversion.coin_id WHERE coins.is_active=true AND coins.deleted_at IS NULL AND coins.id NOT IN (SELECT coin_id FROM wallets WHERE wallets.deleted_at IS NULL AND user_id = ${req.user.id} AND (receive_address IS NOT NULL AND length(receive_address) > 0))  `

      let balanceWalletData = await sails.sendNativeQuery(query, []);

      for (var i = 0; i < balanceWalletData.rows.length; i++) {
        balanceWalletData.rows[i].balance = (balanceWalletData.rows[i].balance).toFixed(sails.config.local.TOTAL_PRECISION);
        balanceWalletData.rows[i].placed_balance = (balanceWalletData.rows[i].placed_balance).toFixed(sails.config.local.TOTAL_PRECISION);
        balanceWalletData.rows[i].quote.EUR.price = (balanceWalletData.rows[i].quote.EUR.price).toFixed(sails.config.local.TOTAL_PRECISION);
        // balanceWalletData.rows[i].quote.USD.price = (balanceWalletData.rows[i].quote.USD.price).toFixed(sails.config.local.TOTAL_PRECISION);
        balanceWalletData.rows[i].quote.INR.price = (balanceWalletData.rows[i].quote.INR.price).toFixed(sails.config.local.TOTAL_PRECISION);
        if (balanceWalletData.rows[i].quote.USD) {
          var get_price = await sails.helpers.fixapi.getPrice(balanceWalletData.rows[i].coin, 'Buy');
          if (get_price.length > 0)
            balanceWalletData.rows[i].quote.USD.price = get_price[0].ask_price
          else
            balanceWalletData.rows[i].quote.USD.price = ((balanceWalletData.rows[i].quote.USD.price) > 0 ? (balanceWalletData.rows[i].quote.USD.price).toFixed(sails.config.local.TOTAL_PRECISION) : 0)
        }
      }

      let nonBalanceWalletData = await sails.sendNativeQuery(nonWalletQuery, []);

      for (var i = 0; i < (nonBalanceWalletData.rows).length; i++) {
        console.log(nonBalanceWalletData.rows[i])
        if (nonBalanceWalletData.rows[i].quote != undefined) {
          nonBalanceWalletData.rows[i].quote.EUR.price = ((nonBalanceWalletData.rows[i].quote.EUR.price) != null ? (nonBalanceWalletData.rows[i].quote.EUR.price).toFixed(sails.config.local.TOTAL_PRECISION) : 0);
          // nonBalanceWalletData.rows[i].quote.USD.price = (nonBalanceWalletData.rows[i].quote.USD.price).toFixed(sails.config.local.TOTAL_PRECISION);
          nonBalanceWalletData.rows[i].quote.INR.price = ((nonBalanceWalletData.rows[i].quote.INR.price) != null ? (nonBalanceWalletData.rows[i].quote.INR.price).toFixed(sails.config.local.TOTAL_PRECISION) : 0);
          if (nonBalanceWalletData.rows[i].quote.USD) {
            var get_price = await sails.helpers.fixapi.getPrice(nonBalanceWalletData.rows[i].coin, 'Buy');
            if (get_price.length > 0)
              nonBalanceWalletData.rows[i].quote.USD.price = get_price[0].ask_price
            else
              nonBalanceWalletData.rows[i].quote.USD.price = ((nonBalanceWalletData.rows[i].quote.USD.price) > 0 ? (nonBalanceWalletData.rows[i].quote.USD.price).toFixed(sails.config.local.TOTAL_PRECISION) : 0)
          }
        }
      }

      return res.json({
        status: 200,
        message: sails.__("Balance retrieved success"),
        balanceData: balanceWalletData.rows,
        nonBalanceData: nonBalanceWalletData.rows,
        currency_list: sails.config.local.CURRENCY_LIST
      });

    } catch (error) {
      console.log('wallet error', error);
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
   * API for sending coin to another address
   * Renders page for user wants to send coin
   *
   * @param <amount, destination_address, coin_code>
   *
   * @return <Success message for successfully send coin or error>
   */
  sendCoin: async function (req, res) {
    try {
      let {
        amount,
        total_fees,
        destination_address,
        coin_code
      } = req.allParams();

      let user_id = req.user.id;
      var today = moment().utc().format();

      var yesterday = moment()
        .startOf('day')
        .format();

      console.log(yesterday)

      var monthlyData = moment()
        .startOf('month')
        .format();

      console.log(monthlyData);

      var userData = await Users.findOne({
        deleted_at: null,
        id: user_id,
        is_active: true
      });

      if (userData.is_twofactor && userData.twofactor_secret && (!req.body.confirm_for_wait)) {
        if (!req.body.otp) {
          return res
            .status(202)
            .json({
              "status": 202,
              "message": sails.__("Please enter OTP to continue")
            });
        }

        let verified = speakeasy
          .totp
          .verify({
            secret: userData.twofactor_secret,
            encoding: 'base32',
            token: req.body.otp,
            window: 2
          });

        if (!verified) {
          return res
            .status(402)
            .json({
              "status": 402,
              "message": sails.__("invalid otp")
            });
        }
      }

      if (userData.security_feature) {
        if (moment(userData.security_feature_expired_time).isAfter(today)) {
          var existing = moment(userData.security_feature_expired_time);
          var tz = moment.tz.guess();
          return res.status(203).json({
            "status": 203,
            "message": sails.__("Wait for 24 hours") + " till ",
            "datetime": existing.tz(tz).format()
          })
        }
      }

      var limitAmount;
      var limitAmountMonthly;

      let coin = await Coins.findOne({
        deleted_at: null,
        is_active: true,
        coin_code: coin_code
      });

      if (coin.min_limit > amount) {
        return res
          .status(500)
          .json({
            "status": 500,
            "message": sails.__("Minimum limit for the coin ") + coin_code + " is " + coin.min_limit + " " + coin.coin_code
          })
      }

      let warmWalletData = await sails
        .helpers
        .wallet
        .getWalletAddressBalance(coin.warm_wallet_address, coin_code);

      let sendWalletData = await sails
        .helpers
        .wallet
        .getWalletAddressBalance(coin.hot_send_wallet_address, coin_code);

      var panic_button_details = await AdminSetting.findOne({
        where: {
          deleted_at: null,
          slug: 'panic_status'
        }
      });

      // Checking for if panic button in one or not
      if (panic_button_details.value == false || panic_button_details.value == "false") {

        //If coin is found
        if (coin) {

          //Fetching value for limit according to user wise limit
          let userTierData = await UserLimit.find({
            deleted_at: null,
            user_id: user_id,
            coin_id: coin.id
          })
          console.log(userTierData);
          console.log(userTierData.length)
          if (userTierData.length == 0) {
            // if (userTierData.monthly_withdraw_crypto == 0 && userTierData.daily_withdraw_crypto == 0) {
            console.log("INSIDENIFN::::")
            if (userData != undefined) {
              //If user wise limit is not found than search according to tier wise
              let limitTierData = await Limit.findOne({
                deleted_at: null,
                tier_step: userData.account_tier,
                coin_id: coin.id
              });
              console.log(limitTierData)
              if (limitTierData != undefined) {
                limitAmount = limitTierData.daily_withdraw_crypto;
                console.log(limitAmount)
                limitAmount = (limitAmount) ? (limitAmount.toFixed(sails.config.local.TOTAL_PRECISION)) : (limitAmount == null)
                limitAmountMonthly = limitTierData.monthly_withdraw_crypto;
                console.log(limitAmountMonthly);
                limitAmountMonthly = (limitAmountMonthly != null) ? (limitAmountMonthly.toFixed(sails.config.local.TOTAL_PRECISION)) : (limitAmountMonthly == null)
              } else {
                limitAmount = null;
                limitAmountMonthly = null;
              }
            }
            // }
          } else if (userTierData.length > 0) {
            limitAmount = userTierData[0].daily_withdraw_crypto;
            console.log(limitAmount)
            limitAmount = (limitAmount) ? (limitAmount.toFixed(sails.config.local.TOTAL_PRECISION)) : (limitAmount == null)
            limitAmountMonthly = userTierData[0].monthly_withdraw_crypto;
            console.log(limitAmountMonthly)
            limitAmountMonthly = (limitAmountMonthly != null) ? (limitAmountMonthly.toFixed(sails.config.local.TOTAL_PRECISION)) : (limitAmountMonthly == null)
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

          console.log("Daily >>>>>>>>", walletHistoryData)

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
            });

          console.log(limitAmount);
          console.log(limitAmountMonthly);

          console.log("Monthly >>>>>>>>", walletHistoryDataMonthly)
          console.log("Addittion daily >>>>>>>>", (parseFloat(walletHistoryData) + parseFloat(total_fees)))
          console.log("Additton Monthly >>>>>>>>>>", (parseFloat(walletHistoryDataMonthly) + parseFloat(total_fees)))

          walletHistoryData = walletHistoryData.toFixed(sails.config.local.TOTAL_PRECISION);
          walletHistoryDataMonthly = walletHistoryDataMonthly.toFixed(sails.config.local.TOTAL_PRECISION);

          console.log(limitAmount >= walletHistoryData)
          console.log(limitAmount >= walletHistoryData || (limitAmount == null || limitAmount == undefined))
          // Limited amount is greater than the total sum of day
          if (limitAmount >= walletHistoryData || (limitAmount == null || limitAmount == undefined)) {

            console.log((parseFloat(walletHistoryData) + parseFloat(total_fees)) <= limitAmount || (limitAmount == null || limitAmount == undefined))
            //If total amount + amount to be send is less than limited amount
            if ((parseFloat(walletHistoryData) + parseFloat(amount)) <= limitAmount || (limitAmount == null || limitAmount == undefined)) {

              console.log(limitAmountMonthly >= walletHistoryDataMonthly || (limitAmountMonthly == null || limitAmountMonthly == undefined))
              //Checking monthly limit is greater than the total sum of month
              if (limitAmountMonthly >= walletHistoryDataMonthly || (limitAmountMonthly == null || limitAmountMonthly == undefined)) {

                console.log((parseFloat(walletHistoryDataMonthly) + parseFloat(amount)) <= limitAmountMonthly || (limitAmountMonthly == null || limitAmountMonthly == undefined))
                // If total amount monthly + amount to be send is less than limited amount of month
                if ((parseFloat(walletHistoryDataMonthly) + parseFloat(total_fees)) <= limitAmountMonthly || (limitAmountMonthly == null || limitAmountMonthly == undefined)) {

                  let wallet = await Wallet.findOne({
                    deleted_at: null,
                    coin_id: coin.id,
                    is_active: true,
                    user_id: user_id
                  });

                  //Checking if wallet is found or not
                  if (wallet) {

                    //If placed balance is greater than the amount to be send
                    if ((wallet.placed_balance).toFixed(sails.config.local.TOTAL_PRECISION) >= (parseFloat(total_fees)).toFixed(sails.config.local.TOTAL_PRECISION)) {

                      //If coin is of bitgo type
                      if (coin.type == 1) {

                        // If after all condition user has accepted to wait for 2 days then request need
                        // to be added in the withdraw request table
                        if (req.body.confirm_for_wait === undefined) {

                          //Check for warm wallet minimum thresold
                          if (warmWalletData.balance >= coin.min_thresold && (warmWalletData.balance - total_fees) >= 0 && (warmWalletData.balance - total_fees) >= coin.min_thresold) {

                            // Wallet balance checking for admin notification
                            await sails.helpers.notification.checkAdminWalletNotification();

                            console.log("Amount >>>>>>>>>", amount)
                            // Send to hot warm wallet and make entry in diffrent table for both warm to
                            // receive and receive to destination
                            let transaction = await sails.helpers.bitgo.send(coin.coin_code, coin.warm_wallet_address, wallet.send_address, (amount * 1e8).toString());

                            var adminWalletDetails = await Wallet.findOne({
                              where: {
                                deleted_at: null,
                                coin_id: coin.id,
                                is_active: true,
                                user_id: 36,
                                is_admin: true
                              }
                            });

                            if (adminWalletDetails != undefined) {
                              var updatedBalance = parseFloat(adminWalletDetails.balance) + (parseFloat(total_fees - amount));
                              var updatedPlacedBalance = parseFloat(adminWalletDetails.placed_balance) + (parseFloat(total_fees - amount));
                              var updatedData = await Wallet
                                .update({
                                  deleted_at: null,
                                  coin_id: coin.id,
                                  is_active: true,
                                  user_id: 36,
                                  is_admin: true
                                })
                                .set({
                                  balance: updatedBalance,
                                  placed_balance: updatedPlacedBalance
                                })
                                .fetch();
                            }

                            //Here remainning ebtry as well as address change
                            let walletHistory = {
                              coin_id: wallet.coin_id,
                              source_address: wallet.send_address,
                              destination_address: destination_address,
                              user_id: user_id,
                              amount: (amount),
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
                              .update({
                                id: wallet.id
                              })
                              .set({
                                balance: (wallet.balance - total_fees).toFixed(sails.config.local.TOTAL_PRECISION),
                                placed_balance: (wallet.placed_balance - total_fees).toFixed(sails.config.local.TOTAL_PRECISION)
                              });

                            // Adding the transaction details in transaction table This is entry for sending
                            // from warm wallet to hot send wallet
                            let addObject = {
                              coin_id: coin.id,
                              source_address: warmWalletData.receiveAddress.address,
                              destination_address: wallet.send_address,
                              user_id: user_id,
                              amount: (total_fees),
                              transaction_type: 'send',
                              is_executed: true,
                              transaction_id: transaction.txid,
                            }

                            await TransactionTable.create({
                              ...addObject
                            });

                            let addObject2 = {
                              coin_id: coin.id,
                              source_address: wallet.send_address,
                              destination_address: destination_address,
                              user_id: user_id,
                              amount: (total_fees),
                              transaction_type: 'send',
                              is_executed: false,
                              transaction_id: transaction.txid,
                            }

                            await TransactionTable.create({
                              ...addObject2
                            })

                            var userNotification = await UserNotification.findOne({
                              user_id: userData.id,
                              deleted_at: null,
                              slug: 'withdraw'
                            })
                            userData.coinName = coin.coin_code;
                            userData.amountReceived = total_fees;
                            if (userNotification != undefined) {
                              if (userNotification.email == true || userNotification.email == "true") {
                                if (userData.email != undefined)
                                  await sails.helpers.notification.send.email("withdraw", userData)
                              }
                              if (userNotification.text == true || userNotification.text == "true") {
                                if (userData.phone_number != undefined && userData.phone_number != null && userData.phone_number != '')
                                  await sails.helpers.notification.send.text("withdraw", userData)
                              }
                            }

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
                              destination_address: wallet.send_address,
                              user_id: user_id,
                              amount: (total_fees),
                              transaction_type: 'send',
                              coin_id: coin.id,
                              is_executed: false
                            }

                            await WithdrawRequest.create({
                              ...requestObject
                            });

                            // notify To admin


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
      } else {
        return res
          .status(500)
          .json({
            "status": 500,
            "message": sails.__("panic button enabled")
          })
      }
    } catch (error) {
      console.log(error);
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
   * API for getting receiving address
   * Renders page for user wants to receive coin
   *
   * @param <coin>
   *
   * @return <Success message for successfully fetched coin address or error>
   */
  getReceiveCoin: async function (req, res) {
    try {
      var {
        coin
      } = req.allParams();
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
      await logger.error(err.message)
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
      let {
        coinReceive,
        is_admin
      } = req.body;
      let coinData = await Coins.findOne({
        select: [
          "id", "coin_code", "coin_icon", "coin_name", "coin", "min_limit"
        ],
        where: {
          coin_code: coinReceive,
          deleted_at: null
        }
      });
      // Explicitly call toJson of Model
      coinData = JSON.parse(JSON.stringify(coinData));

      var walletTransData
      if (is_admin) {
        walletTransData = await TransactionTable
          .find({
            user_id: req.user.id,
            coin_id: coinData.id,
            deleted_at: null,
            is_admin: true
          })
          .sort('id DESC');
      } else {
        walletTransData = await TransactionTable
          .find({
            user_id: req.user.id,
            coin_id: coinData.id,
            deleted_at: null
          })
          .sort('id DESC');
      }

      let coinFee = await AdminSetting.findOne({
        where: {
          slug: 'default_send_coin_fee',
          deleted_at: null
        }
      });

      var currencyConversionData = await CurrencyConversion.findOne({
        coin_id: coinData.id,
        deleted_at: null
      })

      if (currencyConversionData) {
        if (currencyConversionData.quote.USD) {
          var get_price = await sails.helpers.fixapi.getPrice(currencyConversionData.symbol, 'Buy');
          console.log(get_price)
          if (get_price[0] != undefined) {
            currencyConversionData.quote.USD.price = get_price[0].ask_price
          } else {
            currencyConversionData.quote.USD.price = currencyConversionData.quote.USD.price
          }
        }
      }

      let walletUserData = await Wallet.findOne({
        user_id: req.user.id,
        coin_id: coinData.id,
        deleted_at: null,
        is_active: true
      })
      if (walletUserData) {
        if (walletUserData.receive_address === '') {
          walletUserData['flag'] = 1;
        } else {
          walletUserData['flag'] = 0;
        }

      } else {
        walletUserData = {};
        walletUserData["flag"] = 2;
      }
      walletUserData['coin_code'] = coinData.coin_code;
      walletUserData['coin_icon'] = coinData.coin_icon;
      walletUserData['coin'] = coinData.coin;
      walletUserData['coin_name'] = coinData.coin_name;
      walletUserData['min_limit'] = coinData.min_limit
      // let walletTransCount = await WalletHistory.count({ user_id: req.user.id,
      // coin_id: coinData.id, deleted_at: null });
      if (walletTransData) {
        return res.json({
          status: 200,
          message: sails.__("wallet data retrieved success"),
          walletTransData,
          // walletTransCount,
          walletUserData,
          'default_send_Coin_fee': parseFloat(coinFee.value),
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
      await logger.error(err.message)
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
      var {
        coin_code
      } = req.allParams();
      var user_id = req.user.id;
      var userData = [];
      userData = await Users.findOne({
        deleted_at: null,
        is_active: true,
        id: user_id
      });
      if (!userData) {
        userData = await Admin.findOne({
          deleted_at: null,
          is_active: true,
          id: user_id
        });
        userData.flag = true;
      } else {
        userData.flag = false;
      }
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
      await logger.error(error.message)
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  },

  // Create receive address for one coin
  createAdminReceiveAddressCoin: async function (req, res) {
    try {
      var {
        coin_code,
        user_id
      } = req.allParams();
      var userData = [];
      userData = await Users.findOne({
        deleted_at: null,
        is_active: true,
        id: user_id
      });
      if (!userData) {
        userData = await Admin.findOne({
          deleted_at: null,
          is_active: true,
          id: user_id
        });
        userData.flag = true;
      } else {
        userData.flag = false;
      }
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
        //Sending email to user for wallet Address Creation
        let slug = "user_wallet_address_creation"
        let template = await EmailTemplate.findOne({
          slug
        });
        let emailContent = await sails
          .helpers
          .utilities
          .formatEmail(template.content, {
            recipientName: userData.first_name,
            coin: coin_code
          });
        sails
          .hooks
          .email
          .send("general-email", {
            content: emailContent
          }, {
            to: userData.email,
            subject: "User Wallet Address has been Created"
          }, function (err) {
            if (!err) {

            }
          })
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
      await logger.error(error.message)
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  },

  // Admin Send Funds API
  sendCoinAdmin: async function (req, res) {
    try {

      let {
        amount,
        destination_address,
        coin_code
      } = req.allParams();

      let user_id = req.user.id;
      var today = moment().utc().format();

      var yesterday = moment()
        .startOf('day')
        .format();

      var monthlyData = moment()
        .startOf('month')
        .format();

      var userData = await Admin.findOne({
        deleted_at: null,
        id: user_id
      });

      let coin = await Coins.findOne({
        deleted_at: null,
        is_active: true,
        coin_code: coin_code
      });
      console.log("===============Send Coin================");
      console.log("coin", coin);
      let warmWalletData = await sails
        .helpers
        .wallet
        .getWalletAddressBalance(coin.warm_wallet_address, coin_code);
      console.log("warmWalletData", warmWalletData);
      let sendWalletData = await sails
        .helpers
        .wallet
        .getWalletAddressBalance(coin.hot_send_wallet_address, coin_code);

      //If coin is found
      if (coin) {

        let wallet = await Wallet.findOne({
          deleted_at: null,
          coin_id: coin.id,
          is_active: true,
          user_id: user_id
        });

        if (warmWalletData.balance >= parseFloat(amount)) {
          //Checking if wallet is found or not
          if (wallet) {
            console.log("wallet", wallet);
            console.log("wallet.placed_balance >= parseFloat(amount)", wallet.placed_balance >= parseFloat(amount));
            //If placed balance is greater than the amount to be send
            if (wallet.placed_balance >= parseFloat(amount)) {

              //If coin is of bitgo type
              if (coin.type == 1) {
                //Check for warm wallet minimum thresold
                // console.log(warmWalletData.balance)
                // console.log(coin.min_thresold);
                // console.log(warmWalletData.balance >= coin.min_thresold)
                //Execute Transaction

                // console.log("SEND WALLET DATA >>>>>>>>>>>>>>>>>>", sendWalletData);

                // Send to hot warm wallet and make entry in diffrent table for both warm to
                // receive and receive to destination
                // let transaction = await sails.helpers.bitgo.send(coin.coin_code, coin.warm_wallet_address, sendWalletData.receiveAddress.address, (amount * 1e8).toString());
                let transaction = await sails.helpers.bitgo.send(coin.coin_code, coin.warm_wallet_address, wallet.send_address, (amount * 1e8).toString());
                console.log("transaction", transaction);
                //Here remainning ebtry as well as address change
                let walletHistory = {
                  coin_id: wallet.coin_id,
                  source_address: wallet.send_address,
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
                  .update({
                    id: wallet.id
                  })
                  .set({
                    balance: wallet.balance - amount,
                    placed_balance: wallet.placed_balance - amount
                  });

                // Adding the transaction details in transaction table This is entry for sending
                // from warm wallet to hot send wallet
                let addObject = {
                  coin_id: coin.id,
                  source_address: warmWalletData.receiveAddress.address,
                  destination_address: wallet.send_address,
                  user_id: user_id,
                  amount: amount,
                  transaction_type: 'send',
                  is_executed: true,
                  is_admin: true
                }

                await TransactionTable.create({
                  ...addObject
                });

                let addObject2 = {
                  coin_id: coin.id,
                  source_address: wallet.send_address,
                  destination_address: destination_address,
                  user_id: user_id,
                  amount: amount,
                  transaction_type: 'send',
                  is_executed: false,
                  is_admin: true
                }

                await TransactionTable.create({
                  ...addObject2
                })

                return res.json({
                  status: 200,
                  message: sails.__("Token send success")
                });
              }
            } else {
              console.log("First");
              return res
                .status(400)
                .json({
                  status: 400,
                  message: sails.__("Insufficent balance wallet")
                });

            }
          } else {
            console.log("second");
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
              message: sails.__("Warm Wallet Balance Low")
            })
        }
      } else {
        console.log("Third");
        return res
          .status(400)
          .json({
            status: 400,
            message: sails.__("Coin not found")
          });
      }
    } catch (err) {
      console.log("Error");
      console.log(err);
      await logger.error(err.message)
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  },

  // Just for QA testing
  addWalletBalance: async function (req, res) {
    try {
      var {
        coin,
        user_id,
        balance
      } = req.body;


      var coinData = await Coins.findOne({
        deleted_at: null,
        coin_code: coin,
        // is_active: true
      });

      var walletData = await Wallet.findOne({
        deleted_at: null,
        coin_id: coinData.id,
        user_id: user_id
      });


      var amount = parseInt(walletData.balance) + balance;
      var placed_amount = parseInt(walletData.placed_balance) + balance
      if (walletData != undefined) {
        var updateWalletData = await Wallet.update({
          deleted_at: null,
          coin_id: coinData.id,
          user_id: user_id
        })
          .set({
            balance: amount,
            placed_balance: placed_amount
          });
      }
      return res.status(200).json({
        "status": 200
      })
    } catch (error) {
      console.log(error);
      await logger.error(error.message)
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  },

  // Update Wallet Balance
  updateWalletBalance: async function (req, res) {
    try {

      var {
        coin,
        user_id,
        balance
      } = req.body;


      var coinData = await Coins.findOne({
        deleted_at: null,
        coin_code: coin,
        // is_active: true
      });

      var walletData = await Wallet.findOne({
        deleted_at: null,
        coin_id: coinData.id,
        user_id: user_id
      });


      if (walletData != undefined) {
        var updateWalletData = await Wallet.update({
          deleted_at: null,
          coin_id: coinData.id,
          user_id: user_id
        })
          .set({
            balance: balance,
            placed_balance: balance
          });
      }
      return res.status(200).json({
        "status": 200
      })


    } catch (err) {
      console.log(err);
      await logger.error(err.message)
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  },

  getWithdrawlFee: async function (req, res) {
    try {
      var withdrawFee = await AdminSetting.find({
        where: {
          deleted_at: null,
          or: [{
            slug: 'default_send_coin_fee'
          },
          {
            slug: 'faldax_fee'
          }
          ]
        }
      })
        .sort('id DESC')
      return res.status(200)
        .json({
          "status": 200,
          "message": "Withdraw Fee has been retrieved successfully",
          withdrawFee
        })
    } catch (error) {
      console.log(error);
      await logger.error(error.message)
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  }

  // // Check Wallet Balance
  // checkWalletBalance: async function (req, res) {
  //   try {

  //     var coinData = await Coins.find({
  //       deleted_at: null,
  //       is_active: true
  //     });

  //     var coin_limit_data = await AdminSetting.findOne({
  //       where: {
  //         deleted_at: null,
  //         slug: 'admin_threshold_notification'
  //       }
  //     });

  //     var data = JSON.parse(coin_limit_data.value)

  //     for (var i = 0; i < coinData.length; i++) {

  //       console.log(coinData[i].id);
  //       console.log(coinData[i].coin_code);
  //       let warmWallet = await sails.helpers.bitgo.getWallet(coinData[i].coin_code, coinData[i].warm_wallet_address);
  //       let custodialWallet = await sails.helpers.bitgo.getWallet(coinData[i].coin_code, coinData[i].custody_wallet_address);

  //       console.log("Warm Wallet Balance ??????????????", warmWallet.balance);
  //       console.log("Custodial Wallet Balance >>>>>>>>>>", custodialWallet.balance)

  //       let exisiting = data.find(each_value => each_value['coin_id'] === coinData[i].id);
  //       console.log("Existing Value >>>>>>>>>>>>.", exisiting);

  //       if (warmWallet.balance != undefined) {
  //         if (warmWallet.balance <= data.first_limit) {

  //         }
  //       }

  //     }

  //   } catch (err) {
  //     console.log(err);
  //   }
  // }
};
