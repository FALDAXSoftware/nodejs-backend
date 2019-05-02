var fetch = require('node-fetch')
module.exports = {

  friendlyName: 'Get Info for coin',

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

    //Getting info for the coin
    var newAddress;

    //Encode rpcuser and rpcpasword for authorization
    var encodeData = await sails
      .helpers
      .type2Coins
      .encodeAuth(sails.config.local.coinArray[inputs.coin_code].rpcuser, sails.config.local.coinArray[inputs.coin_code].rpcpassword)
    
    //Body Data
    var bodyData = {
      'jsonrpc': '2.0',
      'id': '0',
      'method': 'getinfo'
    }
    try {
      await fetch(sails.config.local.coinArray[inputs.coin_code].url, {
        method: 'POST',
        body: JSON.stringify(bodyData),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + encodeData
          }
        })
        .then(resData => resData.json())
        .then(resData => {
          newAddress = resData.result;
        })
      // TODO Send back the result through the success exit.
      return exits.success(newAddress);
    } catch (err) {
      console.log("Get Info error :: ", err);
    }

  }

};
