/**
 * BuyController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
    //---------------------------Web Api------------------------------
    getBuyBookDetails: async function (req, res) {
        let room = req.query.room;
        try {
            if (req.isSocket) {
                if (req.query.prevRoom) {
                    let prevRoom = req.query.prevRoom;
                    sails.sockets.leave(req.socket, prevRoom, function (err) {
                        if (err) {
                            return res.status(403).json({ status: 403, "message": "Error occured" });
                        } else {
                            sails.sockets.join(req.socket, room, async function (err) {
                                if (err) {
                                    return res.status(403).json({ status: 403, "message": "Error occured" });
                                } else {
                                    let { crypto, currency } = await sails
                                        .helpers
                                        .utilities
                                        .getCurrencies(room);
                                    let buyBookDetails = await sails
                                        .helpers
                                        .tradding
                                        .buy
                                        .getBuyBookOrders(crypto, currency);
                                    if (buyBookDetails) {
                                        return res.json({
                                            status: 200,
                                            data: buyBookDetails,
                                            "message": "Buy data retrived successfully."
                                        });
                                    }
                                }
                            });
                        }
                    });
                } else {
                    sails.sockets.join(req.socket, room, async function (err) {
                        if (err) {
                            return res.status(403).json({ status: 403, "message": "Error occured" });
                        } else {
                            let { crypto, currency } = await sails
                                .helpers
                                .utilities
                                .getCurrencies(room);
                            let buyBookDetails = await sails
                                .helpers
                                .tradding
                                .buy
                                .getBuyBookOrders(crypto, currency);

                            if (buyBookDetails) {
                                return res.json({
                                    status: 200,
                                    data: buyBookDetails,
                                    "message": "Buy data retrived successfully."
                                });
                            }
                        }
                    });
                }
            } else {
                return res.status(403).json({ status: 403, "message": "Error occured" });
            }
        } catch (err) {
            console.log('>>>', err);
            return res
                .status(500)
                .json({ "status": 500, "err": err });
        }
    },

    //-------------------------------CMS Api--------------------------
    getAllBuyOrders: async function (req, res) {
        let { page, limit, data } = req.allParams();
        let query = " from buy_book";
        if ((data && data != "")) {
            query += " WHERE"
            if (data && data != "" && data != null) {
                query = query + " LOWER(symbol) LIKE '%" + data.toLowerCase() + "%'";
                if (!isNaN(data)) {
                    query = query + " OR fill_price=" + data + " OR quantity=" + data;
                }
            }
        }
        countQuery = query;
        query = query + " limit " + limit + " offset " + (parseInt(limit) * (parseInt(page) - 1))
        let buyBookData = await sails.sendNativeQuery("Select *" + query, [])

        buyBookData = buyBookData.rows;

        let buyBookCount = await sails.sendNativeQuery("Select COUNT(id)" + countQuery, [])
        buyBookCount = buyBookCount.rows[0].count;

        if (buyBookData) {
            return res.json({
                "status": 200,
                "message": sails.__("Buy Order list"),
                "data": buyBookData, buyBookCount
            });
        }
    },
};
