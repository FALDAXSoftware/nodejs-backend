var IOTA = require('iota.lib.js');
module.exports = {

  friendlyName: 'Iota get new address',

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

    try {
      var newAddress;
      const iotaApi = new IOTA({provider: 'http://dev-iota-currency.faldax.com'});
      const iota = iotaApi.api;
      var seed = 'WXVRGJANDRDWTVTWOTCWGH9ZTBDFRHXJLH9MYDHEHFOPUMMHRGJHVGEAUQTRCFTNIPSPJARARGCJAX9U' +
          'X'
      iota.getNewAddress(seed, {
        index: 0,
        total: 1,
        security: 3,
        checksum: true,
        returnAll: true
      }, async(error, address) => {
        if (error) {
          console.info('error', error); // eslint-disable-line
        } else {
          console.log("address", address);
          newAddress = address;
          return exits.success(address);
        }
      });
    } catch (err) {
      console.log(err);
    }
  }

};
