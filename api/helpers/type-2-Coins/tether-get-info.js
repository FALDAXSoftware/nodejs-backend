var fetch = require('node-fetch')
module.exports = {

  friendlyName: 'Tether get info',

  description: 'Tether coin get information',

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

    var getInfo;

    //Encoding username and password and providing it in header
    var encodeData = await sails
      .helpers
      .type2Coins
      .encodeAuth(sails.config.local.coinArray[inputs.coin_code].rpcuser, sails.config.local.coinArray[inputs.coin_code].rpcpassword)
    // Get new address.
    var bodyData = {
      "method": "omni_getinfo"
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
          getInfo = resData;
        })

      return exits.success(getInfo);
    } catch (err) {
      console.log("Get Info error :: ", err);
    }
  }

};
