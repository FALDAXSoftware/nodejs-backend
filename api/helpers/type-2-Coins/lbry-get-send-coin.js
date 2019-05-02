var fetch = require('node-fetch')
module.exports = {

  friendlyName: 'Lbry get send coin',

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

    // Get new address.
    var bodyData = {
      'jsonrpc': '2.0',
      'id': '1',
      'method': 'wallet_send',
      "params": {
        "amount": parseFloat(inputs.amount),
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
          console.log(resData);
          newAddress = resData.result;
        })
      // TODO Send back the result through the success exit.
      return exits.success(newAddress);
    } catch (err) {
      console.log("Address Generation error :: ", err);
    }
  }

};
