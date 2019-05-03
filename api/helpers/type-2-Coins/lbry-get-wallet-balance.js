var fetch = require('node-fetch')
module.exports = {

  friendlyName: 'Lbry get wallet balance',

  description: 'LBRY Credits getting user wallet balance',

  inputs: {
    coin_code: {
      type: 'string',
      example: 'ETC',
      description: 'coin code of coin',
      required: true
    },
    address: {
      type: 'string',
      example: 'VvKJ28dvb1Y2NpRNQz7kSvkoNbS4VQ32hb',
      description: 'Address to which it needs to be send',
      required: true
    }
  },

  exits: {

    success: {
      description: 'All done.'
    }
  },

  fn: async function (inputs, exits) {

    var userWalletBalance;

    // Getting user address balance
    var bodyData = {
      'jsonrpc': '2.0',
      'id': '1',
      'method': 'wallet_balance',
      "params": {
        "address": inputs.address
      }
    }
    try {
      await fetch(sails.config.local.coinArray[inputs.coin_code].url, {
        method: 'POST',
        body: JSON.stringify(bodyData),
          headers: {
            'Content-Type': 'application/json'
          }
        })
        .then(resData => resData.json())
        .then(resData => {
          userWalletBalance = resData.result;
        })
      // TODO Send back the result through the success exit.
      return exits.success(userWalletBalance);
    } catch (err) {
      console.log("Address Generation error :: ", err);
    }
  }

};
