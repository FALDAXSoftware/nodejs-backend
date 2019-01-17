var moment = require('moment');
module.exports = {

  friendlyName: 'Execute stop limit',

  description: '',

  inputs: {},

  exits: {

    success: {
      description: 'All done.'
    }
  },

  fn: async function (inputs, exits) {
    var now = moment();
    var pendingDetails = await sails
      .helpers
      .tradding
      .pending
      .getPendingOrderDetails();

    for (var i = 0; i < pendingDetails.length; i++) {
      var {
        order_type,
        side,
        maximum_time,
        id,
        quantity,
        stop_price,
        limit_price,
        settle_currency,
        currency,
        symbol,
        user_id,
        activity_id
      } = pendingDetails[i];

      var now = Date();
      var pending_order_book = ({
        'id': id,
        'user_id': user_id,
        'symbol': symbol,
        'side': side,
        'order_type': order_type,
        'created': now,
        'updated': now,
        'maximum_time': moment(now)
          .add(1, 'years')
          .format(),
        'fill_price': 0.0,
        'limit_price': limit_price,
        'stop_price': stop_price,
        'price': 0.0,
        'quantity': quantity,
        'settle_currency': settle_currency,
        'order_status': "open",
        'currency': currency,
        'activity_id': activity_id
      });

      if (pendingDetails.length > 0) {
        if (order_type == "StopLimit" && side == "Buy") {
          var pendingBuy = await sails
            .helpers
            .tradding
            .stop
            .stopLimitBuy(now, pending_order_book);
        } else if (order_type == "StopLimit" && side == "Sell") {
          var pendingSell = await sails
            .helpers
            .tradding
            .stop
            .stopLimitSell(now, pending_order_book);
        }
      }
    }
  }

};
