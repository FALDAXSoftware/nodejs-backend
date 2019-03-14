var fetch = require('node-fetch')
module.exports = {

  friendlyName: 'Get new address',

  description: '',

  inputs: {},

  exits: {

    success: {
      outputFriendlyName: 'New address'
    }
  },

  fn: async function (inputs) {

    var newAddress;
    // Get new address.
    try {
      fetch('http://dev-stratis-currency.faldax.com/', {
        method: 'POST',
        body: {
          "jsonrpc": "2.0",
          "id": "0",
          "method": "getnewaddress"
        },
          header: {
            'Content-Type': 'application/json'
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
