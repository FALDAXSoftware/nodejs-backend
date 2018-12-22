/**
 * WalletController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
    getCoinBalanceForWallet: async function(req, res) {
        try {
            let { currency } = req.body;
            let currencyArray = currency.split(",");
            let coins = await Coins
                .find({ deleted_at: null })
                .sort('id', 'DESC');
            for (let index = 0; index < coins.length; index++) {
                const coin = coins[index];
                let price = 0;
                let walletDataArray = await Wallet.find({ coin_id: coin.id, user_id: req.user.id }).sort("created_at DESC");
                let walletData = walletDataArray[0];
                coin['balance'] = 0;
                if (walletData && walletData.balance !== undefined) {
                    coin['balance'] = walletData.balance;
                    for (let innerIndex = 0; innerIndex < currencyArray.length; innerIndex++) {
                        const currencyName = currencyArray[innerIndex];
                        let last_price = await TradeHistory
                            .find({ where: { settle_currency: coin.coin, currency: currencyName }, sort: 'id DESC', limit: 1 });
                        if (last_price.length > 0) {
                            price = last_price[0].fill_price
                        }
                        coin[currencyName] = price;
                    }
                    coins[index] = coin;
                }
            }
            return res.json({ status: 200, message: "Wallet balance retrived successfully.", coins });

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

    //receive coin
    getReceiveCoin: async function(req, res) {
        try {
            var { coin } = req.allParams();
            var user_id = req.user.id;
            var receiveCoin = await sails
                .helpers
                .wallet
                .receiveCoin(coin, user_id);

            return res.json({ status: 200, message: "Receive address retrieved successfuly", receiveCoin });
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

    getWalletTransactionHistory: async function(req, res) {
        try {
            let { coinReceive } = req.body;
            let coinData = await Coins.findOne({ coin: coinReceive, deleted_at: null });

            let walletTransData = await WalletHistory.find({ user_id: req.user.id, coin_id: coinData.id, deleted_at: null });

            walletTransData[0]['coin_code'] = coinData.coin_code;
            console.log('walletTransData', walletTransData)

            let walletTransCount = await WalletHistory.count({ user_id: req.user.id, coin_id: coinData.id, deleted_at: null });
            if (walletTransData) {
                return res.json({ status: 200, message: "Wallet data retrived successfully.", walletTransData, walletTransCount })
            } else {
                return res.json({ status: 200, message: "No data found." })
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
