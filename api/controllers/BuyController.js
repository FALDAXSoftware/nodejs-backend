/**
 * BuyController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
    //---------------------------Web Api------------------------------
    getBuyBookDetails: async function (req, res) {
        try {
            if (req.isSocket) {
                sails.sockets.join(req.socket, 'test', async function (err) {
                    if (err) {
                        console.log('>>>err', err);
                        return res.status(403).json({ status: 403, "message": "Error occured" });
                    } else {
                        let buyBookDetails = await buyBook.find({
                            deleted_at: null,
                            settle_currency: 'ETH'
                        }).sort('price', 'DESC');

                        if (buyBookDetails) {
                            return res.json({
                                status: 200,
                                buyBookDetails,
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
            console.log('>>>', err)
        }
    },

    //-------------------------------CMS Api--------------------------
    getAllBuyOrders: async function (req, res) {
        // req.setLocale('en')
        let { page, limit, data } = req.allParams();

        if (data) {
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
                    "data": buyBookData, buyBookCount
                });
            }
        } else {
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
                    "data": buyBookData, buyBookCount
                });
            }
        }
    },
};
