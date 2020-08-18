/**
 * FeesController
 *
 * @description :: Server-side actions for handling fees.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  getAllFees: async function (req, res) {
    let query = " from fees ";
    countQuery = query;
    query += "ORDER BY id DESC";
    let allTradingFees = await sails.sendNativeQuery("Select id, trade_volume, maker_fee, taker_fee" + query, []);

    allTradingFees = allTradingFees.rows;

    let feesCount = await sails.sendNativeQuery("Select COUNT(id)" + countQuery, [])
    feesCount = feesCount.rows[0].count;
    if (allTradingFees) {
      return res.json({
        "status": 200,
        "message": sails.__("All fees retrived success").message,
        "data": allTradingFees,
        feesCount
      });
    } else {
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong").message,
          error_at: sails.__("Something Wrong").message
        });
    }
  },

  editFees: async function (req, res) {
    let fees = await Fees.findOne({
      id: req.body.fee_id,
      deleted_at: null
    })
    if (fees) {
      let updatedFee = await Fees
        .update({
          id: req.body.fee_id
        })
        .set({
          taker_fee: req.body.taker_fee,
          maker_fee: req.body.maker_fee
        })
        .fetch();
      if (updatedFee) {
        return res.json({
          "status": 200,
          "message": sails.__("Fees updated success").message
        });
      } else {
        return res
          .status(500)
          .json({
            status: 500,
            "err": sails.__("Something Wrong").message,
            error_at: sails.__("Something Wrong").message
          });
      }
    } else {
      return res
        .status(400)
        .json({
          status: 400,
          "err": sails.__("No record found").message
        });
    }
  },

  editTradeFees: async function (req, res) {
    try {
      var data = req.body;

      var getFeeValue = await Fees.findOne({
        where: {
          deleted_at: null,
          id: data.id
        }
      })

      if (getFeeValue) {
        var editFeeValue = await Fees
          .update({
            deleted_at: null,
            id: data.id
          })
          .set({
            maker_fee: data.maker_fee,
            taker_fee: data.taker_fee
          });
        return res.json({
          "status": 200,
          "message": sails.__("Fees updated success").message
        });
      } else {
        return res
          .status(500)
          .json({
            status: 500,
            "err": sails.__("No fee Value Found").message
          });
      }
    } catch (error) {
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong").message,
          error_at: sails.__("Something Wrong").message
        });
    }
  }
};
