module.exports = {

  friendlyName: 'Add',

  description: 'Add activity.',

  inputs: {
    orderData: {
      type: "json",
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

    let orderData = inputs.orderData;
    let activityTable = await ActivityTable
      .create(orderData)
      .fetch();

    return exits.success(activityTable);
  }

};
