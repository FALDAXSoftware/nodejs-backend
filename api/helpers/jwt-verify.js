
var jwt = require('jsonwebtoken'),
tokenSecret = "secretissecet";

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
    const validToken = await jwt.verify(
      inputs.token, // The token to be verified
      tokenSecret // Same token we used to sign
    );

    return exits.success(validToken);
  }

};

