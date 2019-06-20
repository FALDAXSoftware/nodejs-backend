/**
 * BuyController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  //---------------------------Web Api------------------------------

  /**
    * API for getting buy book details
    * Renders this api when buy book details need to be fetched
    *
    * @param <room, previous room>
    *
    * @return <Buy book details or error data>
   */

  getBuyBookDetails: async function (req, res) {
    let room = req.query.room;
    try {
      if (req.isSocket) {
        if (req.query.prevRoom) {
          let prevRoom = req.query.prevRoom;
          sails
            .sockets
            .leave(req.socket, prevRoom, function (err) {
              if (err) {
                return res
                  .status(403)
                  .json({
                    status: 403,
                    "message": sails.__("error")
                  });
              } else {
                sails
                  .sockets
                  .join(req.socket, room, async function (err) {
                    if (err) {
                      return res
                        .status(403)
                        .json({
                          status: 403,
                          "message": sails.__("error")
                        });
                    } else {
                      let {crypto, currency} = await sails
                        .helpers
                        .utilities
                        .getCurrencies(room);
                      let buyBookDetails = await sails
                        .helpers
                        .tradding
                        .buy
                        .getBuyBookOrders(crypto, currency);
                      if (buyBookDetails) {
                        return res.json({
                          status: 200,
                          data: buyBookDetails,
                          "message": sails.__("Buy data retrived success")
                        });
                      }
                    }
                  });
              }
            });
        } else {
          sails
            .sockets
            .join(req.socket, room, async function (err) {
              if (err) {
                return res
                  .status(403)
                  .json({
                    status: 403,
                    "message": sails.__("error")
                  });
              } else {
                let {crypto, currency} = await sails
                  .helpers
                  .utilities
                  .getCurrencies(room);
                let buyBookDetails = await sails
                  .helpers
                  .tradding
                  .buy
                  .getBuyBookOrders(crypto, currency);

                if (buyBookDetails) {
                  return res.json({
                    status: 200,
                    data: buyBookDetails,
                    "message": sails.__("Buy data retrived success")
                  });
                }
              }
            });
        }
      } else {
        return res
          .status(403)
          .json({
            status: 403,
            "message": sails.__("error")
          });
      }
    } catch (err) {
      console.log('>>>', err);
      return res
        .status(500)
        .json({"status": 500, "err": err});
    }
  },

  //-------------------------------CMS Api--------------------------
  getAllBuyOrders: async function (req, res) {
    try {
      let {
        page,
        limit,
        data,
        sort_col,
        sort_order,
        user_id
      } = req.allParams();
      let query = " from buy_book";
      let whereAppended = false;

      if ((data && data != "")) {
        query += " WHERE"
        whereAppended = true;
        if (data && data != "" && data != null) {
          query = query + " LOWER(symbol) LIKE '%" + data.toLowerCase() + "%'";
          if (!isNaN(data)) {
            query = query + " OR fill_price=" + data + " OR quantity=" + data;
          }
        }
      }

      if (user_id) {
        if (whereAppended) {
          query += " AND "
        } else {
          query += " WHERE "
        }
        whereAppended = true;
        query += " user_id=" + user_id;
      }
      countQuery = query;
      if (sort_col && sort_order) {
        let sortVal = (sort_order == 'descend'
          ? 'DESC'
          : 'ASC');
        query += " ORDER BY " + sort_col + " " + sortVal;
      }else {
        query += " ORDER BY id DESC";
      }

      query += " limit " + limit + " offset " + (parseInt(limit) * (parseInt(page) - 1))
      console.log('query buy', query)
      let buyBookData = await sails.sendNativeQuery("Select *" + query, [])

      buyBookData = buyBookData.rows;

      let buyBookCount = await sails.sendNativeQuery("Select COUNT(id)" + countQuery, [])
      buyBookCount = buyBookCount.rows[0].count;

      if (buyBookData) {
        return res.json({
          "status": 200,
          "message": sails.__("Buy Order list"),
          "data": buyBookData,
          buyBookCount
        });
      }

    } catch (err) {
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  }
};
