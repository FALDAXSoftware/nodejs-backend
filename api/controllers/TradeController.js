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
      let {symbol, side, order_type, orderQuantity} = req.allParams();
      orderQuantity = parseFloat(orderQuantity);
      let user_id = req.user.id;
      let response = await sails
        .helpers
        .tradding
        .marketSell(symbol, user_id, side, order_type, orderQuantity)
        .tolerate("coinNotFound", () => {
          throw new Error("coinNotFound");
        })
        .tolerate("serverError", () => {
          throw new Error("serverError");
        })
        .tolerate("insufficientBalance", () => {
          throw new Error("insufficientBalance");
        })
        .tolerate("orderBookEmpty", () => {
          throw new Error("orderBookEmpty");
        });
      console.log("done");
      res.json({
        "status": 200,
        "message": sails.__("Order Success")
      });
    } catch (error) {
      console.log(error);

      if (error.message == "coinNotFound") {
        return res
          .status(500)
          .json({status: 500, "err": "Coin Not Found"});
      }
      if (error.message == "insufficientBalance") {
        return res
          .status(500)
          .json({status: 500, "err": "Insufficient balance in wallet"});
      }
      if (error.message == "orderBookEmpty") {
        return res
          .status(500)
          .json({status: 500, "err": "no more limit order in order book"});
      }
      if (error.message == "serverError") {
        return res
          .status(500)
          .json({
            status: 500,
            "err": sails.__("Something Wrong")
          });
      }
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
      let {symbol, side, order_type, orderQuantity} = req.allParams();
      let user_id = req.user.id;
      let response = await sails
        .helpers
        .tradding
        .marketBuy(symbol, user_id, side, order_type, orderQuantity)
        .tolerate("coinNotFound", () => {
          throw new Error("coinNotFound");
        })
        .tolerate("serverError", () => {
          throw new Error("serverError");
        })
        .tolerate("insufficientBalance", () => {
          throw new Error("insufficientBalance");
        })
        .tolerate("orderBookEmpty", () => {
          throw new Error("orderBookEmpty");
        });
      console.log("done");
      res.json({
        "status": 200,
        "message": sails.__("Order Success")
      });
    } catch (error) {
      if (error.message == "coinNotFound") {
        return res
          .status(500)
          .json({status: 500, "err": "Coin Not Found"});
      }
      if (error.message == "insufficientBalance") {
        return res
          .status(500)
          .json({status: 500, "err": "Insufficient balance in wallet"});
      }
      if (error.message == "orderBookEmpty") {
        return res
          .status(500)
          .json({status: 500, "err": "no more limit order in order book"});
      }

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
      let {symbol, side, order_type, orderQuantity, limit_price} = req.allParams();
      let user_id = req.user.id;
      let response = await sails
        .helpers
        .tradding
        .limitSell(symbol, user_id, side, order_type, orderQuantity, limit_price);
      console.log("done");
      res.json({
        "status": 200,
        "message": sails.__("Order Success")
      });
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
      let {symbol, side, order_type, orderQuantity, limit_price} = req.allParams();
      let user_id = req.user.id;
      let response = await sails
        .helpers
        .tradding
        .limitBuy(symbol, user_id, side, order_type, orderQuantity, limit_price)
        .tolerate('invalidQuantity', () => {
          throw new Error("invalidQuantity");
        })
        .tolerate('coinNotFound', () => {
          throw new Error("coinNotFound");
        })
        .tolerate('insufficientBalance', () => {
          throw new Error("insufficientBalance");
        })
        .tolerate('serverError', () => {
          throw new Error("serverError");
        });;
      console.log("done");
      res.json({
        "status": 200,
        "message": sails.__("Order Success")
      });
    } catch (error) {
      console.log("tradecontroller", error)
      if (error.message == "coinNotFound") {
        return res
          .status(500)
          .json({status: 500, "err": "Coin Not Found"});
      }
      if (error.message == "insufficientBalance") {
        return res
          .status(500)
          .json({status: 500, "err": "Insufficient balance in wallet"});
      }
      if (error.message == "invalidQuantity") {
        return res
          .status(500)
          .json({status: 500, "err": "invalid order quantity"});
      }

      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  },

  stopLimitBuy: async function (req, res) {
    console.log("stop limit but", req.body);

    try {
      let {
        symbol,
        side,
        order_type,
        orderQuantity,
        limit_price,
        stop_price
      } = req.allParams();
      let user_id = req.user.id;
      let response = await sails
        .helpers
        .tradding
        .stopLimitBuyAddPending(symbol, user_id, side, order_type, orderQuantity, limit_price, stop_price)
        .tolerate('coinNotFound', () => {
          throw new Error("coinNotFound");
        })
        .tolerate('insufficientBalance', () => {
          throw new Error("insufficientBalance");
        })
        .tolerate('serverError', () => {
          throw new Error("serverError");
        });
      console.log("done");
      res.json({
        "status": 200,
        "message": sails.__("Order Success")
      });
    } catch (error) {
      console.log("tradeController", error);

      if (error.message == "coinNotFound") {
        return res
          .status(500)
          .json({status: 500, "err": "Coin Not Found"});
      }
      if (error.message == "insufficientBalance") {
        return res
          .status(500)
          .json({status: 500, "err": "Insufficient balance in wallet"});
      }

      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  },

  stopLimitSell: async function (req, res) {
    try {
      let {
        symbol,
        side,
        order_type,
        orderQuantity,
        limit_price,
        stop_price
      } = req.allParams();
      let user_id = req.user.id;
      let response = await sails
        .helpers
        .tradding
        .stopLimitSellAddPending(symbol, user_id, side, order_type, orderQuantity, limit_price, stop_price)
        .tolerate('coinNotFound', () => {
          throw new Error("coinNotFound");
        })
        .tolerate('insufficientBalance', () => {
          throw new Error("insufficientBalance");
        })
        .tolerate('serverError', () => {
          throw new Error("serverError");
        });;
      console.log("done");
      res.json({
        "status": 200,
        "message": sails.__("Order Success")
      });
    } catch (error) {
      console.log(error);
      if (error.message == "coinNotFound") {
        return res
          .status(500)
          .json({status: 500, "err": "Coin Not Found"});
      }
      if (error.message == "insufficientBalance") {
        return res
          .status(500)
          .json({status: 500, "err": "Insufficient balance in wallet"});
      }

      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  },
  stopLimitExecute: async function (req, res) {
    await sails
      .helpers
      .tradding
      .executeStopLimit();
    res.end();
  },

  cancelPendingOrder: async function (req, res) {

    try {
      let {side, id, order_type} = req.allParams();
      console.log(req.allParams());
      let user_id = req.user.id;
      let response = await sails
        .helpers
        .tradding
        .pending
        .cancelPendingData(side, order_type, id);
      console.log(response);
      console.log("done");
      res.json({
        "status": 200,
        "message": sails.__("Order Success")
      });
    } catch (error) {
      console.log("tradeController", error);

      if (error.message == "coinNotFound") {
        return res
          .status(500)
          .json({status: 500, "err": "Coin Not Found"});
      }
      if (error.message == "insufficientBalance") {
        return res
          .status(500)
          .json({status: 500, "err": "Insufficient balance in wallet"});
      }

      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  },

  getUserHistory: async function (req, res) {

    try {
      console.log(req.allParams());
      var data = req.allParams();
      let user_id = req.user.id;
      data.user_id = user_id;
      let response = await sails
        .helpers
        .tradding
        .getUserTradeHistory(data);
      // console.log(response); console.log("done");
      res.json({
        "status": 200,
        "message": sails.__("Order Success"),
        "data": response
      });
    } catch (error) {
      console.log("tradeController", error);

      if (error.message == "coinNotFound") {
        return res
          .status(500)
          .json({status: 500, "err": "Coin Not Found"});
      }
      if (error.message == "insufficientBalance") {
        return res
          .status(500)
          .json({status: 500, "err": "Insufficient balance in wallet"});
      }

      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  },

  getUserWallet: async function (req, res) {
    console.log("Trade history call");

    var room = req.query.room;
    try {
      var user_id = inputs.user.id;
      if (req.isSocket) {
        console.log("trade history call", room);
        sails
          .sockets
          .join(req.socket, room + '-' + user_id, async function (err) {
            if (err) {
              console.log('>>>err', err);
              return res
                .status(403)
                .json({status: 403, "message": "Error occured"});
            } else {
              let {crypto, currency} = await sails
                .helpers
                .utilities
                .getCurrencies(room);
              console.log("-=-=-=-=-=", crypto, currency);

              let userBalanceDetails = await sails
                .helpers
                .tradding
                .getUserWalletBalance(user_id, currency, crypto);

              if (tradeDetails) {
                return res.json({status: 200, data: userBalanceDetails, "message": "User Balance retrieved successfully"});
              }
            }
          });
      } else {
        console.log('>>>IN else')
        return res
          .status(403)
          .json({status: 403, "message": "Error occured"});
      }
    } catch (err) {
      console.log('>>>', err)
    }
  },

  // getAllTradeHistory: async function (req, res) {   try {     let { fromDate,
  // toDate,       pair,       Buy,       Sell,       deposit,   withdraw } =
  // req.body;     if (req.user.id && pair && Buy == 'true' && Sell == 'false' &&
  // fromDate && toDate) {       let tradeHistory = await TradeHistory.find({
  // user_id: req.user.id,         side: 'Buy',  symbol: pair,         or: [ {
  // created_at: {    '<=': moment(toDate).format()      }      }, { created_at: {
  //               '>=': moment(fromDate).format()     }       }, {
  // requested_user_id: req.user.id           }         ] }).sort('created_at',
  // 'DESC')       tradeHistory.map(value => { if (value.user_id == req.user.id) {
  //           value.fees = value.user_fee; value.coin = value.user_coin;
  // value['Buy/Sell'] = 'Buy';     } else if (value.requested_user_id ==
  // req.user.id) {           value.fees = value.requested_fee; value.coin =
  // value.requested_coin; value['Buy/Sell'] = 'Buy';         } })       delete
  // tradeHistory.user_id;       delete tradeHistory.requested_user_id; delete
  // tradeHistory.currency;       delete tradeHistory.settle_currency;  return
  // res.json({status: 200, message: 'Trade history retrieved successfully.',
  // tradeHistory})     } else if (req.user.id && pair && Buy == false && Sell ==
  // true && toDate && fromDate) {       let tradeHistory = await
  // TradeHistory.find({         user_id: req.user.id,  side: 'Sell', symbol:
  // pair,         or: [           { created_at: {     '<=':
  // moment(toDate).format()             }           }, { created_at: {    '>=':
  // moment(fromDate).format()             }       }, { requested_user_id:
  // req.user.id           }         ] }).sort('created_at', 'DESC')
  // tradeHistory.map(value => { if (value.user_id == req.user.id) { value.fees =
  // value.user_fee;  value.coin = value.user_coin; value['Buy/Sell'] = 'Sell'; }
  // else if (value.requested_user_id == req.user.id) { value.fees =
  // value.requested_fee;           value.coin = value.requested_coin;
  // value['Buy/Sell'] = 'Sell';         } })       delete tradeHistory.user_id;
  // delete tradeHistory.requested_user_id;       delete tradeHistory.currency;
  // delete tradeHistory.settle_currency;     }   } catch (err) {     return res
  // .status(500)       .json({         status: 500, "err": sails.__("Something
  // Wrong")       });   } },

  getAllTradeHistory: async function (req, res) {
    console.log("Trade history call");

    var room = req.query.room;
    try {
      if (req.isSocket) {
        console.log("trade history call", room);
        sails
          .sockets
          .join(req.socket, room, async function (err) {
            if (err) {
              console.log('>>>err', err);
              return res
                .status(403)
                .json({status: 403, "message": "Error occured"});
            } else {
              let {crypto, currency} = await sails
                .helpers
                .utilities
                .getCurrencies(room);
              console.log("-=-=-=-=-=", crypto, currency);

              let tradeDetails = await sails
                .helpers
                .tradding
                .trade
                .getTradeDetails(crypto, currency, 100);

              if (tradeDetails) {
                return res.json({status: 200, data: tradeDetails, "message": "Trade data retrived successfully."});
              }
            }
          });
      } else {
        console.log('>>>IN else')
        return res
          .status(403)
          .json({status: 403, "message": "Error occured"});
      }
    } catch (err) {
      console.log('>>>', err)
    }
  },

  getUserTradeHistory: async function (req, res) {
    console.log("User Trade history call");

    var room = req.query.room;
    var user_id = req.user.id;
    var month = req.query.month;
    var filter_type = req.query.filter_type;
    try {
      if (req.isSocket) {
        console.log("trade history call", room);
        sails
          .sockets
          .join(req.socket, room + '-' + user_id, async function (err) {
            if (err) {
              console.log('>>>err', err);
              return res
                .status(403)
                .json({status: 403, "message": "Error occured"});
            } else {
              let {crypto, currency} = await sails
                .helpers
                .utilities
                .getCurrencies(room);
              console.log("-=-=-=-=-=", crypto, currency);
              var userTradeDetails;
              if (filter_type == 1) {
                userTradeDetails = await sails
                  .helpers
                  .tradding
                  .getCompletedData(user_id, crypto, currency, month);
              } else if (filter_type == 2) {
                userTradeDetails = await sails
                  .helpers
                  .tradding
                  .pending
                  .getTradePendingDetails(user_id, crypto, currency, month);
              } else if (filter_type == 3) {
                userTradeDetails = await sails
                  .helpers
                  .tradding
                  .getCancelDetails(user_id, crypto, currency, month);
              }

              if (userTradeDetails) {
                return res.json({status: 200, data: userTradeDetails, "message": "User Trade data retrived successfully."});
              }
            }
          });
      } else {
        console.log('>>>IN else')
        return res
          .status(403)
          .json({status: 403, "message": "Error occured"});
      }
    } catch (err) {
      console.log('>>>', err)
    }
  },
  getDepthchartData: async function (req, res) {
    var room = req.query.room;
    try {
      if (req.isSocket) {
        sails
          .sockets
          .join(req.socket, room, async function (err) {
            if (err) {
              return res
                .status(500)
                .json({
                  status: 500,
                  "err": sails.__("Something Wrong")
                });
            } else {
              let {crypto, currency} = await sails
                .helpers
                .utilities
                .getCurrencies(room);
              let data = await sails
                .helpers
                .chart
                .getDepthChartDetail(crypto, currency);
              console.log("DEPTH DATA :::: ", data);
              return res.json({status: 200, data: data, "message": "User Trade data retrived successfully."});
            }

          });
      } else {}
    } catch (error) {
      console.log(error);

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
    let {
      page,
      limit,
      search,
      user_id,
      t_type,
      start_date,
      end_date
    } = req.allParams();
    if (page && page > 0) {
      page = page - 1;
    } else {
      page = 0;
    }
    let q = {
      deleted_at: null
    }
    if (start_date && end_date) {
      q['created_at'] = {
        '>=': start_date,
        '<=': end_date
      };
    }
    if (search) {
      let userArray = await Users.find({
        where: {
          deleted_at: null,
          or: [
            {
              email: {
                contains: search
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
        {
          user_id: idArray
        }, {
          requested_user_id: idArray
        }, {
          symbol: {
            contains: search
          }
        }, {
          settle_currency: {
            contains: search
          }
        }, {
          currency: {
            contains: search
          }
        }
      ]

      if (user_id) {
        q['user_id'] = user_id
      }
      if (t_type) {
        q['side'] = t_type;
      }
      if (start_date && end_date) {
        q['created_at'] = {
          '>=': start_date,
          '<=': end_date
        };
      }

      let user_name = "";

      if (user_id) {
        user_name = await Users.findOne({
          select: ['full_name'],
          where: {
            id: user_id,
            deleted_at: null
          }
        });
      }
      let tradeData = await TradeHistory
        .find({
        ...q
      })
        .sort("id ASC")
        .paginate(page, parseInt(limit));
      for (let index = 0; index < tradeData.length; index++) {
        if (tradeData[index].user_id) {
          let user = await Users.findOne({id: tradeData[index].user_id})
          let user2 = await Users.findOne({id: tradeData[index].requested_user_id})
          tradeData[index].maker_email = user.email;
          tradeData[index].taker_email = user2.email;
          tradeData[index]['volume'] = parseFloat(tradeData[index]['quantity']) * parseFloat(tradeData[index]['fill_price']);
        }
      }

      let tradeCount = await TradeHistory.count({
        ...q
      });

      return res.json({
        "status": 200,
        "message": sails.__("Trade list"),
        "data": tradeData,
        tradeCount,
        user_name
      });
    } else {
      if (user_id) {
        q['user_id'] = user_id
      }
      if (t_type) {
        q['side'] = t_type;
      }
      if (start_date && end_date) {
        q['created_at'] = {
          '>=': start_date,
          '<=': end_date
        };
      }

      let user_name = "";

      if (user_id) {
        user_name = await Users.findOne({
          select: ['full_name'],
          where: {
            id: user_id,
            deleted_at: null
          }
        });
      }
      let tradeData = await TradeHistory
        .find({
        ...q
      })
        .sort("id ASC")
        .paginate(page, parseInt(limit));
      for (let index = 0; index < tradeData.length; index++) {
        if (tradeData[index].user_id) {
          let user = await Users.findOne({id: tradeData[index].user_id})
          let user2 = await Users.findOne({id: tradeData[index].requested_user_id})
          tradeData[index].maker_email = user.email;
          tradeData[index].taker_email = user2.email;
          tradeData[index]['volume'] = parseFloat(tradeData[index]['quantity']) * parseFloat(tradeData[index]['fill_price']);
        }
      }

      let tradeCount = await TradeHistory.count({
        ...q
      });

      return res.json({
        "status": 200,
        "message": sails.__("Trade list"),
        "data": tradeData,
        tradeCount,
        user_name
      });
    }

  }
};
