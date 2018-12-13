module.exports = {

  friendlyName: 'Add sell order',

  description: '',

  inputs: {
    sellLimitOrderData: {
      type: 'json',
      example: '{}',
      description: 'Sell Limit Data',
      required: true
    }
  },

  exits: {

    success: {
      description: 'All done.'
    }
  },

  fn: async function (inputs, exits) {
    let orderData = inputs.sellLimitOrderData;
    let sellAdded = await sellBook
      .create(orderData)
      .fetch();
    return exits.success(sellAdded);
  }

};
