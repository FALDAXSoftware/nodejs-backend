module.exports = {


  friendlyName: 'Get sell wallet balance',


  description: 'Get sell wallet balance',


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
      outputFriendlyName: 'Sell wallet balance',
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
      console.log(inputs.crypto);

      // Get sell wallet balance.
      var sellWalletBalance;
      // TODO
      let coin = await Coins.findOne({
        is_active: true,
        deleted_at: null,
        coin: inputs.crypto
      });
      console.log("------> ", coin);

      if (!coin) {
        return exits.coinNotFound();
      }
      sellWalletBalance = await Wallet.findOne({
        is_active: true,
        deleted_at: null,
        coin_id: coin.id,
        user_id: inputs.user_id
      });
      // Send back the result through the success exit.
      return exits.success(sellWalletBalance);
    } catch (error) {
      return exits.serverError();

    }
  }


};

