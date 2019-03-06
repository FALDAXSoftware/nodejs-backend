/**
 * SellController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
    //---------------------------Web Api------------------------------
    getSellBookDetails: async function (req, res) {
        let room = req.query.room;
        try {
            if (req.isSocket) {

                if (req.query.prevRoom) {
                    let prevRoom = req.query.prevRoom;
                    sails.sockets.leave(req.socket, prevRoom, function (leaveErr) {
                        if (leaveErr) {
                            console.log('>>>leaveErr', leaveErr);
                            return res.status(403).json({ status: 403, "message": "Error occured" });
                        } else {
                            sails.sockets.join(req.socket, room, async function (err) {
                                if (err) {
                                    console.log('>>>err', err);
                                    return res.status(403).json({ status: 403, "message": "Error occured" });
                                } else {
                                    let { crypto, currency } = await sails
                                        .helpers
                                        .utilities
                                        .getCurrencies(room);
                                    let sellBookDetails = await sails
                                        .helpers
                                        .tradding
                                        .sell
                                        .getSellBookOrders(crypto, currency);

                                    if (sellBookDetails) {
                                        return res.json({
                                            status: 200,
                                            data: sellBookDetails,
                                            "message": "Sell data retrived successfully."
                                        });
                                    }
                                }
                            });
                        }
                    });
                } else {
                    sails.sockets.join(req.socket, room, async function (err) {
                        if (err) {
                            console.log('>>>err', err);
                            return res.status(403).json({ status: 403, "message": "Error occured" });
                        } else {
                            let { crypto, currency } = await sails
                                .helpers
                                .utilities
                                .getCurrencies(room);
                            let sellBookDetails = await sails
                                .helpers
                                .tradding
                                .sell
                                .getSellBookOrders(crypto, currency);

                            if (sellBookDetails) {
                                return res.json({
                                    status: 200,
                                    data: sellBookDetails,
                                    "message": "Sell data retrived successfully."
                                });
                            }
                        }
                    });
                }

            } else {
                return res.status(403).json({ status: 403, "message": "Error occured" });
            }
        } catch (err) {
            console.log('>>>', err)
        }
    },

    getData: async function (req, res) {
        try {
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
                where: {
                    deleted_at: null,
                    user_id: req.body.user_id,
                    or: [
                        { symbol: { contains: data } },
                    ]
                }
            }).sort('id ASC').paginate(page, parseInt(limit));

            let sellBookCount = await sellBook.count({
                user_id: req.body.user_id,
                deleted_at: null,
                or: [
                    { symbol: { contains: data } },
                ]
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
                    user_id: req.body.user_id,
                }
            }).sort("id ASC").paginate(page, parseInt(limit));

            let sellBookCount = await sellBook.count({
                where: {
                    deleted_at: null,
                    user_id: req.body.user_id,
                }
            });

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
