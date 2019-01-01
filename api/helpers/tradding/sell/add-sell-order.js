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

    //Adding balance in wallet
    var currency = orderData.currency;
    var crypto = orderData.settle_currency;
    var total_price = orderData.limit_price * orderData.quantity;

    let sellAdded = await sellBook
      .create(orderData)
      .fetch();

    var walletBalance = await sails
      .helpers
      .utilities
      .getSellWalletBalance(orderData.currency, orderData.crypto, inputs.user_id)
      .intercept("coinNotFound", () => {
        return new Error("coinNotFound");
      })
      .intercept("serverError", () => {
        return new Error("serverError");
      });

    var balance = walletBalance.placed_balance;
    var updatedBalance = balance - total_price;
    var updatedBalance = parseFloat((updatedBalance).toFixed(6));

    var walletUpdate = Wallet
      .update({id: walletBalance.id})
      .set({placed_balance: updatedBalance});
    return exits.success(sellAdded);
  }

};
