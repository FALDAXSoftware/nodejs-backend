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
var WAValidator = require('wallet-address-validator');

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
      // if (!req.user.Admin) {

      // }

      // if (userData.account_tier != 4) {
      if (req.user.isAdmin) {
        user_id = 36;
        filter = ` wallets.user_id = ${user_id} AND wallets.is_admin = true `
      } else {
        user_id = req.user.id;

        var userData = await Users
          .findOne({
            where: {
              deleted_at: null,
              is_active: true,
              id: user_id
            }
          })
        filter = ` wallets.user_id = ${user_id}`

        if (userData.account_tier != 4) {
          //Checking whether user can trade in the area selected in the KYC
          var geo_fencing_data = await sails
            .helpers
            .userTradeChecking(user_id);
          console.log('geo_fencing_data', geo_fencing_data);
          if (geo_fencing_data.response != true) {
            return res.json({
              "status": 401,
              "err": geo_fencing_data.msg,
              error_at: geo_fencing_data
            });
          }
        }

      }
      // }

      let query = `SELECT
                    coins.coin_name, coins.coin_code, coins.created_at, coins.id, coins.coin_icon, coins.deleted_at,
                    coins.coin, wallets.balance, wallets.placed_balance, wallets.receive_address , currency_conversion.quote, coins.iserc,coins.is_active
                    FROM coins
                    INNER JOIN wallets ON coins.id = wallets.coin_id
                    LEFT JOIN currency_conversion ON coins.coin = currency_conversion.symbol
                    WHERE ${filter} AND ((length(wallets.receive_address) > 0) OR( coins.iserc = true AND length(wallets.receive_address) = 0)) AND coins.deleted_at IS NULL AND wallets.deleted_at IS NULL AND coins.is_fiat = 'false'
                    ORDER BY coins.coin_name ASC`

      let nonWalletQuery = `SELECT coins.coin_name, coins.coin_code, coins.coin_icon,coins.created_at, coins.id, coins.coin,coins.is_active,coins.iserc, currency_conversion.quote
                              FROM coins LEFT JOIN currency_conversion ON coins.coin = currency_conversion.symbol
                              WHERE coins.is_active = true AND coins.deleted_at IS NULL
                              AND coins.id NOT IN (SELECT coin_id FROM wallets WHERE wallets.deleted_at IS NULL AND user_id =${user_id}
                              AND ((receive_address IS NOT NULL AND length(receive_address) > 0) OR (coins.iserc = true))) AND coins.is_fiat = 'false'
                              ORDER BY coins.coin_name ASC`
      let balanceWalletData = await sails.sendNativeQuery(query, []);
      // var coinData = await Coins.findOne({
      //   where: {
      //     coin_code: 'SUSU'
      //   }
      // });
      // if (coinData.deleted_at == null) {
      //   var susucoinData = await sails.helpers.getUsdSusucoinValue();
      //   susucoinData = JSON.parse(susucoinData);
      //   susucoinData = susucoinData.data
      // }
      let deactivated_asset_lists = [];
      let activated_asset_lists = [];
      let eth_asset = false;
      for (var i = 0; i < balanceWalletData.rows.length; i++) {
        for (var k = 0; k < balanceWalletData.rows.length; k++) {
          if ((balanceWalletData.rows[k].coin_code == 'eth' || balanceWalletData.rows[k].coin_code == 'teth') && balanceWalletData.rows[k].is_active == true) {
            eth_asset = true;
            break;
          }
        }

        balanceWalletData.rows[i].balance = (balanceWalletData.rows[i].balance).toFixed(sails.config.local.TOTAL_PRECISION);
        balanceWalletData.rows[i].placed_balance = (balanceWalletData.rows[i].placed_balance).toFixed(sails.config.local.TOTAL_PRECISION);
        if (balanceWalletData.rows[i].quote != null) {
          if (balanceWalletData.rows[i].quote.EUR != undefined && balanceWalletData.rows[i].quote.INR != undefined) {
            balanceWalletData.rows[i].quote.EUR.price = (balanceWalletData.rows[i].quote.EUR.price).toFixed(sails.config.local.TOTAL_PRECISION)
            balanceWalletData.rows[i].quote.INR.price = (balanceWalletData.rows[i].quote.INR.price).toFixed(sails.config.local.TOTAL_PRECISION)
            balanceWalletData.rows[i].quote.USD.price = ((balanceWalletData.rows[i].quote.USD.price) > 0 ? (balanceWalletData.rows[i].quote.USD.price).toFixed(sails.config.local.TOTAL_PRECISION) : 0)
          } else {
            balanceWalletData.rows[i].quote = {
              EUR: {
                price: 0.0
              },
              INR: {
                price: 0.0
              },
              USD: {
                price: (balanceWalletData.rows[i].quote.USD.price)
              }
            }
          }

        } else {
          if (balanceWalletData.rows[i].coin_code == 'SUSU' && balanceWalletData.rows[i].deleted_at == null)
            // balanceWalletData.rows[i].quote = {
            //   EUR: {
            //     price: susucoinData.EUR,
            //   },
            //   INR: {
            //     price: susucoinData.INR,
            //   },
            //   USD: {
            //     price: susucoinData.USD,
            //   }

            // }
            balanceWalletData.rows[i].quote = {
              EUR: {
                price: (balanceWalletData.rows[i].quote.EUR.price),
              },
              INR: {
                price: (balanceWalletData.rows[i].quote.INR.price),
              },
              USD: {
                price: (balanceWalletData.rows[i].quote.USD.price),
              }
            }
        }

        if (balanceWalletData.rows[i].is_active == true) {
          activated_asset_lists.push(balanceWalletData.rows[i]);
        } else {
          deactivated_asset_lists.push(balanceWalletData.rows[i]);
        }
      }

      let nonBalanceWalletData = await sails.sendNativeQuery(nonWalletQuery, []);
      let all_erctoken_lists = [];
      let all_assets_lists = [];
      for (var i = 0; i < (nonBalanceWalletData.rows).length; i++) {
        if (nonBalanceWalletData.rows[i].quote != undefined) {
          if (nonBalanceWalletData.rows[i].quote.EUR != undefined && nonBalanceWalletData.rows[i].quote.INR != undefined && nonBalanceWalletData.rows[i].quote.USD != undefined) {
            nonBalanceWalletData.rows[i].quote.EUR.price = (nonBalanceWalletData.rows[i].quote.EUR.price).toFixed(sails.config.local.TOTAL_PRECISION)
            nonBalanceWalletData.rows[i].quote.INR.price = (nonBalanceWalletData.rows[i].quote.INR.price).toFixed(sails.config.local.TOTAL_PRECISION)
            nonBalanceWalletData.rows[i].quote.USD.price = ((nonBalanceWalletData.rows[i].quote != undefined && nonBalanceWalletData.rows[i].quote.USD.price) > 0 ? (nonBalanceWalletData.rows[i].quote.USD.price).toFixed(sails.config.local.TOTAL_PRECISION) : 0)
          } else {
            nonBalanceWalletData.rows[i].quote = {
              EUR: {
                price: 0.0
              },
              INR: {
                price: 0.0
              },
              USD: {
                price: (nonBalanceWalletData.rows[i].quote != undefined) ? (nonBalanceWalletData.rows[i].quote.USD.price) : (0.0)
              }
            }
          }
        }
        if (nonBalanceWalletData.rows[i].iserc == true) {
          if (eth_asset == true) {
            all_erctoken_lists.push(nonBalanceWalletData.rows[i]);
          }
        } else {
          all_assets_lists.push(nonBalanceWalletData.rows[i]);
        }
      }
      var all_balance_wallets_list = {};
      all_balance_wallets_list.activated_asset_lists = activated_asset_lists;
      all_balance_wallets_list.deactivated_asset_lists = deactivated_asset_lists;
      var all_non_wallets_list = {};
      all_non_wallets_list.all_assets_lists = all_assets_lists;
      all_non_wallets_list.all_erctoken_lists = all_erctoken_lists;
      return res.json({
        status: 200,
        message: sails.__("Balance retrieved success").message,
        // balanceData: balanceWalletData.rows,
        // nonBalanceData: nonBalanceWalletData.rows,
        balanceData: all_balance_wallets_list,
        nonBalanceData: all_non_wallets_list,
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

      var dateTimeDaily = moment(yesterday).local().format();
      var localTimeDaily = moment.utc(dateTimeDaily).toDate();
      localTimeDaily = moment(localTimeDaily).format()

      var monthlyData = moment()
        .startOf('month')
        .format();

      var dateTimeMonthly = moment(monthlyData).local().format();
      var localTimeMonthly = moment.utc(dateTimeMonthly).toDate();
      localTimeMonthly = moment(localTimeMonthly).format()
      var userData = await Users.findOne({
        deleted_at: null,
        id: user_id,
        is_active: true
      });

      if (userData.account_tier != 4) {
        //Checking whether user can trade in the area selected in the KYC
        var geo_fencing_data = await sails
          .helpers
          .userTradeChecking(user_id);
        if (geo_fencing_data.response != true) {
          return res.json({
            "status": 401,
            "err": geo_fencing_data.msg,
            error_at: geo_fencing_data
          });
        }
      }

      if (userData.is_user_updated == false || userData.is_user_updated == "false") {
        return res
          .status(500)
          .json({
            "status": 500,
            "err": sails.__("Please Complete You profile").message
          })
      }

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


      var coin = await Coins.findOne({
        deleted_at: null,
        is_active: true,
        coin_code: coin_code
      });

      if (coin.coin_code != "SUSU" && coin.coin_code != "txrp" && coin.coin_code != 'xrp' && coin.iserc == false) {
        if (sails.config.local.TESTNET == 1) {
          var valid = WAValidator.validate(destination_address, (coin.coin_name).toLowerCase(), 'testnet');
        } else {
          var valid = WAValidator.validate(destination_address, (coin.coin_name).toLowerCase());
        }

        if (!valid) {
          return res
            .status(500)
            .json({
              "status": 500,
              "err": sails.__("Enter Valid Address").message
            })
        }
      }

      var division = coin.coin_precision;

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

          // Limit Checking According to tier
          var now = moment().utc().format();
          var yesterday = moment()
            .startOf('day')
            .utc()
            .format();

          var previousMonth = moment()
            .startOf('month')
            .utc()
            .format();

          // Get User and tier information
          var tierSql = `SELECT users.account_tier, tiers.monthly_withdraw_limit, tiers.daily_withdraw_limit
                          FROM users
                          LEFT JOIN tiers
                          ON (users.account_tier) = tiers.tier_step
                          WHERE users.deleted_at IS NULL AND users.is_active = 'true'
                          AND users.id = ${user_id} AND tiers.deleted_at IS NULL;`
          var userTierSql = await sails.sendNativeQuery(tierSql);
          userTierSql = userTierSql.rows;

          if ((userTierSql[0].monthly_withdraw_limit == null) || userTierSql[0].daily_withdraw_limit == null) {
            return res
              .status(500)
              .json({
                "status": 500,
                "err": sails.__("User not able to do transactions").message
              })
          }

          var limitSql = `SELECT (currency_conversion.quote->'USD'->'price') as usd_price
                            FROM coins
                            LEFT JOIN currency_conversion
                            ON coins.id = currency_conversion.coin_id
                            WHERE coins.coin_code = '${coin_code}' AND coins.is_active = 'true'
                            AND coins.deleted_at IS NULL AND currency_conversion.deleted_at IS NULL`
          var limitCalculation = await sails.sendNativeQuery(limitSql);
          limitCalculation = limitCalculation.rows;

          // Daily Limit Checking
          var getUserDailyHistory = `SELECT *
                                      FROM (
                                        SELECT SUM((withdraw_request.amount + withdraw_request.network_fee)*Cast(withdraw_request.fiat_values->>'asset_1_usd' as double precision)) as requested_amount
                                          FROM coins
                                          LEFT JOIN withdraw_request
                                          ON withdraw_request.coin_id = coins.id
                                          WHERE coins.is_active = 'true' AND coins.deleted_at IS NULL
                                          AND withdraw_request.deleted_at IS NULL AND withdraw_request.transaction_type = 'send'
                                          AND withdraw_request.user_id = ${user_id}
                                          AND withdraw_request.created_at >= '${yesterday}' AND withdraw_request.created_at <= '${now}'
                                      ) as t
                                      CROSS JOIN (
                                        SELECT SUM((wallet_history.amount + wallet_history.actual_network_fees)*Cast(wallet_history.fiat_values->>'asset_1_usd' as double precision)) as history_amount
                                          FROM coins
                                          LEFT JOIN wallet_history
                                          ON wallet_history.coin_id = coins.id
                                          WHERE coins.is_active = 'true' AND coins.deleted_at IS NULL
                                          AND wallet_history.deleted_at IS NULL AND wallet_history.transaction_type = 'send'
                                          AND wallet_history.user_id = ${user_id}
                                          AND wallet_history.created_at >= '${yesterday}' AND wallet_history.created_at <= '${now}'
                                      ) as m`
          var userDailyHistory = await sails.sendNativeQuery(getUserDailyHistory)
          userDailyHistory = userDailyHistory.rows

          // Monthly Limit Checking
          var getUserMonthlyHistory = `SELECT *
                                          FROM (
                                            SELECT SUM((withdraw_request.amount + withdraw_request.network_fee)*Cast(withdraw_request.fiat_values->>'asset_1_usd' as double precision)) as requested_amount
                                              FROM coins
                                              LEFT JOIN withdraw_request
                                              ON withdraw_request.coin_id = coins.id
                                              WHERE coins.is_active = 'true' AND coins.deleted_at IS NULL
                                              AND withdraw_request.deleted_at IS NULL AND withdraw_request.transaction_type = 'send'
                                              AND withdraw_request.user_id = ${user_id}
                                              AND withdraw_request.created_at >= '${previousMonth}' AND withdraw_request.created_at <= '${now}'
                                          ) as t
                                          CROSS JOIN (
                                            SELECT SUM((wallet_history.amount + wallet_history.actual_network_fees)*Cast(wallet_history.fiat_values->>'asset_1_usd' as double precision)) as history_amount
                                              FROM coins
                                              LEFT JOIN wallet_history
                                              ON wallet_history.coin_id = coins.id
                                              WHERE coins.is_active = 'true' AND coins.deleted_at IS NULL
                                              AND wallet_history.deleted_at IS NULL AND wallet_history.transaction_type = 'send'
                                              AND wallet_history.user_id = ${user_id}
                                              AND wallet_history.created_at >= '${previousMonth}' AND wallet_history.created_at <= '${now}'
                                          ) as m`
          var userMonthlyHistory = await sails.sendNativeQuery(getUserMonthlyHistory);
          userMonthlyHistory = userMonthlyHistory.rows;

          var dailyTotalVolume = 0.0;
          var monthlyTotalVolume = 0.0;
          userDailyHistory[0].request_amount = (userDailyHistory[0].request_amount == null) ? (0.0) : (userDailyHistory[0].request_amount);
          userDailyHistory[0].history_amount = (userDailyHistory[0].history_amount == null) ? (0.0) : (userDailyHistory[0].history_amount);
          userMonthlyHistory[0].history_amount = (userMonthlyHistory[0].history_amount == null) ? (0.0) : (userMonthlyHistory[0].history_amount);
          userMonthlyHistory[0].request_amount = (userMonthlyHistory[0].request_amount == null) ? (0.0) : (userMonthlyHistory[0].request_amount)
          dailyTotalVolume = parseFloat(userDailyHistory[0].history_amount) + parseFloat(userDailyHistory[0].request_amount);
          monthlyTotalVolume = parseFloat(userMonthlyHistory[0].history_amount) + parseFloat(userMonthlyHistory[0].request_amount);
          dailyTotalVolume = (Number.isNaN(dailyTotalVolume)) ? (0.0) : (dailyTotalVolume);
          monthlyTotalVolume = (Number.isNaN(monthlyTotalVolume)) ? (0.0) : (monthlyTotalVolume)
          amount = parseFloat(amount);
          var dailyFlag;
          var monthlyFlag;

          if (userTierSql[0].daily_withdraw_limit == "Unlimited") {
            dailyFlag = true;
          }

          if (userTierSql[0].monthly_withdraw_limit == "Unlimited") {
            monthlyFlag = true;
          }

          if (monthlyTotalVolume <= userTierSql[0].monthly_withdraw_limit || monthlyFlag == true) {

            if ((((limitCalculation[0].usd_price * amount) + monthlyTotalVolume) <= userTierSql[0].monthly_withdraw_limit) || monthlyFlag == true) {

              if ((dailyTotalVolume <= userTierSql[0].daily_withdraw_limit) || dailyFlag == true) {

                if ((((limitCalculation[0].usd_price * amount) + dailyTotalVolume) <= userTierSql[0].daily_withdraw_limit) || dailyFlag == true) {

                  let wallet = await Wallet.findOne({
                    deleted_at: null,
                    coin_id: coin.id,
                    is_active: true,
                    user_id: user_id
                  });

                  //Checking if wallet is found or not
                  if (wallet) {
                    //If placed balance is greater than the amount to be send
                    if (parseFloat((wallet.placed_balance).toFixed(sails.config.local.TOTAL_PRECISION)) >= (parseFloat(total_fees)).toFixed(sails.config.local.TOTAL_PRECISION)) {

                      //If coin is of bitgo type
                      if (coin.type == 1) {

                        let warmWalletData = await sails
                          .helpers
                          .wallet
                          .getWalletAddressBalance(coin.hot_receive_wallet_address, coin_code);

                        console.log("req.body", req.body)
                        // If after all condition user has accepted to wait for 2 days then request need
                        // to be added in the withdraw request table
                        if (req.body.confirm_for_wait == undefined) {
                          console.log("warmWalletData", warmWalletData);
                          //Check for warm wallet minimum thresold
                          console.log("Warmwalletbalance before", warmWalletData.balance);
                          // total_fees = 1;
                          console.log("coin.min_thresold", coin.min_thresold)
                          console.log("warmWalletData.balance >= coin.min_thresold", warmWalletData.balance >= coin.min_thresold)
                          console.log("(warmWalletData.balance - total_fees) >= 0", (warmWalletData.balance - total_fees) >= 0)
                          console.log("total_fees", total_fees);
                          console.log("warmWalletData.balance - total_fees", warmWalletData.balance - total_fees)
                          console.log("(warmWalletData.balance - total_fees) >= coin.min_thresold", (warmWalletData.balance - total_fees) >= coin.min_thresold)
                          console.log("(warmWalletData.balance) > (total_fees * 1e8)", (warmWalletData.balance) > (total_fees * division))
                          if (warmWalletData.balance >= coin.min_thresold && (warmWalletData.balance - total_fees) >= 0 && (warmWalletData.balance - total_fees) >= coin.min_thresold && (warmWalletData.balance) > (total_fees * division)) {
                            // Send to hot warm wallet and make entry in diffrent table for both warm to
                            // receive and receive to destination
                            var valueFee;
                            if (coin.coin_code == "teth" || coin.coin_code == "eth" || coin.iserc == true) {
                              var amountValue = parseFloat(amount * division).toFixed(8);
                              var estimatePass = parseFloat(networkFees / 2).toFixed(8)
                              valueFee = parseFloat(2 * estimatePass).toFixed(8)
                            } else {
                              var estimatePass = parseFloat(networkFees / 2).toFixed(8)
                              valueFee = parseFloat(2 * estimatePass).toFixed(8)
                              var sendAmount = parseFloat(parseFloat(amount)).toFixed(8)
                              var amountValue = parseFloat(sendAmount * division).toFixed(8)
                            }
                            // If XRP and internal address
                            // Check internal address or not
                            var getDestinationValue = await Wallet.findOne({
                              where: {
                                deleted_at: null,
                                coin_id: coin.id,
                                receive_address: destination_address,
                                is_active: true
                              }
                            });

                            var fiatObject = await sails.helpers.getFiatValues(coin.coin);

                            if ((coin.coin_code == "xrp" || coin.coin_code == 'txrp') && getDestinationValue && getDestinationValue != undefined) {
                              var totalFeeSub = 0;
                              totalFeeSub = parseFloat(parseFloat(totalFeeSub) + parseFloat(networkFees / 2));
                              totalFeeSub = parseFloat(totalFeeSub) + parseFloat(amount) + parseFloat(faldaxFees)
                              var walletHistory = {
                                coin_id: wallet.coin_id,
                                source_address: wallet.receive_address,
                                destination_address: destination_address,
                                user_id: user_id,
                                amount: parseFloat(amount) + parseFloat(faldaxFees),
                                transaction_type: 'send',
                                transaction_id: '',
                                is_executed: false,
                                is_admin: false,
                                faldax_fee: faldaxFees,
                                actual_network_fees: parseFloat(networkFees / 2).toFixed(8),
                                estimated_network_fees: parseFloat(networkFees).toFixed(8),
                                is_done: true,
                                actual_amount: amount,
                                fiat_values: fiatObject
                              }
                              await WalletHistory.create({
                                ...walletHistory
                              });

                              var user_wallet_placed_balance = wallet.placed_balance
                              var user_wallet_balance = wallet.balance
                              var receiver_wallet_balance = getDestinationValue.balance;

                              var userBalanceUpdate = parseFloat(user_wallet_balance) - (parseFloat(amount) + parseFloat(faldaxFees) + parseFloat(networkFees / 2));
                              var userPlacedBalanceUpdate = parseFloat(user_wallet_placed_balance) - (parseFloat(amount) + parseFloat(faldaxFees) + parseFloat(networkFees / 2));
                              var receiverBalanceUpdate = parseFloat(getDestinationValue.balance) + parseFloat(amount);
                              var receiverPlacedBalanceUpdate = parseFloat(getDestinationValue.placed_balance) + parseFloat(amount);


                              await Wallet
                                .update({
                                  id: wallet.id
                                })
                                .set({
                                  balance: userBalanceUpdate,
                                  placed_balance: userPlacedBalanceUpdate
                                });

                              await Wallet
                                .update({
                                  id: getDestinationValue.id
                                })
                                .set({
                                  balance: receiverBalanceUpdate,
                                  placed_balance: receiverPlacedBalanceUpdate
                                });

                              var walletHistoryReceiver = {
                                coin_id: wallet.coin_id,
                                source_address: wallet.receive_address,
                                destination_address: destination_address,
                                user_id: getDestinationValue.user_id,
                                amount: amount,
                                transaction_type: 'receive',
                                transaction_id: '',
                                is_executed: false,
                                is_admin: false,
                                faldax_fee: 0.0,
                                actual_network_fees: 0.0,
                                estimated_network_fees: parseFloat(0.0).toFixed(8),
                                is_done: true,
                                actual_amount: amount,
                                fiat_values: fiatObject
                              }

                              await WalletHistory.create({
                                ...walletHistoryReceiver
                              });

                              var addObject = {
                                coin_id: coin.id,
                                source_address: wallet.receive_address,
                                destination_address: destination_address,
                                user_id: user_id,
                                amount: totalFeeSub,
                                transaction_type: 'send',
                                transaction_id: '',
                                is_executed: true,
                                is_admin: false,
                                faldax_fee: faldaxFees,
                                actual_network_fees: parseFloat(networkFees / 2).toFixed(8),
                                estimated_network_fees: parseFloat(networkFees).toFixed(8),
                                is_done: true,
                                actual_amount: amount,
                                sender_user_balance_before: user_wallet_balance,
                                transaction_from: sails.config.local.SEND_TO_DESTINATION
                              }

                              await TransactionTable.create({
                                ...addObject
                              });

                              var addObject = {
                                coin_id: coin.id,
                                source_address: wallet.receive_address,
                                destination_address: destination_address,
                                user_id: getDestinationValue.user_id,
                                amount: parseFloat(amount),
                                transaction_type: 'receive',
                                transaction_id: '',
                                is_executed: true,
                                is_admin: false,
                                faldax_fee: 0.0,
                                actual_network_fees: 0.0,
                                estimated_network_fees: parseFloat(0.0).toFixed(8),
                                is_done: true,
                                actual_amount: amount,
                                sender_user_balance_before: receiver_wallet_balance,
                                transaction_from: sails.config.local.RECEIVE_TO_DESTINATION
                              }

                              await TransactionTable.create({
                                ...addObject
                              });
                              // Update Admin Faldax Wallet
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
                                var totalAdminFees = 0;

                                var updatedBalance = parseFloat(adminWalletDetails.balance) + parseFloat(faldaxFees) + parseFloat(networkFees / 2);
                                var updatedPlacedBalance = parseFloat(adminWalletDetails.balance) + parseFloat(faldaxFees) + parseFloat(networkFees / 2);
                                totalAdminFees = parseFloat(totalAdminFees) + parseFloat(faldaxFees) + parseFloat(networkFees / 2)
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
                                let walletHistoryValue = {
                                  coin_id: wallet.coin_id,
                                  source_address: wallet.receive_address,
                                  destination_address: adminWalletDetails.receive_address,
                                  user_id: 36,
                                  is_admin: true,
                                  amount: (totalAdminFees),
                                  transaction_type: 'send',
                                  transaction_id: '',
                                  is_executed: false,
                                  faldax_fee: faldaxFees,
                                  actual_network_fees: 0.0,
                                  estimated_network_fees: 0.0,
                                  is_done: false,
                                  actual_amount: amount,
                                  fiat_values: fiatObject
                                }

                                await WalletHistory.create({
                                  ...walletHistoryValue
                                });
                              }
                            } else { //
                              // SEND to Warm wallet to Hot Send
                              let transaction = await sails.helpers.bitgo.send(coin.coin_code, coin.hot_receive_wallet_address, destination_address, (amountValue).toString());

                              var total_payout = parseFloat(amount) + parseFloat(faldaxFees)
                              var singleNetworkFee = parseFloat(parseFloat(networkFees) / 2).toFixed(8);

                              if (coin.coin_code == "teth" || coin.coin_code == "eth") {
                                network_fees = (networkFees * sails.config.local.DIVIDE_NINE)
                                var network_feesValue = parseFloat(network_fees / (sails.config.local.DIVIDE_NINE))
                              } else {
                                var network_fees = (transaction.transfer.feeString);
                                var network_feesValue = parseFloat(network_fees / (division))
                              }

                              var totalFeeSub = 0;
                              totalFeeSub = parseFloat(parseFloat(totalFeeSub) + parseFloat(network_feesValue)).toFixed(8)
                              totalFeeSub = parseFloat(totalFeeSub) + parseFloat(amount) + parseFloat(faldaxFees)

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
                                var totalAdminFees = 0;

                                var updatedBalance = parseFloat(adminWalletDetails.balance) + parseFloat(faldaxFees);
                                var updatedPlacedBalance = parseFloat(adminWalletDetails.balance) + parseFloat(faldaxFees);
                                totalAdminFees = parseFloat(totalAdminFees) + parseFloat(faldaxFees)
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
                                let walletHistoryValue = {
                                  coin_id: wallet.coin_id,
                                  source_address: wallet.receive_address,
                                  destination_address: adminWalletDetails.receive_address,
                                  user_id: 36,
                                  is_admin: true,
                                  amount: (totalAdminFees),
                                  transaction_type: 'send',
                                  transaction_id: transaction.txid,
                                  is_executed: false,
                                  faldax_fee: faldaxFees,
                                  actual_network_fees: 0.0,
                                  estimated_network_fees: 0.0,
                                  is_done: false,
                                  actual_amount: amount,
                                  fiat_values: fiatObject
                                }

                                await WalletHistory.create({
                                  ...walletHistoryValue
                                });
                              }
                              //Here remainning ebtry as well as address change
                              let walletHistory = {
                                coin_id: wallet.coin_id,
                                source_address: wallet.receive_address,
                                destination_address: destination_address,
                                user_id: user_id,
                                amount: (total_payout),
                                transaction_type: 'send',
                                transaction_id: transaction.txid,
                                is_executed: false,
                                is_admin: false,
                                faldax_fee: (parseFloat(faldaxFees)).toFixed(8),
                                actual_network_fees: network_feesValue,
                                estimated_network_fees: parseFloat(networkFees).toFixed(8),
                                is_done: false,
                                actual_amount: amount,
                                fiat_values: fiatObject
                              }

                              // Make changes in code for receive webhook and then send to receive address
                              // Entry in wallet history
                              await WalletHistory.create({
                                ...walletHistory
                              });

                              var user_wallet_balance = wallet.balance;
                              // update wallet balance
                              var data = await Wallet
                                .update({
                                  id: wallet.id
                                })
                                .set({
                                  balance: (wallet.balance - totalFeeSub).toFixed(8),
                                  placed_balance: (wallet.placed_balance - totalFeeSub).toFixed(8)
                                });

                              let addObject = {
                                coin_id: coin.id,
                                source_address: wallet.receive_address,
                                destination_address: destination_address,
                                user_id: user_id,
                                amount: parseFloat(totalFeeSub).toFixed(8),
                                transaction_type: 'send',
                                is_executed: true,
                                transaction_id: transaction.txid,
                                faldax_fee: (parseFloat(faldaxFees)).toFixed(8),
                                actual_network_fees: network_feesValue,
                                estimated_network_fees: parseFloat(valueFee).toFixed(8),
                                is_done: false,
                                actual_amount: amount,
                                sender_user_balance_before: user_wallet_balance,
                                warm_wallet_balance_before: parseFloat(warmWalletData.balance / division).toFixed(sails.config.local.TOTAL_PRECISION),
                                transaction_from: sails.config.local.SEND_TO_DESTINATION
                              }

                              await TransactionTable.create({
                                ...addObject
                              });

                              var walletHistoryDataValue = await WalletHistory.findOne({
                                transaction_id: transaction.txid,
                                deleted_at: null,
                                coin_id: wallet.coin_id,
                                user_id: user_id,
                              })
                            }
                            // Send Notification
                            var userNotification = await UserNotification.findOne({
                              user_id: userData.id,
                              deleted_at: null,
                              slug: 'withdraw'
                            })

                            userData.coinName = coin.coin_code;
                            userData.amountReceived = parseFloat(totalFeeSub).toFixed(8);
                            if (userNotification != undefined) {
                              if (userNotification.email == true || userNotification.email == "true") {
                                if (userData.email != undefined)
                                  await sails.helpers.notification.send.email("withdraw", userData)
                              }
                              // if (userNotification.text == true || userNotification.text == "true") {
                              //   if (userData.phone_number != undefined && userData.phone_number != null && userData.phone_number != '')
                              //     await sails.helpers.notification.send.text("withdraw", userData)
                              // }
                            }
                            return res.json({
                              status: 200,
                              message: parseFloat(totalFeeSub).toFixed(8) + " " + (coin.coin_code).toUpperCase() + " " + sails.__("Token send success").message
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
                            var fiatObject = await sails.helpers.getFiatValues(coin.coin);
                            var adminDataFees = await AdminSetting.findOne({
                              where: {
                                deleted_at: null,
                                slug: "default_send_coin_fee"
                              }
                            });
                            //Insert request in withdraw request
                            var requestObject = {
                              source_address: wallet.receive_address,
                              destination_address: destination_address,
                              user_id: user_id,
                              amount: (total_fees),
                              transaction_type: 'send',
                              coin_id: coin.id,
                              is_executed: false,
                              fees: adminDataFees.value,
                              faldax_fee: (parseFloat(faldaxFees)).toFixed(8),
                              network_fee: parseFloat(networkFees).toFixed(8),
                              actual_amount: parseFloat(amount).toFixed(8),
                              fiat_values: fiatObject
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
                      } else if (coin_code == "SUSU") {
                        var value = {
                          "user_id": parseInt(user_id),
                          "amount": parseFloat(amount),
                          "destination_address": destination_address,
                          "faldax_fee": faldaxFees,
                          "network_fee": networkFees
                        }
                        var responseValue = new Promise(async (resolve, reject) => {
                          request({
                            url: sails.config.local.SUSUCOIN_URL + "send-susu-coin-address",
                            method: "POST",
                            headers: {

                              'x-token': 'faldax-susucoin-node',
                              'Content-Type': 'application/json'
                            },
                            body: value,
                            json: true
                          }, function (err, httpResponse, body) {
                            if (err) {
                              reject(err);
                            }
                            if (body.error) {
                              resolve(body);
                            }
                            resolve(body);
                            // return body;
                          });
                        })

                        // var value = Promise.resolve(responseValue)
                        var value = await responseValue;

                        return res
                          .status(200)
                          .json({
                            "status": 200,
                            "message": value.data + " " + coin.coin_code + " " + sails.__("Token send success").message
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
                  var data = {
                    "daily_limit_left": (Number.isNaN(dailyTotalVolume)) ? (userTierSql[0].daily_withdraw_limit) : (parseFloat(userTierSql[0].daily_withdraw_limit - dailyTotalVolume)),
                    "monthly_limit_left": (Number.isNaN(monthlyTotalVolume)) ? (userTierSql[0].monthly_withdraw_limit) : (parseFloat(userTierSql[0].monthly_withdraw_limit - (monthlyTotalVolume))),
                    "daily_limit_actual": userTierSql[0].daily_withdraw_limit,
                    "monthly_limit_actual": userTierSql[0].monthly_withdraw_limit,
                    "current_daily_limit": limitCalculation[0].usd_price * amount
                  }
                  return res
                    .status(201)
                    .json({
                      "status": 201,
                      "message": sails.__("Daily Limit Exceeded Using Amount").message,
                      "data": data
                    })
                }
              } else {

                var data = {
                  "daily_limit_actual": userTierSql[0].daily_withdraw_limit,
                  "monthly_limit_actual": userTierSql[0].monthly_withdraw_limit,
                }
                return res
                  .status(201)
                  .json({
                    "status": 201,
                    "message": sails.__("User Tier Daily Limit Exceeded").message + userTierSql[0].daily_withdraw_limit,
                    "data": data
                  })
              }
            } else {
              var data = {
                "daily_limit_left": (Number.isNaN(dailyTotalVolume)) ? (userTierSql[0].daily_withdraw_limit) : (parseFloat(userTierSql[0].daily_withdraw_limit - (dailyTotalVolume))),
                "monthly_limit_left": (Number.isNaN(monthlyTotalVolume)) ? (userTierSql[0].monthly_withdraw_limit) : (parseFloat(userTierSql[0].monthly_withdraw_limit - (monthlyTotalVolume))),
                "daily_limit_actual": userTierSql[0].daily_withdraw_limit,
                "monthly_limit_actual": userTierSql[0].monthly_withdraw_limit,
                "current_monthly_limit": limitCalculation[0].usd_price * amount,
                // "current_limit_left_montly_amount"
              }
              return res
                .status(201)
                .json({
                  "status": 201,
                  "message": sails.__("Monthly Limit Exceeded Using Amount").message,
                  "data": data
                })
              // var data = {
            }
          } else {
            var data = {
              "daily_limit_actual": userTierSql[0].daily_withdraw_limit,
              "monthly_limit_actual": userTierSql[0].monthly_withdraw_limit,
            }
            // }
            return res
              .status(201)
              .json({
                "status": 201,
                "message": sails.__("User Tier Monthly Limit Exceeded").message + userTierSql[0].monthly_withdraw_limit,
                "data": data
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
            message: sails.__('withdraw request confirm').message,
            error_at: error.stack
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
      var userData = await Users.findOne({
        is_active: true,
        deleted_at: null,
        id: user_id
      })

      if (userData.is_user_updated == false || userData.is_user_updated == "false") {
        return res
          .status(500)
          .json({
            "status": 500,
            "err": sails.__("Please Complete You profile").message
          })
      }

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
        coinReceive
      } = req.body;
      if (req.user.isAdmin == true || req.user.isAdmin == "true") {
        req.user.id = 36
      } else {
        var user_id = req.user.id;
        //Checking whether user can trade in the area selected in the KYC
        var userData = await Users.findOne({
          is_active: true,
          deleted_at: null,
          id: req.user.id
        })

        if (userData.account_tier != 4) {
          var geo_fencing_data = await sails
            .helpers
            .userTradeChecking(user_id);
          if (geo_fencing_data.response != true) {
            return res.json({
              "status": 401,
              "err": geo_fencing_data.msg,
              error_at: geo_fencing_data
            });
          }
        }
        if (userData.is_user_updated == false || userData.is_user_updated == "false") {
          return res
            .status(500)
            .json({
              "status": 500,
              "err": sails.__("Please Complete You profile").message
            })
        }
      }
      let coinData = await Coins.findOne({
        select: [
          "id", "coin_code", "coin_icon", "coin_name", "coin", "min_limit", "max_limit", "iserc", "is_active"
        ],
        where: {
          coin_code: coinReceive,
          deleted_at: null
        }
      });
      if (coinData != undefined) {
        // Explicitly call toJson of Model
        coinData = JSON.parse(JSON.stringify(coinData));
        var walletTransData
        if (req.user.isAdmin && req.user.isAdmin != undefined) {
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

          var coinDataValue = await Coins.findOne({
            where: {
              deleted_at: null,
              // is_active: true,
              id: coinData.id
            }
          })
          for (var j = 0; j < walletTransData.length; j++) {
            if (walletTransData[j].transaction_type == 'send') {
              walletTransData[j].faldax_fee = parseFloat(walletTransData[j].faldax_fee).toFixed(10);
              walletTransData[j].network_fees = parseFloat(walletTransData[j].actual_network_fees)
              walletTransData[j].amount = (coinDataValue.coin_code != "SUSU") ? (parseFloat(parseFloat(walletTransData[j].amount) - parseFloat(walletTransData[j].faldax_fee))) : (parseFloat(walletTransData[j].actual_amount).toFixed(10));
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


        // if (coinReceive != "SUSU") {
        var currencyConversionData = await CurrencyConversion.findOne({
          symbol: coinData.coin,
          deleted_at: null
        })

        if (currencyConversionData) {
          // if (currencyConversionData.quote.USD) {
          //   var get_price = await sails.helpers.fixapi.getPrice(currencyConversionData.symbol, 'Buy');
          //   if (get_price[0] != undefined) {
          //     currencyConversionData.quote.USD.price = get_price[0].ask_price
          //   } else {
          currencyConversionData.quote.USD.price = currencyConversionData.quote.USD.price
          // }
        }
        // }
        // } else {
        //   var value = await sails.helpers.getUsdSusucoinValue();
        //   value = JSON.parse(value);
        //   value = value.data
        //   var currencyConversionData = {
        //     quote: {
        //       USD: {
        //         price: value.USD
        //       },
        //       EUR: {
        //         price: value.EUR
        //       },
        //       INR: {
        //         price: value.INR
        //       }
        //     }
        //   }
        // }

        var object
        var walletUserData = {};
        if (req.user.isAdmin && req.user.isAdmin != undefined) {
          walletUserData = await Wallet.findOne({
            user_id: (36),
            coin_id: coinData.id,
            deleted_at: null,
            is_active: true,
            is_admin: true
          });
        } else {
          // if( coinData.iserc == true ){
          //   coinData.id = 2;
          // }
          walletUserData = await Wallet.findOne({
            user_id: (req.user.id),
            coin_id: coinData.id,
            deleted_at: null,
            is_active: true
          });
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
        walletUserData['iserc'] = coinData.iserc
        let eth_for_erc_status = false;
        let eth_for_erc_address = false;
        if (coinData.iserc == true) {
          let eth_data = await Coins.findOne({
            select: [
              "iserc", "is_active"
            ],
            where: {
              coin_code: {
                in: ["teth", "eth"]
              },
              deleted_at: null
            }
          });
          if (eth_data != undefined) {
            if (eth_data.is_active == true) {
              let wallet_eth_data = await Wallet.findOne({
                user_id: (req.user.id),
                coin_id: eth_data.id,
                deleted_at: null,
                is_active: true
              });
              if (wallet_eth_data) {
                eth_for_erc_status = true;
                if (wallet_eth_data.send_address != null && wallet_eth_data.receive_address != null) {
                  eth_for_erc_address = true;
                }
              }

            }

          }
        }

        if (walletTransData) {
          return res.json({
            status: 200,
            message: sails.__("wallet data retrieved success").message,
            walletTransData,
            // walletTransCount,
            walletUserData,
            'default_send_Coin_fee': parseFloat(coinFee.value),
            currencyConversionData,
            withdrawRequestData,
            is_active: coinData.is_active,
            eth_for_erc_status: eth_for_erc_status,
            eth_for_erc_address: eth_for_erc_address
          });
        } else {
          return res.json({
            status: 200,
            message: sails.__("No record found").message
          })
        }
      } else {
        return res.json({
          status: 500,
          err: sails.__("No record found").message,
          error_at: sails.__("No record found").message
        })
      }

    } catch (error) {
      console.log(error);
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
      var userData = await Users.findOne({
        is_active: true,
        deleted_at: null,
        id: user_id
      })

      if (userData.account_tier != 4) {
        //Checking whether user can trade in the area selected in the KYC
        var geo_fencing_data = await sails
          .helpers
          .userTradeChecking(user_id);
        if (geo_fencing_data.response != true) {
          return res.json({
            "status": 401,
            "err": geo_fencing_data.msg,
            error_at: geo_fencing_data
          });
        }
      }
      if (userData.is_user_updated == false || userData.is_user_updated == "false") {
        return res
          .status(500)
          .json({
            "status": 500,
            "err": sails.__("Please Complete You profile").message
          })
      }
      var coinData = await Coins.findOne({
        where: {
          deleted_at: null,
          coin: coin_code
        }
      })
      if (coinData.is_active == false) {
        return res
          .status(500)
          .json({
            "status": 500,
            "message": sails.__("Coin Inactive").message
          })
      }
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
          message: (coin_code != "SUSU") ? (sails.__("Address Create Success").message) : (walletDataCreate.message),
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
      console.log(error);
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
   * API for creating receive Address for User from CMS
   * Renders page for admin wants to create user address
   *
   * @param <user_id, coin_code>
   *
   * @return <Success message for successfully address created or error>
   */

  createAdminReceiveAddressCoin: async function (req, res) {
    try {
      var {
        coin_code,
        user_id
      } = req.allParams();
      var coinData = await Coins.findOne({
        where: {
          deleted_at: null,
          coin: coin_code
        }
      })
      if (coinData.is_active == false) {
        return res
          .status(500)
          .json({
            "status": 500,
            "message": sails.__("Coin Inactive").message
          })
      }
      var userData = [];
      userData = await Users.findOne({
        deleted_at: null,
        is_active: true,
        id: user_id
      });

      if (userData.account_tier == 0) {
        return res
          .status(500)
          .json({
            "status": 500,
            "err": sails.__("User Wallet create unsuccess").message
          })
      }

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
        let user_language = (userData.default_language ? userData.default_language : 'en');
        let language_content = template.all_content[user_language].content;
        let language_subject = template.all_content[user_language].subject;
        let emailContent = await sails
          .helpers
          .utilities
          .formatEmail(language_content, {
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
            subject: language_subject
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
   * API for creating receive Address for Admin from CMS
   * Renders page for admin wants to create admin address
   *
   * @param <user_id, coin_code>
   *
   * @return <Success message for successfully address created or error>
   */

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
      var coinData = await Coins.findOne({
        where: {
          deleted_at: null,
          coin: coin_code
        }
      })
      if (coinData.is_active == false) {
        return res
          .status(500)
          .json({
            "status": 500,
            "message": sails.__("Coin Inactive").message
          })
      }
      var userData = [];
      userData = await Admin.findOne({
        deleted_at: null,
        is_active: true,
        id: 36
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
        let user_language = 'en';
        let language_content = template.all_content[user_language].content;
        let language_subject = template.all_content[user_language].subject;
        let emailContent = await sails
          .helpers
          .utilities
          .formatEmail(language_content, {
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
            subject: language_subject
          }, function (err) {
            if (!err) {

            }
          })

        return res.json({
          status: 200,
          message: sails.__("Address Create Success").message,
          data: walletDataCreate
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
   * API for sending coin from Admin Address
   * Renders page for admin when admin wants to send coin
   *
   * @param <amount, destination_address, coin_code, networkFees, total_fees>
   *
   * @return <Success message for successfully send coin or error>
   */

  sendCoinAdmin: async function (req, res) {
    try {
      let {
        amount,
        destination_address,
        coin_code,
        networkFees,
        total_fees
      } = req.allParams();
      let user_id = req.user.id;
      user_id = 36;
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
      if (coin.coin_code != "SUSU" && coin.coin_code != "txrp" && coin.coin_code != 'xrp' && coin.iserc != true) {
        if (sails.config.local.TESTNET == 1) {
          var valid = WAValidator.validate(destination_address, (coin.coin_name).toLowerCase(), 'testnet');
        } else {
          var valid = WAValidator.validate(destination_address, (coin.coin_name).toLowerCase());
        }

        if (!valid) {
          return res
            .status(500)
            .json({
              "status": 500,
              "err": sails.__("Enter Valid Address").message
            })
        }
      }
      var division = coin.coin_precision;
      // if (coin_code == 'xrp' || coin_code == 'txrp') {
      //   division = sails.config.local.DIVIDE_SIX;
      // } else if (coin_code == 'eth' || coin_code == 'teth' || coin.iserc == true) {
      //   division = sails.config.local.DIVIDE_EIGHTEEN;
      // }
      // if (coin.type == 1) {

      //   let warmWalletData = await sails
      //     .helpers
      //     .wallet
      //     .getWalletAddressBalance(coin.warm_wallet_address, coin_code);
      //   let sendWalletData = await sails
      //     .helpers
      //     .wallet
      //     .getWalletAddressBalance(coin.hot_send_wallet_address, coin_code);
      // }

      //If coin is found
      if (coin) {

        let wallet = await Wallet.findOne({
          deleted_at: null,
          coin_id: coin.id,
          is_active: true,
          user_id: 36,
          is_admin: true
        });

        //Checking if wallet is found or not
        if (wallet) {
          //If placed balance is greater than the amount to be send
          if (parseFloat((wallet.placed_balance).toFixed(sails.config.local.TOTAL_PRECISION)) >= (parseFloat(total_fees)).toFixed(sails.config.local.TOTAL_PRECISION)) {

            //If coin is of bitgo type
            if (coin.type == 1) {

              let warmWalletData = await sails
                .helpers
                .wallet
                .getWalletAddressBalance(coin.hot_receive_wallet_address, coin_code);

              if (warmWalletData.balance >= coin.min_thresold && (warmWalletData.balance - total_fees) >= 0 && (warmWalletData.balance - total_fees) >= coin.min_thresold && (warmWalletData.balance) > (total_fees * division)) {
                // Send to hot warm wallet and make entry in diffrent table for both warm to
                // receive and receive to destination
                // let transaction = await sails.helpers.bitgo.send(coin.coin_code, coin.warm_wallet_address, sendWalletData.receiveAddress.address, (amount * division).toString());
                if (coin.coin_code == "teth" || coin.coin_code == "eth" || coin.iserc == true) {
                  var amountValue = parseFloat(amount * division).toFixed(8);
                } else {
                  var sendAmount = parseFloat(parseFloat(amount)).toFixed(8)
                  var amountValue = parseFloat(sendAmount * division).toFixed(8)
                }

                var getDestinationValue = await Wallet.findOne({
                  where: {
                    deleted_at: null,
                    coin_id: coin.id,
                    receive_address: destination_address,
                    is_active: true
                  }
                });

                var fiatObject = await sails.helpers.getFiatValues(coin.coin);

                if ((coin.coin_code == "xrp" || coin.coin_code == 'txrp') && getDestinationValue && getDestinationValue != undefined) {
                  var walletHistory = {
                    coin_id: wallet.coin_id,
                    source_address: wallet.receive_address,
                    destination_address: destination_address,
                    user_id: user_id,
                    amount: amount,
                    transaction_type: 'send',
                    transaction_id: '',
                    is_executed: false,
                    is_admin: true,
                    faldax_fee: 0.0,
                    actual_network_fees: 0.0,
                    estimated_network_fees: parseFloat(0.0).toFixed(8),
                    is_done: false,
                    actual_amount: amount,
                    fiat_values: fiatObject
                  }
                  await WalletHistory.create({
                    ...walletHistory
                  });

                  var user_wallet_balance = wallet.balance
                  var receiver_wallet_balance = getDestinationValue.balance;

                  var userBalanceUpdate = parseFloat(wallet.balance) - parseFloat(amount);
                  var userPlacedBalanceUpdate = parseFloat(wallet.placed_balance) - parseFloat(amount);
                  var receiverBalanceUpdate = parseFloat(getDestinationValue.balance) + parseFloat(amount);
                  var receiverPlacedBalanceUpdate = parseFloat(getDestinationValue.placed_balance) + parseFloat(amount);

                  await Wallet
                    .update({
                      id: wallet.id
                    })
                    .set({
                      balance: userBalanceUpdate,
                      placed_balance: userPlacedBalanceUpdate
                    });

                  await Wallet
                    .update({
                      id: getDestinationValue.id
                    })
                    .set({
                      balance: receiverBalanceUpdate,
                      placed_balance: receiverPlacedBalanceUpdate
                    });

                  var walletHistoryReceiver = {
                    coin_id: wallet.coin_id,
                    source_address: wallet.receive_address,
                    destination_address: destination_address,
                    user_id: getDestinationValue.receive_address,
                    amount: amount,
                    transaction_type: 'receive',
                    transaction_id: '',
                    is_executed: false,
                    is_admin: false,
                    faldax_fee: 0.0,
                    actual_network_fees: 0.0,
                    estimated_network_fees: parseFloat(0.0).toFixed(8),
                    is_done: false,
                    actual_amount: amount,
                    fiat_values: fiatObject
                  }

                  await WalletHistory.create({
                    ...walletHistoryReceiver
                  });

                  var addObject = {
                    coin_id: coin.id,
                    source_address: wallet.receive_address,
                    destination_address: destination_address,
                    user_id: user_id,
                    amount: parseFloat(amountValue / division).toFixed(8),
                    transaction_type: 'send',
                    transaction_id: '',
                    is_executed: true,
                    is_admin: true,
                    faldax_fee: 0.0,
                    actual_network_fees: 0.0,
                    estimated_network_fees: parseFloat(0.0).toFixed(8),
                    is_done: false,
                    actual_amount: amount,
                    sender_user_balance_before: user_wallet_balance,
                    // warm_wallet_balance_before: parseFloat(warmWalletData.balance / division).toFixed(sails.config.local.TOTAL_PRECISION),
                    // actual_network_fees: parseFloat(((transaction.transfer.feeString)) / division).toFixed(8),
                    transaction_from: sails.config.local.SEND_TO_DESTINATION
                  }

                  await TransactionTable.create({
                    ...addObject
                  });

                  var addObject = {
                    coin_id: coin.id,
                    source_address: wallet.receive_address,
                    destination_address: destination_address,
                    user_id: user_id,
                    amount: parseFloat(amountValue / division).toFixed(8),
                    transaction_type: 'receive',
                    transaction_id: '',
                    is_executed: true,
                    is_admin: false,
                    faldax_fee: 0.0,
                    actual_network_fees: 0.0,
                    estimated_network_fees: parseFloat(0.0).toFixed(8),
                    is_done: false,
                    actual_amount: amount,
                    sender_user_balance_before: receiver_wallet_balance,
                    // warm_wallet_balance_before: parseFloat(warmWalletData.balance / division).toFixed(sails.config.local.TOTAL_PRECISION),
                    // actual_network_fees: parseFloat(((transaction.transfer.feeString)) / division).toFixed(8),
                    transaction_from: sails.config.local.RECEIVE_TO_DESTINATION
                  }

                  await TransactionTable.create({
                    ...addObject
                  });
                  return res.json({
                    status: 200,
                    message: parseFloat(amountValue / division).toFixed(8) + " " + (coin.coin_code).toUpperCase() + " " + sails.__("Token send success").message
                  });
                } else {
                  let transaction = await sails.helpers.bitgo.send(coin.coin_code, coin.hot_receive_wallet_address, destination_address, (amountValue).toString());
                  //Here remainning ebtry as well as address change
                  var network_fees = (transaction.transfer.feeString);
                  var network_feesValue = parseFloat(network_fees / (division))
                  var totalFeeSub = 0;
                  totalFeeSub = parseFloat(parseFloat(totalFeeSub) + parseFloat(network_feesValue)).toFixed(8)
                  totalFeeSub = parseFloat(totalFeeSub) + parseFloat(amount);
                  var walletHistory = {
                    coin_id: wallet.coin_id,
                    source_address: wallet.receive_address,
                    destination_address: destination_address,
                    user_id: user_id,
                    amount: amount,
                    transaction_type: 'send',
                    transaction_id: transaction.txid,
                    is_executed: false,
                    is_admin: true,
                    faldax_fee: 0.0,
                    actual_network_fees: network_feesValue,
                    estimated_network_fees: parseFloat(networkFees).toFixed(8),
                    is_done: false,
                    actual_amount: amount,
                    fiat_values: fiatObject
                  }

                  // Make changes in code for receive webhook and then send to receive address
                  // Entry in wallet history
                  await WalletHistory.create({
                    ...walletHistory
                  });

                  var user_wallet_balance = wallet.balance;
                  let admin_network_fees = 0.0;
                  var updateBalance = parseFloat(wallet.balance) - parseFloat(totalFeeSub)
                  var updatePlacedBalance = parseFloat(wallet.placed_balance) - parseFloat(totalFeeSub);
                  // update wallet balance
                  await Wallet
                    .update({
                      id: wallet.id
                    })
                    .set({
                      balance: updateBalance,
                      placed_balance: updatePlacedBalance
                    });

                  // Adding the transaction details in transaction table This is entry for sending
                  // from warm wallet to hot send wallet
                  var addObject = {
                    coin_id: coin.id,
                    source_address: wallet.receive_address,
                    destination_address: destination_address,
                    user_id: user_id,
                    amount: parseFloat(amountValue / division).toFixed(8),
                    transaction_type: 'send',
                    transaction_id: transaction.txid,
                    is_executed: true,
                    is_admin: true,
                    faldax_fee: 0.0,
                    actual_network_fees: network_feesValue,
                    estimated_network_fees: parseFloat(networkFees).toFixed(8),
                    is_done: false,
                    actual_amount: amount,
                    sender_user_balance_before: user_wallet_balance,
                    warm_wallet_balance_before: parseFloat(warmWalletData.balance / division).toFixed(sails.config.local.TOTAL_PRECISION),
                    // actual_network_fees: parseFloat(((transaction.transfer.feeString)) / division).toFixed(8),
                    transaction_from: sails.config.local.SEND_TO_DESTINATION
                  }

                  await TransactionTable.create({
                    ...addObject
                  });

                  // await logger.info({
                  //   "module": "Wallet Send Coin Admin",
                  //   "user_id": "user_" + req.user.id,
                  //   "url": req.url,
                  //   "type": "Success"
                  // }, sails.__("Token send success").message)
                  return res.json({
                    status: 200,
                    message: parseFloat(totalFeeSub).toFixed(8) + " " + (coin.coin_code).toUpperCase() + " " + sails.__("Token send success").message
                  });
                }
              } else {
                return res.status(500)
                  .json({
                    status: 500,
                    "message": sails.__("Insufficient Balance in warm Wallet Withdraw Request").message
                  })
              }
            } else if (coin_code == "SUSU") {
              // Sending SUSU coin
              var value = {
                "user_id": parseInt(user_id),
                "amount": parseFloat(amount),
                "destination_address": destination_address,
                "faldax_fee": 0.0,
                "network_fee": networkFees,
                "is_admin": true
              }

              var responseValue = new Promise(async (resolve, reject) => {
                request({
                  url: sails.config.local.SUSUCOIN_URL + "send-susu-coin-address",
                  method: "POST",
                  headers: {

                    'x-token': 'faldax-susucoin-node',
                    'Content-Type': 'application/json'
                  },
                  body: value,
                  json: true
                }, function (err, httpResponse, body) {
                  if (err) {
                    reject(err);
                  }
                  if (body.error) {
                    resolve(body);
                  }
                  resolve(body);
                  // return body;
                });
              })
              var value = await responseValue;

              return res
                .status(200)
                .json({
                  "status": 200,
                  "message": value.data + " " + coin.coin_code + " " + sails.__("Token send success").message
                })
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
   * API for getting withdrawal fees
   * Renders page for admin when admin wants to get withdrawal fee
   *
   * @param <>
   *
   * @return <Success message for successfully getting fee value or error>
   */

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
        end_date,
        t_type,
        side,
        order_type,
        coin
      } = req.allParams();

      var user_id = req.user.id;
      user_id = 36;
      var filter = ''
      if (wallet_type == 1) {
        var queryAppended = false;
        if (coin_code && (coin_code != '' || coin_code != null)) {
          if (coin_code == "susu") {
            filter += ` AND coins.coin_code = '${coin_code.toUpperCase()}'`
          } else {
            filter += ` AND coins.coin_code = '${coin_code}'`
          }
          queryAppended = true;
        }
        if (data && data != '' && data != null) {
          filter += ' AND'
          filter += " (LOWER(wallet_history.source_address) LIKE '%" + data.toLowerCase() + "%' OR LOWER(wallet_history.destination_address) LIKE '%" + data.toLowerCase() + "%' OR LOWER(wallet_history.transaction_id) LIKE '%" + data.toLowerCase() + "%')";
        }
        var walletLogs = `SELECT wallet_history.source_address,coins.coin ,wallet_history.destination_address,
                         wallet_history.amount, coins.coin_precision,
                          wallet_history.transaction_id, CONCAT((wallet_history.faldax_fee),' ',coins.coin) as faldax_fee,
                          wallet_history.residual_amount,
                          wallet_history.created_at, coins.coin_code
                          FROM public.wallet_history LEFT JOIN coins
                          ON wallet_history.coin_id = coins.id
                          WHERE coins.is_active = 'true' AND wallet_history.deleted_at IS NULL AND wallet_history.user_id = 36
                          AND wallet_history.is_admin = 'true' AND wallet_history.transaction_type = 'send'${filter}
                          AND wallet_history.faldax_fee > 0`


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
          if (coin_code == "susu") {
            filter += ` AND coins.coin_code = '${coin_code.toUpperCase()}'`
          } else {
            filter += ` AND coins.coin_code = '${coin_code}'`
          }
        }
        if (data && data != '' && data != null) {
          filter += ' AND'
          filter += " (LOWER(transaction_table.source_address) LIKE '%" + data.toLowerCase() + "%' OR LOWER(transaction_table.destination_address) LIKE '%" + data.toLowerCase() + "%' OR LOWER(transaction_table.transaction_id) LIKE '%" + data.toLowerCase() + "%')";
        }
        var walletLogs = `SELECT transaction_table.source_address,coins.coin, transaction_table.destination_address,
                            (CONCAT(transaction_table.amount) , ' ', coins.coin) as amount,(cast(amount as decimal(10,8))) as amount,
                            transaction_table.transaction_id, transaction_table.*, coins.coin_precision,
                            transaction_table.transaction_type, transaction_table.created_at, coins.coin_code
                            FROM public.transaction_table LEFT JOIN coins
                            ON transaction_table.coin_id = coins.id
                            WHERE coins.is_active = 'true' AND transaction_table.deleted_at IS NULL
                            AND transaction_table.user_id = ${user_id}${filter}`

        if (t_type) {
          walletLogs += " AND LOWER(transaction_table.transaction_type) LIKE '%" + t_type.toLowerCase() + "' "
        }

        if (start_date && end_date) {
          walletLogs += " AND "

          walletLogs += " transaction_table.created_at >= '" + await sails
            .helpers
            .dateFormat(start_date) + " 00:00:00' AND transaction_table.created_at <= '" + await sails
              .helpers
              .dateFormat(end_date) + " 23:59:59'";
        }

        countQuery = walletLogs;

        if (sort_col && sort_order) {
          let sortVal = (sort_order == 'descend' ?
            'DESC' :
            'ASC');
          walletLogs += " ORDER BY transaction_table." + sort_col + " " + sortVal;
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
          if (coin_code == "susu") {
            filter += ` AND coins.coin_code = '${coin_code.toUpperCase()}'`
          } else {
            filter += ` AND coins.coin_code = '${coin_code}'`
          }
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
                              users.email,jst_trade_history.exec_id, coins.coin_precision, coins.coin_code
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
          if (coin_code == "susu") {
            filter += ` AND coins.coin_code = '${coin_code.toUpperCase()}'`
          } else {
            filter += ` AND coins.coin_code = '${coin_code}'`
          }
          queryAppended = true
        }

        if (data && data != '' && data != null) {
          filter += ' AND'
          filter += " (LOWER(wallets.receive_address) LIKE '%" + data.toLowerCase() + "%' OR LOWER(wallets.send_address) LIKE '%" + data.toLowerCase() + "%' OR LOWER(users.full_name) LIKE '%" + data.toLowerCase() + "%' OR LOWER(users.email) LIKE '%" + data.toLowerCase() + "%')";
        }

        var walletLogs = `SELECT wallets.id, users.email, users.created_at, users.deleted_at,
                            CONCAT ((wallets.balance), ' ', coins.coin) as balance,
                            wallets.receive_address, coins.coin_code, coins.coin_precision,
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
      } else if (wallet_type == 5) {

        if (coin && coin != '' && coin != null) {
          var getCoinDetails = await Coins.findOne({
            where: {
              deleted_at: null,
              is_active: true,
              coin_code: coin
            }
          });

          if (coin == "susu") {
            filter += ` AND (trade_history.settle_currency = '${(getCoinDetails.coin).toUpperCase()}' OR trade_history.currency = '${(getCoinDetails.coin).toUpperCase()}')`
          } else {
            filter += ` AND (trade_history.settle_currency = '${(getCoinDetails.coin).toUpperCase()}' OR trade_history.currency = '${(getCoinDetails.coin).toUpperCase()}')`
          }
          queryAppended = true
        }

        if (data && data != '' && data != null) {
          filter += ' AND'
          filter += " (LOWER(users.first_name) LIKE '%" + data.toLowerCase() + "%' OR LOWER(users.last_name) LIKE '%" + data.toLowerCase() + "%' OR LOWER(users.email) LIKE '%" + data.toLowerCase() + "%' OR LOWER(user1.first_name) LIKE '%" + data.toLowerCase() + "%' OR LOWER(user1.last_name) LIKE '%" + data.toLowerCase() + "%' OR LOWER(user1.email) LIKE '%" + data.toLowerCase() + "%')";
        }

        var tradeQuery = ` FROM trade_history
                            LEFT JOIN coins
                            ON trade_history.currency = coins.coin
                            LEFT JOIN coins as coin1
                            ON trade_history.settle_currency = coin1.coin
                            LEFT join users
                            ON trade_history.user_id = users.id
                            LEFT JOIN users as user1
                            ON trade_history.requested_user_id = user1.id
                            WHERE trade_history.deleted_at IS NULL AND taker_fee <> 0${filter}`

        if (t_type && t_type != '' && t_type != null) {
          tradeQuery += " AND trade_history.side = '" + t_type + "' "
        }

        if (order_type && order_type != '' && order_type != null) {
          tradeQuery += " AND trade_history.order_type = '" + order_type + "' "
        }

        if (start_date && end_date) {
          tradeQuery += " AND "

          tradeQuery += " trade_history.created_at >= '" + await sails
            .helpers
            .dateFormat(start_date) + " 00:00:00' AND users.created_at <= '" + await sails
              .helpers
              .dateFormat(end_date) + " 23:59:59'";
        }

        var countQuery = tradeQuery;

        if (sort_col && sort_order) {
          let sortVal = (sort_order == 'descend' ?
            'DESC' :
            'ASC');
          tradeQuery += " ORDER BY trade_history." + sort_col + " " + sortVal;
        } else {
          tradeQuery += " ORDER BY trade_history.created_at DESC"
        }

        tradeQuery += " limit " + limit + " offset " + (parseInt(limit) * (parseInt(page) - 1))
        console.log(`SELECT trade_history.*, coins.*, users.email as email, users.first_name, users.last_name,
        user1.email as requested_email, user1.first_name as RequestedFirstName , user1.last_name `+ tradeQuery)

        var tradeValue = await sails.sendNativeQuery(`SELECT trade_history.*, coins.coin_icon, coins.coin_code, coins.coin_precision, coins.coin_name, coins.iserc
        , users.email as email, users.first_name, users.last_name,
        user1.email as requested_email, user1.first_name as RequestedFirstName , user1.last_name ` + tradeQuery, []);

        tradeValue = tradeValue.rows
        console.log("tradeValue", tradeValue);

        console.log(`SELECT count(trade_history.id)` + countQuery)

        var tradeCount = await sails.sendNativeQuery(`SELECT count(trade_history.id)` + countQuery, [])
        console.log("tradeCount", tradeCount)
        tradeCount = tradeCount.rows[0].count;

        return res
          .status(200)
          .json({
            "status": 200,
            "message": sails.__("Admin trade history success").message,
            tradeValue,
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
          coinData[i].address = coinData[i].warm_wallet_address;
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

      var coinData = await Coins.findOne({
        where: {
          deleted_at: null,
          is_active: true,
          coin_code: data.coin
        }
      })
      if (coinData.coin_code != "SUSU" && coinData.coin_code != "txrp" && coinData.coin_code != 'xrp' && coinData.iserc != true) {
        if (sails.config.local.TESTNET == 1) {
          var valid = WAValidator.validate(data.address, (coinData.coin_name).toLowerCase(), 'testnet');
        } else {
          var valid = WAValidator.validate(data.address, (coinData.coin_name).toLowerCase());
        }

        if (!valid) {
          return res
            .status(500)
            .json({
              "status": 500,
              "err": sails.__("Enter Valid Address").message
            })
        }
      }
      // var division = sails.config.local.DIVIDE_EIGHT;
      // if (data.coin == 'xrp' || data.coin == 'txrp') {
      //   division = sails.config.local.DIVIDE_SIX;
      // } else if (data.coin == 'eth' || data.coin == 'teth' || coinData.iserc == true) {
      //   division = sails.config.local.DIVIDE_NINE;
      // }
      var division = coinData.coin_precision;
      if (data.coin != "SUSU") {
        var reposneData = {};
        if (data.coin == 'xrp' || data.coin == 'txrp') {
          reposneData.fee = 45;
        } else {
          reposneData = await sails
            .helpers
            .wallet
            .getNetworkFee(data.coin, data.amount, data.address);

        }
        if (data.coin == "eth" || data.coin == "teth" || coinData.iserc == true) {
          reposneDataValue = 2 * (reposneData)
        } else {
          reposneDataValue = 2 * (reposneData.fee);
        }

        return res
          .status(200)
          .json({
            "status": 200,
            "message": sails.__("Fee retrieve Success").message,
            "data": parseFloat(reposneDataValue / division).toFixed(8)
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
      console.log("error", error)
      // console.lo
      // if (error.name == "ImplementationError") {
      get_network_fees = await sails.helpers.feesCalculation(req.body.coin.toLowerCase(), (req.body.amount));

      return res
        .status(200)
        .json({
          "status": 200,
          "data": parseFloat(get_network_fees).toFixed(sails.config.local.TOTAL_PRECISION),
          error_at: error.stack
        })
      // }
      // return res
      //   .status(500)
      //   .json({
      //     status: 500,
      //     "err": sails.__("Something Wrong").message,
      //     error_at: error.stack
      //   });
    }
  },
  /**
  Get HotSendWallet Information
  **/
  getHotSendWalletInfo: async function (req, res) {
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
          select: ['id', 'coin_icon', 'coin_name', 'coin_code', 'coin', 'hot_send_wallet_address']
        })
        .sort('id ASC');

      for (var i = 0; i < coinData.length; i++) {
        if (coinData[i].coin_code != 'SUSU') {

          var wallet_data = await sails
            .helpers
            .wallet
            .getWalletAddressBalance(coinData[i].hot_send_wallet_address, coinData[i].coin_code);
          coinData[i].balance = (wallet_data.balance) ? (wallet_data.balance) : (wallet_data.balanceString);
          coinData[i].address = wallet_data.receiveAddress.address;
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
  Get HotSend Wallet Transaction list
  /**/
  getHotSendWalletTransaction: async function (req, res) {
    try {
      var {
        coin_code,
        limit,
        prevId,
        searchLabel
      } = req.allParams();
      var coinData = await Coins.findOne({
        select: [
          'hot_send_wallet_address',
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
          .getCoinTransfer(coinData.coin_code, coinData.hot_send_wallet_address, data);

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
  Get HotReceiveWallet Information
  **/
  getHotReceiveWalletInfo: async function (req, res) {
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
      query.is_fiat = false

      var coinData = await Coins
        .find({
          where: query,
          select: ['id', 'coin_icon', 'coin_name', 'coin_code', 'coin', 'hot_receive_wallet_address', 'coin_precision']
        })
        .sort('id ASC');

      for (var i = 0; i < coinData.length; i++) {
        if (coinData[i].coin_code != 'SUSU') {

          var wallet_data = await sails
            .helpers
            .wallet
            .getWalletAddressBalance(coinData[i].hot_receive_wallet_address, coinData[i].coin_code);
          console.log("wallet_data", wallet_data);
          if (!wallet_data.error) {
            var coinConversionData = await CurrencyConversion.findOne({
              where: {
                deleted_at: null,
                coin_id: coinData[i].id
              }
            })
            console.log(coinConversionData)
            coinData[i].balance = (wallet_data.balance) ? (wallet_data.balance) : (wallet_data.balanceString);
            coinData[i].address = wallet_data.receiveAddress.address;
            coinData[i].fiat = (coinConversionData != undefined) ? (coinConversionData.quote.USD.price) : (0.0);
            coinData[i].total_value = (((coinData[i].balance) / coinData[i].coin_precision) * coinData[i].fiat)
          }
        } else if (coinData[i].coin_code == "SUSU") {
          var responseValue = await new Promise(async (resolve, reject) => {
            request({
              url: sails.config.local.SUSUCOIN_URL + "get-account-balance",
              method: "GET",
              headers: {

                'x-token': 'faldax-susucoin-node',
                'Content-Type': 'application/json'
              },
              json: true
            }, function (err, httpResponse, body) {
              console.log("body", body)
              console.log(err)
              if (err) {
                reject(err);
              }
              if (body.error) {
                resolve(body);
              }
              resolve(body);
              // return body;
            });
          })
          var coinConversionData = await CurrencyConversion.findOne({
            where: {
              deleted_at: null,
              coin_id: coinData[i].id
            }
          })
          console.log(coinConversionData)
          coinData[i].balance = (responseValue && responseValue != undefined) ? (responseValue.data) : (0.0)
          coinData[i].fiat = (coinConversionData != undefined) ? (coinConversionData.quote.USD.price) : (0.0)
          coinData[i].total_value = (((coinData[i].balance) / coinData[i].coin_precision) * coinData[i].fiat)
          // coinData[i].address = "SNbhGFbmk4JW6zpY3nUTjkHBaXmKppyUJH";
          // coinData[i].hot_receive_wallet_address = "SNbhGFbmk4JW6zpY3nUTjkHBaXmKppyUJH"
          coinData[i].coin_precision = "1e0"
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
  // Get Admin Network Fees
  getAdminNetworkFeeData: async function (req, res) {
    try {
      var data = req.body;
      var coinData = await Coins.findOne({
        where: {
          is_active: true,
          deleted_at: null,
          coin_code: data.coin
        }
      })

      if (coinData.coin_code != "SUSU" && coinData.coin_code != "txrp" && coinData.coin_code != 'xrp' && coinData.iserc != true) {
        if (sails.config.local.TESTNET == 1) {
          var valid = WAValidator.validate(data.dest_address, (coinData.coin_name).toLowerCase(), 'testnet');
        } else {
          var valid = WAValidator.validate(data.dest_address, (coinData.coin_name).toLowerCase());
        }

        if (!valid) {
          return res
            .status(500)
            .json({
              "status": 500,
              "message": sails.__("Enter Valid Address").message
            })
        }
      }
      var division = coinData.coin_precision;
      // if (data.coin == 'xrp' || data.coin == 'txrp') {
      //   division = sails.config.local.DIVIDE_SIX;
      // } else if (data.coin == 'eth' || data.coin == 'teth' || coinData.iserc == true) {
      //   division = sails.config.local.DIVIDE_NINE;
      // }
      if (data.coin != "SUSU") {
        var reposneData = {};
        if (data.coin == 'xrp' || data.coin == 'txrp') {
          reposneData.fee = 45;
        } else {
          reposneData = await sails
            .helpers
            .wallet
            .getNetworkFee(data.coin, data.amount, data.dest_address);
        }
        var reposneDataValue;
        if (data.coin == "eth" || data.coin == "teth" || coinData.iserc == true) {
          reposneDataValue = 2 * (reposneData)
        } else {
          reposneDataValue = 2 * (reposneData.fee);
        }
        // reposneDataValue = 2 * (reposneData.fee);
        return res
          .status(200)
          .json({
            "status": 200,
            "message": sails.__("Fee retrieve Success").message,
            "data": parseFloat(reposneDataValue / division).toFixed(8)
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
  },

  /**
    Get HotReceive Wallet Transaction list
    /**/
  getHotReceiveWalletTransaction: async function (req, res) {
    try {
      var {
        coin_code,
        limit,
        prevId,
        searchLabel
      } = req.allParams();
      var coinData = await Coins.findOne({
        select: [
          'hot_receive_wallet_address',
          'coin_code',
          'coin_precision',
          'iserc'
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
          .getCoinTransfer(coinData.coin_code, coinData.hot_receive_wallet_address, data);

        var data = warmWalletData.transfers
      } else {
        var warmWalletData = {}
      }

      return res
        .status(200)
        .json({
          "status": 200,
          "data": warmWalletData,
          coinData
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

  getWalletAvailableBalance: async function (req, res) {
    try {
      var user_id = req.user.id;
      var {
        coin
      } = req.allParams();

      var userData = await Users.findOne({
        where: {
          deleted_at: null,
          is_active: true,
          id: user_id
        }
      });

      if (userData != undefined && userData.account_tier != 4) {
        //Checking whether user can trade in the area selected in the KYC
        var geo_fencing_data = await sails
          .helpers
          .userTradeChecking(user_id);
        if (geo_fencing_data.response != true) {
          return res.json({
            "status": 401,
            "err": geo_fencing_data.msg,
            error_at: geo_fencing_data
          });
        }
      }

      var availableBalance = 0.0;
      var coinData = await Coins.findOne({
        where: {
          is_active: true,
          deleted_at: null,
          coin_code: coin
        }
      })

      if (coinData != undefined) {
        var walletUserData = await Wallet.findOne({
          user_id: user_id,
          deleted_at: null,
          coin_id: coinData.id
        });

        if (walletUserData) {
          var faldax_fee = await AdminSetting.findOne({
            where: {
              deleted_at: null,
              slug: 'send_fee'
            }
          });

          var faldax_fee_value = faldax_fee.value;
          var walletBalance = walletUserData.placed_balance;
          var remainningAmount = parseFloat(walletBalance) - parseFloat(walletBalance * (faldax_fee_value / 100));
          if (remainningAmount > 0) {
            var division = coinData.coin_precision;

            let warmWallet = await sails.helpers.bitgo.getWallet(coinData.coin_code, coinData.hot_receive_wallet_address);
            if (coinData.coin_code != "teth" && coinData.coin_code != "eth" && coinData.coin_code != "txrp" && coinData.coin_code != "xrp" && coinData.iserc == false && coinData.coin_code != 'SUSU') {
              // remainningAmountValue = remainningAmount * division
              var reposneData = await sails
                .helpers
                .wallet
                .getNetworkFee(coinData.coin_code, (remainningAmount), warmWallet.receiveAddress.address);
              availableBalance = remainningAmount - (2 * (reposneData.fee / division))
            } else if (coinData.coin_code == 'teth' || coinData.coin_code == 'eth' || coinData.iserc == true) {
              // remainningAmountValue = remainningAmount * division
              var reposneData = await sails
                .helpers
                .wallet
                .getNetworkFee(coinData.coin_code, (remainningAmount), warmWallet.receiveAddress.address);

              availableBalance = remainningAmount - (2 * feeValue);
            } else if (coinData.coin_code == 'txrp' || coinData.coin_code == 'xrp') {
              var feesValue = parseFloat(45 / division).toFixed(8)
              availableBalance = remainningAmount - (45 / division);
            } else if (coinData.coin_code == 'SUSU') {
              var feesValue = 0.01
              availableBalance = remainningAmount - 0.01;
            }

            return res
              .status(200)
              .json({
                "status": 200,
                "message": sails.__("Available Balance").message,
                "data": (availableBalance > 0) ? (parseFloat(availableBalance).toFixed(8)) : (0.0)
              })
          } else {
            return res
              .status(200)
              .json({
                "status": 200,
                "message": sails.__("Available Balance").message,
                "data": parseFloat(0).toFixed(8)
              })
          }
        }
      } else {
        return res
          .status(200)
          .json({
            "status": 200,
            "message": sails.__("Coin Not Found").message,
            "data": parseFloat(0).toFixed(8)
          })
      }
    } catch (error) {
      // console.log("error", error);
      // if (error.name == "ImplementationError") {
      get_network_fees = await sails.helpers.feesCalculation(coinData.coin_code.toLowerCase(), remainningAmount);
      var availableBalance = remainningAmount - (2 * get_network_fees)
      return res
        .status(200)
        .json({
          "status": 200,
          "message": sails.__("Available Balance").message,
          "data": (availableBalance > 0) ? (parseFloat(availableBalance).toFixed(8)) : (0.0)
        })
      // }

      // return res
      //   .status(500)
      //   .json({
      //     status: 500,
      //     "error": sails.__("Something Wrong").message,
      //     error_at: error.stack
      //   });
    }
  },

  getAdminWalletAvailableBalance: async function (req, res) {
    try {
      if (!req.user.isAdmin) {
        return res.status(403).json({
          status: 403,
          err: sails.__('Unauthorized Access').message
        });
      }
      var user_id = 36;
      var {
        coin
      } = req.allParams();
      var availableBalance = 0.0;
      var coinData = await Coins.findOne({
        where: {
          is_active: true,
          deleted_at: null,
          coin_code: coin
        }
      })

      if (coinData != undefined) {
        var walletUserData = await Wallet.findOne({
          user_id: user_id,
          deleted_at: null,
          coin_id: coinData.id,
          is_admin: true
        });

        if (walletUserData) {
          var walletBalance = walletUserData.placed_balance;
          var remainningAmount = parseFloat(walletBalance);
          if (remainningAmount > 0) {
            var division = coinData.coin_precision;
            // if (coinData.coin_code == 'teth' || coinData.coin_code == 'eth' || coinData.iserc == true) {
            //   division = 1e18;
            // } else if (coinData.coin_code == "txrp" || coinData.coin_code == 'xrp') {
            //   division = 1e6;
            // }
            let warmWallet = await sails.helpers.bitgo.getWallet(coinData.coin_code, coinData.hot_receive_wallet_address);
            if (coinData.coin_code != "teth" && coinData.coin_code != "eth" && coinData.coin_code != "txrp" && coinData.coin_code != "xrp" && coinData.iserc == false) {
              // remainningAmountValue = remainningAmount * division
              var reposneData = await sails
                .helpers
                .wallet
                .getNetworkFee(coinData.coin_code, (remainningAmount), warmWallet.receiveAddress.address);
              availableBalance = remainningAmount - (2 * (reposneData.fee / division))
            } else if (coinData.coin_code == 'teth' || coinData.coin_code == 'eth' || coinData.iserc == true) {
              var reposneData = await sails
                .helpers
                .wallet
                .getNetworkFee(coinData.coin_code, (remainningAmount), warmWallet.receiveAddress.address);
              feeValue = (reposneData / division)
              availableBalance = remainningAmount - (2 * feeValue);
            } else if (coinData.coin_code == 'txrp' || coinData.coin_code == 'xrp') {
              var feesValue = parseFloat(45 / division).toFixed(8)
              availableBalance = remainningAmount - parseFloat(45 / division).toFixed(8);
            }

            return res
              .status(200)
              .json({
                "status": 200,
                "message": sails.__("Available Balance").message,
                "data": (availableBalance > 0) ? (parseFloat(availableBalance).toFixed(8)) : (0.0)
              })
          } else {
            return res
              .status(200)
              .json({
                "status": 200,
                "message": sails.__("Available Balance").message,
                "data": parseFloat(0).toFixed(8)
              })
          }
        }
      } else {
        return res
          .status(500)
          .json({
            "status": 500,
            "message": sails.__("coin inactive or not").message
          })
      }
    } catch (error) {

      if (error.name == "ImplementationError") {
        get_network_fees = await sails.helpers.feesCalculation(coinData.coin_code.toLowerCase(), remainningAmount);
        var availableBalance = remainningAmount - (2 * get_network_fees)
        return res
          .status(200)
          .json({
            "status": 200,
            "message": sails.__("Available Balance").message,
            "data": (availableBalance > 0) ? (parseFloat(availableBalance).toFixed(8)) : (0.0)
          })
      }

      return res
        .status(401)
        .json({
          status: 401,
          "error": sails.__("Something Wrong").message,
          error_at: error.stack
        });
    }
  },

  getWarmAvailableBalance: async function (req, res) {
    try {
      if (!req.user.isAdmin) {
        return res.status(403).json({
          status: 403,
          err: sails.__('Unauthorized Access').message
        });
      }

      var {
        coin
      } = req.allParams();
      var availableBalance = 0.0;
      var coinData = await Coins.findOne({
        where: {
          is_active: true,
          deleted_at: null,
          coin_code: coin
        }
      })

      if (coinData != undefined) {
        var walletData = await sails
          .helpers
          .bitgo
          .getWallet(coinData.coin_code, coinData.warm_wallet_address)
        if (walletData && walletData != undefined) {
          var walletBalance = walletData.balance;
          var remainningAmount = parseFloat(walletBalance);
          var get_static_fees_data = await sails.helpers.getAssetFeesLimit(coinData.coin_code, 1);
          remainningAmount = remainningAmount - get_static_fees_data
          if (remainningAmount > 0) {
            var division = coinData.coin_precision;
            // if (coinData.coin_code == 'teth' || coinData.coin_code == 'eth' || coinData.iserc == true) {
            //   division = 1e18;
            // } else if (coinData.coin_code == "txrp" || coinData.coin_code == 'xrp') {
            //   division = 1e6;
            // }

            if (coinData.coin_code != "teth" && coinData.coin_code != "eth" && coinData.coin_code != "txrp" && coinData.coin_code != "xrp" && coinData.iserc == false) {
              var reposneData = await sails
                .helpers
                .wallet
                .getNetworkFee(coinData.coin_code, (remainningAmount / division), walletData.receiveAddress.address);
              availableBalance = remainningAmount - (2 * (reposneData.fee / division))
            } else if (coinData.coin_code == 'teth' || coinData.coin_code == 'eth' || coinData.iserc == true) {
              var reposneData = await sails
                .helpers
                .wallet
                .getNetworkFee(coinData.coin_code, (remainningAmount / division), walletData.receiveAddress.address);
              feeValue = (reposneData / division)
              availableBalance = parseFloat(remainningAmount) - parseFloat(2 * feeValue);
            } else if (coinData.coin_code == 'txrp' || coinData.coin_code == 'xrp') {
              var feesValue = parseFloat(45 / division).toFixed(8)
              availableBalance = remainningAmount - parseFloat(45 / division).toFixed(8);
            }

            return res
              .status(200)
              .json({
                "status": 200,
                "message": sails.__("Available Balance").message,
                "data": (availableBalance > 0) ? (parseFloat(availableBalance / division).toFixed(8)) : (0.0),
                coinData
              })
          } else {
            return res
              .status(200)
              .json({
                "status": 200,
                "message": sails.__("Available Balance").message,
                "data": parseFloat(0).toFixed(8), coinData
              })
          }
        }
      }
    } catch (error) {

      if (error.name == "ImplementationError") {
        get_network_fees = await sails.helpers.feesCalculation(coinData.coin.toLowerCase(), remainningAmount);
        var availableBalance = remainningAmount - (2 * get_network_fees)
        return res
          .status(200)
          .json({
            "status": 200,
            "message": sails.__("Available Balance").message,
            "data": (availableBalance > 0) ? (parseFloat(availableBalance / division).toFixed(8)) : (0.0), coinData
          })
      }

      return res
        .status(500)
        .json({
          status: 500,
          "error": sails.__("Something Wrong").message,
          error_at: error.stack
        });
    }
  },

  getAdminWarmSend: async function (req, res) {
    try {
      var {
        amount,
        destination_address,
        coin_code
      } = req.body;

      let coin = await Coins.findOne({
        deleted_at: null,
        is_active: true,
        coin_code: coin_code
      });
      var division = coin.coin_precision;
      // if (coin_code == 'xrp' || coin_code == 'txrp') {
      //   division = sails.config.local.DIVIDE_SIX;
      // } else if (coin_code == 'eth' || coin_code == 'teth' || coin.iserc == true) {
      //   division = sails.config.local.DIVIDE_EIGHTEEN;
      // }

      if (coin.type == 1) {

        var warmWalletData = await sails
          .helpers
          .wallet
          .getWalletAddressBalance(coin.warm_wallet_address, coin_code);
        var sendWalletData = await sails
          .helpers
          .wallet
          .getWalletAddressBalance(coin.hot_send_wallet_address, coin_code);
      }

      if (coin) {

        if (coin.type == 1) {

          let warmWalletData = await sails
            .helpers
            .wallet
            .getWalletAddressBalance(coin.warm_wallet_address, coin_code);

          let sendWalletData = await sails
            .helpers
            .wallet
            .getWalletAddressBalance(coin.hot_send_wallet_address, coin_code);
          // console.log("SEND WALLET DATA >>>>>>>>>>>>>>>>>>", sendWalletData);

          if (warmWalletData.balance >= coin.min_thresold && (warmWalletData.balance - amount) >= 0 && (warmWalletData.balance - amount) >= coin.min_thresold && (warmWalletData.balance) > (amount * division)) {
            // Send to hot warm wallet and make entry in diffrent table for both warm to
            // receive and receive to destination
            // let transaction = await sails.helpers.bitgo.send(coin.coin_code, coin.warm_wallet_address, sendWalletData.receiveAddress.address, (amount * division).toString());
            if (coin.coin_code == "teth" || coin.coin_code == "eth" || coin.iserc == true) {
              var amountValue = parseFloat(amount * division).toFixed(8);
            } else {
              var sendAmount = parseFloat(parseFloat(amount))
              var amountValue = parseFloat(sendAmount * division).toFixed(8)
            }

            let transaction = await sails.helpers.bitgo.send(coin.coin_code, coin.warm_wallet_address, destination_address, (amountValue).toString());

            //Here remainning ebtry as well as address change
            var network_fees = (transaction.transfer.feeString);
            var network_feesValue = parseFloat(network_fees / (division))
            var totalFeeSub = 0;
            totalFeeSub = parseFloat(parseFloat(totalFeeSub) + parseFloat(network_feesValue).toFixed(8));
            totalFeeSub = parseFloat(totalFeeSub) + parseFloat(amount);

            return res.json({
              status: 200,
              message: parseFloat(totalFeeSub).toFixed(8) + " " + (coin.coin_code).toUpperCase() + " " + sails.__("Token send success").message
            });
          } else {
            return res.status(500)
              .json({
                status: 500,
                "message": sails.__("Insufficient Balance in warm Wallet Withdraw Request").message
              })
          }
        }
        // } else {
        //   return res
        //     .status(400)
        //     .json({
        //       status: 400,
        //       message: sails.__("Insufficent balance wallet").message
        //     });
        // }
      } else {
        return res
          .status(400)
          .json({
            status: 400,
            message: sails.__("Coin not found").message
          });
      }
    } catch (error) {
      return res
        .status(500)
        .json({
          status: 500,
          "error": sails.__("Something Wrong").message,
          error_at: error.stack
        });
    }
  },
  /**
  Get Wallet Coin Transaction of Admin Business Wallet
  **/
  getBusinessWalletCoinTransaction: async function (req, res) {
    try {
      var {
        coin_code,
        sort_col,
        sort_order,
        page,
        limit,
        data,
        start_date,
        end_date,
        t_type
      } = req.allParams();

      var user_id = req.user.id;
      user_id = 37;
      var filter = '';

      if (coin_code && coin_code != '' && coin_code != null) {
        if (coin_code == "susu") {
          filter += ` AND coins.coin_code = '${coin_code.toUpperCase()}'`
        } else {
          filter += ` AND coins.coin_code = '${coin_code}'`
        }
      }
      if (data && data != '' && data != null) {
        filter += ' AND'
        filter += " (LOWER(transaction_table.source_address) LIKE '%" + data.toLowerCase() + "%' OR LOWER(transaction_table.destination_address) LIKE '%" + data.toLowerCase() + "%' OR LOWER(transaction_table.transaction_id) LIKE '%" + data.toLowerCase() + "%')";
      }
      var walletLogs = `SELECT transaction_table.source_address,coins.coin, transaction_table.destination_address,
                          (CONCAT(transaction_table.amount) , ' ', coins.coin) as amount,(cast(amount as decimal(12,8))) as amount,
                          transaction_table.transaction_id, transaction_table.*, coins.coin_precision,
                          transaction_table.transaction_type, transaction_table.created_at, coins.coin_code
                          FROM public.transaction_table LEFT JOIN coins
                          ON transaction_table.coin_id = coins.id
                          WHERE coins.is_active = 'true' AND transaction_table.deleted_at IS NULL
                          AND transaction_table.user_id = ${user_id}${filter}`
      if (t_type) {
        walletLogs += " AND LOWER(transaction_table.transaction_type) LIKE '%" + t_type.toLowerCase() + "' "
      }


      if (start_date && end_date) {
        walletLogs += " AND "

        walletLogs += " transaction_table.created_at >= '" + await sails
          .helpers
          .dateFormat(start_date) + " 00:00:00' AND transaction_table.created_at <= '" + await sails
            .helpers
            .dateFormat(end_date) + " 23:59:59'";
      }

      countQuery = walletLogs;

      if (sort_col && sort_order) {
        let sortVal = (sort_order == 'descend' ?
          'DESC' :
          'ASC');
        walletLogs += " ORDER BY transaction_table." + sort_col + " " + sortVal;
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
   * Get User Avaiable Limits
   */
  getUserAvailableLimit: async function (req, res) {
    try {
      var user_id = req.user.id;
      console.log('user_id', user_id);
      var data = req.body;
      var now = moment().local().format();
      var yesterday = moment()
        .startOf('day')
        .local()
        .format();

      var previousMonth = moment()
        .startOf('month')
        .local()
        .format();

      var userData = await Users.findOne({
        where: {
          deleted_at: null,
          is_active: true,
          id: user_id
        }
      });

      if (userData != undefined && userData.account_tier != 4) {
        //Checking whether user can trade in the area selected in the KYC
        var geo_fencing_data = await sails
          .helpers
          .userTradeChecking(user_id);
        if (geo_fencing_data.response != true) {
          return res.json({
            "status": 401,
            "err": geo_fencing_data.msg,
            error_at: geo_fencing_data
          });
        }
      }

      // Get User and tier information
      var tierSql = `SELECT users.account_tier, tiers.monthly_withdraw_limit, tiers.daily_withdraw_limit
                      FROM users
                      LEFT JOIN tiers
                      ON (users.account_tier) = tiers.tier_step
                      WHERE users.deleted_at IS NULL AND users.is_active = 'true'
                      AND users.id = ${user_id} AND tiers.deleted_at IS NULL;`
      var userTierSql = await sails.sendNativeQuery(tierSql);
      userTierSql = userTierSql.rows;
      console.log('userTierSql', userTierSql);
      if ((userTierSql[0].monthly_withdraw_limit == null) || userTierSql[0].daily_withdraw_limit == null) {
        return res
          .status(202)
          .json({
            "status": 202,
            "message": sails.__("User not able to do transactions").message
          })
      }

      var limitSql = `SELECT (currency_conversion.quote->'USD'->'price') as usd_price
                        FROM coins
                        LEFT JOIN currency_conversion
                        ON coins.id = currency_conversion.coin_id
                        WHERE coins.coin_code = '${data.coin}' AND coins.is_active = 'true'
                        AND coins.deleted_at IS NULL AND currency_conversion.deleted_at IS NULL`
      var limitCalculation = await sails.sendNativeQuery(limitSql);
      limitCalculation = limitCalculation.rows;
      console.log('limitCalculation', limitCalculation);
      // Daily Limit Checking
      var getUserDailyHistory = `SELECT *
                                  FROM (
                                    SELECT SUM((withdraw_request.amount + withdraw_request.network_fee)*Cast(withdraw_request.fiat_values->>'asset_1_usd' as double precision)) as requested_amount
                                      FROM coins
                                      LEFT JOIN withdraw_request
                                      ON withdraw_request.coin_id = coins.id
                                      WHERE coins.is_active = 'true' AND coins.deleted_at IS NULL
                                      AND withdraw_request.deleted_at IS NULL AND withdraw_request.transaction_type = 'send'
                                      AND withdraw_request.user_id = ${user_id}
                                      AND withdraw_request.created_at >= '${yesterday}' AND withdraw_request.created_at <= '${now}'
                                  ) as t
                                  CROSS JOIN (
                                    SELECT SUM((wallet_history.amount + wallet_history.actual_network_fees)*Cast(wallet_history.fiat_values->>'asset_1_usd' as double precision)) as history_amount
                                      FROM coins
                                      LEFT JOIN wallet_history
                                      ON wallet_history.coin_id = coins.id
                                      WHERE coins.is_active = 'true' AND coins.deleted_at IS NULL
                                      AND wallet_history.deleted_at IS NULL AND wallet_history.transaction_type = 'send'
                                      AND wallet_history.user_id = ${user_id}
                                      AND wallet_history.created_at >= '${yesterday}' AND wallet_history.created_at <= '${now}'
                                  ) as m`

      var userDailyHistory = await sails.sendNativeQuery(getUserDailyHistory)
      userDailyHistory = userDailyHistory.rows
      console.log('userDailyHistory', userDailyHistory);
      // Monthly Limit Checking
      var getUserMonthlyHistory = `SELECT *
                                    FROM (
                                      SELECT SUM((withdraw_request.amount + withdraw_request.network_fee)*Cast(withdraw_request.fiat_values->>'asset_1_usd' as double precision)) as requested_amount
                                        FROM coins
                                        LEFT JOIN withdraw_request
                                        ON withdraw_request.coin_id = coins.id
                                        WHERE coins.is_active = 'true' AND coins.deleted_at IS NULL
                                        AND withdraw_request.deleted_at IS NULL AND withdraw_request.transaction_type = 'send'
                                        AND withdraw_request.user_id = ${user_id}
                                        AND withdraw_request.created_at >= '${previousMonth}' AND withdraw_request.created_at <= '${now}'
                                    ) as t
                                    CROSS JOIN (
                                      SELECT SUM((wallet_history.amount + wallet_history.actual_network_fees)*Cast(wallet_history.fiat_values->>'asset_1_usd' as double precision)) as history_amount
                                        FROM coins
                                        LEFT JOIN wallet_history
                                        ON wallet_history.coin_id = coins.id
                                        WHERE coins.is_active = 'true' AND coins.deleted_at IS NULL
                                        AND wallet_history.deleted_at IS NULL AND wallet_history.transaction_type = 'send'
                                        AND wallet_history.user_id = ${user_id}
                                        AND wallet_history.created_at >= '${previousMonth}' AND wallet_history.created_at <= '${now}'
                                    ) as m`
      var userMonthlyHistory = await sails.sendNativeQuery(getUserMonthlyHistory);
      userMonthlyHistory = userMonthlyHistory.rows;

      var dailyTotalVolume = 0.0;
      var monthlyTotalVolume = 0.0;
      userDailyHistory[0].request_amount = (userDailyHistory[0].request_amount == null) ? (0.0) : (userDailyHistory[0].request_amount);
      userDailyHistory[0].history_amount = (userDailyHistory[0].history_amount == null) ? (0.0) : (userDailyHistory[0].history_amount);
      userMonthlyHistory[0].history_amount = (userMonthlyHistory[0].history_amount == null) ? (0.0) : (userMonthlyHistory[0].history_amount);
      userMonthlyHistory[0].request_amount = (userMonthlyHistory[0].request_amount == null) ? (0.0) : (userMonthlyHistory[0].request_amount)
      dailyTotalVolume = parseFloat(userDailyHistory[0].history_amount) + parseFloat(userDailyHistory[0].request_amount);
      monthlyTotalVolume = parseFloat(userMonthlyHistory[0].history_amount) + parseFloat(userMonthlyHistory[0].request_amount);
      dailyTotalVolume = (Number.isNaN(dailyTotalVolume)) ? (0.0) : (dailyTotalVolume);
      monthlyTotalVolume = (Number.isNaN(monthlyTotalVolume)) ? (0.0) : (monthlyTotalVolume)

      var dailyFlag = false;
      var monthlyFlag = false;
      if (userTierSql[0].daily_withdraw_limit == "Unlimited") {
        dailyFlag = true;
      }

      if (userTierSql[0].monthly_withdraw_limit == "Unlimited") {
        monthlyFlag = true;
      }

      if (monthlyTotalVolume <= userTierSql[0].monthly_withdraw_limit || monthlyFlag == true) {

        if ((((limitCalculation[0].usd_price * data.amount) + monthlyTotalVolume) <= userTierSql[0].monthly_withdraw_limit) || monthlyFlag == true) {

          if ((dailyTotalVolume <= userTierSql[0].daily_withdraw_limit) || dailyFlag == true) {

            if ((((limitCalculation[0].usd_price * data.amount) + dailyTotalVolume) <= userTierSql[0].daily_withdraw_limit) || dailyFlag == true) {
              console.log('dailyFlag', dailyFlag);
              console.log('monthlyFlag', monthlyFlag);
              if (dailyFlag == true && monthlyFlag == true) {
                var data = {
                  "daily_limit_left": "Unlimited",
                  "monthly_limit_left": "Unlimited",
                  "daily_limit_actual": "Unlimited",
                  "monthly_limit_actual": "Unlimited",
                  "current_limit_left_daily_amount": "Unlimited",
                  "current_limit_left_montly_amount": "Unlimited"
                }
                return res
                  .status(203)
                  .json({
                    "status": 203,
                    "message": sails.__("User Can do transaction").message,
                    "data": data
                  })
              } else {
                console.log("limitCalculation[0].usd_price", limitCalculation[0].usd_price);
                console.log("data.amount", data.amount)
                var value = parseFloat(limitCalculation[0].usd_price * data.amount).toFixed(2)
                console.log("value", value)
                console.log("dailyTotalVolume", dailyTotalVolume)
                console.log("userTierSql[0].daily_withdraw_limit", userTierSql[0].daily_withdraw_limit)
                console.log("monthlyTotalVolume", monthlyTotalVolume)
                console.log("userTierSql[0].monthly_withdraw_limit", userTierSql[0].monthly_withdraw_limit)
                console.log("(value) + (monthlyTotalVolume)", parseFloat(value) + parseFloat(monthlyTotalVolume))
                var data = {
                  "daily_limit_left": (Number.isNaN(dailyTotalVolume)) ? (userTierSql[0].daily_withdraw_limit) : (parseFloat(userTierSql[0].daily_withdraw_limit - dailyTotalVolume)),
                  "monthly_limit_left": (Number.isNaN(monthlyTotalVolume)) ? (userTierSql[0].monthly_withdraw_limit) : (parseFloat(userTierSql[0].monthly_withdraw_limit - monthlyTotalVolume)),
                  "daily_limit_actual": userTierSql[0].daily_withdraw_limit,
                  "monthly_limit_actual": userTierSql[0].monthly_withdraw_limit,
                  "current_limit_left_daily_amount": parseFloat(userTierSql[0].daily_withdraw_limit) - (parseFloat(value) + parseFloat(dailyTotalVolume)),
                  "current_limit_left_montly_amount": (userTierSql[0].monthly_withdraw_limit) - (parseFloat(value) + parseFloat(monthlyTotalVolume))
                }
                return res
                  .status(200)
                  .json({
                    "status": 200,
                    "message": sails.__("User Can do transaction").message,
                    "data": data
                  })
              }
            } else {

              var data = {
                "daily_limit_left": (Number.isNaN(dailyTotalVolume)) ? (userTierSql[0].daily_withdraw_limit) : (parseFloat(userTierSql[0].daily_withdraw_limit - dailyTotalVolume)),
                "monthly_limit_left": (Number.isNaN(monthlyTotalVolume)) ? (userTierSql[0].monthly_withdraw_limit) : (parseFloat(userTierSql[0].monthly_withdraw_limit - (monthlyTotalVolume))),
                "daily_limit_actual": parseFloat(userTierSql[0].daily_withdraw_limit),
                "monthly_limit_actual": parseFloat(userTierSql[0].monthly_withdraw_limit),
                "current_daily_limit": parseFloat(limitCalculation[0].usd_price * data.amount)
              }
              return res
                .status(201)
                .json({
                  "status": 201,
                  "message": sails.__("Daily Limit Exceeded Using Amount").message,
                  "data": data
                })
            }
          } else {

            var data = {
              "daily_limit_actual": parseFloat(userTierSql[0].daily_withdraw_limit),
              "monthly_limit_actual": parseFloat(userTierSql[0].monthly_withdraw_limit),
            }
            return res
              .status(201)
              .json({
                "status": 201,
                "message": sails.__("User Tier Daily Limit Exceeded").message + userTierSql[0].daily_withdraw_limit,
                "data": data
              })
          }
        } else {
          var data = {
            "daily_limit_left": (Number.isNaN(dailyTotalVolume)) ? (userTierSql[0].daily_withdraw_limit) : (parseFloat(userTierSql[0].daily_withdraw_limit - (dailyTotalVolume))),
            "monthly_limit_left": (Number.isNaN(monthlyTotalVolume)) ? (userTierSql[0].monthly_withdraw_limit) : (parseFloat(userTierSql[0].monthly_withdraw_limit - (monthlyTotalVolume))),
            "daily_limit_actual": parseFloat(userTierSql[0].daily_withdraw_limit),
            "monthly_limit_actual": parseFloat(userTierSql[0].monthly_withdraw_limit),
            "current_monthly_limit": parseFloat(limitCalculation[0].usd_price * data.amount)
          }
          return res
            .status(201)
            .json({
              "status": 201,
              "message": sails.__("Monthly Limit Exceeded Using Amount").message,
              "data": data
            })
          // var data = {
        }
      } else {
        var data = {
          "daily_limit_actual": parseFloat(userTierSql[0].daily_withdraw_limit),
          "monthly_limit_actual": parseFloat(userTierSql[0].monthly_withdraw_limit),
        }
        // }
        return res
          .status(201)
          .json({
            "status": 201,
            "message": sails.__("User Tier Monthly Limit Exceeded").message + userTierSql[0].monthly_withdraw_limit,
            "data": data
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

  sendCoinTradeDesk: async function (req, res) {
    try {
      let {
        amount,
        destination_address,
        coin_code,
        networkFees,
        total_fees
      } = req.allParams();
      var user_id = 36;
      var today = moment().utc().format();

      let coin = await Coins.findOne({
        deleted_at: null,
        is_active: true,
        coin_code: coin_code
      });

      if (coin.coin_code != "SUSU" && coin.coin_code != "txrp" && coin.coin_code != 'xrp' && coin.iserc != true) {
        if (sails.config.local.TESTNET == 1) {
          var valid = WAValidator.validate(destination_address, (coin.coin_name).toLowerCase(), 'testnet');
        } else {
          var valid = WAValidator.validate(destination_address, (coin.coin_name).toLowerCase());
        }

        if (!valid) {
          return res
            .status(500)
            .json({
              "status": 500,
              "err": sails.__("Enter Valid Address").message
            })
        }
      }

      var division = coin.coin_precision;

      if (coin) {

        let wallet = await Wallet.findOne({
          deleted_at: null,
          coin_id: coin.id,
          is_active: true,
          user_id: user_id
          // is_admin: true
        });

        //Checking if wallet is found or not
        if (wallet) {

          //If placed balance is greater than the amount to be send
          if (parseFloat((wallet.placed_balance).toFixed(sails.config.local.TOTAL_PRECISION)) >= (parseFloat(total_fees)).toFixed(sails.config.local.TOTAL_PRECISION)) {

            //If coin is of bitgo type
            if (coin.type == 1) {

              let warmWalletData = await sails
                .helpers
                .wallet
                .getWalletAddressBalance(coin.hot_receive_wallet_address, coin_code);

              if (warmWalletData.balance >= coin.min_thresold && (warmWalletData.balance - total_fees) >= 0 && (warmWalletData.balance - total_fees) >= coin.min_thresold && (warmWalletData.balance) > (total_fees * division)) {
                // Send to hot warm wallet and make entry in diffrent table for both warm to
                // receive and receive to destination
                // let transaction = await sails.helpers.bitgo.send(coin.coin_code, coin.warm_wallet_address, sendWalletData.receiveAddress.address, (amount * division).toString());
                if (coin.coin_code == "teth" || coin.coin_code == "eth" || coin.iserc == true) {
                  var amountValue = parseFloat(amount * division).toFixed(8);
                } else {
                  var sendAmount = parseFloat(parseFloat(amount)).toFixed(8)
                  var amountValue = parseFloat(sendAmount * division).toFixed(8)
                }

                var getDestinationValue = await Wallet.findOne({
                  where: {
                    deleted_at: null,
                    coin_id: coin.id,
                    receive_address: destination_address,
                    is_active: true
                  }
                });

                var fiatObject = await sails.helpers.getFiatValues(coin.coin);

                if ((coin.coin_code == "xrp" || coin.coin_code == 'txrp') && getDestinationValue && getDestinationValue != undefined) {
                  var walletHistory = {
                    coin_id: wallet.coin_id,
                    source_address: wallet.receive_address,
                    destination_address: destination_address,
                    user_id: user_id,
                    amount: amount,
                    transaction_type: 'send',
                    transaction_id: '',
                    is_executed: false,
                    is_admin: true,
                    faldax_fee: 0.0,
                    actual_network_fees: 0.0,
                    estimated_network_fees: parseFloat(0.0).toFixed(8),
                    is_done: false,
                    actual_amount: amount,
                    fiat_values: fiatObject
                  }
                  await WalletHistory.create({
                    ...walletHistory
                  });

                  var user_wallet_balance = wallet.balance
                  var receiver_wallet_balance = getDestinationValue.balance;

                  var userBalanceUpdate = parseFloat(wallet.balance) - parseFloat(amount);
                  var userPlacedBalanceUpdate = parseFloat(wallet.placed_balance) - parseFloat(amount);
                  var receiverBalanceUpdate = parseFloat(getDestinationValue.balance) + parseFloat(amount);
                  var receiverPlacedBalanceUpdate = parseFloat(getDestinationValue.placed_balance) + parseFloat(amount);

                  await Wallet
                    .update({
                      id: wallet.id
                    })
                    .set({
                      balance: userBalanceUpdate,
                      placed_balance: userPlacedBalanceUpdate
                    });

                  await Wallet
                    .update({
                      id: getDestinationValue.id
                    })
                    .set({
                      balance: receiverBalanceUpdate,
                      placed_balance: receiverPlacedBalanceUpdate
                    });

                  var walletHistoryReceiver = {
                    coin_id: wallet.coin_id,
                    source_address: wallet.receive_address,
                    destination_address: destination_address,
                    user_id: getDestinationValue.receive_address,
                    amount: amount,
                    transaction_type: 'receive',
                    transaction_id: '',
                    is_executed: false,
                    is_admin: false,
                    faldax_fee: 0.0,
                    actual_network_fees: 0.0,
                    estimated_network_fees: parseFloat(0.0).toFixed(8),
                    is_done: false,
                    actual_amount: amount,
                    fiat_values: fiatObject
                  }

                  await WalletHistory.create({
                    ...walletHistoryReceiver
                  });

                  var addObject = {
                    coin_id: coin.id,
                    source_address: wallet.receive_address,
                    destination_address: destination_address,
                    user_id: user_id,
                    amount: parseFloat(amountValue / division).toFixed(8),
                    transaction_type: 'send',
                    transaction_id: '',
                    is_executed: true,
                    is_admin: true,
                    faldax_fee: 0.0,
                    actual_network_fees: 0.0,
                    estimated_network_fees: parseFloat(0.0).toFixed(8),
                    is_done: false,
                    actual_amount: amount,
                    sender_user_balance_before: user_wallet_balance,
                    // warm_wallet_balance_before: parseFloat(warmWalletData.balance / division).toFixed(sails.config.local.TOTAL_PRECISION),
                    // actual_network_fees: parseFloat(((transaction.transfer.feeString)) / division).toFixed(8),
                    transaction_from: sails.config.local.SEND_TO_DESTINATION
                  }

                  await TransactionTable.create({
                    ...addObject
                  });

                  var addObject = {
                    coin_id: coin.id,
                    source_address: wallet.receive_address,
                    destination_address: destination_address,
                    user_id: user_id,
                    amount: parseFloat(amountValue / division).toFixed(8),
                    transaction_type: 'receive',
                    transaction_id: '',
                    is_executed: true,
                    is_admin: false,
                    faldax_fee: 0.0,
                    actual_network_fees: 0.0,
                    estimated_network_fees: parseFloat(0.0).toFixed(8),
                    is_done: false,
                    actual_amount: amount,
                    sender_user_balance_before: receiver_wallet_balance,
                    // warm_wallet_balance_before: parseFloat(warmWalletData.balance / division).toFixed(sails.config.local.TOTAL_PRECISION),
                    // actual_network_fees: parseFloat(((transaction.transfer.feeString)) / division).toFixed(8),
                    transaction_from: sails.config.local.RECEIVE_TO_DESTINATION
                  }

                  await TransactionTable.create({
                    ...addObject
                  });
                  return res.json({
                    status: 200,
                    message: parseFloat(amountValue / division).toFixed(8) + " " + (coin.coin_code).toUpperCase() + " " + sails.__("Token send success").message
                  });
                } else {
                  let transaction = await sails.helpers.bitgo.send(coin.coin_code, coin.hot_receive_wallet_address, destination_address, (amountValue).toString());
                  //Here remainning ebtry as well as address change
                  var network_fees = (transaction.transfer.feeString);
                  var network_feesValue = parseFloat(network_fees / (division))
                  var totalFeeSub = 0;
                  totalFeeSub = parseFloat(parseFloat(totalFeeSub) + parseFloat(network_feesValue)).toFixed(8)
                  totalFeeSub = parseFloat(totalFeeSub) + parseFloat(amount);
                  var walletHistory = {
                    coin_id: wallet.coin_id,
                    source_address: wallet.receive_address,
                    destination_address: destination_address,
                    user_id: user_id,
                    amount: amount,
                    transaction_type: 'send',
                    transaction_id: transaction.txid,
                    is_executed: false,
                    is_admin: true,
                    faldax_fee: 0.0,
                    actual_network_fees: network_feesValue,
                    estimated_network_fees: parseFloat(networkFees).toFixed(8),
                    is_done: false,
                    actual_amount: amount,
                    fiat_values: fiatObject
                  }

                  // Make changes in code for receive webhook and then send to receive address
                  // Entry in wallet history
                  await WalletHistory.create({
                    ...walletHistory
                  });

                  var user_wallet_balance = wallet.balance;
                  var updateBalance = parseFloat(wallet.balance) - parseFloat(totalFeeSub)
                  var updatePlacedBalance = parseFloat(wallet.placed_balance) - parseFloat(totalFeeSub);
                  // update wallet balance
                  await Wallet
                    .update({
                      id: wallet.id
                    })
                    .set({
                      balance: updateBalance,
                      placed_balance: updatePlacedBalance
                    });

                  // Adding the transaction details in transaction table This is entry for sending
                  // from warm wallet to hot send wallet
                  var addObject = {
                    coin_id: coin.id,
                    source_address: wallet.receive_address,
                    destination_address: destination_address,
                    user_id: user_id,
                    amount: parseFloat(amountValue / division).toFixed(8),
                    transaction_type: 'send',
                    transaction_id: transaction.txid,
                    is_executed: true,
                    is_admin: true,
                    faldax_fee: 0.0,
                    actual_network_fees: network_feesValue,
                    estimated_network_fees: parseFloat(networkFees).toFixed(8),
                    is_done: false,
                    actual_amount: amount,
                    sender_user_balance_before: user_wallet_balance,
                    warm_wallet_balance_before: parseFloat(warmWalletData.balance / division).toFixed(sails.config.local.TOTAL_PRECISION),
                    // actual_network_fees: parseFloat(((transaction.transfer.feeString)) / division).toFixed(8),
                    transaction_from: sails.config.local.SEND_TO_DESTINATION
                  }

                  await TransactionTable.create({
                    ...addObject
                  });

                  return res.json({
                    status: 200,
                    message: parseFloat(totalFeeSub).toFixed(8) + " " + (coin.coin_code).toUpperCase() + " " + sails.__("Token send success").message
                  });
                }
              } else {
                return res.status(500)
                  .json({
                    status: 500,
                    "message": sails.__("Insufficient Balance in warm Wallet Withdraw Request").message
                  })
              }
            } else if (coin_code == "SUSU") {
              // Sending SUSU coin
              var value = {
                "user_id": parseInt(user_id),
                "amount": parseFloat(amount),
                "destination_address": destination_address,
                "faldax_fee": 0.0,
                "network_fee": networkFees,
                "is_admin": true
              }

              var responseValue = new Promise(async (resolve, reject) => {
                request({
                  url: sails.config.local.SUSUCOIN_URL + "send-susu-coin-address",
                  method: "POST",
                  headers: {

                    'x-token': 'faldax-susucoin-node',
                    'Content-Type': 'application/json'
                  },
                  body: value,
                  json: true
                }, function (err, httpResponse, body) {
                  if (err) {
                    reject(err);
                  }
                  if (body.error) {
                    resolve(body);
                  }
                  resolve(body);
                  // return body;
                });
              })
              var value = await responseValue;

              return res
                .status(200)
                .json({
                  "status": 200,
                  "message": value.data + " " + coin.coin_code + " " + sails.__("Token send success").message
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
            message: sails.__("Coin not found").message
          });
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

  getTradeDeskWalletHistory: async function (req, res) {
    try {

    } catch (error) {
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
