module.exports = {

  friendlyName: 'Add pending order',

  description: '',

  inputs: {
    orderData: {
      type: "json",
      example: '{}',
      description: 'Order Data To add.',
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
    let orderData = inputs.orderData;
    let pendingData = await PendingBook
      .create(orderData)
      .fetch();

    return exits.success(pendingData);
  }

};
