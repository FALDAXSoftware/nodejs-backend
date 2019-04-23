/**
 * jwToken
 *
 * @description :: JSON Webtoken Service for sails
 * @help        :: See https://github.com/auth0/node-jsonwebtoken & http://sailsjs.org/#!/documentation/concepts/Services
 */

var jwt = require('jsonwebtoken'),
  tokenSecret = "secretissecet";

module.exports = {

  friendlyName: 'Jwt issue',

  description: '',

  inputs: {
    id: {
      type: 'number',
      description: 'The name of the person to greet.',
      required: true
    },
    setExpiry: {
      type: 'boolean',
      description: 'set expiration time of token or not',
      required: false,
      defaultsTo: false
    }
  },

  exits: {

  },

  fn: async function (inputs, exits) {
    let extraParams = {};
    if (inputs.setExpiry) {
      extraParams["expiresIn"] = 60 * 60;
    }
    var result = jwt.sign(
      { id: inputs.id },
      tokenSecret, // Token Secret that we sign it with
      {
        // expiresIn : '1d' // Token Expire time
        ...extraParams
      }
    );
    return exits.success(result);
  }

};
