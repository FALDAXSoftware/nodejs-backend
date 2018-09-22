
var jwt = require('jsonwebtoken'),
tokenSecret = "secretissecet";

module.exports = {

  friendlyName: 'Jw token',

  description: '',

  inputs: {
    id: {
      type: 'number',
      description: 'The name of the person to greet.',
      required: true
    }
  },

  exits: {

  },

  fn: async function (inputs, exits) {
    var result = jwt.sign(
      { id: inputs.id },
      tokenSecret, // Token Secret that we sign it with
      {
        expiresIn : '3m' // Token Expire time
      }
    );
    return exits.success(result);
  }

};
