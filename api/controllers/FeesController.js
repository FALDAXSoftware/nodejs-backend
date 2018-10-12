/**
 * FeesController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
    //---------------------------Web Api------------------------------

    //-------------------------------CMS Api--------------------------
    getAllFees: async function (req, res) {
        // req.setLocale('en')
        let { page, limit, data } = req.allParams();
        if (data) {
            let feesData = await Fees.find({
                where: {
                    deleted_at: null,
                    or: [{
                        name: { contains: data }
                    },
                    { coin_id1: { contains: data } }
                    ]
                }
            }).sort("id ASC").paginate(page, parseInt(limit));
            let FeesCount = await Fees.count({
                where: {
                    deleted_at: null,
                    or: [{
                        name: { contains: data }
                    },
                    { coin_id1: { contains: data } }
                    ]
                }
            });
            if (feesData) {
                return res.json({
                    "status": "200",
                    "message": sails.__("Fees list"),
                    "data": feesData, FeesCount
                });
            }
        } else {
            let feesData = await Fees.find({
                where: {
                    deleted_at: null,
                }
            }).sort("id ASC").paginate(page, parseInt(limit));
            let FeesCount = await Fees.count({
                where: {
                    deleted_at: null,
                }
            });
            if (feesData) {
                return res.json({
                    "status": "200",
                    "message": sails.__("Fees list"),
                    "data": feesData, FeesCount
                });
            }
        }
    },
};
