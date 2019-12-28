
var jwt = require('jsonwebtoken');

module.exports = {

  friendlyName: 'Jwt verify',

  description: '',

  inputs: {
    token: {
      type: 'string',
      required: true
    }
  },

  exits: {

  },

  fn: async function (inputs, exits) {
    // All done.
    // Verifies token on a request
    var token = await sails.helpers.getDecryptData(sails.config.local.JWT_TOKEN_SECRET);
    var tokenSecret = token;
    try {
      const validToken = await jwt.verify(
        inputs.token, // The token to be verified
        tokenSecret // Same token we used to sign
      );
      return exits.success(validToken);
    }
    catch (err) {
      return exits.success(err);
    }
    // return exits.success(validToken);
  }

};

