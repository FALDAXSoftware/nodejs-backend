var moment = require('moment');

module.exports = {


  friendlyName: 'Get user simplex history',


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
      outputFriendlyName: 'User simplex history',
    },

  },


  fn: async function (inputs, exits) {

    // Get user simplex history.
    try {
      var userSimplexHistory;
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
        if (currency != "null" && settle_currency != "null") {
          q['currency'] = settle_currency,
            q['settle_currency'] = currency
        }
      }

      if (data.toDate != undefined && data.toDate != null && data.toDate != '' && data.fromDate != '' && data.fromDate != undefined && data.fromDate != null) {
        q['created_at'] = {}
      }

      if (data.toDate && (data.toDate != undefined || data.toDate != null || data.toDate != '')) {
        q['created_at']['<='] = moment(data.toDate)
          .endOf('day')
          .format();
      }
      if (data.fromDate && (data.fromDate != undefined || data.fromDate != null && data.fromDate != '')) {
        q['created_at']['>='] = moment(data.fromDate).format();
      }

      if ((data.buy == "false" && data.sell == "false") || (data.buy == "true" && data.sell == "true")) {
        q['user_id'] = data.user_id
      }

      q['is_processed'] = true;

      var totalCount = await SimplexTradeHistory
        .count({
          ...q
        })

      userSimplexHistory = await SimplexTradeHistory
        .find({
          ...q
        })
        .paginate({
          page: (data.page - 1),
          limit: data.limit
        })
        .sort("id DESC");

      var userTradeHistoryData = {
        data: userSimplexHistory,
        total: totalCount
      }

      // Send back the result through the success exit.
      return exits.success(userTradeHistoryData);

    } catch (error) {
      console.log("error in simplex", error);
    }

  }


};
