module.exports = {

  friendlyName: 'Get wallet balance',

  description: '',

  inputs: {
    crypto: {
      type: 'string',
      example: 'BTC',
      description: 'Code of Crypto.',
      required: true
    },
    currency: {
      type: 'string',
      example: 'ETH',
      description: 'Code of Currency.',
      required: true
    },
    user_id: {
      type: 'number',
      example: 1,
      description: 'Id Of user',
      required: true
    }
  },

  exits: {

    success: {
      outputFriendlyName: 'Wallet balance'
    },
    serverError: {
      descritpion: 'serverError'
    },
    coinNotFound: {
      description: 'Error when coin not found'
    }

  },

  fn: async function (inputs, exits) {
    try {
      // Get sell wallet balance.
      var walletBalance;
      // TODO
      let coin = await Coins.findOne({is_active: true, deleted_at: null, coin: inputs.currency});

      if (!coin) {
        return exits.coinNotFound();
      }
      walletBalance = await Wallet.findOne({is_active: true, deleted_at: null, coin_id: coin.id, user_id: inputs.user_id});
      // Send back the result through the success exit.
      return exits.success(walletBalance);
    } catch (error) {

      return exits.serverError();

    }
  }

};
