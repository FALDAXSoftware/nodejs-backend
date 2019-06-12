/**
 * TransactionController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
var moment = require

module.exports = {
  // ---------------------------Web Api------------------------------
  // -------------------------------CMS Api--------------------------
  getAllTransactions: async function (req, res) {
    // req.setLocale('en')
    let {
      page,
      limit,
      data,
      t_type,
      start_date,
      end_date,
      user_id,
      sort_col,
      sort_order
    } = req.allParams();

    let query = " from wallet_history LEFT JOIN users ON wallet_history.user_id = users.id LEFT JOIN coins ON  wallet_history.coin_id = coins.id";
    let whereAppended = false;

    if ((data && data != "")) {
      if (data && data != "" && data != null) {
        query += " WHERE"
        whereAppended = true;
        query += " (LOWER(users.email) LIKE '%" + data.toLowerCase() + "%' OR LOWER(wallet_history.source_address) LIKE '%" + data.toLowerCase() + "%' OR LOWER(wallet_history.transaction_id) LIKE '%" + data.toLowerCase() + "%' OR LOWER(wallet_history.destination_address) LIKE '%" + data.toLowerCase() + "%'";
        if (!isNaN(data)) {
          query += " OR wallet_history.amount=" + data;
        }
        query += ")"
      }
    }

    if (user_id) {
      if (whereAppended) {
        query += " AND "
      } else {
        query += " WHERE "
      }
      whereAppended = true;
      query += " wallet_history.user_id=" + user_id
    }

    if (t_type && t_type.trim() != "") {
      if (whereAppended) {
        query += " AND "
      } else {
        query += " WHERE "
      }
      whereAppended = true;
      query += "  wallet_history.transaction_type='" + t_type + "'";
    }

    if (start_date && end_date) {
      if (whereAppended) {
        query += " AND "
      } else {
        query += " WHERE "
      }

      query += " wallet_history.created_at >= '" + await sails
        .helpers
        .dateFormat(start_date) + " 00:00:00' AND wallet_history.created_at <= '" + await sails
          .helpers
          .dateFormat(end_date) + " 23:59:59'";
    }

    countQuery = query;

    if (sort_col && sort_order) {
      let sortVal = (sort_order == 'descend'
        ? 'DESC'
        : 'ASC');
      query += " ORDER BY " + sort_col + " " + sortVal;
    }
    query += " limit " + limit + " offset " + (parseInt(limit) * (parseInt(page) - 1))
    console.log(query)

    let transactionData = await sails.sendNativeQuery("Select wallet_history.*, users.email " + query, [])
    transactionData = transactionData.rows;

    let transactionCount = await sails.sendNativeQuery("Select COUNT(wallet_history.id)" + countQuery, [])
    transactionCount = transactionCount.rows[0].count;

    if (transactionData) {
      return res.json({
        "status": 200,
        "message": sails.__("Transaction list"),
        "data": transactionData,
        transactionCount
      });
    }
  },

  getUserTransactions: async function (req, res) {
    // req.setLocale('en')
    let {
      page,
      limit,
      data,
      t_type,
      start_date,
      end_date,
      user_id,
      sort_col,
      sort_order
    } = req.allParams();

    let query = " from wallet_history LEFT JOIN users ON wallet_history.user_id = users.id LEFT J" +
      "OIN coins ON  wallet_history.coin_id = coins.id";
    let whereAppended = false;

    if ((data && data != "")) {
      if (data && data != "" && data != null) {
        query += " WHERE"
        whereAppended = true;
        query += " (LOWER(users.email) LIKE '%" + data.toLowerCase() + "%' OR LOWER(wallet_history.source_address) LIKE '%" + data.toLowerCase() + "%' OR LOWER(wallet_history.transaction_id) LIKE '%" + data.toLowerCase() + "%' OR LOWER(wallet_history.destination_address) LIKE '%" + data.toLowerCase() + "%'";
        if (!isNaN(data)) {
          query += " OR wallet_history.amount=" + data;
        }
        query += ")"
      }
    }

    if (user_id) {
      if (whereAppended) {
        query += " AND "
      } else {
        query += " WHERE "
      }
      whereAppended = true;
      query += " wallet_history.user_id=" + user_id
    }

    if (t_type && t_type != "") {
      if (whereAppended) {
        query += " AND "
      } else {
        query += " WHERE "
      }
      whereAppended = true;
      query += "  wallet_history.transaction_type='" + t_type + "'";
    }

    if (start_date && end_date) {
      if (whereAppended) {
        query += " AND "
      } else {
        query += " WHERE "
      }

      query += " wallet_history.created_at >= '" + await sails
        .helpers
        .dateFormat(start_date) + " 00:00:00' AND wallet_history.created_at <= '" + await sails
          .helpers
          .dateFormat(end_date) + " 23:59:59'";
    }

    countQuery = query;

    if (sort_col && sort_order) {
      let sortVal = (sort_order == 'descend'
        ? 'DESC'
        : 'ASC');
      query += " ORDER BY " + sort_col + " " + sortVal;
    }

    query += " limit " + limit + " offset " + (parseInt(limit) * (parseInt(page) - 1))

    let transactionData = await sails.sendNativeQuery("Select wallet_history.*, users.email " + query, [])
    transactionData = transactionData.rows;

    let transactionCount = await sails.sendNativeQuery("Select COUNT(wallet_history.id)" + countQuery, [])
    transactionCount = transactionCount.rows[0].count;

    if (transactionData) {
      return res.json({
        "status": 200,
        "message": sails.__("Transaction list"),
        "data": transactionData,
        transactionCount
      });
    }
  }
};
