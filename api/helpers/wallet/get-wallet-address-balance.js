var fetch = require('node-fetch')
module.exports = {

  friendlyName: 'Get wallet address balance',

  description: '',

  inputs: {
    wallet_address: {
      type: 'string',
      example: '5ce2decc0b9242a103a3855327db059c',
      description: 'Wallet address for coin',
      required: true
    },
    coin_code: {
      type: 'string',
      example: 'tbtc',
      description: 'Coin Code for coin',
      required: true
    }
  },

  exits: {

    success: {
      outputFriendlyName: 'Wallet address balance'
    }
  },

  fn: async function (inputs, exits) {

    try {
      var walletAddressData;
      var coinData = await Coins.findOne({
        where: {
          deleted_at: null,
          is_active: true,
          coin_code: inputs.coin_code
        }
      })
      var token_value = coinData.access_token_value
      var access_token_value = await sails.helpers.getDecryptData(sails.config.local[token_value]);
      fetch(sails.config.local.BITGO_PROXY_URL + '/' + (inputs.coin_code).toLowerCase() + '/wallet/' + inputs.wallet_address, {
        method: "GET",
        headers: {
          Authorization: 'Bearer ' + access_token_value
        }
      })
        .then(resData => resData.json())
        .then(async resData => {
          walletAddressData = resData;
          var coinData = await Coins.findOne({
            where: {
              deleted_at: null,
              is_active: true,
              coin_code: inputs.coin_code
            }
          })
          if (inputs.coin_code == "txrp" || inputs.coin_code == "xrp" || inputs.coin_code == 'teth' || inputs.coin_code == 'eth' || coinData.iserc == true) {
            console.log("INSIDE IF>>>>>>")
            walletAddressData.balance = resData.balanceString;
          }
          return exits.success(walletAddressData);
        });
    } catch (err) {
      console.log(err);
    }

  }

};
