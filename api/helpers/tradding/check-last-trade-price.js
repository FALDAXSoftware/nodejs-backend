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
    var tradeHistoryCount = await sails
      .helpers
      .tradding
      .trade
      .getTradeDetails(input.crypto, inputs.currency);

    var lastTradePrice;

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

      var sellBookData = sellBook[0].fill_price || 0;
      lastTradePrice = ((buyBookData + sellBookData) / 2);

    } else {
      var tradeData = await sails
        .helpers
        .tradding
        .trade
        .getLastTradePrice(inputs.settle_currency, inputs.currency);
      lastTradePrice = tradeData[0].fill_price;
    }
    return exits.success(lastTradePrice)

  }

};
