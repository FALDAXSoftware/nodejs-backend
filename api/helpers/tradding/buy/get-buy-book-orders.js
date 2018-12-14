module.exports = {


  friendlyName: 'Get buy book orders',


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
    },
  },


  exits: {

    success: {
      outputFriendlyName: 'Buy book orders',
    },

  },


  fn: async function (inputs, exits) {

    // Get buy book orders.
    var buyBookOrders;
    buyBookOrders = await buyBook.find({
      where: {
        deleted_at: null,
        settle_currency: inputs.crypto,
        currency: inputs.currency
      },
      sort: "price DESC"
    });
    return exits.success(buyBookOrders);

  }


};

