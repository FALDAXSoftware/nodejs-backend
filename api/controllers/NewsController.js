/**
 * NewsController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  // Get All News Pagination
  getAllNews: async function (req, res) {
    try {
      let {
        page,
        limit,
        data,
        filter_val,
        start_date,
        end_date,
        sort_col,
        sort_order
      } = req.allParams();

      let query = " from news";
      let whereAppended = false;
      if ((data && data != "")) {
        query += " WHERE"
        whereAppended = true;
        if (data && data != "" && data != null) {
          query += " (LOWER(link) LIKE '%" + data.toLowerCase() + "%'OR LOWER(title) LIKE '%" + data.toLowerCase() + "%'OR LOWER(description) LIKE '%" + data.toLowerCase() + "%'";
          if (filter_val && filter_val != "") {
            query += " AND owner = '" + filter_val + "'";
          }
          query += ")"
        }
      }

      if (filter_val && filter_val != " ") {
        query += whereAppended ? " AND " : " WHERE ";
        whereAppended = true;
        query += "owner = '" + filter_val + "'";
      }

      if (start_date && end_date) {
        query += whereAppended ? " AND " : " WHERE ";
        query += " posted_at >= '" + await sails
          .helpers
          .dateFormat(start_date) + " 00:00:00' AND posted_at <= '" + await sails
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
      query += " limit " + limit + " offset " + (parseInt(limit) * (parseInt(page) - 1));

      let news = await sails.sendNativeQuery("Select *" + query, []);
      news = news.rows;

      let newsCount = await sails.sendNativeQuery("Select COUNT(id)" + countQuery, [])
      newsCount = newsCount.rows[0].count;

      return res.json({
        "status": 200,
        "message": sails.__("News retrived success"),
        "data": news,
        newsCount
      });
    } catch (error) {
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  },
  // Change News Status
  changeNewsStatus: async function (req, res) {
    try {
      let { id, is_active } = req.body;
      await News
        .update({ id: id })
        .set({ is_active });
      return res.json({
        "status": 200,
        "message": sails.__("News Status Update success")
      });
    } catch (error) {
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  },

  // get news details
  getNewsDetails: async function (req, res) {
    try {
      let { news_id } = req.allParams();
      let newsDetails = await News.findOne({ id: news_id });
      if (newsDetails) {
        return res.json({
          "status": 200,
          "message": sails.__("News Status Update success"),
          data: newsDetails
        });
      } else {
        return res.json({
          "status": 400,
          "message": sails.__("No news found")
        });
      }
    } catch (error) {
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  }
};
