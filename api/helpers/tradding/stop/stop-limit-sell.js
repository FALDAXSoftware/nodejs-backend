module.exports = {

  friendlyName: 'Stop limit sell',

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
      console.log("Inisde this :: ")
      var order = inputs.pending_order_book;
      console.log(order);
      var lastTradePrice = await sails
        .helpers
        .tradding
        .checkLastTradePrice(order.settle_currency, order.currency);

      console.log(lastTradePrice)

      var activityResult = await sails
        .helpers
        .tradding
        .activity
        .getActivityDetails(order.activity_id);

      console.log(activityResult);
      console.log("STOP PRICE :: ", order.stop_price);
      if (lastTradePrice <= order.stop_price) {
        console.log("Inside if Loop :: ");
        var sellMatchResponse = await sails
          .helpers
          .tradding
          .limit
          .limitSellMatch(order, order.settle_currency, order.currency, activityResult);

        if (sellMatchResponse) {
          var pendingOrder = await sails
            .helpers
            .tradding
            .pending
            .deletePendingOrder(order.id);
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

};
