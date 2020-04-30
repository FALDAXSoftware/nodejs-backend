/**
 * TradingViewController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const moment = require('moment');
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
  getSymbolInfo: function (req, res) {
    res.json({
      description: req.query.symbol,
      // "exchange-listed": "Faldax", "exchange-traded": "Faldax",
      has_intraday: true,
      has_no_volume: false,
      minmov: 1,
      minmov2: 0,
      name: req.query.symbol,
      pointvalue: 1,
      pricescale: 100,
      // session: "0930-1630",
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
      // console.log("req.allParams()", req.allParams())
      let { symbol, resolution, from, to } = req.allParams();
      let { crypto, currency } = await sails
        .helpers
        .utilities
        .getCurrencies(symbol);

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
        // case "1D":
        //   resolutionInMinute = 1440
        //   break;
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
      // console.log("crypto, currency, resolutionInMinute, from, to", crypto, currency, resolutionInMinute, from, to)
      let candleStickData = await sails
        .helpers
        .tradding
        .getCandleStickData(crypto, currency, resolutionInMinute, from, to)
        .tolerate("serverError", () => {
          throw new Error("serverError");
        });
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
      console.log(error);

      return res
        .status(200)
        .json({
          s: "error",
          "errmsg": sails.__("Something Wrong").message
        });
    }
  }

};
