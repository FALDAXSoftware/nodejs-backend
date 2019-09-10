const request = require('request');
module.exports = {
  friendlyName: 'Get Market Price',
  description: '',
  inputs: {
    symbol: {
      type: 'string',
      example: 'XRP/BTC',
      description: 'Symbol of Pair',
      required: true
    }
  },
  exits: {
    success: {
      outputFriendlyName: 'Price',
    },
    error: {
      description: 'Something Error'
    }
  },
  //Response

  /*
  {
    "Ask": 0.25498,
    "Bid": 0.2541,
    "AskSize": 76800,
    "BidSize": 7754.5,
    "Symbol": "XRP/USD"
}
  */

  fn: async function (inputs, exits) {
    request({
      url: 'http://192.168.3.233:8080/Market/GetQuote?symbol='+inputs.symbol,
      method: "POST",
      headers: {
        // 'cache-control': 'no-cache',
        // Authorization: `Bearer ${sails.config.local.BITGO_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      // body: {
      //   symbol: inputs.symbol
      // },
      json: true
    }, function (err, httpResponse, body) {
      if (err) {
        return exits.error(err);
      }
      if (body.error) {
        return exits.error(body);
      }
      return exits.success(body);
    });

  }


};

