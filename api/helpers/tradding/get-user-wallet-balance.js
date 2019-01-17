module.exports = {

  friendlyName: 'Get user wallet balance',

  description: '',

  inputs: {
    user_id: {
      type: 'number',
      example: 1,
      description: 'Id of user',
      required: true
    },
    currency: {
      type: 'string',
      example: 'BTC',
      description: 'Coin for which balance need to be obtained',
      required: true
    },
    crypto: {
      type: 'string',
      example: 'XRP',
      description: 'Coin for which balance need to be obtained',
      required: true
    }
  },

  exits: {

    success: {
      outputFriendlyName: 'User wallet balance'
    }
  },

  fn: async function (inputs, exits) {

    // Get user wallet balance.
    var userWalletBalance;
    // TODO

    var coinId = await Coins.findOne({
      where: {
        is_active: true,
        deleted_at: null,
        coin: inputs.currency
      }
    })

    var cryptoId = await Coins.findOne({
      where: {
        is_active: true,
        deleted_at: null,
        coin: inputs.crypto
      }
    })

    userWalletCurrencyBalance = await Wallet.find({
      where: {
        coin_id: coinId.id,
        deleted_at: null,
        is_active: true
      }
    });

    userWalletCryptoBalance = await Wallet.find({
      where: {
        coin_id: cryptoId.id,
        deleted_at: null,
        is_active: true
      }
    });

    userWalletBalance = {
      'currency': userWalletCurrencyBalance,
      'crypto': userWalletCryptoBalance
    };

    // Send back the result through the success exit.
    return exits.success(userWalletBalance);

  }

};
