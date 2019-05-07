/**
 * WithdrawReqController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  // ---------------------------Web Api------------------------------
  // -------------------------------CMS Api--------------------------
  getAllWithdrawReq: async function (req, res) {
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

    let query = " from withdraw_request LEFT JOIN users ON withdraw_request.user_id = users.id";
    let whereAppended = false;

    if ((data && data != "")) {
      if (data && data != "" && data != null) {
        query += " WHERE"
        whereAppended = true;
        query += " (LOWER(users.email) LIKE '%" + data.toLowerCase() + "%' OR LOWER(withdraw_request.source_address) LIKE '%" + data.toLowerCase() + "%' OR LOWER(withdraw_request.destination_address) LIKE '%" + data.toLowerCase() + "%'";
        if (!isNaN(data)) {
          query += " OR withdraw_request.amount=" + data;
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
      query += " withdraw_request.user_id=" + user_id
    }

    if (t_type && t_type != "") {
      if (whereAppended) {
        query += " AND "
      } else {
        query += " WHERE "
      }
      whereAppended = true;
      query += " withdraw_request.transaction_type=" + t_type;
    }

    if (start_date && end_date) {
      if (whereAppended) {
        query += " AND "
      } else {
        query += " WHERE "
      }

      query += " withdraw_request.created_at >= '" + await sails
        .helpers
        .dateFormat(start_date) + " 00:00:00' AND withdraw_request.created_at <= '" + await sails
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
    console.log('query', query)

    let withdrawReqData = await sails.sendNativeQuery("Select withdraw_request.*, users.email " + query, [])
    withdrawReqData = withdrawReqData.rows;

    let withdrawReqCount = await sails.sendNativeQuery("Select COUNT(withdraw_request.id)" + countQuery, [])
    withdrawReqCount = withdrawReqCount.rows[0].count;

    if (withdrawReqData) {
      return res.json({
        "status": 200,
        "message": sails.__("Withdraw Request list"),
        "data": withdrawReqData,
        withdrawReqCount
      });
    }
  }
};
