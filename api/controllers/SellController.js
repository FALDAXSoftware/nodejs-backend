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

                sails.sockets.join(req.socket, 'test', function (err) {
                    console.log('>>>err', err)
                    return res.json({ "msg": "sell socket" });
                });

                //var socketId = sails.sockets.id(req);
                console.log('>>>IN IF SELLLLL')
                // let sellBookDetails = await sellBook.find({
                //     deleted_at: null,
                //     settle_currency: 'ETH',
                //     currency
                // }).sort('price', 'ASC');

                // if (sellBookDetails) {

                // }
            } else {
                console.log('>>>IN else')
            }


        } catch (err) {
            console.log('>>>', err)
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
