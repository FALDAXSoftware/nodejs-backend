const BitGoJS = require('bitgo');

module.exports = {

  friendlyName: 'Create all',

  description: '',

  inputs: {},

  exits: {

    success: {
      description: 'All done.'
    },
    unknown: {
      description: 'Something Went wrong'
    }
  },

  fn: async function (inputs, exits) {
    return exits.unknown({
      "err": sails.__("Something Wrong"),
    });
    try {
      console.log(sails.config.local.BITGO_ENV_MODE);
      console.log(sails.config.local.BITGO_ACCESS_TOKEN);

      var bitgo = new BitGoJS.BitGo({ env: sails.config.local.BITGO_ENV_MODE, accessToken: sails.config.local.BITGO_ACCESS_TOKEN });
      var requestedCoin = await Coins.find({ deleted_at: null, is_active: true })

      for (let index = 0; index < requestedCoin.length; index++) {
        const coin = requestedCoin[index];
        bitgo
          .coin(coin.coin_code)
          .wallets()
          .generateWallet({
            label: coin.coin_code + '-wallet',
            passphrase: sails.config.local.BITGO_PASSPHRASE,
            // enterprise: sails.config.local.BITGO_ENTERPRISE
          })
          .then(async newWallet => {
            console.log(newWallet.wallet.id());
            await Coins
              .update({ id: coin.id })
              .set({
                'wallet_address': newWallet
                  .wallet
                  .id()
              });

          })
      }
      return exits.success();
    } catch (error) {
      return exits.serverError({
        "status": 500,
        "message": sails.__("Something Wrong"),
      });
    }
  }

};
