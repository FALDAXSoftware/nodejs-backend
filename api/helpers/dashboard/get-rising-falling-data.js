var fetch = require('node-fetch')
module.exports = {

  friendlyName: 'Get rising falling data',

  description: '',

  inputs: {
    currency: {
      type: 'string',
      example: 'USD',
      description: 'Fiat currency',
      required: true
    }
  },

  exits: {

    success: {
      outputFriendlyName: 'Rising falling data'
    }
  },

  fn: async function (inputs, exits) {

    // Get rising falling data.
    var risingFallingData;
    try {
      // fetch('https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?convert=' + inputs.currency + '&start=1&limit=600', {
      //     method: "GET",
      //     headers: {
      //       'X-CMC_PRO_API_KEY': sails.config.local.COIN_MARKET_CAP_API
      //     }
      //   })
      //   .then(resData => resData.json())
      //   .then(resData => {
      //     risingFallingData = resData;
      //     return exits.success(risingFallingData);
      //   });
      var risingFallingData = []
      var coinData = await Coins.find({
        where: {
          deleted_at: null,
          is_active: true,
          iserc: false
        }
      })
      for (var i = 0; i < coinData.length; i++) {
        if (coinData[i].coin_code != 'SUSU' && coinData[i] != "terc") {
          var currencyConversionValue = await CurrencyConversion.findOne({
            where: {
              deleted_at: null,
              coin_id: coinData[i].id
            }
          })
          risingFallingData.push(currencyConversionValue)
          console.log(risingFallingData)
        } else if (coinData[i].coin_code == "SUSU") {
          var susucoinData = await sails.helpers.getUsdSusucoinValue();
          susucoinData = JSON.parse(susucoinData);
          susucoinData = susucoinData.data
          risingFallingData.push(susucoinData)
        }
      }
      return exits.success(risingFallingData);
    } catch (err) {
      console.log("Error in rising falling data ::::: ", err);
    }

  }

};
