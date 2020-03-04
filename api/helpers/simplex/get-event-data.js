var request = require('request');
module.exports = {


  friendlyName: 'Get event data',


  description: '',


  inputs: {

  },


  exits: {

    success: {
      outputFriendlyName: 'Event data',
    },

  },


  fn: async function (inputs, exits) {

    // Get event data.
    try {
      var keyValue = sails.config.local.SIMPLEX_ACCESS_TOKEN;
      key = await sails.helpers.getDecryptData(keyValue);
      await request.get('https://sandbox.test-simplexcc.com/wallet/merchant/v2/events', {
        headers: {
          'Authorization': 'ApiKey ' + key,
          'Content-Type': 'application/json'
        }
      }, function (err, res, body) {
        return exits.success(JSON.parse(res.body));
      });
    } catch (err) {
      console.log("Error in Event data ::::: ", err);
    }

  }


};
