/**
 * CoinsController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
    //---------------------------Web Api------------------------------
    getAllCoins: async function (req, res) {
        try {
            let { page, limit, data } = req.allParams();
            if (data) {
                var balanceRes = await sails.sendNativeQuery("SELECT coins.*, wallets.balance, wallets.placed_balance FROM coins LEFT JOIN wallets ON coins.id = wallets.coin_id WHERE (coins.coin_name LIKE '%" + data + "%' OR coins.coin_code LIKE '%" + data + "%') AND coins.is_active = true AND coins.deleted_at IS NULL ORDER BY wallets.balance DESC LIMIT " + limit + " OFFSET " + (limit * (page - 1)));

                let allCoinsCount = await Coins.count({
                    where: {
                        deleted_at: null,
                        is_active: true,
                        or: [{
                            coin_name: { contains: data }
                        },
                        { coin_code: { contains: data } }
                        ]
                    }
                });
                if (balanceRes) {
                    return res.json({
                        "status": 200,
                        "message": sails.__("Coin list"),
                        "data": balanceRes, allCoinsCount
                    });
                }
            } else {
                var balanceRes = await sails.sendNativeQuery(`SELECT coins.*, wallets.balance, wallets.placed_balance FROM coins LEFT JOIN wallets ON coins.id = wallets.coin_id WHERE coins.is_active = true AND coins.deleted_at IS NULL ORDER BY wallets.balance DESC LIMIT ${limit} OFFSET ${page} `);

                let allCoinsCount = await Coins.count({
                    where: {
                        deleted_at: null,
                        is_active: true
                    }
                });

                if (balanceRes) {
                    return res.json({
                        "status": 200,
                        "message": sails.__("Coin list"),
                        "data": balanceRes, allCoinsCount
                    });
                }
            }
        } catch (err) {
            console.log('>>>>err', err);
            res.status(500).json({
                status: 500,
                "err": sails.__("Something Wrong")
            });
            return;
        }
    },

    //-------------------------------CMS Api--------------------------
    getCoins: async function (req, res) {
        // req.setLocale('en')
        let { page, limit, data } = req.allParams();
        if (data) {
            let coinsData = await Coins.find({
                where: {
                    deleted_at: null,
                    or: [{
                        coin_name: { contains: data }
                    },
                    { coin_code: { contains: data } }
                    ]
                }
            }).sort("id ASC").paginate(page - 1, parseInt(limit));
            let CoinsCount = await Coins.count({
                where: {
                    deleted_at: null,
                    or: [{
                        coin_name: { contains: data }
                    },
                    { coin_code: { contains: data } }
                    ]
                }
            });
            if (coinsData) {
                return res.json({
                    "status": 200,
                    "message": sails.__("Coin list"),
                    "data": coinsData, CoinsCount
                });
            }
        } else {
            let coinsData = await Coins.find({
                where: {
                    deleted_at: null,
                }
            }).sort("id ASC").paginate(page - 1, parseInt(limit));
            let CoinsCount = await Coins.count({
                where: {
                    deleted_at: null,
                }
            });
            if (coinsData) {
                return res.json({
                    "status": 200,
                    "message": sails.__("Coin list"),
                    "data": coinsData, CoinsCount
                });
            }
        }
    },

    create: async function (req, res) {
        try {
            if (req.body.coin_name && req.body.coin_code && req.body.limit && req.body.wallet_address) {
                let existingCoin = await Coins.find({
                    deleted_at: null,
                    or: [
                        { coin_name: req.body.coin_name },
                        { coin_code: req.body.coin_code },
                    ]
                });
                if (existingCoin.length > 0) {
                    res.status(400).json({
                        "status": 400,
                        "err": "Coin name or code already in use.",
                    });
                    return;
                }
                var coins_detail = await Coins.create({
                    coin_name: req.body.coin_name,
                    coin_code: req.body.coin_code,
                    limit: req.body.limit,
                    wallet_address: req.body.wallet_address,
                    created_at: new Date()
                }).fetch();
                if (coins_detail) {
                    //Send verification email in before create
                    res.json({
                        "status": 200,
                        "message": "Coin created successfully."
                    });
                    return;
                } else {
                    res.status(400).json({
                        "status": 400,
                        "err": "Something went wrong",
                    });
                    return;
                }
            } else {
                res.status(400).json({
                    "status": 400,
                    "err": "coin id is not sent",
                });
                return;
            }
        } catch (error) {
            res.status(500).json({
                status: 500,
                "err": sails.__("Something Wrong")
            });
            return;
        }
    },

    update: async function (req, res) {
        try {

            const coin_details = await Coins.findOne({ id: req.body.coin_id });
            if (!coin_details) {
                return res.status(401).json({ status: 401, err: 'Invalid coin' });
            }
            let existingCoin = await Coins.find({
                deleted_at: null,
                id: { '!=': req.body.coin_id },
                or: [
                    { coin_name: req.body.coin_name },
                    { coin_code: req.body.coin_code },
                ]
            });
            if (existingCoin.length > 0) {
                res.status(400).json({
                    "status": 400,
                    "err": "Coin name or code already in use.",
                });
                return;
            }
            var coinData = {
                id: req.body.coin_id, ...req.body
            }
            var updatedCoin = await Coins.update({ id: req.body.coin_id }).set(req.body).fetch();
            if (!updatedCoin) {
                return res.json({
                    "status": 200,
                    "message": "Something went wrong! could not able to update coin details"
                });
            }
            return res.json({
                "status": 200,
                "message": "Coin details updated successfully"
            });
        } catch (error) {
            res.status(500).json({
                status: 500,
                "err": sails.__("Something Wrong")
            });
            return;
        }
    },

    delete: async function (req, res) {
        let { id } = req.allParams();
        if (!id) {
            res.status(500).json({
                "status": 500,
                "err": "Coin id is not sent"
            });
            return;
        }
        let coinData = await Coins.update({ id: id }).set({ deleted_at: new Date() }).fetch();
        if (coinData) {
            return res.status(200).json({
                "status": 200,
                "message": "Coin deleted successfully"
            });
        }
    },
};
