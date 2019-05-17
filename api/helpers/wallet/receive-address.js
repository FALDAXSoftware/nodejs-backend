var {map} = require('lodash');
const BitGoJS = require('bitgo');

module.exports = {

  friendlyName: 'Receive address for particular user for which coin wallet address is available.',

  description: '',

  inputs: {
    user: {
      type: 'json',
      example: '{}',
      description: 'User Data for which wallet needs to be created',
      required: true
    },
    test_key: {
      type: 'string',
      example: 'hjkghbg',
      description: 'Testing key',
      required: false,
      defaultsTo: "false"
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

    //Configuring bitgo API with access token
    var bitgo = new BitGoJS.BitGo({env: sails.config.local.BITGO_ENV_MODE, accessToken: sails.config.local.BITGO_ACCESS_TOKEN});

    //Fetching coin list
    const coinData = await Coins.find({deleted_at: null, is_active: true, is_address_created_signup: true});

    for (let index = 0; index < coinData.length; index++) {
      const coin = coinData[index];
      if (coin.coin_name == inputs.user.fiat) {

        //For USD and EURO
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
      } else if (coin.coin_name !== 'USD' && coin.coin_name !== 'EUR' && coin.coin !== 'ETH' && coin.hot_receive_wallet_address) {

        //For all the coins accept USD EURO and ETH
        var wallet = await bitgo
          .coin(coin.coin_code)
          .wallets()
          .get({id: coin.hot_receive_wallet_address});

        if (wallet) {

          //Here chain =0 means testnet Generating wallet address
          var address = await wallet.createAddress({"chain": sails.config.local.chain});
          if (inputs.test_key == sails.config.local.test_key) {
            var obj = {
              wallet_id: "wallet",
              coin_id: parseInt(coin.id),
              receive_address: address.address,
              user_id: parseInt(inputs.user.id),
              balance: 100000.0,
              placed_balance: 100000.0
            }

          } else {
            var obj = {
              wallet_id: "wallet",
              coin_id: parseInt(coin.id),
              receive_address: address.address,
              user_id: parseInt(inputs.user.id),
              balance: 0.0,
              placed_balance: 0.0,
              // label: inputs.user.id
            }

          }
          var create = await Wallet
            .create(obj)
            .fetch();

          if (!address.address) {

            var interval = setInterval(async() => {
              try {
                bitgo
                  .coin(coin.coin_code)
                  .wallets()
                  .get({id: coin.wallet_address})
                  .then(async(walletResponse) => {

                    if (typeof walletResponse._wallet.receiveAddress != 'undefined') {
                      let obj = {
                        wallet_id: coin.wallet_address,
                        coin_id: parseInt(coin.id),
                        receive_address: walletResponse._wallet.receiveAddress.address,
                        user_id: parseInt(inputs.user.id),
                        balance: 0.0
                      }

                      await Wallet
                        .update({id: create.id})
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
