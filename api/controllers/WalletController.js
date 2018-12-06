/**
 * WalletController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
    getCoinBalanceForWallet: async function (req, res) {
        try {
            let { currency1, currency2, currency3 } = req.body;
            let walletBalance = [];
            let coins = await Coins.find({ deleted_at: null }).sort('id', 'DESC');

            coins.map(async (coin) => {
                var obj = coin;
                let walletData = await Wallet.findOne({ coin_id: coin.id });

                if (currency1 == currency2 == currency3) {
                    if (walletData && walletData.balance !== undefined) {
                        obj.balance = walletData.balance;
                        delete obj.coin_id;
                        if (obj.balance != 0) {
                            let last_price = await TradeHistory.find({
                                settle_currency: obj.coin_code,
                                currency: currency1
                            }).sort('id', 'DESC');

                            if (last_price.length == 0) {
                                obj.price = 0;
                            } else {
                                obj.price = last_price[0]['fill_price'];
                            }

                            obj.currency = currency1;

                        } else {
                            obj.price = 0;
                        }
                        walletBalance.push(obj);
                    }
                } else {
                    for (var i = 0; i < 3; i++) {
                        if (i == 0) {
                            currency1 = currency1;
                        } else if (i == 1) {
                            currency1 = currency2;
                        } else {
                            currency1 = currency3;
                        }
                        if (walletData && walletData.balance !== undefined) {
                            obj.balance = walletData.balance;
                            delete obj.coin_id;
                            if (obj.balance != 0) {
                                let last_price = await TradeHistory.find({
                                    settle_currency: obj.coin_code,
                                    currency: currency1
                                }).sort('id', 'DESC');

                                if (last_price.length == 0) {
                                    obj.price = 0;
                                } else {
                                    obj.price = last_price[0]['fill_price'];
                                }

                                obj.currency = currency1;

                            } else {
                                obj.price = 0;
                            }
                            walletBalance.push(obj);
                        }
                    }
                }
            })

            setTimeout(() => {
                if (walletBalance != null) {
                    return res.json({
                        status: 200,
                        message: "Wallet balance retrived successfully.",
                        walletBalance
                    })
                } else {
                    return res.status(500).json({
                        status: 500,
                        "err": "No wallet data found."
                    });
                }
            }, 2000);

        } catch (error) {
            return res.status(500).json({
                status: 500,
                "err": sails.__("Something Wrong")
            });
        }
    },

    getWalletTransactionHistory: async function (req, res) {
        try {
            let { user_id, coin_id } = req.body;

            let walletTransData = await WalletHistory.find({
                user_id,
                coin_id,
                deleted_at: null,
            });
            let walletTransCount = await WalletHistory.count({
                user_id,
                coin_id,
                deleted_at: null,
            });
            if (walletTransData) {
                return res.json({
                    status: 200,
                    message: "Wallet data retrived successfully.",
                    walletTransData,
                    walletTransCount
                })
            } else {
                return res.json({
                    status: 200,
                    message: "No data found.",
                })
            }
        } catch (err) {
            return res.status(500).json({
                status: 500,
                "err": sails.__("Something Wrong")
            });
        }
    }
};
