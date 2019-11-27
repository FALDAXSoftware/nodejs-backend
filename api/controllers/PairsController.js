/**
 * PairsController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
var logger = require("./logger");
module.exports = {
  //---------------------------Web Api------------------------------

  /**
   * API for getting instrument pair data
   * Renders this api when instrument data needs to be fetched
   *
   * @param <coin name, room, previous room>
   *
   * @return <Instruments data or error data>
   */

  getInstrumentPair: async function (req, res) {
    let coin = req.query.coin;
    try {
      if (req.isSocket) {
        sails
          .sockets
          .join(req.socket, coin, async function (err) {
            if (err) {
              return res
                .status(403)
                .json({
                  status: 403,
                  "message": sails.__("error")
                });
            } else {
              var response = await sails
                .helpers
                .tradding
                .getInstrumentData(coin);

              return res
                .status(200)
                .json({
                  status: 200,
                  "message": sails.__("instruments data retireve success"),
                  data: response
                });
            }
          });
      } else {
        return res
          .status(403)
          .json({
            status: 403,
            "message": sails.__("error")
          });
      }
    } catch (error) {
      await logger.error(error.message)
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  },

  //-------------------------------CMS Api--------------------------
  getAllPairs: async function (req, res) {
    try {
      let {
        page,
        limit,
        data,
        sort_col,
        sort_order,
        filter_val
      } = req.allParams();
      let query = " from pairs";
      let whereAppended = false;
      if ((data && data != "")) {
        query += " WHERE"
        whereAppended = true;
        if (data && data != "" && data != null) {
          query += " ( LOWER(name) LIKE '%" + data.toLowerCase() + "%'";
          if (!isNaN(data)) {
            query += " OR maker_fee=" + data + " OR taker_fee=" + data;
          }
          query += " )"
        }
      }
      if (filter_val) {
        query += whereAppended ? " AND " : " WHERE ";
        whereAppended = true;
        query += "( coin_code1 ='" + filter_val + "' OR coin_code2 = '" + filter_val + "' )";
      }
      countQuery = query;
      if (sort_col && sort_order) {
        let sortVal = (sort_order == 'descend' ?
          'DESC' :
          'ASC');
        query += " ORDER BY " + sort_col + " " + sortVal;
      } else {
        query += " ORDER BY id ASC";
      }
      query += " limit " + limit + " offset " + (parseInt(limit) * (parseInt(page) - 1));
      let pairData = await sails.sendNativeQuery("Select *" + query, [])

      pairData = pairData.rows;

      let pairsCount = await sails.sendNativeQuery("Select COUNT(id)" + countQuery, [])
      pairsCount = pairsCount.rows[0].count;

      let allCoins = await Coins.find({
        where: {
          is_active: true,
          deleted_at: null
        },
        select: ['id', 'coin_name', 'coin_code', 'coin']
      });

      if (pairData) {
        return res.json({
          "status": 200,
          "message": sails.__("Pair list"),
          "data": pairData,
          pairsCount,
          allCoins
        });
      }
    } catch (err) {
      await logger.error(err.message)
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  },

  createPair: async function (req, res) {
    try {
      if (req.body.name && req.body.coin_code1 && req.body.coin_code2) {
        let coinID_1 = await Coins.findOne({
          coin: req.body.coin_code1
        });
        let coinID_2 = await Coins.findOne({
          coin: req.body.coin_code2
        });
        let existingPair = await Pairs.find({
          coin_code1: coinID_1.id,
          coin_code2: coinID_2.id,
          deleted_at: null
        });
        if (existingPair.length > 0) {
          return res.status(500).json({
            "status": 500,
            "err": sails.__("pair already exist")
          });
        }

        var pair_details = await Pairs
          .create({
            name: req.body.name,
            coin_code1: coinID_1.id,
            coin_code2: coinID_2.id,
            maker_fee: req.body.maker_fee,
            taker_fee: req.body.taker_fee,
            created_at: new Date()
          })
          .fetch();
        if (pair_details) {
          return res.json({
            "status": 200,
            "message": sails.__('Create Pair')
          });
        } else {
          return res
            .status(400)
            .json({
              "status": 400,
              "err": sails.__("not listed")
            });
        }
      } else {
        return res
          .status(400)
          .json({
            "status": 400,
            "err": sails.__("Pair Name & coin is not sent")
          });
      }
    } catch (error) {
      await logger.error(error.message)
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  },

  updatePair: async function (req, res) {
    try {
      if (req.body.id) {
        const pair_details = await Pairs.findOne({
          id: req.body.id
        });
        if (!pair_details) {
          return res
            .status(401)
            .json({
              "status": 401,
              err: sails.__('invalid coin')
            });
        }
        var updatedPair = await Pairs
          .update({
            id: req.body.id
          })
          .set(req.body)
          .fetch();
        if (!updatedPair) {
          return res
            .status(400)
            .json({
              "status": 400,
              "err": sails.__("Something Wrong")
            });
        }
        return res.json({
          "status": 200,
          "message": sails.__('Update Pair')
        });
      } else {
        return res
          .status(400)
          .json({
            'status': 400,
            'err': sails.__('pair id is not sent.')
          })
      }
    } catch (error) {
      console.log("error",error);
      await logger.error(error.message)
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  }
};
