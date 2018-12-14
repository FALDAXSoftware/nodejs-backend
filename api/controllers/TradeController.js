/**
 * TradeController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const moment = require('moment');

module.exports = {
  //---------------------------Web Api------------------------------
  marketSell: async function (req, res) {
    try {
      let { symbol, side, order_type, orderQuantity } = req.allParams();
      let user_id = req.user.id;
      let response = await sails
        .helpers
        .tradding
        .marketSell(symbol, user_id, side, order_type, orderQuantity);
      console.log("done");
      res.end();
    } catch (error) {
      console.log("---Error---", error);

      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  },
  marketBuy: async function (req, res) {
    try {
      console.log(req.allParams());
      let { symbol, side, order_type, orderQuantity } = req.allParams();
      let user_id = req.user.id;
      let response = await sails
        .helpers
        .tradding
        .marketBuy(symbol, user_id, side, order_type, orderQuantity);
      console.log("done");
      res.end();
    } catch (error) {
      console.log("---Error---", error);
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  },
  limitSell: async function (req, res) {
    try {
      console.log(req.allParams());
      let { symbol, side, order_type, orderQuantity, limit_price } = req.allParams();
      let user_id = req.user.id;
      let response = await sails
        .helpers
        .tradding
        .limitBuy(symbol, user_id, side, order_type, orderQuantity, limit_price);
      console.log("done");
      res.end();
    } catch (error) {
      console.log("---Error---", error);

      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  },

  limitBuy: async function (req, res) {
    try {
      let { symbol, side, order_type, orderQuantity, limit_price } = req.allParams();
      let user_id = req.user.id;
      let response = await sails
        .helpers
        .tradding
        .limitBuy(symbol, user_id, side, order_type, orderQuantity, limit_price);
      console.log("done");
      res.end();
    } catch (error) {
      console.log("---Error---", error);

      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  },

  getAllTradeHistory: async function (req, res) {
    try {

      let {
        fromDate,
        toDate,
        pair,
        Buy,
        Sell,
        deposit,
        withdraw
      } = req.body;

      if (req.user.id && pair && Buy == 'true' && Sell == 'false' && fromDate && toDate) {
        let tradeHistory = await TradeHistory.find({
          user_id: req.user.id,
          side: 'Buy',
          symbol: pair,
          or: [
            {
              created_at: {
                '<=': moment(toDate).format()
              }
            }, {
              created_at: {
                '>=': moment(fromDate).format()
              }
            }, {
              requested_user_id: req.user.id
            }
          ]
        }).sort('created_at', 'DESC')

        tradeHistory.map(value => {
          if (value.user_id == req.user.id) {
            value.fees = value.user_fee;
            value.coin = value.user_coin;
            value['Buy/Sell'] = 'Buy';
          } else if (value.requested_user_id == req.user.id) {
            value.fees = value.requested_fee;
            value.coin = value.requested_coin;
            value['Buy/Sell'] = 'Buy';
          }
        })

        delete tradeHistory.user_id;
        delete tradeHistory.requested_user_id;
        delete tradeHistory.currency;
        delete tradeHistory.settle_currency;

        return res.json({ status: 200, message: 'Trade history retrieved successfully.', tradeHistory })
      } else if (req.user.id && pair && Buy == false && Sell == true && toDate && fromDate) {
        let tradeHistory = await TradeHistory.find({
          user_id: req.user.id,
          side: 'Sell',
          symbol: pair,
          or: [
            {
              created_at: {
                '<=': moment(toDate).format()
              }
            }, {
              created_at: {
                '>=': moment(fromDate).format()
              }
            }, {
              requested_user_id: req.user.id
            }
          ]
        }).sort('created_at', 'DESC')

        tradeHistory.map(value => {
          if (value.user_id == req.user.id) {
            value.fees = value.user_fee;
            value.coin = value.user_coin;
            value['Buy/Sell'] = 'Sell';
          } else if (value.requested_user_id == req.user.id) {
            value.fees = value.requested_fee;
            value.coin = value.requested_coin;
            value['Buy/Sell'] = 'Sell';
          }
        })

        delete tradeHistory.user_id;
        delete tradeHistory.requested_user_id;
        delete tradeHistory.currency;
        delete tradeHistory.settle_currency;
      }
    } catch (err) {
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  },

  //-------------------------------CMS Api--------------------------
  getAllTrades: async function (req, res) {
    // req.setLocale('en')
    let { page, limit, data, user_id, t_type, start_date, end_date } = req.allParams();
    if (page && page > 0) {
      page = page - 1;
    } else {
      page = 0;
    }
    let q = {
      deleted_at: null,
    }
    if (data) {
      let userArray = await Users.find({
        where: {
          deleted_at: null,
          or: [
            {
              email: {
                contains: data
              }
            }
          ]
        }
      });
      let idArray = [];
      for (let index = 0; index < userArray.length; index++) {
        idArray.push(userArray[index].id);
      }
      q['or'] = [
        { user_id: idArray },
        { requested_user_id: idArray },
        { symbol: { contains: data } },
        { settle_currency: { contains: data } },
        { currency: { contains: data } },
      ]
    }
    if (user_id) {
      q['user_id'] = user_id
    }
    if (t_type) {
      q['side'] = t_type;
    }
    if (start_date && end_date) {
      q['created_at'] = { '>': start_date };
      q['created_at'] = { '<': end_date };
    }
    let tradeData = await TradeHistory.find({ ...q }).sort("id ASC").paginate(page, parseInt(limit));
    for (let index = 0; index < tradeData.length; index++) {
      if (tradeData[index].user_id) {
        let user = await Users.findOne({ id: tradeData[index].user_id })
        let user2 = await Users.findOne({ id: tradeData[index].requested_user_id })
        tradeData[index].maker_email = user.email;
        tradeData[index].taker_email = user2.email;
        tradeData[index]['volume'] = parseFloat(tradeData[index]['quantity']) * parseFloat(tradeData[index]['fill_price']);
      }
    }

    let tradeCount = await TradeHistory.count({ ...q });

    return res.json({
      "status": 200,
      "message": sails.__("Trade list"),
      "data": tradeData,
      tradeCount
    });
  }
};
