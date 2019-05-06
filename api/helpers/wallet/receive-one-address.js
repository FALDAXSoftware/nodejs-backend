const BitGoJS = require('bitgo');

module.exports = {

  friendlyName: 'Receive address for one coin',

  description: '',

  inputs: {
    coin: {
      type: 'string',
      example: 'BTC',
      description: 'Name Of Coin',
      required: true
    },
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
    //Configuring bitgo
    var bitgo = new BitGoJS.BitGo({env: sails.config.local.BITGO_ENV_MODE, accessToken: sails.config.local.BITGO_ACCESS_TOKEN});

    //Fetching coin list
    const coinData = await Coins.find({deleted_at: null, is_active: true, coin_name: inputs.coin});
    bitgo
      .coin(coinData.coin_code)
      .wallets()
      .get({
        id: coinData.wallet_address
      }, async function (err, wallet) {
        if (err) {
          console.log(err);
        }
        wallet
          .createAddress({
            "chain": 0
          }, async function callback(err, address) {
            let obj = {
              walled_id: coinData.wallet_address,
              coin_id: coinData.id,
              recieve_address: address.address,
              user_id: inputs.user.id,
              balance: 0.0
            }
            var create = await Wallet.create(obj);
            // resolve({ wallet: "Wallet created" });
            exits.success();
          });
      });
  }

};
