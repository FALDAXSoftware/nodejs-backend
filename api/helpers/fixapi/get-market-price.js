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
    },type: {
      type: 'string',
      example: '0',
      description: '0:Bid, 1:Offer(Ask)',
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
      // url: sails.config.local.JST_MARKET_URL + '/Market/GetQuote?symbol=' + inputs.symbol,
      url: sails.config.local.JST_MARKET_URL + '/Market/GetQuoteSnapshot?symbol=' + inputs.symbol + '&mdEntyType=' + inputs.type,
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      json: true
    }, async function (err, httpResponse, body) {
      if (err) {
        return exits.error(err);
      }
      if (body.error) {
        return exits.error(body);
      }
      if((body.MDEntries).length > 0 ){
        let object_data = {
          coin: inputs.symbol,
          type: inputs.type,
          // ask_price: body.MDEntries[0].Ask,
          // ask_size: body.MDEntries[0].AskSize,
          // bid_price: body.MDEntries[0].Bid,
          // bid_size: body.MDEntries[0].BidSize,
          market_snapshot: body,
        };
        // Add data in table
        if( inputs.type == 1 ){
          object_data.ask_price = body.MDEntries[0].MDEntryPx;
          object_data.ask_size = body.MDEntries[0].MDEntrySize;
          object_data.bid_price = 0.0;
          object_data.bid_size = 0.0;
        }else{
          object_data.ask_price = 0.0;
          object_data.ask_size = 0.0;
          object_data.bid_price = body.MDEntries[0].MDEntryPx;
          object_data.bid_size = body.MDEntries[0].MDEntrySize;
        }

        await PriceHistory.create(object_data);
        //ends
      }


      return exits.success(body);
    });

  }


};

