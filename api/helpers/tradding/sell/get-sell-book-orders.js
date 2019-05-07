module.exports = {

  friendlyName: 'Get sell book orders',

  description: '',

  inputs: {
    crypto: {
      type: 'string',
      example: 'BTC',
      description: 'Code of Crypto.',
      required: true
    },
    currency: {
      type: 'string',
      example: 'ETH',
      description: 'Code of Currency.',
      required: true
    }
  },

  exits: {

    success: {
      outputFriendlyName: 'Sell book orders'
    }
  },

  fn: async function (inputs, exits) {

    var sellBookOrders;
    sellBookOrders = await SellBook.find({
      where: {
        deleted_at: null,
        settle_currency: inputs.crypto,
        currency: inputs.currency
      },
      sort: "price ASC"
    });
    return exits.success(sellBookOrders);

  }

};
