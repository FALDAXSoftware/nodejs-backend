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

    //Configuring bitgo API with access token
    var bitgo = new BitGoJS.BitGo({
      env: sails.config.local.BITGO_ENV_MODE,
      accessToken: sails.config.local.BITGO_ACCESS_TOKEN
    });

    //Fetching coin list
    var requestedCoin = await Coins.find({
      deleted_at: null,
      is_active: true,
      coin_code: inputs.coin
    })

    console.log(requestedCoin)

    //Generating wallet id for particular coin
    bitgo
      .coin(inputs.coin)
      .wallets()
      .generateWallet({
        label: inputs.coin + '-wallet',
        passphrase: sails.config.local.BITGO_PASSPHRASE
      })
      .then(async newWallet => {
        console.log(newWallet);
        await Coins
          .update({
            id: requestedCoin.id
          })
          .set({
            'hot_send_wallet_address': newWallet
              .wallet
              .id()
          });
        return exits.success(newWallet);
      })
  }

};
