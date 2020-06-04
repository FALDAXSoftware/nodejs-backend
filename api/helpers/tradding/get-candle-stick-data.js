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
    // duration: {   type: 'number',   example: 1,   description: 'Number of days
    // for which data needs to be found',   required: true },
    from: {
      type: 'string',
      example: "1550893613",
      description: 'Time stamp from data you want',
      required: true
    },
    to: {
      type: 'string',
      example: "1550893613",
      description: 'Time stamp until data you want',
      required: true
    }
  },

  exits: {

    success: {
      outputFriendlyName: 'Candle stick data'
    },
    serverError: {
      description: 'serverError'
    }

  },

  fn: async function (inputs, exits) {

    try {
      // Get candle stick data.
      var candleStickData = {};
      // TODO Send back the result through the success exit.

      // console.log("inputs", inputs)
      var from = moment
        .unix(inputs.from)
        .utc()
        .format("YYYY-MM-DD 00:00:00");
      var to = moment
        .unix(inputs.to)
        .utc()
        .format("YYYY-MM-DD 23:59:59");
      // for the current day
      // var start = moment.tz("America/Chicago", inputs.from).startOf('day').utc().format("YYYY-MM-DD HH:mm:ss");
      // var end = moment.tz("America/Chicago").endOf('day').utc().format("YYYY-MM-DD HH:mm:ss");
      // console.log("start",start)
      // console.log("end",end)
      // console.log("Form To-----------------", from, to);
      let openQuery = `SELECT id, fill_price, TO_TIMESTAMP(floor(extract(EPOCH FROM created_at)/(60*${inputs.time_period}))*(60*${inputs.time_period})) as interval 
                        FROM trade_history 
                        WHERE id IN (SELECT min(id) FROM trade_history 
                              WHERE created_at >= '${from}' AND created_at <= '${to}'
                              AND settle_currency = '${inputs.crypto}' AND currency = '${inputs.currency}' 
                              GROUP BY TO_TIMESTAMP(floor(extract(EPOCH FROM created_at)/(60*${inputs.time_period}))*(60*${inputs.time_period}))) 
                        ORDER BY interval 
                        LIMIT 15000`
      // let openQuery = "SELECT id, fill_price, TO_TIMESTAMP(floor(extract(EPOCH FROM created_At)/(60*" + inputs.time_period + "))*(60*" + inputs.time_period + ")) as interval FROM trade_history WHERE settle_currency = '" + inputs.crypto + "' AND currency = '" + inputs.currency + "' AND id IN (SELECT min(id) FROM trade_history WHERE created_at >= '" + from + "' AND created_at <= '" + to + "' GROUP BY TO_TIMESTAMP(floor(extract(EPOCH FROM created_At)/(60*" + inputs.time_period + "))*(60*" + inputs.time_period + "))) ORDER BY interval LIMIT 1000";
      // console.log("openQuery", openQuery)
      var openResult = await sails.sendNativeQuery(openQuery);
      // console.log("Open------------", openResult);
      // var openResult = [];

      let closeQuery = `SELECT id, fill_price, TO_TIMESTAMP(floor(extract(EPOCH FROM created_at)/(60*${inputs.time_period}))*(60*${inputs.time_period})) as interval 
                          FROM trade_history 
                          WHERE id IN (SELECT max(id) FROM trade_history 
                                WHERE created_at >= '${from}' AND created_at <= '${to}'
                                AND settle_currency = '${inputs.crypto}' AND currency = '${inputs.currency}'
                                GROUP BY TO_TIMESTAMP(floor(extract(EPOCH FROM created_at)/(60*${inputs.time_period}))*(60*${inputs.time_period}))) 
                          ORDER BY interval 
                          LIMIT 15000`
      // let closeQuery = "SELECT id, fill_price, TO_TIMESTAMP(floor(extract(EPOCH FROM created_At)/(60*" + inputs.time_period + "))*(60*" + inputs.time_period + ")) as interval FROM trade_history WHERE settle_currency = '" + inputs.crypto + "' AND currency = '" + inputs.currency + "' AND id IN (SELECT max(id) FROM trade_history WHERE created_at >= '" + from + "' AND created_at <= '" + to + "' GROUP BY TO_TIMESTAMP(floor(extract(EPOCH FROM created_At)/(60*" + inputs.time_period + "))*(60*" + inputs.time_period + "))) ORDER BY interval LIMIT 1000";
      // console.log("closeQuery", closeQuery)
      var closeResult = await sails.sendNativeQuery(closeQuery);
      // var closeResult = [];
      // console.log("Close------------", closeResult);

      let highQuery = `SELECT max(fill_price) as fill_price, TO_TIMESTAMP(floor(extract(EPOCH FROM created_at)/(60*${inputs.time_period}))*(60*${inputs.time_period})) as interval 
                        FROM trade_history WHERE settle_currency = '${inputs.crypto}' AND currency = '${inputs.currency}' 
                        AND created_at >= '${from}' AND created_at <= '${to}' 
                        GROUP BY interval 
                        ORDER BY interval 
                        LIMIT 15000`
      // let highQuery = "SELECT max(fill_price) as fill_price, TO_TIMESTAMP(floor(extract(EPOCH FROM crea" +
      "ted_At)/(60*" + inputs.time_period + "))*(60*" + inputs.time_period + ")) as interval FROM trade_history WHERE settle_currency = '" + inputs.crypto + "' AND currency = '" + inputs.currency + "' AND created_at >= '" + from + "' AND created_at <= '" + to + "' GROUP BY interval ORDER BY interval LIMIT 1000";
      // console.log("highQuery", highQuery)
      var highResult = await sails.sendNativeQuery(highQuery);
      // var highResult = [];
      // console.log("highResult-------------", highResult);

      let lowQuery = `SELECT min(fill_price) as fill_price, TO_TIMESTAMP(floor(extract(EPOCH FROM created_at)/(60*${inputs.time_period}))*(60*${inputs.time_period})) as interval 
                        FROM trade_history WHERE settle_currency = '${inputs.crypto}' AND currency = '${inputs.currency}'
                        AND created_at >= '${from}' AND created_at <= '${to}' 
                        GROUP BY interval 
                        ORDER BY interval 
                        LIMIT 15000`
      // let lowQuery = "SELECT min(fill_price) as fill_price, TO_TIMESTAMP(floor(extract(EPOCH FROM crea" +
      //   "ted_At)/(60*" + inputs.time_period + "))*(60*" + inputs.time_period + ")) as interval FROM trade_history WHERE settle_currency = '" + inputs.crypto + "' AND currency = '" + inputs.currency + "' AND created_at >= '" + from + "' AND created_at <= '" + to + "' GROUP BY interval ORDER BY interval LIMIT 1000";
      // console.log("lowQuery", lowQuery)
      var lowResult = await sails.sendNativeQuery(lowQuery);
      // console.log("lowResult", lowResult)
      // var lowResult = [];

      let volumnQuery = `SELECT sum(quantity) as quantity, TO_TIMESTAMP(floor(extract(EPOCH FROM created_at)/(60*${inputs.time_period}))*(60*${inputs.time_period})) as interval 
                          FROM trade_history 
                          WHERE settle_currency = '${inputs.crypto}' AND currency = '${inputs.currency}' 
                          AND created_at >= '${from}' AND created_at <= '${to}' 
                          GROUP BY interval 
                          ORDER BY interval 
                          LIMIT 15000`

      // let volumnQuery = "SELECT sum(quantity) as quantity, TO_TIMESTAMP(floor(extract(EPOCH FROM created_" +
      //   "At)/(60*" + inputs.time_period + "))*(60*" + inputs.time_period + ")) as interval FROM trade_history WHERE settle_currency = '" + inputs.crypto + "' AND currency = '" + inputs.currency + "' AND created_at >= '" + from + "' AND created_at <= '" + to + "' GROUP BY interval ORDER BY interval LIMIT 1000";
      // console.log("volumnQuery", volumnQuery)
      var volumnResult = await sails.sendNativeQuery(volumnQuery);
      // console.log("volumnResult", volumnResult)
      // var volumnResult = [];

      let open = [];
      let close = [];
      let high = [];
      let low = [];
      let time = [];
      let volumn = [];
      for (let index = 0; index < openResult.rows.length; index++) {
        // console.log("CLOSE RESULT AT INDEX ::: ", index + " == " +
        // closeResult.rows[index].fill_price);
        if (openResult.rows[index] !== undefined)
          open.push(openResult.rows[index].fill_price);
        time.push(moment.utc(openResult.rows[index].interval).unix());
        if (closeResult.rows[index] !== undefined)
          close.push(closeResult.rows[index].fill_price);
        if (highResult.rows[index] !== undefined)
          high.push(highResult.rows[index].fill_price);
        if (lowResult.rows[index] !== undefined)
          low.push(lowResult.rows[index].fill_price);
        volumn.push(volumnResult.rows[index].quantity)
      }
      candleStickData = {
        o: open,
        h: high,
        l: low,
        c: close,
        t: time,
        v: volumn
      }
      // console.log("candleStickData", candleStickData)
      return exits.success(candleStickData);
    } catch (error) {
      console.log(error);

      return exits.serverError();
    }

  }

};
