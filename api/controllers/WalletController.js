/**
 * WalletController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const BitGoJS = require('bitgo');

module.exports = {
  getCoinBalanceForWallet: async function (req, res) {
    try {
      let {currency} = req.body;
      let currencyArray = currency.split(",");
      let coins = await Coins
        .find({deleted_at: null})
        .sort('id', 'DESC');
      for (let index = 0; index < coins.length; index++) {
        const coin = coins[index];
        let price = 0;
        let walletDataArray = await Wallet
          .find({coin_id: coin.id, user_id: req.user.id})
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
            }
            coin[currencyName] = price;
          }
          coins[index] = coin;
        }
      }
      return res.json({status: 200, message: "Wallet balance retrived successfully.", coins});

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

  sendCoin: async function (req, res) {
    try {
      let {amount, destination_address, coin_code} = req.allParams();
      let user_id = req.user.id;
      let coin = await Coins.findOne({deleted_at: null, is_active: true, coin: coin_code});
      if (coin) {
        let wallet = await Wallet.findOne({deleted_at: null, coin_id: coin.id, is_active: true, user_id: user_id});
        if (wallet) {
          if (wallet.placed_balance >= parseInt(amount)) {
            console.log("transfer");
            if (coin.type == 1) {
              var bitgo = new BitGoJS.BitGo({env: sails.config.local.BITGO_ENV_MODE, accessToken: sails.config.local.BITGO_ACCESS_TOKEN});
              var bitgoWallet = await bitgo
                .coin(coin.coin)
                .wallets()
                .get({id: coin.wallet_address});
              let params = {
                amount: amount * 1e8,
                address: destination_address,
                walletPassphrase: sails.config.local.BITGO_PASSPHRASE
              };
              bitgoWallet
                .send(params)
                .then(async function (transaction) {
                  console.log("transaction", transaction);
                  let walletHistory = {
                    coin_id: wallet.coin_id,
                    source_address: wallet.receive_address,
                    destination_address: destination_address,
                    user_id: user_id,
                    amount: amount,
                    transaction_type: 'send',
                    transaction_id: transaction.id
                  }
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
                  return res.json({status: 200, message: "Token send successfully"});
                });
            }
          } else {
            return res
              .status(400)
              .json({status: 400, message: "Issuficient coin balance in wallet"});

          }
        } else {
          return res
            .status(400)
            .json({status: 400, message: "Issuficient coin balance in wallet"});

        }
      } else {
        return res
          .status(400)
          .json({status: 400, message: "Coin or token not available"});

      }
    } catch (error) {
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  },

  //receive coin
  getReceiveCoin: async function (req, res) {
    try {
      var {coin} = req.allParams();
      var user_id = req.user.id;
      var receiveCoin = await sails
        .helpers
        .wallet
        .receiveCoin(coin, user_id);

      return res.json({status: 200, message: "Receive address retrieved successfuly", receiveCoin});
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

  getWalletTransactionHistory: async function (req, res) {
    try {
      let {coinReceive} = req.body;
      let coinData = await Coins.findOne({coin: coinReceive, deleted_at: null});
      console.log("Coin Data ::: ", coinData);
      console.log(req.user.id);
      let walletTransData = await WalletHistory.find({user_id: req.user.id, coin_id: coinData.id, deleted_at: null});
      console.log("wallet Transfer Data ", walletTransData);
      walletTransData[0]['coin_code'] = coinData.coin_code;
      console.log('walletTransData', walletTransData)

      let walletTransCount = await WalletHistory.count({user_id: req.user.id, coin_id: coinData.id, deleted_at: null});
      if (walletTransData) {
        return res.json({status: 200, message: "Wallet data retrived successfully.", walletTransData, walletTransCount})
      } else {
        return res.json({status: 200, message: "No data found."})
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
