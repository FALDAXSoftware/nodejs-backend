var moment = require('moment');

module.exports = {

  friendlyName: 'Get user JST trade history',

  description: '',

  inputs: {
    data: {
      type: 'json',
      example: '{}',
      description: 'Number of months',
      required: true
    }
  },

  exits: {

    success: {
      outputFriendlyName: 'User JST trade history'
    }
  },

  fn: async function (inputs, exits) {

    // Get user trade history according the filter send by the frontend.
    var userTradeHistory;
    var data = inputs.data;

    var q = [];

    var currency,
      settle_currency;
    if (data.symbol != null || data.symbol != undefined) {
      var values = await sails
        .helpers
        .utilities
        .getCurrencies(data.symbol);

      settle_currency = values.crypto;
      currency = values.currency;
    }

    if (data.symbol != null || data.symbol != undefined) {
      if (currency != "null" ) {
        q['currency'] = currency,
        q['settle_currency'] = settle_currency
      }
    }

    if (data.toDate != undefined && data.toDate != null && data.toDate != '' && data.fromDate != '' && data.fromDate != undefined && data.fromDate != null) {
      q['created_at'] = {}
    }

    if (data.toDate && (data.toDate != undefined || data.toDate != null && data.toDate != '')) {
      q['created_at']['<='] = moment(data.toDate)
        .endOf('day')
        .format();
    }
    if (data.fromDate && (data.fromDate != undefined || data.fromDate != null && data.fromDate != '')) {
      q['created_at']['>='] = moment(data.fromDate).format();
    }
    q['or'] = [];
    if (data.buy == "true" || data.buy == true) {
      q['or'].push({
          user_id: data.user_id,
          side: 'Buy'
        })
    }

    if (data.sell == "true" || data.sell == true) {
      q['or'].push({
          user_id: data.user_id,
          side: 'Sell'
        })
    }

    if (data.buy == "false" && data.sell == "false") {
      q['or'].push({
        user_id: data.user_id
      });
    }

    userTradeHistory = await JSTTradeHistory
      .find({
        ...q
      })
      .sort("id DESC");

    // Send back the result through the success exit.
    return exits.success(userTradeHistory);

  }

};
