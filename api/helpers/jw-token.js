
var jwt = require('jsonwebtoken');

//currently not in use
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
    var token = await sails.helpers.getDecryptData(sails.config.local.JWT_TOKEN_SECRET);
    var tokenSecret = token
    var result = jwt.sign(
      { id: inputs.id },
      tokenSecret, // Token Secret that we sign it with
      {
        expiresIn: '3m' // Token Expire time
      }
    );
    return exits.success(result);
  }

};
