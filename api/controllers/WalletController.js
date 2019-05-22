/**
 * WalletController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const BitGoJS = require('bitgo');
var moment = require('moment');

module.exports = {

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
      var dataRecuur = [];

      var wallet_user = await Users.findOne({
        where: {
          id: req.user.id,
          deleted_at: null,
          is_active: true
        }
      });
      if (currency == "USD") {
        currency = "USD,USD,USD";
      } else if (currency == "INR") {
        currency = "INR,INR,INR";
      } else if (currency == "EUR") {
        currency = "EUR,EUR,EUR";
      }
      let currencyArray = currency.split(",");
      let coins = await Coins
        .find({
        deleted_at: null,
        "wallet_address": {
          "!": null
        }
      })
        .sort('id', 'DESC');
      for (let index = 0; index < coins.length; index++) {
        const coin = coins[index];
        let price = 0;
        let walletDataArray = await Wallet
          .find({coin_id: coin.id, user_id: req.user.id, deleted_at: null})
          .sort("created_at DESC");
        let walletData = walletDataArray[0];
        coin['balance'] = 0;
        if (walletData && walletData.balance !== undefined) {
          coin['balance'] = walletData.balance;
          for (let innerIndex = 0; innerIndex < currencyArray.length; innerIndex++) {
            const currencyName = currencyArray[innerIndex];
            let last_price = await TradeHistory.find({
              where: {
                settle_currency: coin.coin,
                currency: currencyName
              },
              sort: 'id DESC',
              limit: 1
            });
            if (last_price.length > 0) {
              price = last_price[0].fill_price
            } else {
              price = 0;
            }
            coin[currencyName] = price;
            var total = total + price;
          }
          coins[index] = coin;

          if (coins[index].balance > 0) {
            balanceCoin.push(coins[index])
          } else {
            nonBalanceCoin.push(coins[index]);
          }
        }
      }
      var balanceData = {
        'balanceWallet': balanceCoin,
        'nonBalanceWallet': nonBalanceCoin
      }

      var calculation = 0;
      if (isNaN(wallet_user.percent_wallet) || wallet_user.percent_wallet == null || wallet_user.percent_wallet == undefined) {
        calculation = 0;
      } else {
        calculation = wallet_user.percent_wallet;
      }
      var percentchange = (total / (wallet_user.percent_wallet) * 100);
      if (isNaN(percentchange) || percentchange == undefined || percentchange == Infinity) {
        percentchange = 0;
      }
      var updateData = await Users
        .update({id: req.user.id, deleted_at: null, is_active: true})
        .set({'percent_wallet': percentchange, "email": wallet_user.email});

      if (percentchange >= wallet_user.percent_wallet) {
        flag = true;
      } else {
        flag = false;
      }

      var data = {
        "percentChange": percentchange,
        "flag": flag
      }

      return res.json({
        status: 200,
        message: sails.__("Balance retrieved success"),
        balanceData,
        data
      });

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
                        address: destination_address,
                        walletPassphrase: sails.config.local.BITGO_PASSPHRASE
                      };

                      // Send to hot warm wallet and make entry in diffrent table for both warn to
                      // receive and receive to destination
                      bitgoWallet
                        .send(params)
                        .then(async function (transaction) {
                          //Here remainning ebtry as well as address change
                          let walletHistory = {
                            coin_id: wallet.coin_id,
                            source_address: wallet.receive_address,
                            destination_address: destination_address,
                            user_id: user_id,
                            amount: amount,
                            transaction_type: 'send',
                            transaction_id: transaction.id
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
                    destination_address: destination_address,
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
                    message: sails.__("Insufficent balance")
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
