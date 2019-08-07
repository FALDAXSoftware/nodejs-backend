module.exports = {

  friendlyName: 'Check last trade price',

  description: '',

  inputs: {
    crypto: {
      type: 'string',
      example: 'ETH',
      description: 'Name of cryptocurrency.',
      required: true
    },
    currency: {
      type: 'string',
      example: 'BTC',
      description: 'Name of currency.',
      required: true
    }
  },

  exits: {

    success: {
      description: 'All done.'
    }
  },

  fn: async function (inputs, exits) {
    // TODO
    // Fetching trade history data on the basis of the currency and crypto
    var tradeHistoryCount = await sails
      .helpers
      .tradding
      .trade
      .getTradeDetails(inputs.crypto, inputs.currency, 1);

    var lastTradePrice;

    // If no trade history data has been found fetching details from the buy book and sell book and average of it
    if (tradeHistoryCount.length == 0) {
      var buyBook = await sails
        .helpers
        .tradding
        .buy
        .getBuyOrders(inputs.crypto, inputs.currency);

      var buyBookData = buyBook[0].fill_price || 0;

      var sellBook = await sails
        .helpers
        .tradding
        .sell
        .getSellBookOrders(inputs.crypto, inputs.currency);

      var sellBookData = SellBook[0].fill_price || 0;
      lastTradePrice = ((buyBookData + sellBookData) / 2);

    } else {
      // Fetching last trade price for particular pair from trade history
      var tradeData = await sails
        .helpers
        .tradding
        .trade
        .getLastTradePrice(inputs.crypto, inputs.currency);
      lastTradePrice = tradeData[0].fill_price;
    }
    return exits.success(lastTradePrice)

  }

};
