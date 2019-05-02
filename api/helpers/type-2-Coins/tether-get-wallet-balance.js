var fetch = require('node-fetch')
module.exports = {

  friendlyName: 'Tether get wallet balance',

  description: '',

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

    var newAddress;
    var encodeData = await sails
      .helpers
      .type2Coins
      .encodeAuth(sails.config.local.coinArray[inputs.coin_code].rpcuser, sails.config.local.coinArray[inputs.coin_code].rpcpassword)
    // Get new address.
    var property_id = 1;
    var bodyData = {
      "method": "omni_getbalance",
      "params": [inputs.address, property_id]
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
          console.log(resData.result);
          newAddress = resData.result;
        })
      // TODO Send back the result through the success exit.
      return exits.success(newAddress);
    } catch (err) {
      console.log("Address Generation error :: ", err);
    }
  }

};
