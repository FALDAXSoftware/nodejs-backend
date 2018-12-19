var { map } = require('lodash');
const BitGoJS = require('bitgo');

module.exports = {

  friendlyName: 'Receive address',

  description: '',

  inputs: {
    user: {
      type: 'json',
      example: '{}',
      description: 'User Data for which wallet needs to be created',
      required: true
    }
  },

  exits: {
    success: {
      description: 'All done.'
    },
    error: {
      description: 'Error.'
    }
  },

  fn: async function (inputs, exits) {
    var bitgo = new BitGoJS.BitGo({ env: sails.config.local.BITGO_ENV_MODE, accessToken: sails.config.local.BITGO_ACCESS_TOKEN });
    const coinData = await Coins.find({ deleted_at: null, is_active: true });
    for (let index = 0; index < coinData.length; index++) {
      const coin = coinData[index];
      if (coin.coin_name == inputs.user.fiat) {
        var obj = {
          wallet_id: "wallet",
          coin_id: parseInt(coin.id),
          receive_address: inputs.user.fiat,
          user_id: parseInt(inputs.user.id),
          balance: 0.0
        }
        var create = await Wallet
          .create(obj)
          .fetch()
      } else if (coin.coin_name !== 'USD' && coin.coin_name !== 'EUR' && coin.wallet_address) {
        var wallet = await bitgo
          .coin(coin.coin_code)
          .wallets()
          .get({ id: coin.wallet_address });

        if (wallet) {

          var address = await wallet.createAddress({ "chain": 0 });
          var obj = {
            wallet_id: coin.wallet_address,
            coin_id: parseInt(coin.id),
            receive_address: address.address,
            user_id: parseInt(inputs.user.id),
            balance: 0.0
          }

          var create = await Wallet
            .create(obj)
            .fetch();

          if (!address.address) {

            var interval = setInterval(async () => {
              try {
                bitgo
                  .coin(coin.coin_code)
                  .wallets()
                  .get({ id: coin.wallet_address })
                  .then(async (walletResponse) => {

                    if (typeof walletResponse._wallet.receiveAddress != 'undefined') {
                      let obj = {
                        wallet_id: coin.wallet_address,
                        coin_id: parseInt(coin.id),
                        receive_address: walletResponse._wallet.receiveAddress.address,
                        user_id: parseInt(inputs.user.id),
                        balance: 0.0
                      }

                      await Wallet
                        .update({ id: create.id })
                        .update(obj);

                      clearInterval(interval);
                    }
                  })
              } catch (err) {
                console.log(err);
              }
            }, 1000);
          }
        }
      }
    }
    return exits.success();
  }

};
