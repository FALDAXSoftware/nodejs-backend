module.exports = {

  friendlyName: 'Stop limit sell add pending',

  description: '',

  inputs: {
    symbol: {
      type: 'string',
      example: 'BTC-ETH',
      description: 'Combination of Crypto-Currency.',
      required: true
    },
    user_id: {
      type: 'number',
      example: 1,
      description: 'Id Of user',
      required: true
    },
    side: {
      type: 'string',
      example: 'Buy/Sell',
      description: 'Trade Side.',
      required: true
    },
    order_type: {
      type: 'string',
      example: 'Market/Limit/StopLimit',
      description: 'Trade Side.',
      required: true
    },
    orderQuantity: {
      type: 'number',
      example: 1,
      description: 'order quantity.',
      required: true
    },
    limit_price: {
      type: 'number',
      example: 10,
      description: 'Limit Price',
      required: true
    },
    stop_price: {
      type: 'number',
      example: 10,
      description: 'Stop Price',
      required: true
    }
  },

  exits: {

    success: {
      description: 'All done.'
    }
  },

  fn: async function (inputs, exits) {
    // TODO
    let {crypto, currency} = await sails
      .helpers
      .utilities
      .getCurrencies(inputs.symbol);

    var limitSellOrder = ({
      'user_id': inputs.user_id,
      'symbol': inputs.symbol,
      'side': inputs.side,
      'order_type': inputs.order_type,
      'created': moment(),
      'updated': moment(),
      'maximum_time': moment().add(1, 'years'),
      'fill_price': 0.0,
      'limit_price': inputs.limit_price,
      'stop_price': inputs.stop_price,
      'price': 0.0,
      'quantity': inputs.orderQuantity,
      'settl_currency': crypto,
      'order_status': "Open",
      'currency': currency
    });

    var wallet = await sails
      .helpers
      .utilities
      .getSellWalletBalance(currency, crypto, inputs.user_id)
      .intercept("coinNotFound", () => {
        return new Error("coinNotFound");
      })
      .intercept("serverError", () => {
        return new Error("serverError");
      });

    let fees = await sails
      .helpers
      .utilities
      .getMakerTakerFees(crypto, currency);

    var resultData = {
      ...limitBuyOrder
    }
    resultData.is_market = false;
    resultData.fix_quantity = inputs.orderQuantity;
    resultData.maker_fee = fees.makerFee;
    resultData.taker_fee = fees.takerFee;

    var resultPending = await sails
      .helpers
      .tradding
      .getWalletStatus(limitSellOrder, wallet);

    if (resultPending == true) {
      var result = await sails
        .helpers
        .tradding
        .activity
        .add(limitSellOrder);

      limitSellOrder.activity_id = result.id;
      var data = await sails
        .helpers
        .tradding
        .pending
        .addPendingOrder(limitSellOrder);

      //Emit Socket Here
      return exits.success(data);
    } else {
      // Not enough Balance Error
      return exits.success();
    }
  }

};
