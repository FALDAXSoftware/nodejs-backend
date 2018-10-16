/**
 * PairsController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
    //---------------------------Web Api------------------------------

    //-------------------------------CMS Api--------------------------
    getAllPairs: async function (req, res) {
        // req.setLocale('en')
        let { page, limit, data } = req.allParams();
        if (data) {
            let pairData = await Pairs.find({
                where: {
                    deleted_at: null,
                    or: [{
                        name: { contains: data }
                    },
                    { coin_code1: { contains: data } },
                    { coin_code2: { contains: data } }
                    ]
                }
            }).sort("id ASC").paginate(page, parseInt(limit));
            let pairsCount = await Pairs.count({
                where: {
                    deleted_at: null,
                    or: [{
                        name: { contains: data }
                    },
                    { coin_code1: { contains: data } },
                    { coin_code2: { contains: data } }
                    ]
                }
            });
            if (pairData) {
                return res.json({
                    "status": "200",
                    "message": sails.__("Pair list"),
                    "data": pairData, pairsCount
                });
            }
        } else {
            let pairData = await Pairs.find({
                where: {
                    deleted_at: null,
                }
            }).sort("id ASC").paginate(page, parseInt(limit));

            let allCoins = await Coins.find({ where: { is_active: true }, select: ['id', 'coin_name', 'coin_code'] });
            let pairsCount = await Pairs.count({
                where: {
                    deleted_at: null,
                }
            });

            if (pairData) {
                return res.json({
                    "status": "200",
                    "message": sails.__("Pair list"),
                    "data": pairData, pairsCount, allCoins
                });
            }
        }
    },

    createPair: async function (req, res) {
        try {
            if (req.body.name && req.body.coin_code1 && req.body.coin_code1) {

                let coinID_1 = await Coins.findOne({ coin_code: req.body.coin_code1 });
                let coinID_2 = await Coins.findOne({ coin_code: req.body.coin_code1 });

                var pair_details = await Pairs.create({
                    name: req.body.name,
                    coin_code1: coinID_1.id,
                    coin_code2: coinID_2.id,
                    maker_fee: req.body.maker_fee,
                    taker_fee: req.body.taker_fee,
                    created_at: new Date()
                }).fetch();
                if (pair_details) {
                    res.json({
                        "status": 200,
                        "message": sails.__('Create Pair')
                    });
                    return;
                } else {
                    res.json({
                        "status": 400,
                        "message": "not listed",
                        "error": "Something went wrong",
                    });
                    return;
                }
            } else {
                res.json({
                    "status": 400,
                    "message": "not listed",
                    "error": "Pair Name & coin is not sent",
                });
                return;
            }
        } catch (error) {
            res.status(500).json({
                "status": "500",
                "message": "error",
                "errors": error
            });
            return;
        }
    },

    updatePair: async function (req, res) {
        try {
            if (req.body.id) {
                const pair_details = await Pairs.findOne({ id: req.body.id });
                if (!pair_details) {
                    return res.status(401).json({ err: 'invalid coin' });
                }
                var updatedPair = await Pairs.update({ id: req.body.id }).set(req.body).fetch();
                if (!updatedPair) {
                    return res.json({
                        "status": "200",
                        "message": "Something went wrong!"
                    });
                }
                return res.json({
                    "status": "200",
                    "message": sails.__('Update Pair')
                });
            } else {
                return res.status(400).json({ 'status': '400', 'message': 'pair id is not sent.' })
            }
        } catch (error) {
            res.json({
                "status": "500",
                "message": "error",
                "errors": error
            });
            return;
        }
    }
};
