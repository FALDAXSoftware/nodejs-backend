var fetch = require('node-fetch')
module.exports = {

  friendlyName: 'Neo get new address',

  description: 'Neo Coin getting new address',

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
      description: 'All done.'
    }
  },

  fn: async function (inputs, exits) {

    var newAddress;

    // Get new address.
    var bodyData = {
      'jsonrpc': '2.0',
      'id': '1',
      'method': 'getnewaddress',
      "params": []
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
          newAddress = resData.result;
        })
      // TODO Send back the result through the success exit.
      return exits.success(newAddress);
    } catch (err) {
      console.log("Address Generation error :: ", err);
    }
  }

};
