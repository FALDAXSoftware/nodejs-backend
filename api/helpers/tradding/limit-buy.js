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
      let {
        crypto,
        currency
      } = await sails
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

      var quantityValue = (inputs.orderQuantity).toFixed(sails.config.local.QUANTITY_PRECISION);

      var priceValue = (inputs.limit_price).toFixed(sails.config.local.PRICE_PRECISION);

      var buyLimitOrderData = {
        'user_id': inputs.user_id,
        'symbol': inputs.symbol,
        'side': inputs.side,
        'order_type': inputs.order_type,
        'created': now,
        'updated': now,
        'fill_price': 0.0,
        'limit_price': priceValue,
        'stop_price': 0.0,
        'price': priceValue,
        'quantity': quantityValue,
        'fix_quantity': quantityValue,
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
      resultData.fix_quantity = quantityValue

      let activity = await sails
        .helpers
        .tradding
        .activity
        .add(resultData);

      resultData.maker_fee = fees.makerFee;
      resultData.taker_fee = fees.takerFee;

      if (sellBook && sellBook.length > 0) {
        var currentPrice = sellBook[0].price;
        if (priceValue >= currentPrice) {
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
          for (var i = 0; i < userIds.length; i++) {
            // Notification Sending for users
            var userNotification = await UserNotification.findOne({
              user_id: userIds[i],
              deleted_at: null,
              slug: 'trade_execute'
            })
            var user_data = await Users.findOne({
              deleted_at: null,
              id: userIds[i],
              is_active: true
            });
            if (user_data != undefined) {
              if (userNotification != undefined) {
                if (userNotification.email == true || userNotification.email == "true") {
                  if (user_data.email != undefined)
                    await sails.helpers.notification.send.email("trade_execute", user_data)
                }
                if (userNotification.text == true || userNotification.text == "true") {
                  if (user_data.phone_number != undefined)
                    await sails.helpers.notification.send.text("trade_execute", user_data)
                }
              }
            }
          }
          await sails
            .helpers
            .sockets
            .tradeEmit(crypto, currency, userIds);
          return exits.success(limitMatchData);
        } else {
          buyLimitOrderData.activity_id = activity.id;
          var total_price = buyLimitOrderData.quantity * buyLimitOrderData.limit_price;
          if (total_price <= wallet.placed_balance) {
            buyLimitOrderData.is_partially_fulfilled = true;
            buyLimitOrderData.is_filled = false;
            buyLimitOrderData.added = true;
            var addBuyBook = await sails
              .helpers
              .tradding
              .buy
              .addBuyOrder(buyLimitOrderData);
            //Add Socket Here Emit
            addBuyBook.added = true;


            // Notification sending for users
            for (var i = 0; i < userIds.length; i++) {
              // Notification Sending for users
              var userNotification = await UserNotification.findOne({
                user_id: userIds[i],
                deleted_at: null,
                slug: 'trade_execute'
              })
              var user_data = await Users.findOne({
                deleted_at: null,
                id: userIds[i],
                is_active: true
              });
              if (user_data != undefined) {
                if (userNotification != undefined) {
                  if (userNotification.email == true || userNotification.email == "true") {
                    if (user_data.email != undefined)
                      await sails.helpers.notification.send.email("order_added", user_data)
                  }
                  if (userNotification.text == true || userNotification.text == "true") {
                    if (user_data.phone_number != undefined)
                      await sails.helpers.notification.send.text("order_added", user_data)
                  }
                }
              }
            }
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
          buyLimitOrderData.is_filled = false;
          buyLimitOrderData.added = true;
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
            });

          addBuyBook.added = true;

          // // Notification sending for Users
          for (var i = 0; i < userIds.length; i++) {
            // Notification Sending for users
            var userNotification = await UserNotification.findOne({
              user_id: userIds[i],
              deleted_at: null,
              slug: 'trade_execute'
            })
            var user_data = await Users.findOne({
              deleted_at: null,
              id: userIds[i],
              is_active: true
            });
            if (user_data != undefined) {
              if (userNotification != undefined) {
                if (userNotification.email == true || userNotification.email == "true") {
                  if (user_data.email != undefined)
                    await sails.helpers.notification.send.email("order_added", user_data)
                }
                if (userNotification.text == true || userNotification.text == "true") {
                  if (user_data.phone_number != undefined)
                    await sails.helpers.notification.send.text("order_added", user_data)
                }
              }
            }
          }

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
