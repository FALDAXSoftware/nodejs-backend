var moment = require('moment');

module.exports = {

  friendlyName: 'Get user trade history',

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
      outputFriendlyName: 'User trade history'
    }
  },

  fn: async function (inputs, exits) {

    // Get user trade history.
    var userTradeHistory;
    var data = inputs.data;

    var q = [];

    if (data.currency && data.settle_currency) {
      q['currency'] = data.currency,
      q['settle_currency'] = data.settle_currency
    }
    q['created_at'] = {}
    // console.log("-=-=-=-",moment(data.toDate).format());
    
    if (data.toDate) {
      q['created_at']['<='] = moment(data.toDate).format();
    }
    if (data.fromDate) {
      q['created_at']['>='] = moment(data.fromDate).format();
    }
    q['or'] = [];
    if (data.buy) {
      q['or'].push({user_id: data.user_id, side: 'Buy'}),
      q['or'].push({requested_user_id: data.user_id, side: 'Sell'})
    }

    if (data.sell) {
      q['or'].push({user_id: data.user_id, side: 'Sell'}),
      q['or'].push({requested_user_id: data.user_id, side: 'Buy'})
    }

    // console.log("Q value ", q);

    userTradeHistory = await TradeHistory
      .find({
      ...q
    })
      .sort("id DESC");
    // TODO Send back the result through the success exit.
    return exits.success(userTradeHistory);

  }

};
