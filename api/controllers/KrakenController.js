/**
 * KrakenController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const BitGoJS = require('bitgo');

module.exports = {

  //Get Order Book Data
  getOrderBookData: async function (req, res) {
    try {
      var { pair, pair_value } = req.allParams();

      var orderData = await sails
        .helpers
        .kraken
        .getOrderBook(pair, pair_value);

      return res.json({ status: 200, "data": 1 })
    } catch (err) {
      console.log(err);
      return res.json({
        status: 500,
        "err": sails.__("Something Wrong")
      });
    }
  },

  //Add order
  addOrder: async function (req, res) {
    try {
      var {
        pair,
        type,
        ordertype,
        volume
      } = req.body;

      var addedData = await sails
        .helpers
        .kraken
        .addStandardOrder(pair, type, ordertype, volume);

      return res.json({ status: 200, "data": addedData });
    } catch (err) {
      console.log(err);
      return res.json({
        status: 500,
        "err": sails.__("Something Wrong")
      });
    }
  },

  //Get Deposit Address
  depositAddress: async function (req, res) {
    try {
      var { symbol } = req.allParams();

      var depositAdd = await sails
        .helpers
        .kraken
        .getDepositAddress(symbol);

      return res.json({ status: 200, "data": depositAdd });
    } catch (err) {
      console.log(err);
      return res.json({
        status: 500,
        "err": sails.__("Something Wrong")
      });
    }
  },

  //Get recent Deposit status
  getDepositStatus: async function (req, res) {
    try {
      var { symbol } = req.allParams();

      var depositStatus = await sails
        .helpers
        .kraken
        .getRecentDepositStatus(symbol);

      return res.json({ status: 200, "data": depositStatus });
    } catch (err) {
      console.log(err);
      return res.json({
        status: 500,
        "err": sails.__("Something Wrong")
      });
    }
  },

  //Get withdrawl Information
  getWithdrawlInformation: async function (req, res) {
    try {
      var { asset, amount } = req.allParams()

      var withdrwalInfo = await sails
        .helpers
        .kraken
        .getWithdrawlInfo(asset, amount);

      return res.json({ status: 200, "data": withdrwalInfo });
    } catch (err) {
      console.log(err);
      return res.json({
        status: 500,
        "err": sails.__("Something Wrong")
      });
    }
  },

  //Withdraw Funds
  getWithdrawlFunds: async function (req, res) {
    try {
      var { asset, amount } = req.allParams()

      var withdrawlFunds = await sails
        .helpers
        .kraken
        .withdrawFunds(asset, amount);

      return res.json({ status: 200, "data": withdrawlFunds });
    } catch (err) {
      console.log(err);
      return res.json({
        status: 500,
        "err": sails.__("Something Wrong")
      });
    }
  },

  //Get Recent withdrawl Status
  getRecentWithdrawlStatus: async function (req, res) {
    try {
      var { asset } = req.allParams();

      var withdrawStatus = await sails
        .helpers
        .kraken
        .recentWithdrawlStatus(asset);

      return res.json({ status: 200, "data": withdrawStatus });
    } catch (err) {
      console.log(err);
      return res.json({
        status: 500,
        "err": sails.__("something Wrong")
      });
    }
  },

  //Withdrawl Cancellation LEFT
  withdrwalCancellationStatus: async function (req, res) {
    try {
      var { asset, refid } = req.body;

      var cancelStatus = await sails
        .helpers
        .kraken
        .getWithdrawlCancel(asset, refid);

      return res.json({ status: 200, "data": cancelStatus });
    } catch (err) {
      console.log(err);
      return res.json({
        status: 500,
        "err": sails.__("Something Wrong")
      });
    }
  },

  //Query for trade INFO
  queryTradeInformation: async function (req, res) {
    try {
      var { txid } = req.allParams();

      var result = await sails
        .helpers
        .kraken
        .queryTradeInfo(txid);

      console.log("Result :: ", result);
      return res.json({ status: 200, "data": result });
    } catch (err) {
      console.log(err);
      return res.json({
        status: 500,
        "err": sails.__("Something Wrong")
      });
    }
  },

  performConversion: async function (req, res) {
    let {
      pair,
      type,
      volume,
      includeFees
    } = req.allParams();
    let userId = req.user.id;
    let pairDetails = await Pairs.findOne({
      name: pair,
      deleted_at: null,
      is_active: true
    });
    let krakenFees = 0.2;
    let faldaxFees = 0.3;
    if (pairDetails) {
      let currencyAmount = 0;
      if (type == "buy") {
        currencyAmount = volume * pairDetails.ask_price;
      } else if (type == "sell") {
        currencyAmount = volume * pairDetails.bid_price;
      }
      if (includeFees == "false") {
        currencyAmount = currencyAmount + ((currencyAmount * krakenFees) / 100);
        currencyAmount = currencyAmount + ((currencyAmount * faldaxFees) / 100);
      }
      let { crypto, currency } = await sails
        .helpers
        .utilities
        .getCurrencies(pair);
      let wallet = null;
      if (type == "buy") {
        wallet = await sails
          .helpers
          .utilities
          .getWalletBalance(crypto, currency, userId)
          .tolerate("coinNotFound", () => {
            throw new Error("coinNotFound");
          })
          .tolerate("serverError", () => {
            throw new Error("serverError")
          });
      } else if (type == "sell") {
        wallet = await sails
          .helpers
          .utilities
          .getWalletBalance(currency, crypto, userId)
          .tolerate("coinNotFound", () => {
            throw new Error("coinNotFound");
          })
          .tolerate("serverError", () => {
            throw new Error("serverError")
          });
      }
      if (currencyAmount <= wallet.placed_balance) {
        var addedData = await sails
          .helpers
          .kraken
          .addStandardOrder(pairDetails.kraken_pair, type, "market", volume).tolerate("orderError", () => {
            throw new Error("orderError");
          });
        console.log("addedData-----", addedData);
        // if (addedData && addedData.error) {

        // }

      } else {
        console.log("insufficient funds");
      }
    } else {
      console.log("invalid pair");
    }
  }

}
