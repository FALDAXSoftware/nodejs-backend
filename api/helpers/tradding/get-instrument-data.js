var moment = require('moment');

module.exports = {

  friendlyName: 'Get instrument data',

  description: '',

  inputs: {
    currency: {
      type: 'string',
      example: 'BTC',
      description: 'Name of Coin',
      required: true
    }
  },

  exits: {

    success: {
      outputFriendlyName: 'Instrument data'
    }
  },

  fn: async function (inputs, exits) {

    try { // Get instrument data.
      var instrumentData;
      // TODO
      var pairData = [];

      var currency = inputs.currency;
      var now = moment
        .utc()
        .format();
      var yesterday = moment
        .utc(now)
        .subtract(1, 'days')
        .format();

      instrumentData = await Pairs.find({
        where: {
          name: {
            'contains': '-' + currency
          },
          is_active: true,
          deleted_at: null
        }
      });
      let coins = await Coins.find({
        is_active: true,
        deleted_at: null
      });
      let coinList = {};
      for (let index = 0; index < coins.length; index++) {
        const element = coins[index];
        coinList[element.id] = element;
      }
      for (var i = 0; i < instrumentData.length; i++) {
        var total_volume = 0;
        var current_price = 0;
        var previous_price = 0;
        var tradeData = await TradeHistory.find({
          where: {
            deleted_at: null,
            symbol: instrumentData[i].name,
            created_at: {
              '>=': yesterday,
              '<=': now
            }
          },
          sort: 'id DESC'
        });

        var lastTradePrice = 0;
        if (tradeData.length > 0) {
          lastTradePrice = tradeData[0]['fill_price'];
        } else {
          lastTradePrice = 0;
        }
        for (var j = 0; j < tradeData.length; j++) {
          total_volume = total_volume + tradeData[j]['quantity'];
        }
        if (tradeData.length == 0) {
          current_price = 0
        } else {
          current_price = tradeData[0]['fill_price']
        }
        if (tradeData.length == 0) {
          previous_price = 0;
        } else {
          previous_price = tradeData[tradeData.length - 1]['fill_price'];
        }

        var diffrence = current_price - previous_price
        var percentChange = (diffrence / current_price) * 100;

        if (isNaN(percentChange)) {
          percentChange = 0;
        } else if (percentChange == '-Infinity') {
          percentChange = 0;
        } else {
          percentChange = percentChange;
        }

        var instrument_data = {
          "name": instrumentData[i].name,
          "last_price": lastTradePrice,
          "volume": total_volume,
          "percentChange": percentChange,
          "coin_icon": (coinList[instrumentData[i].coin_code1] != undefined && coinList[instrumentData[i].coin_code1].coin_icon != null ? coinList[instrumentData[i].coin_code1].coin_icon : "")
        }
        pairData.push(instrument_data);
      }
      // Send back the result through the success exit.
      return exits.success(pairData);
    } catch (err) {
      console.log(err);
    }

  }

};
