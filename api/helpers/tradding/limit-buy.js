module.exports = {

  friendlyName: 'Limit buy',

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
    try {
      var userIds = [];
      userIds.push(inputs.user_id);
      let {crypto, currency} = await sails
        .helpers
        .utilities
        .getCurrencies(inputs.symbol);
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
      let sellBook = await sails
        .helpers
        .tradding
        .sell
        .getSellBookOrders(crypto, currency);

      let fees = await sails
        .helpers
        .utilities
        .getMakerTakerFees(crypto, currency);

      var now = new Date();

      var buyLimitOrderData = {
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
        ...buyLimitOrderData
      }
      resultData.isMarket = false;
      resultData.fix_quantity = inputs.orderQuantity

      let activity = await sails
        .helpers
        .tradding
        .activity
        .add(resultData);

      resultData.maker_fee = fees.makerFee;
      resultData.taker_fee = fees.takerFee;

      if (sellBook && sellBook.length > 0) {
        var currentPrice = sellBook[0].price;
        if (inputs.limit_price >= currentPrice) {
          var limitMatchData = await sails
            .helpers
            .tradding
            .limit
            .limitBuyMatch(buyLimitOrderData, crypto, currency, activity)
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
          buyLimitOrderData.activity_id = activity.id;
          var total_price = buyLimitOrderData.quantity * buyLimitOrderData.limit_price;
          if (total_price <= wallet.placed_balance) {
            buyLimitOrderData.is_partially_fulfilled = true;
            var addBuyBook = await sails
              .helpers
              .tradding
              .buy
              .addBuyOrder(buyLimitOrderData);
            console.log("USER  IDS :::: ", userIds);

            //Add Socket Here Emit
            await sails
              .helpers
              .sockets
              .tradeEmit(buyLimitOrderData.settle_currency, buyLimitOrderData.currency, userIds);
            return exits.success(addBuyBook);
          } else {
            return exits.insufficientBalance();
          }
        }
      } else {
        buyLimitOrderData.activity_id = activity.id;
        var total_price = buyLimitOrderData.quantity * buyLimitOrderData.limit_price;
        if (total_price <= wallet.placed_balance) {
          buyLimitOrderData.is_partially_fulfilled = true;
          var addBuyBook = await sails
            .helpers
            .tradding
            .buy
            .addBuyOrder(buyLimitOrderData)
            .intercept("coinNotFound", () => {
              return new Error("coinNotFound");
            })
            .intercept("serverError", () => {
              return new Error("serverError");
            });;
          console.log("USER  IDS :::: ", userIds);

          //Add Socket Here Emit
          await sails
            .helpers
            .sockets
            .tradeEmit(buyLimitOrderData.settle_currency, buyLimitOrderData.currency, userIds);
          return exits.success(addBuyBook);
        } else {
          return exits.insufficientBalance();
        }
      }
    } catch (error) {
      console.log("From limit buy :: ", error)
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
