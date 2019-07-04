var fetch = require('node-fetch')
module.exports = {

  friendlyName: 'Get Currency Conversion data',

  description: '',

  inputs: {},

  exits: {
    success: {
      outputFriendlyName: 'Currency Conversion data'
    }
  },

  fn: async function (inputs, exits) {
    // Get Currency Conversion data.
    try {
      fetch('https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?convert=' + sails.config.local.CURRENCY_LIST + '&start=1&limit=20', {
          method: "GET",
          headers: {
            'X-CMC_PRO_API_KEY': sails.config.local.COIN_MARKET_CAP_API
          }
        })
        .then(resData => resData.json())
        .then(resData => {
          return exits.success(resData);
        });
    } catch (err) {
      console.log("Error in rising falling data ::::: ", err);
    }
  }
};
