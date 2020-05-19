const BitGoJS = require('bitgo');

module.exports = {

  friendlyName: 'Create all',

  description: 'Create wallet for all the coins.',

  inputs: {},

  exits: {

    success: {
      description: 'All done.'
    },
    serverError: {
      description: 'Something Went wrong'
    }
  },

  fn: async function (inputs, exits) {
    try {


      //Fetching coin list
      var requestedCoin = await Coins.find({
        deleted_at: null,
        is_active: true,
        is_fiat: false
      })

      for (let index = 0; index < requestedCoin.length; index++) {
        const coin = requestedCoin[index];
        var token_value = requestedCoin[index].access_token_value
        var access_token_value = await sails.helpers.getDecryptData(sails.config.local[token_value]);
        var passphrase_value = await sails.helpers.getDecryptData(sails.config.local.BITGO_PASSPHRASE);
        var enterprise_value = await sails.helpers.getDecryptData(sails.config.local.BITGO_ENTERPRISE);
        //Configuring bitgo API with access token
        var bitgo = new BitGoJS.BitGo({
          env: sails.config.local.BITGO_ENV_MODE,
          accessToken: access_token_value
        });
        //Generating wallet id for all coin
        bitgo
          .coin(coin.coin_code)
          .wallets()
          .generateWallet({
            label: coin.coin_code + '-wallet',
            passphrase: passphrase_value,
            enterprise: enterprise_value
          })
          .then(async newWallet => {
            await Coins
              .update({
                id: coin.id
              })
              .set({
                'wallet_address': newWallet
                  .wallet
                  .id()
              });

          })
      }
      return exits.success();
    } catch (error) {
      console.log(error);

      return exits.serverError({
        "err": sails.__("Something Wrong").message
      });
    }
  }

};
