/**
 * SellController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
    //---------------------------Web Api------------------------------

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
