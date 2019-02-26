var moment = require('moment');
module.exports = {

  friendlyName: 'Get candle stick data',

  description: '',

  inputs: {
    crypto: {
      type: 'string',
      example: 'ETH',
      description: 'Name of cryptocurrency',
      required: true
    },
    currency: {
      type: 'string',
      example: 'BTC',
      description: 'Name of currency',
      required: true
    },
    time_period: {
      type: 'number',
      example: 1,
      description: 'Interval at which data needs to be obtained',
      required: true
    },
    duration: {
      type: 'number',
      example: 1,
      description: 'Number of days for which data needs to be found',
      required: true
    }
  },

  exits: {

    success: {
      outputFriendlyName: 'Candle stick data'
    }
  },

  fn: async function (inputs) {

    try { // Get candle stick data.
      var candleStickData = [];
      // TODO Send back the result through the success exit.

      var today = moment()
        .utc()
        .format('YYYY-MM-DD 23:59:59');

      var lastData = moment()
        .utc()
        .subtract(inputs.duration, "days")
        .format('YYYY-MM-DD');

      var open = await sails.sendNativeQuery("SELECT fill_price as open, to_timestamp(floor((extract('epoch' from created_at) " +
          "/ 60 * " + inputs.time_period + " )) * 60*" + inputs.time_period + " ) AT TIME ZONE 'UTC' as interval_alias FROM trade_history WHERE settle_currency" +
          " = " + inputs.crypto + "AND currency = " + inputs.currency + " AND id in ( select min(id)  FROM trade_history WHERE created_at >= " + lastData + " AND created_at <= " + today + " group by to_timestamp(floor((extract('epoch' from created_at) / 60*" + inputs.time_period + " )) * 60*" + inputs.time_period + ") AT TIME ZONE 'UTC' )");

      var close = await sails.sendNativeQuery("SELECT fill_price as close, to_timestamp(floor((extract('epoch' from created_at)" +
          " / 60 * " + inputs.time_period + " )) * 60*" + inputs.time_period + " ) AT TIME ZONE 'UTC' as interval_alias FROM trade_history WHERE settle_currency" +
          " = " + inputs.crypto + "AND currency = " + inputs.currency + " AND id in ( select max(id)  FROM trade_history WHERE created_at >= " + lastData + " AND created_at <= " + today + " group by to_timestamp(floor((extract('epoch' from created_at) / 60*" + inputs.time_period + " )) * 60*" + inputs.time_period + ") AT TIME ZONE 'UTC' )")

      var high = await sails.sendNativeQuery("SELECT max(fill_price) as high, to_timestamp(floor((extract('epoch' from created" +
          "_at) / 60 *" + inputs.time_period + " )) * 60*" + inputs.time_period + ") AT TIME ZONE 'UTC' as createdNew FROM trade_history WHERE settle_currency = " + inputs.crypto + " AND currency = " + inputs.currency + " AND GROUP BY to_timestamp(floor((extract('epoch' from created_at) / 60 *21 )) *" +
          " 60*21) AT TIME ZONE 'UTC' ORDER BY createdNew");

      var low = await sails.sendNativeQuery("SELECT min(fill_price) as high, to_timestamp(floor((extract('epoch' from created" +
          "_at) / 60 *" + inputs.time_period + " )) * 60*" + inputs.time_period + ") AT TIME ZONE 'UTC' as createdNew FROM trade_history WHERE settle_currency = " + inputs.crypto + " AND currency = " + inputs.currency + " AND GROUP BY to_timestamp(floor((extract('epoch' from created_at) / 60 *21 )) *" +
          " 60*21) AT TIME ZONE 'UTC' ORDER BY createdNew");

      open.map((data, i) => {
        var newData = [];
        newData[0] = parseInt(moment(open[i].interval_alias).format('X'));
        newData[1] = open[i].open;
        newData[2] = high[i].high;
        newData[3] = low[i].low;
        newData[4] = close[i].close;
        candleStickData.push(newData);

      });

      return candleStickData;
    } catch (error) {
      console.log(error);
    }

  }

};
