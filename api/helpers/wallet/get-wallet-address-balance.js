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

      fetch('https://test.bitgo.com/api/v2/' + inputs.coin_code + '/wallet/' + inputs.wallet_address, {
          method: "GET",
          headers: {
            Authorization: 'Bearer ' + sails.config.local.BITGO_ACCESS_TOKEN
          }
        })
        .then(resData => resData.json())
        .then(resData => {
          walletAddressData = resData;
          return exits.success(walletAddressData);
        });
    } catch (err) {
      console.log(err);
    }

  }

};
