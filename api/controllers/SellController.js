/**
 * SellController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  //---------------------------Web Api------------------------------
  getSellBookDetails: async function (req, res) {
    let room = req.query.room;
    try {
      if (req.isSocket) {
        if (req.query.prevRoom) {
          let prevRoom = req.query.prevRoom;
          sails
            .sockets
            .leave(req.socket, prevRoom, function (leaveErr) {
              if (leaveErr) {
                return res
                  .status(403)
                  .json({status: 403, "message": "Error occured"});
              } else {
                sails
                  .sockets
                  .join(req.socket, room, async function (err) {
                    if (err) {
                      return res
                        .status(403)
                        .json({status: 403, "message": "Error occured"});
                    } else {
                      let {crypto, currency} = await sails
                        .helpers
                        .utilities
                        .getCurrencies(room);
                      let sellBookDetails = await sails
                        .helpers
                        .tradding
                        .sell
                        .getSellBookOrders(crypto, currency);

                      if (sellBookDetails) {
                        return res.json({status: 200, data: sellBookDetails, "message": "Sell data retrived successfully."});
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
                  .json({status: 403, "message": "Error occured"});
              } else {
                let {crypto, currency} = await sails
                  .helpers
                  .utilities
                  .getCurrencies(room);
                let sellBookDetails = await sails
                  .helpers
                  .tradding
                  .sell
                  .getSellBookOrders(crypto, currency);

                if (sellBookDetails) {
                  return res.json({status: 200, data: sellBookDetails, "message": "Sell data retrived successfully."});
                }
              }
            });
        }

      } else {
        return res
          .status(403)
          .json({status: 403, "message": "Error occured"});
      }
    } catch (err) {
      console.log('>>>', err)
    }
  },

  getData: async function (req, res) {
    try {
      sails
        .sockets
        .broadcast('test', {'message': 'blahhhh'});

    } catch (err) {
      console.log('>getData>>', err)
    }
  },

  //-------------------------------CMS Api--------------------------
  getAllSellOrders: async function (req, res) {
    let {page, limit, data, sortCol, sortOrder} = req.allParams();
    let query = " from sell_book";
    if ((data && data != "")) {
      query += " WHERE"
      if (data && data != "" && data != null) {
        query = query + " LOWER(symbol) LIKE '%" + data.toLowerCase() + "%'";
        if (!isNaN(data)) {
          query = query + " OR fill_price=" + data + " OR quantity=" + data;
        }
      }
    }

    countQuery = query;
    if (sortCol && sortOrder) {
      let sortVal = (sortOrder == 'descend'
        ? 'DESC'
        : 'ASC');
      query += " ORDER BY " + sortCol + " " + sortVal;
    }

    query = query + " limit " + limit + " offset " + (parseInt(limit) * (parseInt(page) - 1))
    let sellBookData = await sails.sendNativeQuery("Select *" + query, [])

    sellBookData = sellBookData.rows;

    let sellBookCount = await sails.sendNativeQuery("Select COUNT(id)" + countQuery, [])
    sellBookCount = sellBookCount.rows[0].count;

    if (sellBookData) {
      return res.json({
        "status": 200,
        "message": sails.__("Sell Order list"),
        "data": sellBookData,
        sellBookCount
      });
    }
  }
};
