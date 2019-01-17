module.exports = {

  friendlyName: 'Get last trade price',

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
      outputFriendlyName: 'Last trade price'
    }
  },

  fn: async function (inputs, exits) {

    // Get last trade price.
    var lastTradePrice;

    lastTradePrice = await TradeHistory.find({
      where: {
        deleted_at: null,
        settle_currency: inputs.crypto,
        currency: inputs.currency
      },
      sort: 'id DESC',
      limit: 1
    });
    // TODO Send back the result through the success exit.
    return exits.success(lastTradePrice);

  }

};
