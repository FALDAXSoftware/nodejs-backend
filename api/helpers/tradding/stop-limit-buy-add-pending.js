const moment = require('moment');

module.exports = {

  friendlyName: 'Stop limit buy',

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
    },
    serverError: {
      description: 'serverError'
    },
    insufficientBalance: {
      description: 'Error when insufficient balance in wallet.'
    },
    coinNotFound: {
      description: 'Error when coin not found'
    }
  },

  fn: async function (inputs, exits) {
    // TODO
    try {
      let {crypto, currency} = await sails
        .helpers
        .utilities
        .getCurrencies(inputs.symbol);

      var now = new Date();
      var limitSellOrder = ({
        'user_id': inputs.user_id,
        'symbol': inputs.symbol,
        'side': inputs.side,
        'order_type': inputs.order_type,
        'maximum_time': moment(now)
          .add(1, 'years')
          .format(),
        'fill_price': 0.0,
        'limit_price': inputs.limit_price,
        'stop_price': inputs.stop_price,
        'price': 0.0,
        'quantity': inputs.orderQuantity,
        'settle_currency': crypto,
        'order_status': "open",
        'currency': currency
      });

      var wallet = await sails
        .helpers
        .utilities
        .getWalletBalance(crypto, currency, inputs.user_id)
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
        ...limitSellOrder
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
        // Not enough Balance
        return exits.insufficientBalance();
      }
    } catch (error) {
      console.log(error);
      if (error.message == "coinNotFound") {
        return exits.coinNotFound();
      }
      return exits.serverError();
    }
  }

};
