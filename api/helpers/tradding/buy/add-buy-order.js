module.exports = {

  friendlyName: 'Add buy order',

  description: '',

  inputs: {
    buyLimitOrderData: {
      type: 'json',
      example: '{}',
      description: 'Buy Limit Data',
      required: true
    }
  },

  exits: {

    success: {
      description: 'All done.'
    }
  },

  fn: async function (inputs, exits) {
    let orderData = inputs.buyLimitOrderData;
    let buyAdded = await buyBook
      .create(orderData)
      .fetch();
    return exits.success(buyAdded);
  }
};
