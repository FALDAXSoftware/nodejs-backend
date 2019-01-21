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
      var card_data = [];
      var current_price = 0;
      var previous_price = 0;
      var flag = true;

      let {crypto, currency} = await sails
        .helpers
        .utilities
        .getCurrencies(inputs.symbol);

      let coinData = await Coins.findOne({
        where: {
          deleted_at: null,
          is_active: true,
          coin: crypto
        }
      });


      var yesterday = moment
        .utc()
        .subtract(1, 'days')
        .format();
      var today = moment
        .utc()
        .format();

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

      var current = await TradeHistory.find({
        where: {
          settle_currency: crypto,
          currency: currency,
          deleted_at: null,
          created_at: {
            '>=': yesterday,
            '<=': today
          }
        },
        sort: 'id DESC'
      });

      if (current == undefined || current.length == 0) {
        current_price = 0;
      } else {
        current_price = current[0]['fill_price'];
      }

      var previous = await TradeHistory.find({
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

      if (previous == undefined || previous.length == 0) {
        previous_price = 0;
      } else {
        previous_price = previous[0]['fill_price'];
      }

      var diffrrence = current_price - previous_price;
      var percentchange = (diffrrence / current_price) * 100;

      if (isNaN(percentchange) || percentchange == "-Infinity") {
        percentchange = 0;
      } else {
        percentchange = percentchange;
      }

      if (diffrrence < 0) {
        flag = false;
      } else {
        flag = true;
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

      card_data = {
        "currency": currency,
        "settle_currency": crypto,
        "average_price": average_price,
        "diffrence": diffrrence,
        "percentchange": percentchange,
        "flag": flag,
        "tradeChartDetails": tradeOrderDetails,
        "icon": coinData.coin_icon
      }

      return exits.success(card_data);
    } catch (err) {
      console.log(err);
    }
  }

};
