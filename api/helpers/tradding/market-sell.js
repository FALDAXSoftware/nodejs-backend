module.exports = {

  friendlyName: 'Market sell',

  description: 'market sell order',

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
    }
  },

  exits: {
    success: {
      description: 'All done.'
    },
    coinNotFound: {
      description: 'Error when coin not found'
    },
    insufficientBalance: {
      description: 'Error when insufficient balance in wallet.'
    },
    orderBookEmpty: {
      description: 'Error when no order in orderbook'
    },
    serverError: {
      description: 'serverError'
    }
  },

  fn: async function (inputs, exits) {

    try {
      let userIds = [];
      userIds.push(inputs.user_id);
      let {
        crypto,
        currency
      } = await sails
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
          return new Error("serverError")
        });
      let buyBook = await sails
        .helpers
        .tradding
        .buy
        .getBuyBookOrders(crypto, currency);
      let fees = await sails
        .helpers
        .utilities
        .getMakerTakerFees(crypto, currency);

      var quantityValue = (inputs.orderQuantity).toFixed(sails.config.local.QUANTITY_PRECISION)

      if (buyBook && buyBook.length > 0) {
        var availableQty = buyBook[0].quantity;
        var currentBuyBookDetails = buyBook[0];
        var priceValue = (currentBuyBookDetails.price).toFixed(sails.config.local.PRICE_PRECISION)
        var now = new Date();
        var orderData = {
          user_id: inputs.user_id,
          symbol: inputs.symbol,
          side: inputs.side,
          order_type: inputs.order_type,
          created_at: now,
          updated_at: now,
          maximum_time: now,
          fill_price: priceValue,
          limit_price: 0,
          stop_price: 0,
          price: 0,
          quantity: quantityValue,
          order_status: "partially_filled",
          currency: currency,
          settle_currency: crypto
        }

        var resultData = {
          ...orderData
        }
        resultData.is_market = true;
        resultData.fix_quantity = quantityValue;
        resultData.maker_fee = fees.makerFee;
        resultData.taker_fee = fees.takerFee;

        let activity = await sails
          .helpers
          .tradding
          .activity
          .add(resultData);

        if (quantityValue <= availableQty) {
          if ((priceValue * quantityValue).toFixed(sails.config.local.TOTAL_PRECISION) <= (wallet.placed_balance).toFixed(sails.config.local.TOTAL_PRECISION)) {
            var trade_history_data = {
              ...orderData
            };
            trade_history_data.maker_fee = fees.makerFee;
            trade_history_data.taker_fee = fees.takerFee;
            trade_history_data.quantity = quantityValue;
            trade_history_data.requested_user_id = currentBuyBookDetails.user_id;
            trade_history_data.created_at = now;
            trade_history_data.fix_quantity = quantityValue;
            let updatedActivity = await sails
              .helpers
              .tradding
              .activity
              .update(currentBuyBookDetails.activity_id, trade_history_data);
            userIds.push(parseInt(trade_history_data.requested_user_id));
            var request = {
              requested_user_id: trade_history_data.requested_user_id,
              user_id: inputs.user_id,
              currency: currency,
              side: inputs.side,
              settle_currency: crypto,
              quantity: quantityValue,
              fill_price: priceValue
            }

            var tradingFees = await sails
              .helpers
              .wallet
              .tradingFees(request, fees.makerFee, fees.takerFee)
              .intercept("serverError", () => {
                return new Error("serverError")
              });

            trade_history_data.user_fee = (tradingFees.userFee);
            trade_history_data.requested_fee = (tradingFees.requestedFee);
            trade_history_data.user_coin = crypto;
            trade_history_data.requested_coin = currency;
            let tradeHistory = await sails
              .helpers
              .tradding
              .trade
              .add(trade_history_data);

            let remainigQuantity = availableQty - quantityValue;

            if (remainigQuantity > 0) {
              let updatedBuyBook = await sails
                .helpers
                .tradding
                .buy
                .update(currentBuyBookDetails.id, {
                  quantity: (remainigQuantity).toFixed(sails.config.local.QUANTITY_PRECISION)
                });
            } else {
              await sails
                .helpers
                .tradding
                .buy
                .deleteOrder(currentBuyBookDetails.id);
            }

          } else {
            return exits.insufficientBalance();
          }
        } else {
          var remainingQty = quantityValue - availableQty;
          if ((priceValue * quantityValue).toFixed(sails.config.local.TOTAL_PRECISION) <= (wallet.placed_balance).toFixed(sails.config.local.TOTAL_PRECISION)) {
            var trade_history_data = {
              ...orderData
            };
            trade_history_data.maker_fee = fees.makerFee;
            trade_history_data.taker_fee = fees.takerFee;
            trade_history_data.quantity = availableQty;
            trade_history_data.requested_user_id = currentBuyBookDetails.user_id;
            trade_history_data.created_at = now;

            trade_history_data.fix_quantity = quantityValue;
            let updatedActivity = await sails
              .helpers
              .tradding
              .activity
              .update(currentBuyBookDetails.activity_id, trade_history_data);
            userIds.push(parseInt(trade_history_data.requested_user_id));
            var request = {
              requested_user_id: trade_history_data.requested_user_id,
              user_id: inputs.user_id,
              currency: currency,
              side: inputs.side,
              settle_currency: crypto,
              quantity: availableQty,
              fill_price: priceValue
            }
            var tradingFees = await sails
              .helpers
              .wallet
              .tradingFees(request, fees.makerFee, fees.takerFee)
              .intercept("serverError", () => {
                return new Error("serverError")
              });
            trade_history_data.user_fee = (tradingFees.userFee);
            trade_history_data.requested_fee = (tradingFees.requestedFee);
            trade_history_data.user_coin = crypto;
            trade_history_data.requested_coin = currency;
            let tradeHistory = await sails
              .helpers
              .tradding
              .trade
              .add(trade_history_data);

            await sails
              .helpers
              .tradding
              .buy
              .deleteOrder(currentBuyBookDetails.id);
            let requestData = {
              ...inputs
            }
            requestData.orderQuantity = remainingQty;
            let response = await sails
              .helpers
              .tradding
              .marketSell(requestData.symbol, requestData.user_id, requestData.side, requestData.order_type, requestData.orderQuantity)
              .intercept("coinNotFound", () => {
                return new Error("coinNotFound");
              })
              .intercept("serverError", () => {
                return new Error("serverError");
              })
              .intercept("insufficientBalance", () => {
                return new Error("insufficientBalance");
              })
              .intercept("orderBookEmpty", () => {
                return new Error("orderBookEmpty");
              });
          } else {
            return exits.insufficientBalance();
          }

        }

      } else {
        return exits.orderBookEmpty();
      }
      // console.log("----wallet", wallet);
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
      return exits.success();

    } catch (error) {
      console.log(error);
      if (error.message == "coinNotFound") {
        return exits.coinNotFound();
      }
      if (error.message == "serverError") {
        return exits.serverError();
      }
      return exits.serverError();
    }
  }

};
