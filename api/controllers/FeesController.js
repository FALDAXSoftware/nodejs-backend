/**
 * FeesController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  getAllFees: async function (req, res) {
    let {page, limit, data, sortCol, sortOrder} = req.allParams();
    console.log('sortCol, sortOrder', sortCol, sortOrder)
    let query = " from fees";
    countQuery = query;
    if (sortCol && sortOrder) {
      let sortVal = (sortOrder == 'descend'
        ? 'DESC'
        : 'ASC');
      query += " ORDER BY " + sortCol + " " + sortVal;
    }
    query += " limit " + limit + " offset " + (parseInt(limit) * (parseInt(page) - 1));

    console.log('query users', query)
    let allTradingFees = await sails.sendNativeQuery("Select *" + query, []);

    allTradingFees = allTradingFees.rows;

    let feesCount = await sails.sendNativeQuery("Select COUNT(id)" + countQuery, [])
    feesCount = feesCount.rows[0].count;
    if (allTradingFees) {
      return res.json({"status": 200, "message": "All fees retrived successfully", "data": allTradingFees, feesCount});
    } else {
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  },

  editFees: async function (req, res) {
    let fees = await Fees.findOne({id: req.body.fee_id, deleted_at: null})
    if (fees) {
      let updatedFee = await Fees
        .update({id: req.body.fee_id})
        .set({taker_fee: req.body.taker_fee, maker_fee: req.body.maker_fee})
        .fetch();
      if (updatedFee) {
        return res.json({"status": 200, "message": "Fees updated successfully"});
      } else {
        return res
          .status(500)
          .json({
            status: 500,
            "err": sails.__("Something Wrong")
          });
      }
    } else {
      return res
        .status(400)
        .json({status: 400, "err": "data not found"});
    }
  }
};
