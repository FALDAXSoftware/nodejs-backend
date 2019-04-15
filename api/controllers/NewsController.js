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
        filterVal,
        start_date,
        end_date,
        sortCol,
        sortOrder
      } = req.allParams();

      let query = " from news";

      if ((data && data != "")) {
        query += " WHERE"
        if (data && data != "" && data != null) {
          query = query + " LOWER(link) LIKE '%" + data.toLowerCase() + "%'OR LOWER(title) LIKE '%" + data.toLowerCase() + "%'OR LOWER(description) LIKE '%" + data.toLowerCase() + "%'";
          if (start_date) {
            query = query + "OR created_at >=" + start_date;
          }
          if (end_date) {
            query = query + " created_at <=" + end_date;
          }
        }
      }
      if (filterVal && filterVal != "") {
        console.log('filterValVal>>>>>>>>', query)
        if (data && data != "" && data != null) {
          query += "AND owner = '" + filterVal + "'";
        } else {
          query += " WHERE owner = '" + filterVal + "'";
        }
      }

      countQuery = query;
      if (sortCol && sortOrder) {
        let sortVal = (sortOrder == 'descend'
          ? 'DESC'
          : 'ASC');
        query += " ORDER BY " + sortCol + " " + sortVal;
      }
      query += " limit " + limit + " offset " + (parseInt(limit) * (parseInt(page) - 1));
      console.log('NEWS>>>>>>>>', query)
      let news = await sails.sendNativeQuery("Select *" + query, []);
      news = news.rows;

      let newsCount = await sails.sendNativeQuery("Select COUNT(id)" + countQuery, [])
      newsCount = newsCount.rows[0].count;

      return res.json({ "status": 200, "message": "News retrived successfully", "data": news, newsCount });
    } catch (error) {
      console.log('>>>>>>', error)
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
      return res.json({ "status": 200, "message": "News Status Updated" });
    } catch (error) {
      console.log('error', error)
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
        return res.json({ "status": 200, "message": "News data Updated", data: newsDetails });
      } else {
        return res.json({ "status": 400, "message": "No news found" });
      }
    } catch (error) {
      console.log('error', error)
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  }

};
