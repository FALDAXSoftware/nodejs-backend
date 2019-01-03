module.exports = {

  friendlyName: 'Stop limit buy',

  description: '',

  inputs: {
    now: {
      type: 'ref',
      description: 'Time',
      required: true
    },
    pending_order_book: {
      type: 'json',
      example: '{}',
      description: 'Pending Book data,',
      required: true
    }
  },

  exits: {

    success: {
      description: 'All done.'
    }
  },

  fn: async function (inputs, exits) {
    try {
      var order = inputs.pending_order_book;
      var lastTradePrice = await sails
        .helpers
        .tradding
        .checkLastTradePrice(order.settle_currency, order.currency);

      var activityResult = await sails
        .helpers
        .tradding
        .activity
        .getActivityDetails(order.activity_id);

      if (lastTradePrice >= order.stop_price) {
        var buyMatchResponse = await sails
          .helpers
          .tradding
          .limit
          .limitBuyMatch(order, order.settle_currency, order.currency, activityResult);

        console.log("Buy Match Response :: ", buyMatchResponse);

        if (buyMatchResponse) {
          var pendingOrder = await sails
            .helpers
            .tradding
            .pending
            .deletePendingOrder(order.id);
        }

      }
      return exits.success();
    } catch (error) {
      console.log(error);
    }

  }

};
