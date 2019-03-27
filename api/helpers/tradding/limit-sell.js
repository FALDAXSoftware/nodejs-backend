module.exports = {

  friendlyName: 'Limit sell',

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
    }
  },

  exits: {

    success: {
      description: 'All done.'
    },
    error: {
      description: 'Error'
    },
    coinNotFound: {
      description: 'Error when coin not found'
    },
    insufficientBalance: {
      description: 'Error when insufficient balance in wallet.'
    },
    serverError: {
      description: 'serverError'
    },
    invalidQuantity: {
      descritpion: 'Quantity can not be less than zero'
    }
  },

  fn: async function (inputs, exits) {
    // TODO
    try {
      let { crypto, currency } = await sails
        .helpers
        .utilities
        .getCurrencies(inputs.symbol);
      let wallet = await sails
        .helpers
        .utilities
        .getSellWalletBalance(crypto, currency, inputs.user_id)
        .intercept("coinNotFound", () => {
          return new Error("coinNotFound");
        })
        .intercept("serverError", () => {
          return new Error("serverError");
        });;
      let buyBook = await sails
        .helpers
        .tradding
        .buy
        .getBuyBookOrders(crypto, currency);
      let fees = await sails
        .helpers
        .utilities
        .getMakerTakerFees(crypto, currency);
      var now = new Date();

      var sellLimitOrderData = {
        'user_id': inputs.user_id,
        'symbol': inputs.symbol,
        'side': inputs.side,
        'order_type': inputs.order_type,
        'created': now,
        'updated': now,
        'fill_price': 0.0,
        'limit_price': inputs.limit_price,
        'stop_price': 0.0,
        'price': inputs.limit_price,
        'quantity': inputs.orderQuantity,
        'fix_quantity': inputs.orderQuantity,
        'order_status': "open",
        'currency': currency,
        'settle_currency': crypto,
        'maximum_time': now,
        'is_partially_fulfilled': false
      };
      var resultData = {
        ...sellLimitOrderData
      }
      resultData.isMarket = false;
      resultData.fix_quantity = inputs.orderQuantity;
      resultData.maker_fee = fees.makerFee;
      resultData.taker_fee = fees.takerFee;

      let activity = await sails
        .helpers
        .tradding
        .activity
        .add(resultData);

      if (buyBook && buyBook.length > 0) {
        var currentPrice = buyBook[0].price;
        if (inputs.limit_price <= currentPrice) {
          var limitMatchData = await sails
            .helpers
            .tradding
            .limit
            .limitSellMatch(sellLimitOrderData, crypto, currency, activity)
            .intercept('invalidQuantity', () => {
              return new Error("invalidQuantity");
            })
            .intercept('coinNotFound', () => {
              return new Error("coinNotFound");
            })
            .intercept('insufficientBalance', () => {
              return new Error("insufficientBalance");
            })
            .intercept('serverError', () => {
              return new Error("serverError");
            });
          await sails
            .helpers
            .sockets
            .tradeEmit(crypto, currency);
          return exits.success(limitMatchData);
        } else {
          sellLimitOrderData.activity_id = activity.id;
          var total_price = sellLimitOrderData.quantity * sellLimitOrderData.limit_price;
          if (total_price <= wallet.placed_balance) {
            sellLimitOrderData.is_partially_fulfilled = true;
            var addSellBook = await sails
              .helpers
              .tradding
              .sell
              .addSellOrder(sellLimitOrderData);
            //Add Socket Here Emit
            await sails
              .helpers
              .sockets
              .tradeEmit(crypto, currency);
            return exits.success(addSellBook);
          } else {
            return exits.insufficientBalance();
          }
        }
      } else {
        sellLimitOrderData.activity_id = activity.id;
        var total_price = sellLimitOrderData.quantity * sellLimitOrderData.limit_price;
        if (total_price <= wallet.placed_balance) {
          sellLimitOrderData.is_partially_fulfilled = true;
          var addSellBook = await sails
            .helpers
            .tradding
            .sell
            .addSellOrder(sellLimitOrderData);
          //Add Socket Here Emit
          await sails
            .helpers
            .sockets
            .tradeEmit(crypto, currency);
          return exits.success(addSellBook);
        } else {
          return exits.insufficientBalance();
        }
      }

    } catch (error) {
      console.log(error);
      if (error.message == "coinNotFound") {
        return exits.coinNotFound();
      }
      if (error.message == "invalidQuantity") {
        return exits.invalidQuantity();
      }
      if (error.message == "insufficientBalance") {
        return exits.insufficientBalance();
      }
      if (error.message == "invalidQuantity") {
        return exits.invalidQuantity();
      }
      return exits.serverError();
    }
  }

};
