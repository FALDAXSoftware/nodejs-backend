var moment = require('moment');
module.exports = {

  friendlyName: 'Get card data',

  description: '',

  inputs: {
    symbol: {
      type: 'string',
      example: 'ETH-BTC',
      description: 'Pair for which card data need to be found',
      required: true
    }
  },

  exits: {

    success: {
      outputFriendlyName: 'Card data'
    }
  },

  fn: async function (inputs, exits) {

    try {
      var cardData = [];

      let { crypto, currency } = await sails
        .helpers
        .utilities
        .getCurrencies(inputs.symbol);

      var yesterday = moment()
        .subtract(1, 'days')
        .format('YYYY-MM-DD HH:mm:ss.SSS');
      var today = moment().format('YYYY-MM-DD HH:mm:ss.SSS');
      console.log("yestretday", yesterday);


      var total_price = 0;
      var average_price = 0;

      var price = await TradeHistory.find({
        where: {
          settle_currency: crypto,
          currency: currency,
          deleted_at: null,
          created_at: {
            '>=': yesterday
          }
        },
        sort: 'id DESC'
      });

      if (price.length == 0) {
        average_price = 0;
      } else {
        for (var i = 0; i < price.length; i++) {
          total_price = total_price + price[i]['fill_price'];
        }
        average_price = total_price / (price.length);
      }

      var current_price = await TradeHistory.find({
        where: {
          settle_currency: crypto,
          currency: currency,
          deleted_at: null,
          created_at: {
            '>=': yesterday
          },
          created_at: {
            '<=': today
          }
        },
        sort: 'id DESC'
      });

      if (current_price == undefined || current_price.length == 0) {
        current_price = 0;
      } else {
        current_price = current_price[0]['fill_price'];
      }

      var previous_price = await TradeHistory.find({
        where: {
          settle_currency: crypto,
          currency: currency,
          deleted_at: null,
          created_at: {
            '>=': yesterday
          }
        },
        sort: 'id ASC'
      });
      console.log(previous_price);

      if (previous_price == undefined || previous_price.length == 0) {
        previous_price = 0;
      } else {
        previous_price = previous_price[0]['fill_price'];
      }

      var diffrrence = current_price - previous_price;
      var percentchange = (diffrrence / current_price) * 100;

      if (percentchange == NaN || percentchange == "-Infinity") {
        percentchange = 0;
      } else {
        percentchange = percentchange;
      }

      var tradeOrderDetails = await TradeHistory.find({
        where: {
          deleted_at: null,
          settle_currency: crypto,
          currency: currency,
          created_at: {
            '>=': yesterday
          }
        },
        sort: 'id DESC'
      });

      var card_data = {
        "currency": currency,
        "settle_currency": crypto,
        "average_price": average_price,
        "diffrence": diffrrence,
        "percentchange": percentchange,
        "tradeChartDetails": tradeOrderDetails
      }

      return exits.success(cardData);
    } catch (err) {
      console.log(err);
    }
  }

};
