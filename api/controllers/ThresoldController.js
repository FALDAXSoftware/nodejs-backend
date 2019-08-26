/**
 * ThresoldController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  //---------------------------Web Api------------------------------
  addThresoldValue: async function (req, res) {
    try {
      var currencyData = await sails
        .helpers
        .dashboard
        .getCurrencyConversion();
      let coins = await Coins.find({
        deleted_at: null,
        is_active: true
      });
      let coinArray = [];
      for (let index = 0; index < coins.length; index++) {
        const element = coins[index];
        coinArray.push(element.coin)
      }

      //  for loop for res.data insert in table
      if (currencyData.data) {
        for (var i = 0; i < currencyData.data.length; i++) {
          if (coinArray.includes(currencyData.data[i].symbol)) {
            var currency_data = await ThresoldPrices
              .create({
                coin_id: coins[coinArray.indexOf(currencyData.data[i].symbol)].id,
                quote: currencyData.data[i].quote,
                symbol: currencyData.data[i].symbol,
                created_at: new Date()
              })
              .fetch();
          } else {
            console.log('>>>>>>>>>>>>else');
          }
        }
      }
    } catch (err) {
      console.log(err);
    }
  }
}
