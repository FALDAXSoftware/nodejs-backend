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
    var currency = orderData.currency;
    var crypto = orderData.settle_currency;
    var total_price = orderData.limit_price * orderData.quantity;
    let buyAdded = await buyBook
      .create(orderData)
      .fetch();

    var walletBalance = await sails
      .helpers
      .utilities
      .getWalletBalance(orderData.crypto, orderData.currency, inputs.user_id)
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

    return exits.success(buyAdded);
  }
};
