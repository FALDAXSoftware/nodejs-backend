module.exports = {


  friendlyName: 'Update currency conversion data',


  description: '',


  inputs: {

  },


  exits: {

    success: {
      description: 'All done.',
    },

  },


  fn: async function (inputs, exits) {
    var currencyData = await sails
      .helpers
      .dashboard
      .getCurrencyConversion();

    let coins = await Coins.find({ deleted_at: null, is_active: true });
    let coinArray = [];
    for (let index = 0; index < coins.length; index++) {
      const element = coins[index];
      coinArray.push(element.coin)
    }
    //  for loop for res.data insert in table
    if (currencyData.data) {
      for (var i = 0; i < currencyData.data.length; i++) {
        if (coinArray.includes(currencyData.data[i].symbol)) {
          let existCurrencyData = await CurrencyConversion.findOne({ deleted_at: null, symbol: currencyData.data[i].symbol })
          if (existCurrencyData) {
            var currency_data = await CurrencyConversion
              .update({
                coin_id: coins[coinArray.indexOf(currencyData.data[i].symbol)].id
              })
              .set({ quote: currencyData.data[i].quote })
              .fetch();
          } else {
            var currency_data = await CurrencyConversion
              .create({
                coin_id: coins[coinArray.indexOf(currencyData.data[i].symbol)].id,
                quote: currencyData.data[i].quote,
                symbol: currencyData.data[i].symbol,
                created_at: new Date()
              })
              .fetch();
          }
        }
      }
    }
    return exits.success();
  }


};

