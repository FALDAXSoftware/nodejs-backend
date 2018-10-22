/**
 * BuyController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
    //---------------------------Web Api------------------------------

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
                    "status": "200",
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
                    "status": "200",
                    "message": sails.__("Buy Order list"),
                    "data": buyBookData, buyBookCount
                });
            }
        }
    },
};
