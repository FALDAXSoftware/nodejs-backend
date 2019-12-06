const request = require('request');
var http = require("http");
var logger = require("../../controllers/logger");

// var rp = require('request-promise');
module.exports = {
  friendlyName: 'Simplex Backend Call',
  description: '',
  inputs: {
    value_object: {
      type: 'json',
      example: '{}',
      description: 'JSON object for which the value needs to be obtained'
    },
  },
  exits: {
    success: {
      outputFriendlyName: 'Simplex API Call from Backend',
    },
    error: {
      outputFriendlyName: 'Simplex API Call from Backend Error',
    }
  },



  fn: async function (inputs, exits) {

    try {

      var req_body = inputs.value_object;
      console.log(sails.config.local.SIMPLEX_BACKEND_URL)
      await request({
        url: sails.config.local.SIMPLEX_BACKEND_URL + req_body.action,
        method: req_body.method,
        headers: {
          // 'cache-control': 'no-cache',
          // Authorization: `Bearer ${sails.config.local.BITGO_ACCESS_TOKEN}`,
          'x-token': 'faldax-simplex-backend',
          'Content-Type': 'application/json'
        },
        body: req_body,
        json: true
      }, function (err, httpResponse, body) {

        if (err) {
          return exits.error(err);
        }
        if (body.error) {
          return exits.error(body);
        }
        console.log("body", body);
        return exits.success(body);
        // return body;
      });
    } catch (error) {
      console.log("error", error);
      await logger.error(error.message);
      return exits.error(error)
    }
  }


};
