var fetch = require('node-fetch')
module.exports = {

  friendlyName: 'Iota get Info',

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
      description: 'All done.'
    }
  },

  fn: async function (inputs, exits) {

    var newAddress;
    // Get new address.
    var bodyData = {
      "command": "getNodeInfo"
    }
    try {
      await fetch(sails.config.local.coinArray[inputs.coin_code].url, {
        method: 'POST',
        body: JSON.stringify(bodyData),
          headers: {
            'Content-Type': 'application/json',
            'X-IOTA-API-Version': '1.4.1'
          }
        })
        .then(resData => resData.json())
        .then(resData => {
          console.log(resData);
          newAddress = resData;
        })

      return exits.success(newAddress);
    } catch (err) {
      console.log("Get Info error :: ", err);
    }
  }

};
