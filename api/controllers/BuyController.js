/**
 * BuyController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
    //---------------------------Web Api------------------------------
    getBuyBookDetails: async function (req, res) {
        // console.log("====>", req.query.room);
        let room = req.query.room;
        try {
            if (req.isSocket) {
                console.log(room);
                sails.sockets.join(req.socket, room, async function (err) {
                    if (err) {
                        console.log('>>>err', err);
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
            } else {
                console.log('>>>IN else')
                return res.status(403).json({ status: 403, "message": "Error occured" });
            }
        } catch (err) {
            console.log('>>>', err)
        }
    },

    //-------------------------------CMS Api--------------------------
    getAllBuyOrders: async function (req, res) {
        // req.setLocale('en')
        let { page, limit, data } = req.allParams();

        if (data) {
            let user_name = await Users.findOne({ select: ['full_name'], where: { id: req.body.userId } });

            let buyBookData = await buyBook.find({
                where: {
                    deleted_at: null,
                    user_id: req.body.user_id,
                    or: [
                        {
                            symbol: { contains: data }
                        },
                    ]
                }
            }).sort('id ASC').paginate(page, parseInt(limit));

            let buyBookCount = await buyBook.count({
                user_id: req.body.user_id,
            });
            if (buyBookData) {
                return res.json({
                    "status": 200,
                    "message": sails.__("Buy Order list"),
                    "data": buyBookData, buyBookCount, user_name
                });
            }
        } else {
            let user_name = await Users.findOne({ select: ['full_name'], where: { id: req.body.userId } });

            let buyBookData = await buyBook.find({
                where: {
                    deleted_at: null,
                    user_id: req.body.user_id,
                }
            }).sort("id ASC").paginate(page, parseInt(limit));

            let buyBookCount = await buyBook.count();

            if (buyBookData) {
                return res.json({
                    "status": 200,
                    "message": sails.__("Buy Order list"),
                    "data": buyBookData, buyBookCount, user_name
                });
            }
        }
    },
};
