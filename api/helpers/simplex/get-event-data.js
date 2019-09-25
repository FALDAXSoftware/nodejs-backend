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
      var key = await AdminSetting.findOne({
        where: {
          deleted_at: null,
          slug: 'access_token'
        }
      });
      key = await sails.helpers.getDecryptData(key.value);
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
