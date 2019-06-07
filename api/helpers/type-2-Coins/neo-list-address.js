var fetch = require('node-fetch')
module.exports = {

  friendlyName: 'Neo list address',

  description: 'Neo Coin listing addresses generated',

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

    var listaddress;

    // Get list of address generated
    var bodyData = {
      'jsonrpc': '2.0',
      'id': '1',
      'method': 'listaddress',
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
          listaddress = resData.result;
        })
      // TODO Send back the result through the success exit.
      return exits.success(listaddress);
    } catch (err) {
      console.log("Address Generation error :: ", err);
    }
  }

};
