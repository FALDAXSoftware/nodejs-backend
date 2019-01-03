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
    },
    coinNotFound: {
      description: 'Error when coin not found'
    },
    serverError: {
      description: 'serverError'
    }
  },

  fn: async function (inputs, exits) {
    try {
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
        .getWalletBalance(orderData.settle_currency, orderData.currency, orderData.user_id)
        .intercept("coinNotFound", () => {
          return new Error("coinNotFound");
        })
        .intercept("serverError", () => {
          return new Error("serverError");
        });

      var balance = walletBalance.placed_balance;
      var updatedBalance = balance - total_price;
      var updatedBalance = parseFloat((updatedBalance).toFixed(6));

      var walletUpdate = await Wallet
        .update({id: walletBalance.id})
        .set({placed_balance: updatedBalance});

      return exits.success(buyAdded);
    } catch (error) {
      console.log(error);
      if (error.message == "coinNotFound") {
        return exits.coinNotFound();
      }
      return exits.serverError();
    }
  }
};
