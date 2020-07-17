/**
 * TradingViewController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const moment = require('moment');

// Influx setup
const Influx = require('influx');
const influx = new Influx.InfluxDB({
  host: process.env.INFLUX_HOST,
  port: process.env.INFLUX_PORT,
  database: process.env.INFLUX_DATABASE,
  username: process.env.INFLUX_USERNAME,
  password: process.env.INFLUX_PASSWORD,
  schema: [
    {
      measurement: 'trade_history_xrp_btc',
      fields: {
        price: Influx.FieldType.FLOAT,
        amount: Influx.FieldType.FLOAT
      },
      tags: [
        'pair'
      ]
    }
  ]
})

module.exports = {
  getConfig: function (req, res) {
    return res.json({
      "supports_search": true,
      "supports_group_request": false,
      "supports_marks": false,
      "supports_timescale_marks": false,
      "supports_time": true,
      "exchanges": [
        {
          "value": "",
          "name": "All Exchanges",
          "desc": ""
        }
      ],
      "symbols_types": [
        {
          "name": "All types",
          "value": ""
        }
      ],
      "supported_resolutions": [
        "1",
        "15",
        "240",
        "D",
        "2D",
        "3D",
        "W",
        "3W",
        "M",
        "6M"
      ]
    });
  },
  getCurrentTime: function (req, res) {
    res.json(moment.utc().valueOf());
  },
  getSymbolInfo: async function (req, res) {
    let quantityPrecision = 8;
    let pricePrecision = 100000;
    let pair = await Pairs.findOne({
      name: (req.query.symbol),
      is_active: true,
      deleted_at: null
    });
    if (pair != undefined) {
      quantityPrecision = parseInt(pair.quantity_precision);
      pricePrecision = parseFloat(1 + 'e' + pair.price_precision);
    }
    res.json({
      description: (req.query.symbol).replace("-", "/"),
      // "exchange-listed": "Faldax", "exchange-traded": "Faldax",
      has_intraday: true,
      has_no_volume: false,
      minmov: 1,
      minmov2: 0,
      name: (req.query.symbol).replace("-", "/"),
      pointvalue: 1,
      // pricescale: 100,
      volume_precision: quantityPrecision,
      pricescale: pricePrecision,
      session: ":1234567",
      supported_resolutions: [
        "1",
        "15",
        "240",
        "D",
        "2D",
        "3D",
        "W",
        "3W",
        "M",
        "6M"
      ],
      ticker: req.query.symbol,
      timezone: "Etc/UTC",
      type: "stock"
    });
  },
  getHistoryData: async function (req, res) {
    try {
      console.log("req.allParams()", req.allParams())
      let { symbol, resolution, from, to } = req.allParams();

      if (symbol == "XRP-BTC") {
        // var limit = 1440;
        from = moment.unix(from)
          .utc()
          .format();
        to = moment.unix(to)
          .utc()
          .format();
        var period
        if (resolution == 1) {
          period = "1m"
        } else if (resolution == 15) {
          period = '15m'
        } else if (resolution == 240) {
          period = "4h";
        } else if (resolution == 'D') {
          period = '1d'
        } else if (resolution == '1D') {
          period = '1d'
        } else if (resolution == '2D') {
          period = '2d'
        } else if (resolution == '3D') {
          period = '3d'
        } else if (resolution == 'W') {
          period = '1w';
        } else if (resolution == '3W') {
          period = '3w'
        } else if (resolution == 'M') {
          period = '4w'
        } else if (resolution == '6M') {
          period = '24w'
        }
        var influx_table_name = 'trade_history_xrp_btc';
        var influx_pair_name = 'xrpbtc';
        var dataValue = await influx.query(`
                          SELECT first(price) AS open, last(price) AS close, 
                          max(price) AS high, min(price) AS low, sum(amount) AS volume 
                          FROM ${influx_table_name} WHERE pair='${influx_pair_name}' AND time > '${from}'  AND time < '${to}'
                          GROUP BY time(${period})
                      `)
        var candleStickData = {};
        var o = [];
        var c = [];
        var l = [];
        var h = [];
        var v = [];
        var t = [];
        if (dataValue.groupRows.length > 0) {
          for (var i = 0; i < (dataValue.groupRows[0].rows).length; i++) {
            if (dataValue.groupRows[0].rows[i].open != null) {
              console.log("moment.utc(dataValue.groupRows[0].rows[i].time", moment.utc(dataValue.groupRows[0].rows[i].time).unix())
              t.push(parseFloat(moment.utc(dataValue.groupRows[0].rows[i].time).unix()));
              o.push(dataValue.groupRows[0].rows[i].open);
              c.push(dataValue.groupRows[0].rows[i].close);
              l.push(dataValue.groupRows[0].rows[i].low);
              h.push(dataValue.groupRows[0].rows[i].high);
              v.push(dataValue.groupRows[0].rows[i].volume);
            }
          }
          candleStickData = {
            o: o,
            h: h,
            l: l,
            c: c,
            t: t,
            v: v
          }

          return res
            .status(200)
            .json({
              s: "ok",
              ...candleStickData
            });
        } else {
          return res
            .status(200)
            .json({ s: "no_data" });
        }
      } else if (symbol == "ETH-BTC") {
        from = moment.unix(from)
          .utc()
          .format();
        to = moment.unix(to)
          .utc()
          .format();
        var period
        if (resolution == 1) {
          period = "1m"
        } else if (resolution == 15) {
          period = '15m'
        } else if (resolution == 240) {
          period = "4h";
        } else if (resolution == 'D') {
          period = '1d'
        } else if (resolution == '1D') {
          period = '1d'
        } else if (resolution == '2D') {
          period = '2d'
        } else if (resolution == '3D') {
          period = '3d'
        } else if (resolution == 'W') {
          period = '1w';
        } else if (resolution == '3W') {
          period = '3w'
        } else if (resolution == 'M') {
          period = '4w'
        } else if (resolution == '6M') {
          period = '24w'
        }
        var influx_table_name = 'trade_history_eth_btc';
        var influx_pair_name = 'ethbtc';
        var dataValue = await influx.query(`
                        SELECT first(price) AS open, last(price) AS close, 
                        max(price) AS high, min(price) AS low, sum(amount) AS volume 
                        FROM ${influx_table_name} WHERE pair='${influx_pair_name}' AND time > '${from}'  AND time < '${to}'
                        GROUP BY time(${period})
                    `)
        var candleStickData = {};
        var o = [];
        var c = [];
        var l = [];
        var h = [];
        var v = [];
        var t = [];
        if (dataValue.groupRows.length > 0) {
          for (var i = 0; i < (dataValue.groupRows[0].rows).length; i++) {
            if (dataValue.groupRows[0].rows[i].open != null) {
              console.log("moment.utc(dataValue.groupRows[0].rows[i].time", moment.utc(dataValue.groupRows[0].rows[i].time).unix())
              t.push(parseFloat(moment.utc(dataValue.groupRows[0].rows[i].time).unix()));
              o.push(dataValue.groupRows[0].rows[i].open);
              c.push(dataValue.groupRows[0].rows[i].close);
              l.push(dataValue.groupRows[0].rows[i].low);
              h.push(dataValue.groupRows[0].rows[i].high);
              v.push(dataValue.groupRows[0].rows[i].volume);
            }
          }
          candleStickData = {
            o: o,
            h: h,
            l: l,
            c: c,
            t: t,
            v: v
          }

          return res
            .status(200)
            .json({
              s: "ok",
              ...candleStickData
            });
        } else {
          return res
            .status(200)
            .json({ s: "no_data" });
        }
      }

      let { crypto, currency } = await sails
        .helpers
        .utilities
        .getCurrencies(symbol);

      // console.log("req.allParams()", req.allParams())

      let resolutionInMinute = 0;
      // Covert Resolution In Day
      switch (resolution) {
        case "1":
          resolutionInMinute = 1;
          break;
        case "15":
          resolutionInMinute = 15
          break;
        case "240":
          resolutionInMinute = 240
          break;
        // Day
        case "D":
          resolutionInMinute = 1440
          break;
        case "1D":
          resolutionInMinute = 1440
          break;
        // 2 Day 2 Day
        case "2D":
          resolutionInMinute = 2 * 1440
          break;
        // 3 Day
        case "3D":
          resolutionInMinute = 3 * 1440
          break;
        // Week
        case "W":
          resolutionInMinute = 7 * 1440
          break;
        // 3 Week
        case "3W":
          resolutionInMinute = 3 * 7 * 1440
          break;
        // Month
        case "M":
          resolutionInMinute = 30 * 1440
          break;
        // 6 Month
        case "6M":
          resolutionInMinute = 6 * 30 * 1440
          break;
        // Minutes -> Day
        default:
          resolutionInMinute = parseInt(resolution);
          break;
      }
      var dataValue = {};
      var candleStickData = await sails
        .helpers
        .tradding
        .getCandleStickData(crypto, currency, resolutionInMinute, from, to)
        .tolerate("serverError", () => {
          throw new Error("serverError");
        });
      // console.log("candleStickData.o.length", candleStickData.o.length)
      if (candleStickData.o.length > 0) {
        return res
          .status(200)
          .json({
            s: "ok",
            ...candleStickData
          });
      } else {
        return res
          .status(200)
          .json({ s: "no_data" });
      }
    } catch (error) {
      console.log("error", error);

      return res
        .status(200)
        .json({
          s: "error",
          "errmsg": sails.__("Something Wrong").message
        });
    }
  },
};
