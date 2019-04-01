/**
 * FeesController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
    getAllFees: async function (req, res) {
        let allTradingFees = await Fees.find({ deleted_at: null });
        if (allTradingFees) {
            return res.json({
                "status": 200,
                "message": "All fees retrived successfully",
                "data": allTradingFees
            });
        } else {
            return res.status(500).json({
                status: 500,
                "err": sails.__("Something Wrong")
            });
        }
    },

    editFees: async function (req, res) {
        let fees = await Fees.findOne({ id: req.body.fee_id, deleted_at: null })
        if (fees) {
            let updatedFee = await Fees.update({ id: req.body.fee_id }).set({
                taker_fee: req.body.taker_fee,
                maker_fee: req.body.maker_fee
            }).fetch();
            if (updatedFee) {
                return res.json({
                    "status": 200,
                    "message": "Fees updated successfully",
                });
            } else {
                return res.status(500).json({
                    status: 500,
                    "err": sails.__("Something Wrong")
                });
            }
        } else {
            return res.status(400).json({
                status: 400,
                "err": "data not found"
            });
        }
    }
};
