var jwt = require("jsonwebtoken");

module.exports = {


  friendlyName: 'Metabase setup',


  description: '',


  inputs: {

  },


  exits: {

    success: {
      description: 'All done.',
    },

  },


  fn: async function (inputs, exits) {
    // TODO
    try {
      var METABASE_SITE_URL = "http://18.190.46.86:80";
      var METABASE_SECRET_KEY = "dbeb99a40641d0d53d1630bc52e4e154f0d0d5a74a1e672b9f035feb0213d0fb";

      var payload = {
        resource: {
          dashboard: 2
        },
        params: {},
        exp: Math.round(Date.now() / 1000) + (10 * 60) // 10 minute expiration
      };
      var token = jwt.sign(payload, METABASE_SECRET_KEY);

      var iframeUrl = METABASE_SITE_URL + "/embed/dashboard/" + token + "#theme=night&bordered=true&titled=true";
      exits.success(iframeUrl)
    } catch (error) {

    }
  }


};
