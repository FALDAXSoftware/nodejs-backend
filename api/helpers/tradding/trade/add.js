module.exports = {


  friendlyName: 'Add',


  description: 'Add trade.',


  inputs: {
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
    let tradehistory = await TradeHistory.create(orderData).fetch();
    return exits.success(tradehistory);
  }


};

