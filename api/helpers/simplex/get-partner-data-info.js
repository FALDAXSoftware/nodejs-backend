var request = require('request');
module.exports = {


  friendlyName: 'Get partner data info',


  description: '',


  inputs: {
    data: {
      type: 'json',
      example: "{}",
      description: 'JSON object of data',
      required: true
    }
  },


  exits: {

    success: {
      outputFriendlyName: 'Partner data info',
    },

  },


  fn: async function (inputs, exits) {

    // Get partner data info.
    try {
      var keyValue = sails.config.local.ACCESS_TOKEN
      key = await sails.helpers.getDecryptData(keyValue);
      await request.post(sails.config.local.SIMPLEX_URL + 'payments/partner/data', {
        headers: {
          'Authorization': 'ApiKey ' + key,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(inputs.data)
      }, function (err, res, body) {
        return exits.success(JSON.parse(res.body));
      });
    } catch (err) {
      console.log("Error in rising falling data ::::: ", err);
    }

  }


};
