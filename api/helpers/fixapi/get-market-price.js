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
      url: 'http://3.19.249.13:8080/Market/GetQuote?symbol=' + inputs.symbol,
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
    }, async function (err, httpResponse, body) {
      if (err) {
        return exits.error(err);
      }
      if (body.error) {
        return exits.error(body);
      }
      // Add data in table
      let object_data = {
        coin: inputs.symbol,
        ask_price: body.Ask,
        ask_size: body.AskSize,
        bid_price: body.Bid,
        bid_size: body.BidSize,
      };
      await PriceHistory.create(object_data);
      //ends

      return exits.success(body);
    });

  }


};
