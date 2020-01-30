/**
 * ResidualTransactionController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const moment = require('moment');
var logger = require('../controllers/logger')
const {
  Validator
} = require('node-input-validator');

module.exports = {

  /**
   * get Transactions list
   */
  list: async function (req, res) {
    try {
      if (!req.user.isAdmin) {
        return res.status(403).json({
          status: 403,
          err: sails.__('Unauthorized Access').message
        });
      }
      let {
        sortCol,
        sortOrder,
        data,
        page,
        limit
      } = req.allParams();
      let query = " from residual_transactions WHERE deleted_at IS NULL ";

      if ((data && data != "")) {
        if (data && data != "" && data != null) {
          query = query + " AND (transaction_from='" + data + "')";
        }
      }
      countQuery = query;

      if (sortCol && sortOrder) {
        let sortVal = (sortOrder == 'descend' ?
          'DESC' :
          'ASC');
        query += " ORDER BY " + sortCol + " " + sortVal;
      } else {
        query += " ORDER BY id DESC";
      }

      query += " limit " + limit + " offset " + (parseInt(limit) * (parseInt(page) - 1));

      let get_data = await sails.sendNativeQuery("Select *" + query, [])
      let total = await sails.sendNativeQuery("Select COUNT(id)" + countQuery, [])
      total = total.rows[0].count;
      if (get_data.rowCount > 0) {
        return res
          .status(200)
          .json({
            "status": 200,
            "message": sails.__("Record found").message,
            "data": {
              transactions: get_data.rows,
              total
            }
          })
      } else {
        return res
          .status(500)
          .json({
            status: 500,
            "err": sails.__("No record found").message,
            error_at:sails.__("No record found").message
          });
      }

    } catch (error) {
      // console.log("error", error);
      // await logger.error(error.message)
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong").message,
          error_at:error.stack
        });
    }
  }
};
