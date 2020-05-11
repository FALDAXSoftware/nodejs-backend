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
        limit,
        start_date,
        end_date,
        t_type
      } = req.allParams();
      let query = " from residual_transactions LEFT JOIN coins ON residual_transactions.coin_id = coins.id  WHERE residual_transactions.deleted_at IS NULL ";

      if ((data && data != "")) {
        if (data && data != "" && data != null) {
          query += " AND "
          query += " (LOWER(residual_transactions.source_address) LIKE '%" + data.toLowerCase() + "%' OR LOWER(residual_transactions.transaction_id) LIKE '%" + data.toLowerCase() + "%' OR LOWER(coins.coin_code) LIKE '%" + data.toLowerCase() + "%' OR LOWER(residual_transactions.destination_address) LIKE '%" + data.toLowerCase() + "%'";
          query += ")"
        }
      }


      countQuery = query;

      if (t_type && t_type != "") {
        query += " AND LOWER(residual_transactions.transaction_type) LIKE '%" + t_type.toLowerCase() + "'"
      }

      if (start_date && end_date) {
        query += " AND "

        query += " residual_transactions.created_at >= '" + await sails
          .helpers
          .dateFormat(start_date) + " 00:00:00' AND residual_transactions.created_at <= '" + await sails
            .helpers
            .dateFormat(end_date) + " 23:59:59'";
      }


      if (sortCol && sortOrder) {
        let sortVal = (sortOrder == 'descend' ?
          'DESC' :
          'ASC');
        query += " ORDER BY " + sortCol + " " + sortVal;
      } else {
        query += " ORDER BY residual_transactions.id DESC";
      }

      query += " limit " + limit + " offset " + (parseInt(limit) * (parseInt(page) - 1));

      let get_data = await sails.sendNativeQuery("Select residual_transactions.*, coins.coin, coins.coin_code" + query, [])
      let total = await sails.sendNativeQuery("Select COUNT(residual_transactions.id)" + countQuery, [])
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
          .status(200)
          .json({
            status: 200,
            "err": sails.__("No record found").message,
            error_at: sails.__("No record found").message
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
          error_at: error.stack
        });
    }
  }
};
