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
    }
  },

  exits: {

  },

  fn: async function (inputs, exits) {
    var result = jwt.sign(
      { id: inputs.id },
      tokenSecret, // Token Secret that we sign it with
      {
        expiresIn : '1d' // Token Expire time
      }
    );
    return exits.success(result);
  }

};
