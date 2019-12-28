var request = require('request');

module.exports = {


  friendlyName: 'Get qoute details',


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
      outputFriendlyName: 'Qoute details',
    },

  },


  fn: async function (inputs, exits) {

    try {
      var keyValue = sails.config.local.SIMPLEX_ACCESS_TOKEN
      key = await sails.helpers.getDecryptData(keyValue);
      await request.post(sails.config.local.SIMPLEX_URL + 'quote', {
        headers: {
          'Authorization': 'ApiKey ' + key,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "digital_currency": inputs.data.digital_currency,
          "fiat_currency": inputs.data.fiat_currency,
          "requested_currency": inputs.data.requested_currency,
          "requested_amount": inputs.data.requested_amount,
          "end_user_id": (inputs.data.end_user_id).toString(),
          "wallet_id": sails.config.local.WALLET_ID,
          "client_ip": (inputs.data.client_ip)
        }),

      }, function (err, res, body) {
        res = res.toJSON();
        return exits.success(JSON.parse(res.body));
      });
    } catch (err) {
      console.log("Error in rising falling data ::::: ", err);
    }

  }
};
