const BitGoJS = require('bitgo');
module.exports = {

  friendlyName: 'Create',

  description: 'Create wallet address for particular coin only.',

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

  fn: async function (inputs, exits) {

    var access_token_value = await sails.helpers.getDecryptData(sails.config.local.BITGO_ACCESS_TOKEN);
    var passphrase_value = await sails.helpers.getDecryptData(sails.config.local.BITGO_PASSPHRASE);
    var enterprise_value = await sails.helpers.getDecryptData(sails.config.local.BITGO_ENTERPRISE);
    //Configuring bitgo API with access token
    var bitgo = new BitGoJS.BitGo({
      env: sails.config.local.BITGO_ENV_MODE,
      accessToken: access_token_value,
      enterprise: enterprise_value
    });

    //Fetching coin list
    var requestedCoin = await Coins.find({
      deleted_at: null,
      is_active: true,
      coin_code: inputs.coin
    })

    //Generating wallet id for particular coin
    bitgo
      .coin(inputs.coin)
      .wallets()
      .generateWallet({
        label: inputs.coin + '-wallet',
        passphrase: passphrase_value,
        enterprise: enterprise_value
      })
      .then(async newWallet => {
        await Coins
          .update({
            id: requestedCoin[0].id
          })
          .set({
            'custody_wallet_address': newWallet
              .wallet
              .id()
          });
        return exits.success(newWallet);
      })
  }

};
