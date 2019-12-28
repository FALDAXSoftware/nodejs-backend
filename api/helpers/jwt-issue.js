/**
 * jwToken
 *
 * @description :: JSON Webtoken Service for sails
 * @help        :: See https://github.com/auth0/node-jsonwebtoken & http://sailsjs.org/#!/documentation/concepts/Services
 */

var jwt = require('jsonwebtoken');

module.exports = {

  friendlyName: 'Jwt issue',

  description: '',

  inputs: {
    id: {
      type: 'number',
      description: 'The name of the person to greet.',
      required: true
    },
    isAdmin: {
      type: 'boolean',
      description: 'User has admin access or not',
      required: false,
      defaultsTo: false
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
    var token = await sails.helpers.getDecryptData(sails.config.local.JWT_TOKEN_SECRET);
    var tokenSecret = token;
    let extraParams = {};
    let params = {
      id: inputs.id
    }
    if (inputs.setExpiry) {
      extraParams["expiresIn"] = 15 * 60;
    }
    if (inputs.isAdmin) {
      params["isAdmin"] = true
    }
    var result = jwt.sign(
      { ...params },
      tokenSecret, // Token Secret that we sign it with
      {
        // expiresIn : '1d' // Token Expire time
        ...extraParams
      }
    );
    return exits.success(result);
  }

};
