var jwt = require("jsonwebtoken");

module.exports = {


  friendlyName: 'Metabase setup',


  description: '',


  inputs: {
    dashboardValue: {
      type: 'number',
      example: 1,
      description: 'Dahsboard Value',
      required: true
    }
  },


  exits: {

    success: {
      description: 'All done.',
    },

  },


  fn: async function (inputs, exits) {
    // TODO
    try {
      var METABASE_SITE_URL = sails.config.local.METABASE_SITE_URL;
      var METABASE_SECRET_KEY = await sails.helpers.getDecryptData(sails.config.local.METABASE_SECRET_KEY);

      console.log(inputs.dashboardValue)

      var payload = {
        resource: {
          dashboard: inputs.dashboardValue
        },
        params: {},
        exp: Math.round(Date.now() / 1000) + (10 * 60) // 10 minute expiration
      };
      var token = jwt.sign(payload, METABASE_SECRET_KEY);

      var iframeUrl = METABASE_SITE_URL + "/embed/dashboard/" + token + "#bordered=true&titled=true";
      exits.success(iframeUrl)
    } catch (error) {
      console.log(error);
    }
  }


};
