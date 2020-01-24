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
const request = require('request');


module.exports = {
  /**
  Get Monthly/Daily Value
  **/
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

      var monthlyData = moment()
        .startOf('month')
        .format();

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

      return res.json({
        walletHistoryData,
        walletHistoryDataMonthly
      })
    } catch (error) {
      console.log(error);
    }
  },
  /**
  Call currency conversion helper
  **/
  getConversionData: async function (req, res) {
    // var currencyData = await sails
    //   .helpers
    //   .dashboard
    //   .getCurrencyConversion();

    // await logger.info({
    //   "module": "Wallet",
    //   "user_id": "user_" + req.user.id,
    //   "url": req.url,
    //   "type": "Entry"
    // }, "Entered the function")

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

    try {
      var user_id;
      var filter = ''
      if (req.user.isAdmin) {
        user_id = 36;
        filter = ` wallets.user_id = ${user_id} AND wallets.is_admin = true `
      } else {
        user_id = req.user.id;
        filter = ` wallets.user_id = ${user_id}`
      }
      let query = `SELECT
                    coins.coin_name, coins.coin_code, coins.created_at, coins.id, coins.coin_icon,
                    coins.coin, wallets.balance, wallets.placed_balance, wallets.receive_address , currency_conversion.quote, coins.iserc
                    FROM coins
                    INNER JOIN wallets ON coins.id = wallets.coin_id
                    LEFT JOIN currency_conversion ON coins.id = currency_conversion.coin_id
                    WHERE ${filter} AND ((length(wallets.receive_address) > 0) OR( coins.iserc = true AND length(wallets.receive_address) = 0)) AND coins.is_active=true AND coins.deleted_at IS NULL AND wallets.deleted_at IS NULL`

      let nonWalletQuery = `SELECT coins.coin_name, coins.coin_code, coins.coin_icon,coins.created_at, coins.id, coins.coin,currency_conversion.quote
                              FROM coins LEFT JOIN currency_conversion ON coins.id = currency_conversion.coin_id
                              WHERE coins.is_active=true AND coins.deleted_at IS NULL
                              AND coins.id NOT IN (SELECT coin_id FROM wallets WHERE wallets.deleted_at IS NULL AND user_id =${user_id}
                              AND ((receive_address IS NOT NULL AND length(receive_address) > 0) OR (coins.iserc = true)))`
      let balanceWalletData = await sails.sendNativeQuery(query, []);

      var susucoinData = await sails.helpers.getUsdSusucoinValue();
      console.log("susucoinData", susucoinData)
      susucoinData = JSON.parse(susucoinData);
      susucoinData = susucoinData.data

      for (var i = 0; i < balanceWalletData.rows.length; i++) {
        if (balanceWalletData.rows[i].iserc == false) {
          balanceWalletData.rows[i].balance = (balanceWalletData.rows[i].balance).toFixed(sails.config.local.TOTAL_PRECISION);
          balanceWalletData.rows[i].placed_balance = (balanceWalletData.rows[i].placed_balance).toFixed(sails.config.local.TOTAL_PRECISION);
          if (balanceWalletData.rows[i].quote != null) {
            balanceWalletData.rows[i].quote.EUR.price = (balanceWalletData.rows[i].quote != null) ? (balanceWalletData.rows[i].quote.EUR.price).toFixed(sails.config.local.TOTAL_PRECISION) : (0.0);
            balanceWalletData.rows[i].quote.INR.price = (balanceWalletData.rows[i].quote != null) ? (balanceWalletData.rows[i].quote.INR.price).toFixed(sails.config.local.TOTAL_PRECISION) : (0.0);
          } else {
            balanceWalletData.rows[i].quote = {
              EUR: {
                price: susucoinData.EUR,
              },
              INR: {
                price: susucoinData.INR,
              },
              USD: {
                price: susucoinData.USD,
              }

            }
          }
          if (balanceWalletData.rows[i].quote.USD) {
            var get_price = await sails.helpers.fixapi.getPrice(balanceWalletData.rows[i].coin, 'Buy');
            if (get_price.length > 0)
              balanceWalletData.rows[i].quote.USD.price = get_price[0].ask_price
            else
              balanceWalletData.rows[i].quote.USD.price = ((balanceWalletData.rows[i].quote.USD.price) > 0 ? (balanceWalletData.rows[i].quote.USD.price).toFixed(sails.config.local.TOTAL_PRECISION) : 0)
          }
        }
      }

      let nonBalanceWalletData = await sails.sendNativeQuery(nonWalletQuery, []);

      for (var i = 0; i < (nonBalanceWalletData.rows).length; i++) {
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
        message: sails.__("Balance retrieved success").message,
        balanceData: balanceWalletData.rows,
        nonBalanceData: nonBalanceWalletData.rows,
        currency_list: sails.config.local.CURRENCY_LIST
      });

    } catch (error) {
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
        coin_code,
        networkFees,
        faldaxFees
      } = req.allParams();

      let user_id = req.user.id;
      var today = moment().utc().format();

      var dateTime = moment(today).local().format();
      var localTime = moment.utc(dateTime).toDate();
      localTime = moment(localTime).format()

      var yesterday = moment()
        .startOf('day')
        .format();

      var dateTimeMonthly = moment(yesterday).local().format();
      var localTimeMonthly = moment.utc(dateTimeMonthly).toDate();
      localTimeMonthly = moment(localTimeMonthly).format()

      var monthlyData = moment()
        .startOf('month')
        .format();

      var dateTimeDaily = moment(yesterday).local().format();
      var localTimeDaily = moment.utc(dateTimeDaily).toDate();
      localTimeDaily = moment(localTimeDaily).format()

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
              "message": sails.__("Please enter OTP to continue").message
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
              "message": sails.__("invalid otp").message
            });
        }
      }

      if (userData.security_feature) {
        if (moment(userData.security_feature_expired_time).isAfter(today)) {
          var existing = moment(userData.security_feature_expired_time);
          var tz = moment.tz.guess();
          return res.status(203).json({
            "status": 203,
            "message": sails.__("Wait for 24 hours").message + " till ",
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
            "message": sails.__("Minimum limit for the coin ").message + coin_code + " is " + coin.min_limit + " " + coin.coin_code,
            error_at: sails.__("Minimum limit for the coin ").message + coin_code + " is " + coin.min_limit + " " + coin.coin_code
          })
      }

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
          if (userTierData.length == 0 || userTierData == undefined) {
            if (userData != undefined) {
              //If user wise limit is not found than search according to tier wise
              let limitTierData = await Limit.findOne({
                deleted_at: null,
                tier_step: userData.account_tier,
                coin_id: coin.id
              });
              if (limitTierData != undefined) {
                limitAmount = limitTierData.daily_withdraw_crypto;
                limitAmount = (limitAmount) ? (limitAmount.toFixed(sails.config.local.TOTAL_PRECISION)) : (limitAmount == null)
                limitAmountMonthly = limitTierData.monthly_withdraw_crypto;
                limitAmountMonthly = (limitAmountMonthly != null) ? (limitAmountMonthly.toFixed(sails.config.local.TOTAL_PRECISION)) : (limitAmountMonthly == null)
              } else {
                limitAmount = null;
                limitAmountMonthly = null;
              }
            }
          } else if (userTierData.length > 0) {
            limitAmount = userTierData[0].daily_withdraw_crypto;
            limitAmount = (limitAmount) ? (limitAmount.toFixed(sails.config.local.TOTAL_PRECISION)) : (limitAmount == null)
            limitAmountMonthly = userTierData[0].monthly_withdraw_crypto;
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
                '>=': (localTimeMonthly),
                '<=': (localTime)
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
                '>=': (localTimeDaily),
                '<=': (localTime)
              }
            });

          walletHistoryData = walletHistoryData.toFixed(sails.config.local.TOTAL_PRECISION);
          walletHistoryDataMonthly = walletHistoryDataMonthly.toFixed(sails.config.local.TOTAL_PRECISION);
          // Limited amount is greater than the total sum of day
          if (limitAmount >= walletHistoryData || (limitAmount == null || limitAmount == undefined)) {

            //If total amount + amount to be send is less than limited amount
            if ((parseFloat(walletHistoryData) + parseFloat(amount)) <= limitAmount || (limitAmount == null || limitAmount == undefined)) {

              //Checking monthly limit is greater than the total sum of month
              if (limitAmountMonthly >= walletHistoryDataMonthly || (limitAmountMonthly == null || limitAmountMonthly == undefined)) {

                // If total amount monthly + amount to be send is less than limited amount of month
                if ((parseFloat(walletHistoryDataMonthly) + parseFloat(amount)) <= limitAmountMonthly || (limitAmountMonthly == null || limitAmountMonthly == undefined)) {

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

                        let warmWalletData = await sails
                          .helpers
                          .wallet
                          .getWalletAddressBalance(coin.warm_wallet_address, coin_code);

                        let sendWalletData = await sails
                          .helpers
                          .wallet
                          .getWalletAddressBalance(coin.hot_send_wallet_address, coin_code);

                        // If after all condition user has accepted to wait for 2 days then request need
                        // to be added in the withdraw request table
                        if (req.body.confirm_for_wait === undefined) {

                          //Check for warm wallet minimum thresold
                          console.log("Warmwalletbalance before",warmWalletData.balance);
                          if (warmWalletData.balance >= coin.min_thresold && (warmWalletData.balance - total_fees) >= 0 && (warmWalletData.balance - total_fees) >= coin.min_thresold && (warmWalletData.balance) > (total_fees * 1e8)) {

                            // Send to hot warm wallet and make entry in diffrent table for both warm to
                            // receive and receive to destination
                            var valueFee = parseFloat(networkFees / 2).toFixed(8)
                            var sendAmount = parseFloat(parseFloat(amount) + parseFloat(valueFee)).toFixed(8)
                            var amountValue = parseFloat(sendAmount * 1e8).toFixed(8)
                            let transaction = await sails.helpers.bitgo.send(coin.coin_code, coin.warm_wallet_address, wallet.send_address, (amountValue).toString());

                            var total_payout = parseFloat(amount) + parseFloat(faldaxFees)
                            var singleNetworkFee = parseFloat(parseFloat(networkFees) / 2).toFixed(8);
                            var network_fees = (transaction.transfer.feeString);
                            var network_feesValue = parseFloat(network_fees / (1e8))
                            var totalFeeSub = (parseFloat(total_payout) + parseFloat(network_feesValue) + parseFloat(singleNetworkFee));
                            var leftNetworkFees = (network_feesValue > singleNetworkFee) ? (parseFloat(network_feesValue) - parseFloat(singleNetworkFee)) : (parseFloat(singleNetworkFee) - parseFloat(network_feesValue));

                            console.log("valueFee",valueFee);
                            console.log("sendAmount",sendAmount);
                            console.log("amountValue",amountValue);
                            console.log("transaction",transaction);
                            console.log("total_payout",total_payout);
                            console.log("singleNetworkFee",singleNetworkFee);
                            console.log("network_fees",network_fees);
                            console.log("network_feesValue",network_feesValue);
                            console.log("totalFeeSub",totalFeeSub);
                            console.log("leftNetworkFees",leftNetworkFees);
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
                              var updatedBalance = parseFloat(adminWalletDetails.balance) + (parseFloat(faldaxFees));
                              var updatedPlacedBalance = parseFloat(adminWalletDetails.placed_balance) + (parseFloat(faldaxFees));
                              if (networkFees > network_feesValue) {
                                updatedBalance = parseFloat(updatedBalance) + parseFloat(leftNetworkFees);
                                updatedPlacedBalance = parseFloat(updatedPlacedBalance) + parseFloat(leftNetworkFees);
                              }
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
                              amount: (total_payout),
                              transaction_type: 'send',
                              transaction_id: transaction.txid,
                              is_executed: false,
                              is_admin: false,
                              faldax_fee: (parseFloat(faldaxFees)).toFixed(8),
                              actual_network_fees: network_feesValue,
                              estimated_network_fees: parseFloat(networkFees / 2).toFixed(8),
                              is_done: false,
                              actual_amount: amount
                            }

                            // Make changes in code for receive webhook and then send to receive address
                            // Entry in wallet history
                            await WalletHistory.create({
                              ...walletHistory
                            });
                            // update wallet balance
                            var data = await Wallet
                              .update({
                                id: wallet.id
                              })
                              .set({
                                balance: (wallet.balance - totalFeeSub).toFixed(8),
                                placed_balance: (wallet.placed_balance - totalFeeSub).toFixed(8)
                              });
                            console.log("User wallet balance after tx",data);
                            // Adding the transaction details in transaction table This is entry for sending
                            // from warm wallet to hot send wallet
                            let addObject = {
                              coin_id: coin.id,
                              source_address: warmWalletData.receiveAddress.address,
                              destination_address: wallet.send_address,
                              user_id: user_id,
                              amount: (amount),
                              transaction_type: 'send',
                              is_executed: true,
                              transaction_id: transaction.txid,
                              faldax_fee: (parseFloat(faldaxFees)).toFixed(8),
                              actual_network_fees: network_feesValue,
                              estimated_network_fees: parseFloat(networkFees / 2).toFixed(8),
                              is_done: false,
                              actual_amount: amount
                            }

                            await TransactionTable.create({
                              ...addObject
                            });

                            let addObject2 = {
                              coin_id: coin.id,
                              source_address: wallet.send_address,
                              destination_address: destination_address,
                              user_id: user_id,
                              amount: (amount),
                              transaction_type: 'send',
                              is_executed: false,
                              transaction_id: transaction.txid,
                              faldax_fee: (parseFloat(faldaxFees)).toFixed(8),
                              actual_network_fees: network_feesValue,
                              estimated_network_fees: parseFloat(networkFees / 2).toFixed(8),
                              is_done: false,
                              actual_amount: amount
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
                            userData.amountReceived = totalFeeSub;
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
                              message: amount + " " + (coin.coin_code).toUpperCase() + " " + sails.__("Token send success").message
                            });
                          } else {
                            if (req.body.confirm_for_wait === undefined) {
                              return res
                                .status(201)
                                .json({
                                  status: 201,
                                  message: sails.__('withdraw request confirm').message
                                })
                            } else {
                              return res
                                .status(200)
                                .json({
                                  status: 200,
                                  "err": sails.__("Transfer could not happen").message
                                });
                            }
                          }
                        } else {
                          if (req.body.confirm_for_wait == true || req.body.confirm_for_wait === "true") {
                            var adminDataFees = await AdminSetting.findOne({
                              where: {
                                deleted_at: null,
                                slug: "default_send_coin_fee"
                              }
                            });
                            //Insert request in withdraw request
                            var requestObject = {
                              source_address: wallet.send_address,
                              destination_address: destination_address,
                              user_id: user_id,
                              amount: (total_fees),
                              transaction_type: 'send',
                              coin_id: coin.id,
                              is_executed: false,
                              fees: adminDataFees.value
                            }

                            await WithdrawRequest.create({
                              ...requestObject
                            });

                            // notify To admin

                            return res.json({
                              status: 200,
                              message: sails.__("Request sumbit success").message
                            });
                          } else {
                            return res
                              .status(201)
                              .json({
                                status: 201,
                                message: sails.__('withdraw request confirm').message
                              })
                          }
                        }
                      } else {
                        var value = {
                          "user_id": parseInt(user_id),
                          "amount": parseFloat(amount),
                          "destination_address": destination_address,
                          "faldax_fee": faldaxFees,
                          "network_fee": networkFees
                        }
                        console.log(value);
                        var responseValue = await request({
                          url: sails.config.local.SUSUCOIN_URL + "send-susu-coin-address",
                          method: "POST",
                          headers: {

                            'x-token': 'faldax-susucoin-node',
                            'Content-Type': 'application/json'
                          },
                          body: value,
                          json: true
                        }, function (err, httpResponse, body) {
                          console.log("body", body)
                          console.log(err)
                          if (err) {
                            return (err);
                          }
                          if (body.error) {
                            return (body);
                          }
                          return (body);
                          // return body;
                        });
                        return res
                          .status(200)
                          .json({
                            "status": 200,
                            "message": amount + " " + coin.coin_code + " " + sails.__("Token send success").message
                          })
                      }
                    } else {
                      return res
                        .status(400)
                        .json({
                          status: 400,
                          message: sails.__("Insufficent balance wallet").message
                        });

                    }
                  } else {
                    return res
                      .status(400)
                      .json({
                        status: 400,
                        message: sails.__("Wallet Not Found").message
                      });
                  }
                } else {
                  return res
                    .status(400)
                    .json({
                      status: 400,
                      message: sails.__("Monthly Limit Exceeded Using Amount").message + (limitAmountMonthly - (parseFloat(walletHistoryDataMonthly)))
                    })
                }
              } else {
                return res
                  .status(400)
                  .json({
                    status: 400,
                    message: sails.__("Monthly Limit Exceeded").message
                  })
              }
            } else {
              return res
                .status(400)
                .json({
                  status: 400,
                  message: sails.__("Daily Limit Exceeded Using Amount").message + (limitAmount - (parseFloat(walletHistoryData)))
                })
            }
          } else {
            return res
              .status(400)
              .json({
                status: 400,
                message: sails.__("Daily Limit Exceeded").message
              })
          }
        } else {
          return res
            .status(400)
            .json({
              status: 400,
              message: sails.__("Coin not found").message
            });
        }
      } else {
        return res
          .status(500)
          .json({
            "status": 500,
            "message": sails.__("panic button enabled").message,
            error_at: esails.__("panic button enabled").message
          })
      }
    } catch (error) {
      // console.log("Error", error);
      if (error.name == "ImplementationError") {
        return res
          .status(201)
          .json({
            status: 201,
            message: sails.__('withdraw request confirm').message
          })
      }
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
   * API for getting receiving address
   * Renders page for user wants to receive coin
   *
   * @param <coin>
   *
   * @return <Success message for successfully fetched coin address or error>
   */
  getReceiveCoin: async function (req, res) {
    try {
      // await logger.info({
      //   "module": "Wallet Receive",
      //   "user_id": "user_" + req.user.id,
      //   "url": req.url,
      //   "type": "Entry"
      // }, "Entered the function")
      var {
        coin
      } = req.allParams();
      var user_id = req.user.id;
      var receiveCoin = await sails
        .helpers
        .wallet
        .receiveCoin(coin, user_id);

      if (receiveCoin !== 1) {
        // await logger.info({
        //   "module": "Wallet Receive Address",
        //   "user_id": "user_" + req.user.id,
        //   "url": req.url,
        //   "type": "Success"
        // }, sails.__("receive address success").message)
        return res.json({
          status: 200,
          message: sails.__("receive address success").message,
          receiveCoin
        });
      } else {
        // await logger.error({
        //   "module": "Panic Button",
        //   "user_id": "user_" + req.user.id,
        //   "url": req.url,
        //   "type": "Error"
        // }, sails.__("Something Wrong").message)
        return res
          .status(500)
          .json({
            status: 500,
            "err": sails.__("Something Wrong").message,
            error_at: sails.__("Something Wrong").message
          });
      }
    } catch (error) {
      // console.log(error);
      // await logger.error({
      //   "user_id": "user_" + req.user.id,
      //   "module": "JST",
      //   "url": req.url,
      //   "type": "Error"
      // }, err.message)
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
      if (is_admin == true && is_admin == "true") {
        req.user.id = 36
      }
      let coinData = await Coins.findOne({
        select: [
          "id", "coin_code", "coin_icon", "coin_name", "coin", "min_limit", "max_limit", "iserc"
        ],
        where: {
          coin_code: coinReceive,
          deleted_at: null
        }
      });
      if (coinData != undefined) {
        // Explicitly call toJson of Model
        coinData = JSON.parse(JSON.stringify(coinData));
        console.log(coinData);
        var walletTransData
        if (is_admin && is_admin != undefined) {
          walletTransData = await WalletHistory
            .find({
              user_id: 36,
              coin_id: coinData.id,
              deleted_at: null,
              is_admin: true
            })
            .sort('id DESC');
        } else {
          walletTransData = await WalletHistory
            .find({
              user_id: req.user.id,
              coin_id: coinData.id,
              deleted_at: null
            })
            .sort('id DESC');

          for (var j = 0; j < walletTransData.length; j++) {
            if (walletTransData[j].transaction_type == 'send') {
              walletTransData[j].faldax_fee = parseFloat(walletTransData[j].faldax_fee).toFixed(10);
              walletTransData[j].network_fees = (walletTransData[j].actual_network_fees >= parseFloat(walletTransData[j].estimated_network_fees)) ? (parseFloat((walletTransData[j].actual_network_fees * 2)).toFixed(10)) : (parseFloat(walletTransData[j].estimated_network_fees * 2))
              walletTransData[j].amount = (walletTransData[j].coin_id != 26) ? (parseFloat(parseFloat(walletTransData[j].amount) - parseFloat(walletTransData[j].faldax_fee))) : (parseFloat(walletTransData[j].amount).toFixed(10));
              walletTransData[j].total = (parseFloat(walletTransData[j].amount) + (parseFloat(walletTransData[j].network_fees)) + parseFloat(walletTransData[j].faldax_fee));
            } else if (walletTransData[j].transaction_type == 'receive') {
              walletTransData[j].faldax_fee = "-";
              walletTransData[j].network_fees = "-"
              walletTransData[j].total = (parseFloat(walletTransData[j].amount));
              walletTransData[j].amount = parseFloat(parseFloat(walletTransData[j].amount)).toFixed(8);
            }
          }
        }

        var withdrawRequestData = await WithdrawRequest.find({
          where: {
            deleted_at: null,
            user_id: req.user.id,
            coin_id: coinData.id
          }
        }).sort('created_at DESC')

        let coinFee = await AdminSetting.findOne({
          where: {
            slug: 'default_send_coin_fee',
            deleted_at: null
          }
        });


        if (coinReceive != "SUSU") {
          var currencyConversionData = await CurrencyConversion.findOne({
            coin_id: coinData.id,
            deleted_at: null
          })

          if (currencyConversionData) {
            if (currencyConversionData.quote.USD) {
              var get_price = await sails.helpers.fixapi.getPrice(currencyConversionData.symbol, 'Buy');
              if (get_price[0] != undefined) {
                currencyConversionData.quote.USD.price = get_price[0].ask_price
              } else {
                currencyConversionData.quote.USD.price = currencyConversionData.quote.USD.price
              }
            }
          }
        } else {
          var value = await sails.helpers.getUsdSusucoinValue();
          value = JSON.parse(value);
          value = value.data
          var currencyConversionData = {
            quote: {
              USD: {
                price: value.USD
              },
              EUR: {
                price: value.EUR
              },
              INR: {
                price: value.INR
              }
            }
          }
        }

        var object
        var walletUserData;
        if (is_admin && is_admin != undefined) {
          walletUserData = await Wallet.findOne({
            user_id: (36),
            coin_id: coinData.id,
            deleted_at: null,
            is_active: true,
            is_admin: true
          });
        } else {
          walletUserData = await Wallet.findOne({
            user_id: (req.user.id),
            coin_id: coinData.id,
            deleted_at: null,
            is_active: true
          });
        }

        if (coinData.iserc == true) {
          var walletData = await Wallet.findOne({
            where: {
              deleted_at: null,
              is_active: true,
              coin_id: 2,
              user_id: req.user.id
            }
          })

          walletUserData.receive_address = walletData.receive_address;
          walletUserData.send_address = walletData.send_address;
        }

        if (walletUserData) {
          if (walletUserData.receive_address === '' || walletUserData.receive_address == null) {
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
        walletUserData['min_limit'] = coinData.min_limit;
        walletUserData['max_limit'] = coinData.max_limit;

        if (walletTransData) {
          return res.json({
            status: 200,
            message: sails.__("wallet data retrieved success").message,
            walletTransData,
            // walletTransCount,
            walletUserData,
            'default_send_Coin_fee': parseFloat(coinFee.value),
            currencyConversionData,
            withdrawRequestData
          });
        } else {
          return res.json({
            status: 200,
            message: sails.__("No Data").message
          })
        }
      } else {
        return res.json({
          status: 500,
          err: sails.__("No Data").message,
          error_at: sails.__("No Data").message
        })
      }

    } catch (error) {
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
        await logger.error({
          "module": "Panic Button",
          "user_id": "user_" + req.user.id,
          "url": req.url,
          "type": "Error"
        }, sails.__("Address already Create Success").message)
        return res.json({
          status: 500,
          message: sails.__("Address already Create Success").message,
          data: walletDataCreate
        })
      } else if (walletDataCreate) {
        return res.json({
          status: (coin_code != "SUSU") ? (200) : (walletDataCreate.status),
          message: (coin_code != "SUSU") ? (sails.__("Address Create Success")) : (walletDataCreate.message),
          data: (coin_code != "SUSU") ? (walletDataCreate) : (walletDataCreate.data)
        })
      } else {
        return res.json({
          status: 500,
          message: sails.__("Address Not Create Success").message,
          data: walletDataCreate,
          error_at: sails.__("Address Not Create Success").message
        })
      }
    } catch (error) {
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
  Create receive address for one coin
  **/
  createAdminReceiveAddressCoin: async function (req, res) {
    try {
      // await logger.info({
      //   "module": "Admin Create User Wallet",
      //   "user_id": "user_" + req.user.id,
      //   "url": req.url,
      //   "type": "Entry"
      // }, "Entered the function")
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

      userData.flag = false;
      var walletDataCreate = await sails
        .helpers
        .wallet
        .receiveOneAddress(coin_code, userData);

      if (walletDataCreate == 1) {
        // await logger.error({
        //   "module": "Admin Create User Wallet",
        //   "user_id": "user_" + req.user.id,
        //   "url": req.url,
        //   "type": "Error"
        // }, sails.__("Address already Create Success").message)

        return res.json({
          status: 500,
          message: sails.__("Address already Create Success").message,
          data: walletDataCreate,
          error_at: sails.__("Address already Create Success").message
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
        // await logger.info({
        //   "module": "Wallet Create Address",
        //   "user_id": "user_" + req.user.id,
        //   "url": req.url,
        //   "type": "Success"
        // }, sails.__("Address Create Success").message)
        return res.json({
          status: 200,
          message: sails.__("Address Create Success").message,
          data: walletDataCreate
        })
      } else {
        // await logger.error({
        //   "module": "Wallet Create Address",
        //   "user_id": "user_" + req.user.id,
        //   "url": req.url,
        //   "type": "Error"
        // }, sails.__("Address Not Create Success").message)
        return res.json({
          status: 500,
          message: sails.__("Address Not Create Success").message,
          data: walletDataCreate,
          error_at: sails.__("Address Not Create Success").message
        })
      }
    } catch (error) {
      // console.log(error)
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
  Create receive address for one coin for admin
  **/
  createAdminReceiveAddressCoinForAdmin: async function (req, res) {
    try {
      // await logger.info({
      //   "module": "Admin create admin wallet",
      //   "user_id": "user_" + req.user.id,
      //   "url": req.url,
      //   "type": "Entry"
      // }, "Entered the function")
      var {
        coin_code,
        user_id
      } = req.allParams();
      var userData = [];
      userData = await Admin.findOne({
        deleted_at: null,
        is_active: true,
        id: user_id
      });
      userData.flag = true;
      var walletDataCreate = await sails
        .helpers
        .wallet
        .receiveOneAddress(coin_code, userData);

      if (walletDataCreate == 1) {
        // await logger.error({
        //   "module": "Wallet Create Address",
        //   "user_id": "user_" + req.user.id,
        //   "url": req.url,
        //   "type": "Error"
        // }, sails.__("Address already Create Success").message)
        return res.json({
          status: 500,
          message: sails.__("Address already Create Success").message,
          data: walletDataCreate,
          error_at: sails.__("Address already Create Success").message
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
        // await logger.info({
        //   "module": "Wallet Create Address",
        //   "user_id": "user_" + req.user.id,
        //   "url": req.url,
        //   "type": "Success"
        // }, sails.__("Address Create Success").message)
        return res.json({
          status: 200,
          message: sails.__("Address Create Success").message,
          data: walletDataCreate
        })
      } else {
        // await logger.error({
        //   "module": "Wallet Create Address",
        //   "user_id": "user_" + req.user.id,
        //   "url": req.url,
        //   "type": "Error"
        // }, sails.__("Address Not Create Success").message)
        return res.json({
          status: 500,
          message: sails.__("Address Not Create Success").message,
          data: walletDataCreate,
          error_at: sails.__("Address Not Create Success").message
        })
      }
    } catch (error) {
      // console.log(error)
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
  Admin Send Funds API
  **/
  sendCoinAdmin: async function (req, res) {
    try {
      // await logger.info({
      //   "module": "Wallet Admin Send Coin",
      //   "user_id": "user_" + req.user.id,
      //   "url": req.url,
      //   "type": "Entry"
      // }, "Entered the function")
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

        let wallet = await Wallet.findOne({
          deleted_at: null,
          coin_id: coin.id,
          is_active: true,
          user_id: user_id
        });

        //Checking if wallet is found or not
        if (wallet) {
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
              //Here remainning ebtry as well as address change
              let walletHistory = {
                coin_id: wallet.coin_id,
                source_address: wallet.send_address,
                destination_address: destination_address,
                user_id: user_id,
                amount: amount,
                transaction_type: 'send',
                transaction_id: transaction.txid,
                is_executed: false,
                is_admin: true
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
                transaction_id: transaction.txid,
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
                transaction_id: transaction.txid,
                transaction_type: 'send',
                is_executed: false,
                is_admin: true
              }

              await TransactionTable.create({
                ...addObject2
              })

              // await logger.info({
              //   "module": "Wallet Send Coin Admin",
              //   "user_id": "user_" + req.user.id,
              //   "url": req.url,
              //   "type": "Success"
              // }, sails.__("Token send success").message)
              return res.json({
                status: 200,
                message: sails.__("Token send success").message
              });
            }
          } else {
            // await logger.info({
            //   "module": "Wallet Send Coin Admin",
            //   "user_id": "user_" + req.user.id,
            //   "url": req.url,
            //   "type": "Success"
            // }, sails.__("Insufficent balance wallet").message)
            return res
              .status(400)
              .json({
                status: 400,
                message: sails.__("Insufficent balance wallet").message
              });

          }
        } else {
          return res
            .status(400)
            .json({
              status: 400,
              message: sails.__("Wallet Not Found").message
            });
        }
      } else {
        return res
          .status(400)
          .json({
            status: 400,
            message: sails.__("Coin not found").message
          });
      }
    } catch (error) {
      // console.log(error);
      // await logger.error({
      //   "user_id": "user_" + req.user.id,
      //   "module": "JST",
      //   "url": req.url,
      //   "type": "Error"
      // }, err.message)
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
  Just for QA testing Just for Testing
  **/
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
      // console.log(error);
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
  Update Wallet Balance Just for testing
  **/
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


    } catch (error) {
      // console.log(error);
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
  Get Withrawls Fees
  **/
  getWithdrawlFee: async function (req, res) {
    try {
      // await logger.info({
      //   "module": "Wallet",
      //   "user_id": "user_" + req.user.id,
      //   "url": req.url,
      //   "type": "Entry"
      // }, "Entered the function")
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
      // await logger.info({
      //   "module": "Wallet Faldax Fee",
      //   "user_id": "user_" + req.user.id,
      //   "url": req.url,
      //   "type": "Success"
      // }, "Withdraw Fee has been retrieved successfully")
      return res.status(200)
        .json({
          "status": 200,
          "message": sails.__("Withdraw Fee has been retrieved successfully").message,
          withdrawFee
        })
    } catch (error) {
      // console.log(error);
      // await logger.error({
      //   "module": "Wallet Faldax Fee",
      //   "user_id": "user_" + req.user.id,
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
  Get Wallet Coin Transaction
  **/
  getWalletCoinTransaction: async function (req, res) {
    try {
      var {
        coin_code,
        wallet_type,
        sort_col,
        sort_order,
        page,
        limit,
        data,
        start_date,
        end_date
      } = req.allParams();

      var user_id = req.user.id;
      var filter = ''
      console.log("coin_code", coin_code);
      if (wallet_type == 1) {
        var queryAppended = false;
        if (coin_code && (coin_code != '' || coin_code != null)) {
          filter += ` AND coins.coin_code = '${coin_code}'`
          queryAppended = true;
        }
        if (data && data != '' && data != null) {
          filter += ' AND'
          filter += " (LOWER(wallet_history.source_address) LIKE '%" + data.toLowerCase() + "%' OR LOWER(wallet_history.destination_address) LIKE '%" + data.toLowerCase() + "%' OR LOWER(wallet_history.transaction_id) LIKE '%" + data.toLowerCase() + "%')";
        }
        var walletLogs = `SELECT wallet_history.source_address,coins.coin ,wallet_history.destination_address,
                          (cast((wallet_history.amount - wallet_history.faldax_fee) as decimal(8,0))) as amount,
                          wallet_history.transaction_id, CONCAT((wallet_history.faldax_fee),' ',coins.coin) as faldax_fee,
                          wallet_history.created_at, coins.coin_code
                          FROM public.wallet_history LEFT JOIN coins
                          ON wallet_history.coin_id = coins.id
                          WHERE coins.is_active = 'true' AND wallet_history.deleted_at IS NULL
                           AND wallet_history.transaction_type = 'send'${filter}`


        if (start_date && end_date) {
          walletLogs += " AND "

          walletLogs += " wallet_history.created_at >= '" + await sails
            .helpers
            .dateFormat(start_date) + " 00:00:00' AND wallet_history.created_at <= '" + await sails
              .helpers
              .dateFormat(end_date) + " 23:59:59'";
        }

        countQuery = walletLogs;

        if (sort_col && sort_order) {
          let sortVal = (sort_order == 'descend' ?
            'DESC' :
            'ASC');
          walletLogs += " ORDER BY wallet_history." + sort_col + " " + sortVal;
        }

        walletLogs += " limit " + limit + " offset " + (parseInt(limit) * (parseInt(page) - 1))

        var walletValue = await sails.sendNativeQuery(walletLogs, []);

        walletValue = walletValue.rows

        tradeCount = await sails.sendNativeQuery(countQuery, [])
        tradeCount = tradeCount.rows.length;

        return res
          .status(200)
          .json({
            "status": 200,
            "message": sails.__("wallet Fee Data success").message,
            walletValue,
            tradeCount
          })
      } else if (wallet_type == 2) {
        if (coin_code && coin_code != '' && coin_code != null) {
          filter += ` AND coins.coin_code = '${coin_code}'`
        }
        if (data && data != '' && data != null) {
          filter += ' AND'
          filter += " (LOWER(wallet_history.source_address) LIKE '%" + data.toLowerCase() + "%' OR LOWER(wallet_history.destination_address) LIKE '%" + data.toLowerCase() + "%' OR LOWER(wallet_history.transaction_id) LIKE '%" + data.toLowerCase() + "%')";
        }
        var walletLogs = `SELECT wallet_history.source_address,coins.coin, wallet_history.destination_address,
                            (CONCAT(wallet_history.amount) , ' ', coins.coin) as amount,(cast(amount as decimal(8,0))) as amount,
                            wallet_history.transaction_id, wallet_history.transaction_type, wallet_history.created_at, coins.coin_code
                            FROM public.wallet_history LEFT JOIN coins
                            ON wallet_history.coin_id = coins.id
                            WHERE coins.is_active = 'true' AND wallet_history.deleted_at IS NULL
                            AND user_id = ${user_id} AND is_admin = 'true'${filter}`

        if (start_date && end_date) {
          walletLogs += " AND "

          walletLogs += " wallet_history.created_at >= '" + await sails
            .helpers
            .dateFormat(start_date) + " 00:00:00' AND wallet_history.created_at <= '" + await sails
              .helpers
              .dateFormat(end_date) + " 23:59:59'";
        }

        countQuery = walletLogs;

        if (sort_col && sort_order) {
          let sortVal = (sort_order == 'descend' ?
            'DESC' :
            'ASC');
          walletLogs += " ORDER BY wallet_history." + sort_col + " " + sortVal;
        }

        walletLogs += " limit " + limit + " offset " + (parseInt(limit) * (parseInt(page) - 1))

        var walletValue = await sails.sendNativeQuery(walletLogs, []);

        walletValue = walletValue.rows

        tradeCount = await sails.sendNativeQuery(countQuery, [])
        tradeCount = tradeCount.rows.length;

        return res
          .status(200)
          .json({
            "status": 200,
            "message": sails.__("Admin wallet history success").message,
            walletValue,
            tradeCount
          })
      } else if (wallet_type == 3) {

        var queryAppended = false;

        if (coin_code && coin_code != '' && coin_code != null) {
          filter += ` AND coins.coin_code = '${coin_code}'`
          queryAppended = true
        }

        if (data && data != '' && data != null) {
          if (queryAppended == true) {
            filter += " AND (LOWER(users.email) LIKE '%" + data.toLowerCase() + "%' OR LOWER(jst_trade_history.symbol) LIKE '%" + data.toLowerCase() + "%' OR LOWER(jst_trade_history.order_id) LIKE '%" + data.toLowerCase() + "%' OR jst_trade_history.exec_id LIKE '%" + data.trim() + "%' OR LOWER(jst_trade_history.currency) LIKE '%" + data.toLowerCase() + "%' OR LOWER(jst_trade_history.settle_currency) LIKE '%" + data.toLowerCase() + "%'";
            if (!isNaN(data)) {
              filter += " OR quantity=" + data + " OR fill_price=" + data
            }
            filter += ")"
          } else {
            filter += " AND (LOWER(users.email) LIKE '%" + data.toLowerCase() + "%' OR LOWER(jst_trade_history.symbol) LIKE '%" + data.toLowerCase() + "%' OR LOWER(jst_trade_history.order_id) LIKE '%" + data.toLowerCase() + "%' OR jst_trade_history.exec_id LIKE '%" + data.trim() + "%' OR LOWER(jst_trade_history.currency) LIKE '%" + data.toLowerCase() + "%' OR LOWER(jst_trade_history.settle_currency) LIKE '%" + data.toLowerCase() + "%'";
            if (!isNaN(data)) {
              filter += " OR quantity=" + data + " OR fill_price=" + data
            }
            filter += ")"
          }
        }

        var walletLogs = `SELECT CONCAT((jst_trade_history.fill_price), ' ',(jst_trade_history.settle_currency)) as fill_price,
                              CONCAT((jst_trade_history.quantity), ' ',(jst_trade_history.currency)) as quantity,
                              jst_trade_history.order_status, jst_trade_history.symbol,
                              jst_trade_history.settle_currency, jst_trade_history.currency,
                              (CONCAT(jst_trade_history.limit_price), ' ', (jst_trade_history.settle_currency)) as limit_price,
                              jst_trade_history.order_id, jst_trade_history.execution_report, jst_trade_history.exec_id, jst_trade_history.transact_time,
                              CONCAT((jst_trade_history.faldax_fees),' ', (CASE when jst_trade_history.side = 'Buy' THEN jst_trade_history.currency ELSE jst_trade_history.settle_currency END)) as faldax_fees,
                              CONCAT((jst_trade_history.network_fees),' ', (CASE when jst_trade_history.side = 'Buy' THEN jst_trade_history.currency ELSE jst_trade_history.settle_currency END)) as network_fees,
                              CONCAT((jst_trade_history.difference_faldax_commission), ' ',(jst_trade_history.settle_currency)) as comission,
                              users.email,jst_trade_history.exec_id, coins.coin_code
                              FROM public.jst_trade_history LEFT JOIN coins
                              ON coins.coin = jst_trade_history.currency OR coins.coin = jst_trade_history.settle_currency
                              LEFT JOIN users ON users.id = jst_trade_history.user_id
                              WHERE jst_trade_history.order_status='filled'
                              ${filter}`

        if (start_date && end_date) {
          walletLogs += " AND "

          walletLogs += " jst_trade_history.created_at >= '" + await sails
            .helpers
            .dateFormat(start_date) + " 00:00:00' AND jst_trade_history.created_at <= '" + await sails
              .helpers
              .dateFormat(end_date) + " 23:59:59'";
        }

        countQuery = walletLogs;

        if (sort_col && sort_order) {
          let sortVal = (sort_order == 'descend' ?
            'DESC' :
            'ASC');
          walletLogs += " ORDER BY jst_trade_history." + sort_col + " " + sortVal;
        }

        walletLogs += " limit " + limit + " offset " + (parseInt(limit) * (parseInt(page) - 1))

        var walletValue = await sails.sendNativeQuery(walletLogs, []);

        walletValue = walletValue.rows

        tradeCount = await sails.sendNativeQuery(countQuery, [])
        tradeCount = tradeCount.rows.length;

        return res
          .status(200)
          .json({
            "status": 200,
            "message": sails.__("Admin wallet history success").message,
            walletValue,
            tradeCount
          })
      } else if (wallet_type == 4) {

        if (coin_code && coin_code != '' && coin_code != null) {
          filter += ` AND coins.coin_code = '${coin_code}'`
          queryAppended = true
        }

        if (data && data != '' && data != null) {
          filter += ' AND'
          filter += " (LOWER(wallets.receive_address) LIKE '%" + data.toLowerCase() + "%' OR LOWER(wallets.send_address) LIKE '%" + data.toLowerCase() + "%' OR LOWER(users.full_name) LIKE '%" + data.toLowerCase() + "%' OR LOWER(users.email) LIKE '%" + data.toLowerCase() + "%')";
        }

        var walletLogs = `SELECT wallets.id, users.email, users.created_at, users.deleted_at,
                            CONCAT ((wallets.balance), ' ', coins.coin) as balance,
                            wallets.receive_address, coins.coin_code,
                            wallets.send_address, users.full_name, coins.coin
                            FROM public.wallets LEFT JOIN users
                            ON users.id = wallets.user_id
                            LEFT JOIN coins ON wallets.coin_id = coins.id
                            WHERE users.deleted_at IS NOT NULL AND wallets.balance IS NOT NULL AND wallets.balance > 0
                            AND wallets.placed_balance IS NOT NULL${filter}`

        if (start_date && end_date) {
          walletLogs += " AND "

          walletLogs += " users.deleted_at >= '" + await sails
            .helpers
            .dateFormat(start_date) + " 00:00:00' AND users.deleted_at <= '" + await sails
              .helpers
              .dateFormat(end_date) + " 23:59:59'";
        }

        countQuery = walletLogs;

        if (sort_col && sort_order) {
          let sortVal = (sort_order == 'descend' ?
            'DESC' :
            'ASC');
          walletLogs += " ORDER BY users." + sort_col + " " + sortVal;
        } else {
          walletLogs += " ORDER BY users.delete_at DESC"
        }

        walletLogs += " limit " + limit + " offset " + (parseInt(limit) * (parseInt(page) - 1))
        var walletValue = await sails.sendNativeQuery(walletLogs, []);

        walletValue = walletValue.rows

        tradeCount = await sails.sendNativeQuery(countQuery, [])
        tradeCount = tradeCount.rows.length;

        return res
          .status(200)
          .json({
            "status": 200,
            "message": sails.__("Admin wallet history success").message,
            walletValue,
            tradeCount
          })
      }


    } catch (error) {
      // console.log(error);
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
  Get Warmwallet Information
  **/
  getWarmWalletInfo: async function (req, res) {
    try {
      let {
        search
      } = req.allParams();
      var query = {};
      if (search && search != "" && search != null) {
        query = {
          or: [{
            coin: {
              contains: search
            }
          },
          {
            coin_name: {
              contains: search
            }
          }
          ]
        }
      }
      query.deleted_at = null
      query.is_active = true

      var coinData = await Coins
        .find({
          where: query,
          select: ['id', 'coin_icon', 'coin_name', 'coin_code', 'coin', 'warm_wallet_address']
        })
        .sort('id ASC');

      for (var i = 0; i < coinData.length; i++) {
        if (coinData[i].coin_code != 'SUSU') {
          var warmWalletData = await sails
            .helpers
            .wallet
            .getWalletAddressBalance(coinData[i].warm_wallet_address, coinData[i].coin_code);
          coinData[i].balance = (warmWalletData.balance) ? (warmWalletData.balance) : (warmWalletData.balanceString);
          coinData[i].address = warmWalletData.receiveAddress.address;
        } else {
          var walletData = await Wallet.findOne({
            where: {
              deleted_at: null,
              is_active: true,
              "wallet_id": "warm_wallet"
            }
          });
          coinData[i].balance = (walletData && walletData != undefined) ? (walletData.balance) : (0.0)
          coinData[i].address = (walletData && walletData != undefined) ? (walletData.receive_address) : ""
        }
      }
      return res
        .status(200)
        .json({
          status: 200,
          data: coinData,
          message: sails.__("Warm wallet retrieve").message
        })
    } catch (error) {
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
  Get Warm Wallet Transaction list
  /**/
  getWarmWalletTransaction: async function (req, res) {
    try {
      var {
        coin_code,
        limit,
        prevId,
        searchLabel
      } = req.allParams();
      var coinData = await Coins.findOne({
        select: [
          'warm_wallet_address',
          'coin_code'
        ],
        where: {
          is_active: true,
          deleted_at: null,
          coin_code: coin_code
        }
      });

      var data = {
        prevId: prevId,
        limit: limit,
        searchLabel: searchLabel
      }

      if (coinData.coin_code != 'SUSU') {
        var warmWalletData = await sails
          .helpers
          .bitgo
          .getCoinTransfer(coinData.coin_code, coinData.warm_wallet_address, data);

        var data = warmWalletData.transfers
      } else {
        var warmWalletData = {}
      }

      return res
        .status(200)
        .json({
          "status": 200,
          "data": warmWalletData
        })
    } catch (error) {
      // console.log(error);
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
  Get Cold Wallet Information
  **/
  getColdWalletInfo: async function (req, res) {
    try {
      let {
        search
      } = req.allParams();
      var query = {};
      if (search && search != "" && search != null) {
        query = {
          or: [{
            coin: {
              contains: search
            }
          },
          {
            coin_name: {
              contains: search
            }
          }
          ]
        }
      }
      query.deleted_at = null
      query.is_active = true

      var coinData = await Coins
        .find({
          where: query,
          select: ['id', 'coin_icon', 'coin_name', 'coin_code', 'coin', 'custody_wallet_address']
        })
        .sort('id ASC');

      for (var i = 0; i < coinData.length; i++) {
        if (coinData[i].coin_code != "SUSU" && coinData[i].custody_wallet_address != null) {
          let wallet_data = await sails
            .helpers
            .wallet
            .getWalletAddressBalance(coinData[i].custody_wallet_address, coinData[i].coin_code);
          coinData[i].balance = (wallet_data.balance) ? (wallet_data.balance) : (wallet_data.balanceString);
          coinData[i].address = wallet_data.receiveAddress.address;
        } else {
          coinData[i].balance = 0.0
          coinData[i].address = '';
        }
      }
      return res
        .status(200)
        .json({
          status: 200,
          data: coinData,
          message: sails.__("Custodial wallet retrieve").message
        })
    } catch (error) {
      // console.log(error);
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
  Get Cold Wallet Transaction
  **/
  getColdWalletTransaction: async function (req, res) {
    try {
      var {
        coin_code,
        prevId,
        limit,
        searchLabel
      } = req.allParams();
      var coinData = await Coins.findOne({
        select: [
          'custody_wallet_address',
          'coin_code'
        ],
        where: {
          is_active: true,
          deleted_at: null,
          coin_code: coin_code
        }
      });

      var data = {
        limit: limit,
        prevId: prevId,
        searchLabel: searchLabel
      }

      if (coinData[i].coin_code != 'SUSU') {

        var warmWalletData = await sails
          .helpers
          .bitgo
          .getCoinTransfer(coinData.coin_code, coinData.custody_wallet_address, data);
      } else {
        var warmWalletData = {};
      }

      return res
        .status(200)
        .json({
          "status": 200,
          "data": warmWalletData
        })
    } catch (error) {
      // console.log(error);
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

  // Get Newtork Fee Value for each coin
  getNetworkFeeData: async function (req, res) {
    try {
      var data = req.body;
      console.log(data);
      if (data.coin != "SUSU") {
        var reposneData = await sails
          .helpers
          .wallet
          .getNetworkFee(data.coin, data.amount, data.address);
        console.log("reposneData",reposneData);
        reposneDataValue = 2 * (reposneData.fee);
        return res
          .status(200)
          .json({
            "status": 200,
            "message": sails.__("Fee retrieve Success").message,
            "data": parseFloat(reposneDataValue / 1e8).toFixed(8)
          })
      } else {
        return res
          .status(200)
          .json({
            "status": 200,
            "message": sails.__("Fee retrieve Success").message,
            "data": 0.01
          })
      }
    } catch (error) {
      if (error.name == "ImplementationError") {
        get_network_fees = await sails.helpers.feesCalculation(req.body.coin.toLowerCase(), (req.body.amount));
        return res
          .status(200)
          .json({
            "status": 200,
            "data": parseFloat(get_network_fees).toFixed(sails.config.local.TOTAL_PRECISION),
            error_at: error.stack
          })
      }
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong").message,
          error_at: error.stack
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
