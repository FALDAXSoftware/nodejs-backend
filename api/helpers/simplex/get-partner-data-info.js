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
      var key = await AdminSetting.findOne({
        where: {
          deleted_at: null,
          slug: 'access_token'
        }
      });
      key = await sails.helpers.getDecryptData(key.value);
      await request.post('https://sandbox.test-simplexcc.com/wallet/merchant/v2/payments/partner/data', {
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
