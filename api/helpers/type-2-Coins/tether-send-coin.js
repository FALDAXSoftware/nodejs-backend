var fetch = require('node-fetch')
module.exports = {

  friendlyName: 'Tether send coin',

  description: '',

  inputs: {
    coin_code: {
      type: 'string',
      example: 'USDT',
      description: 'coin code of coin',
      required: true
    },
    address: {
      type: 'string',
      example: 'VvKJ28dvb1Y2NpRNQz7kSvkoNbS4VQ32hb',
      description: 'Address to which it needs to be send',
      required: true
    },
    amount: {
      type: 'number',
      example: 0.1,
      description: 'amount of coin',
      required: true
    },
    message: {
      type: 'string',
      example: 'donation',
      description: 'Reason for sending coin',
      required: false
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
    // Get new address. Fetch first paramater from database i.e. from address
    var property_id = 1;
    console.log(inputs.address, property_id, inputs.amount);
    var bodyData = {
      "method": "omni_send",
      "params": [
        "3M9qvHKtgARhqcMtM5cRT9VaiDJ5PSfQGY", inputs.address, property_id, JSON.stringify(inputs.amount)
      ]
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
          console.log(resData);
          newAddress = resData;
        })

      return exits.success(newAddress);
    } catch (err) {
      console.log("Get Info error :: ", err);
    }
  }

};
