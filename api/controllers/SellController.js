/**
 * SellController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
    //---------------------------Web Api------------------------------
    getSellBookDetails: async function (req, res) {
        try {
            if (req.isSocket) {
                sails.sockets.join(req.socket, 'test', async function (err) {
                    if (err) {
                        console.log('>>>err', err);
                        return res.status(403).json({ status: 403, "message": "Error occured" });
                    } else {
                        let sellBookDetails = await sellBook.find({
                            deleted_at: null,
                            settle_currency: 'ETH',
                            currency
                        }).sort('price', 'ASC');

                        if (sellBookDetails) {
                            return res.json({
                                status: 200,
                                sellBookDetails,
                                "message": "Sell data retrived successfully."
                            });
                        }
                    }
                });
            } else {
                console.log('>>>IN else')
                return res.status(403).json({ status: 403, "message": "Error occured" });
            }
        } catch (err) {
            return res.status(500).json({
                "status": 500,
                "err": sails.__("Something Wrong")
            });
        }
    },

    getData: async function (req, res) {
        try {
            console.log('>getData>>');
            sails.sockets.broadcast('test', { 'message': 'blahhhh' });

        } catch (err) {
            console.log('>getData>>', err)
        }
    },

    //-------------------------------CMS Api--------------------------
    getAllSellOrders: async function (req, res) {
        // req.setLocale('en')
        let { page, limit, data } = req.allParams();

        if (data) {
            let sellBookData = await sellBook.find({
                user_id: req.body.user_id
            }).sort('id ASC').paginate(page, parseInt(limit));

            let sellBookCount = await sellBook.count({
                user_id: req.body.user_id,
            });
            if (sellBookData) {
                return res.json({
                    "status": 200,
                    "message": sails.__("Sell Order list"),
                    "data": sellBookData, sellBookCount
                });
            }
        } else {
            let sellBookData = await sellBook.find({
                where: {
                    deleted_at: null,
                }
            }).sort("id ASC").paginate(page, parseInt(limit));

            let sellBookCount = await sellBook.count();

            if (sellBookData) {
                return res.json({
                    "status": 200,
                    "message": sails.__("Sell Order list"),
                    "data": sellBookData, sellBookCount
                });
            }
        }
    },
};
