const BitGoJS = require('bitgo');
module.exports = {

  friendlyName: 'Create',

  description: 'Create wallet.',

  inputs: {
    coin: {
      type: 'string',
      example: 'BTC',
      description: 'Name of coin for wallet creation',
      required: true
    }
  },

  exits: {

    success: {
      description: 'All done.'
    },
    error: {
      description: 'error.'
    }

  },

  fn: async function (inputs) {

    var bitgo = new BitGoJS.BitGo({ env: sails.config.local.BITGO_ENV_MODE, accessToken: sails.config.local.BITGO_ACCESS_TOKEN });
    var requestedCoin = await Coins.find({ deleted_at: null, is_active: true, coin_code: inputs.coin })

    bitgo
      .coin(inputs.coin)
      .wallets()
      .generateWallet({
        label: inputs.coin + '-wallet',
        passphrase: sails.config.local.BITGO_PASSPHRASE
      })
      .then(async newWallet => {
        await Coins
          .update({ id: requestedCoin.id })
          .set({
            'wallet_address': newWallet
              .wallet
              .id()
          });
        return exits.success(newWallet);
      })
  }

};
