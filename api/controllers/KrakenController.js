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
      
    } catch (err) {
      console.log(err);
      return res.json({status: 500, "data": err});
    }
  }
}
