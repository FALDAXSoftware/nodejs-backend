module.exports = {


  friendlyName: 'Update',


  description: 'Update activity.',


  inputs: {
    id: {
      type: 'number',
      example: 1,
      description: 'id of activity.',
      required: true
    },
    orderData: {
      type: "json",
      description: 'Order Data To add.',
      required: true
    }
  },


  exits: {
    success: {
      description: 'All done.',
    },

  },


  fn: async function (inputs, exits) {
    let orderData = inputs.orderData;
    var remainQuantity = await ActivityTable.findOne({ id: inputs.id });

    var total_quantity = remainQuantity.quantity - orderData.quantity;

    let tradehistory = await ActivityTable.update({ id: inputs.id }).set({ quantity: total_quantity }).fetch();
    return exits.success(tradehistory);
  }


};

