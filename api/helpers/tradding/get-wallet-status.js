module.exports = {

  friendlyName: 'Get wallet status',

  description: '',

  inputs: {
    limitBuyOrder: {
      type: 'json',
      example: '{}',
      description: 'Limit Order',
      required: true
    },
    wallet: {
      type: 'json',
      example: '{}',
      description: 'wallet of user',
      required: true
    }
  },

  exits: {

    success: {
      outputFriendlyName: 'Wallet status'
    }
  },

  fn: async function (inputs, exits) {

    // Get wallet status.
    var walletStatus;
    var order = inputs.limitBuyOrder;
    var wallet = inputs.wallet;
    if (order.limit_price * order.quantity <= walllet.placed_balance) {
      return exits.success(true);
    } else {
      return exits.success(false);
    }
    // TODO Send back the result through the success exit.
    return walletStatus;

  }

};
