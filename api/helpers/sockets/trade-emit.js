module.exports = {


  friendlyName: 'Trade emit',


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
      description: 'All done.',
    },

  },


  fn: async function (inputs, exits) {
    let buyBookDetails = await sails
      .helpers
      .tradding
      .buy
      .getBuyBookOrders(inputs.crypto, inputs.currency);
    sails.sockets.broadcast(inputs.crypto + "-" + inputs.currency, "buybookUpdate", buyBookDetails);
    let sellBookDetails = await sails
      .helpers
      .tradding
      .sell
      .getSellBookOrders(inputs.crypto, inputs.currency);
    sails.sockets.broadcast(inputs.crypto + "-" + inputs.currency, "sellbookUpdate", sellBookDetails);
    return exits.success();
  }


};

