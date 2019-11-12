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

    let query = " from transaction_table LEFT JOIN users ON transaction_table.user_id = users.id LEFT JOIN coins ON transaction_table.coin_id = coins.id";
    let whereAppended = false;

    if ((data && data != "")) {
      if (data && data != "" && data != null) {
        query += " WHERE"
        whereAppended = true;
        query += " (LOWER(users.email) LIKE '%" + data.toLowerCase() + "%' OR LOWER(transaction_table.source_address) LIKE '%" + data.toLowerCase() + "%' OR LOWER(transaction_table.transaction_id) LIKE '%" + data.toLowerCase() + "%' OR LOWER(transaction_table.destination_address) LIKE '%" + data.toLowerCase() + "%'";
        if (!isNaN(data)) {
          query += " OR transaction_table.amount=" + data;
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
      query += " transaction_table.user_id=" + user_id
    }

    if (t_type && t_type.trim() != "") {
      if (whereAppended) {
        query += " AND "
      } else {
        query += " WHERE "
      }
      whereAppended = true;
      query += "  transaction_table.transaction_type='" + t_type + "'";
    }

    if (start_date && end_date) {
      if (whereAppended) {
        query += " AND "
      } else {
        query += " WHERE "
      }

      query += " transaction_table.created_at >= '" + await sails
        .helpers
        .dateFormat(start_date) + " 00:00:00' AND transaction_table.created_at <= '" + await sails
        .helpers
        .dateFormat(end_date) + " 23:59:59'";
    }

    countQuery = query;

    if (sort_col && sort_order) {
      let sortVal = (sort_order == 'descend' ?
        'DESC' :
        'ASC');
      query += " ORDER BY " + sort_col + " " + sortVal;
    } else {
      query += " ORDER BY transaction_table.id DESC";
    }
    query += " limit " + limit + " offset " + (parseInt(limit) * (parseInt(page) - 1))

    let coinFee = await AdminSetting.findOne({
      where: {
        slug: 'default_send_coin_fee',
        deleted_at: null
      }
    });

    let transactionData = await sails.sendNativeQuery("Select transaction_table.*, users.email, coins.coin , coins.coin_code " + query, [])
    transactionData = transactionData.rows;

    let transactionCount = await sails.sendNativeQuery("Select COUNT(transaction_table.id)" + countQuery, [])
    transactionCount = transactionCount.rows[0].count;

    if (transactionData) {
      return res.json({
        "status": 200,
        "message": sails.__("Transaction list"),
        "data": transactionData,
        transactionCount,
        'default_send_Coin_fee': parseFloat(coinFee.value)
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

    let query = " from transaction_table LEFT JOIN users ON transaction_table.user_id = users.id LEFT J" +
      "OIN coins ON  transaction_table.coin_id = coins.id";
    let whereAppended = false;

    if ((data && data != "")) {
      if (data && data != "" && data != null) {
        query += " WHERE"
        whereAppended = true;
        query += " (LOWER(users.email) LIKE '%" + data.toLowerCase() + "%' OR LOWER(transaction_table.source_address) LIKE '%" + data.toLowerCase() + "%' OR LOWER(transaction_table.transaction_id) LIKE '%" + data.toLowerCase() + "%' OR LOWER(transaction_table.destination_address) LIKE '%" + data.toLowerCase() + "%'";
        if (!isNaN(data)) {
          query += " OR transaction_table.amount=" + data;
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
      query += " transaction_table.user_id=" + user_id
    }

    if (t_type && t_type != "") {
      if (whereAppended) {
        query += " AND "
      } else {
        query += " WHERE "
      }
      whereAppended = true;
      query += "  transaction_table.transaction_type='" + t_type + "'";
    }

    if (start_date && end_date) {
      if (whereAppended) {
        query += " AND "
      } else {
        query += " WHERE "
      }

      query += " transaction_table.created_at >= '" + await sails
        .helpers
        .dateFormat(start_date) + " 00:00:00' AND transaction_table.created_at <= '" + await sails
        .helpers
        .dateFormat(end_date) + " 23:59:59'";
    }

    countQuery = query;

    if (sort_col && sort_order) {
      let sortVal = (sort_order == 'descend' ?
        'DESC' :
        'ASC');
      query += " ORDER BY " + sort_col + " " + sortVal;
    }

    query += " limit " + limit + " offset " + (parseInt(limit) * (parseInt(page) - 1))

    let transactionData = await sails.sendNativeQuery("Select transaction_table.*, users.email " + query, [])
    transactionData = transactionData.rows;

    let transactionCount = await sails.sendNativeQuery("Select COUNT(transaction_table.id)" + countQuery, [])
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
