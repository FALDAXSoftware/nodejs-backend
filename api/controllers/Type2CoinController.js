/**
 * TicketController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  // ---------------------------Web Api------------------------------ Get Coin
  // Info for particular coin
  getCoinInfo: async function (req, res) {
    try {
      var {coin_code} = req.allParams();

      var getInfo = await sails
        .helpers
        .type2Coins
        .stratis
        .getInfo(coin_code);

      return res.json({"status": 200, "message": 'Information retrieved successfully', "data": getInfo});
    } catch (err) {
      console.log(err);
    }

  },

  //Get Address for particular coin
  getCoinNewAddress: async function (req, res) {
    try {
      var {coin_code} = req.allParams();

      var getInfo = await sails
        .helpers
        .type2Coins
        .stratis
        .getNewAddress(coin_code);

      return res.json({"status": 200, "message": 'Information retrieved successfully', "data": getInfo});
    } catch (err) {
      console.log(err);
    }

  },

  //Get Transaction List for Particular coin
  getTransactionList: async function (req, res) {
    try {
      var {coin_code} = req.allParams();

      var getInfo = await sails
        .helpers
        .type2Coins
        .stratis
        .getInfo(coin_code);

      return res.json({"status": 200, "message": 'Information retrieved successfully', "data": getInfo});
    } catch (err) {
      console.log(err);
    }

  },

  //Send coion to other
  sendCoin: async function (req, res) {
    try {
      var {coin_code, to_address, amount, message} = req.body;

      var getInfo = await sails
        .helpers
        .type2Coins
        .stratis
        .sendFunds(coin_code, to_address, amount, message);

      return res.json({"status": 200, "message": 'Information retrieved successfully', "data": getInfo});
    } catch (err) {
      console.log(err);
    }

  }
}
