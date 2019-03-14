var fetch = require('node-fetch')
module.exports = {

  friendlyName: 'Get new address',

  description: '',

  inputs: {
    coin_code: {
      type: 'string',
      example: 'BTC',
      description: 'coin code of coin',
      required: true
    }
  },

  exits: {

    success: {
      outputFriendlyName: 'New address'
    }
  },

  fn: async function (inputs, exits) {

    var newAddress;
    console.log("URL :::::: ", sails.config.local.coinArray[inputs.coin_code].url);
    var encodeData = sails
      .helper
      .type2Coins
      .encodeAuth(sails.config.local.coinArray[inputs.coin_code].rpcuser, sails.config.local.coinArray[inputs.coin_code].rpcpassword)
    // Get new address.
    try {
      fetch(sails.config.local.coinArray[inputs.coin_code].url, {
        method: 'POST',
        body: {
          "jsonrpc": "2.0",
          "id": "0",
          "method": "getinfo"
        },
          header: {
            'Content-Type': 'application/json',
            'Authorization': encodeData
          }
        })
        .then(resData => resData.json())
        .then(resData => {
          console.log(resData);
        })
      // TODO Send back the result through the success exit.
      return newAddress;
    } catch (err) {
      consol.log(err);
    }

  }

};
