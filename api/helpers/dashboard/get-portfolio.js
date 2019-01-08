var moment = require('moment');
module.exports = {

  friendlyName: 'Get portfolio',

  description: '',

  inputs: {
    user_id: {
      type: 'number',
      example: 1,
      description: 'id of user',
      required: true
    }
  },

  exits: {

    success: {
      outputFriendlyName: 'Portfolio'
    }
  },

  fn: async function (inputs) {

    // Get portfolio.
    var portfolio;
    // TODO
    var yesterday = moment()
      .subtract(1, 'days')
      .format();
    var today = moment().format();

    var flag = true;
    var portfolioData = [];
    var average_price;

    var userData = await Users.findOne({
      where: {
        deleted_at: null,
        id: inputs.user_id
      }
    });

    var coinBalance = await sails.sendNativeQuery("SELECT coins.coin_name, coins.coin , wallets.balance, wallets.placed_balance FRO" +
      "M coins LEFT JOIN wallets ON coins.id = wallets.coin_id WHERE ((wallets.user_id " +
      "= " + inputs.user_id + " AND wallets.deleted_at IS NULL))");

    for (var i = 0; i < coinBalance.rowCount; i++) {
      var total_price = 0;
      var price = await TradeHistory.find({
        where: {
          settle_currency: coinBalance.rows[i].coin_name,
          currency: userData.fiat,
          deleted_at: null
        },
        sort: 'id DESC'
      });

      console.log(price.length);

      if (price.length == 0) {
        average_price = 0;
      } else {
        for (var j = 0; j < price.length; j++) {
          total_price = total_price + price[j]['fill_price'];
        }
        average_price = total_price / (price.length);
      }

      var currentPrice = await TradeHistory.find({
        where: {
          deleted_at: null,
          settle_currency: coinBalance.rows[i].coin_name,
          currency: userData.fiat,
          created_at: {
            '<=': today
          },
          created_at: {
            '>=': yesterday
          }
        },
        sort: 'id DESC'
      });

      if (currentPrice.length == 0) {
        currentPrice = 0;
      } else {
        currentPrice = currentPrice[0]['fill_price'];
      }

      var previousPrice = await TradeHistory.find({
        where: {
          deleted_at: null,
          settle_currency: coinBalance.rows[i].coin_name,
          currency: userData.fiat,
          created_at: {
            '>=': yesterday
          }
        },
        sort: 'id DESC'
      });

      if (previousPrice.length == 0) {
        previousPrice = 0;
      } else {
        previousPrice = previousPrice[0]['fill_price'];
      }

      var diffrence = currentPrice - previousPrice;
      var percentChange = (diffrence / currentPrice) * 100;

      if (percentChange) {
        percentChange = percentChange;
      } else {
        percentChange = 0;
      }

      var priceFiat = await TradeHistory.find({
        where: {
          deleted_at: null,
          settle_currency: coinBalance.rows[i].coin_name,
          currency: userData.fiat,
          created_at: {
            '<=': today
          }
        },
        sort: 'id DESC'
      })

      if (priceFiat.length == 0) {
        priceFiat = 0;
      } else {
        priceFiat = priceFiat;
      }

      var portfolio_data = {
        "name": coinBalance.rows[i].coin_name,
        "average_price": average_price,
        "percentchange": percentChange,
        "amounts": coinBalance.rows[i].balance,
        'symbol': coinBalance.rows[i].coin,
        "fiatPrice": priceFiat,
        "fiat": userData.fiat
      }
      portfolioData.push(portfolio_data);
    }
    console.log(portfolioData);

    // Send back the result through the success exit.
    return portfolioData;

  }

};
