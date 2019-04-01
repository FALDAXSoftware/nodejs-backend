var base64 = require('base-64');
module.exports = {

  friendlyName: 'Encode auth',

  description: '',

  inputs: {
    coinuser: {
      type: 'string',
      example: 'stratisrpc',
      description: 'user name of coin',
      required: true
    },
    coinpassword: {
      type: 'string',
      example: 'secret',
      description: 'password of coin',
      required: true
    }
  },

  exits: {

    success: {
      description: 'All done.'
    }
  },

  fn: async function (inputs, exits) {
    // TODO
    try {
      var rpccall = inputs.coinuser + ':' + inputs.coinpassword
      var encodedData = base64.encode(rpccall);
      return exits.success(encodedData);
    } catch (err) {
      console.log(err);
    }
  }

};
