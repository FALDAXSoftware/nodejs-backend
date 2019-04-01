/**
 * KrakenController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {

  //Get Order Book Data
  getOrderBookData: async function (req, res) {
    try {
      var {pair, pair_value} = req.allParams();

      var orderData = await sails
        .helpers
        .kraken
        .getOrderBook(pair, pair_value);

      return res.json({status: 200, "data": 1})
    } catch (err) {
      console.log(err);
      return res.json({status: 500, "err": err});
    }
  },

  //Add order
  addOrder: async function (req, res) {
    try
    {
      var {pair, type, ordertype, volume} = req.body;

      var addedData = await sails
        .helpers
        .kraken
        .addStandardOrder(pair, type, ordertype, volume);

      return res.json({status: 200, "data": addedData});
    } catch (err) {
      console.log(err);
      return res.json({status: 500, "err": err});
    }
  },

  //Get Deposit Address
  depositAddress: async function (req, res) {
    try {
      var {symbol} = req.allParams();

      var depositAdd = await sails
        .helpers
        .kraken
        .getDepositAddress(symbol);

      return res.json({status: 200, "data": depositAdd});
    } catch (err) {
      console.log(err);
      return res.json({status: 500, "err": err});
    }
  },

  //Get recent Deposit status
  getDepositStatus: async function (req, res) {
    try {
      var {symbol} = req.allParams();

      var depositStatus = await sails
        .helpers
        .kraken
        .getRecentDepositStatus(symbol);

      return res.json({status: 200, "data": depositStatus});
    } catch (err) {
      console.log(err);
      return res.json({status: 500, "err": err});
    }
  }
}
