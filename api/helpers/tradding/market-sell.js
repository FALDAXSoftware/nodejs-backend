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

      if (buyBook && buyBook.length > 0) {
        var availableQty = buyBook[0].quantity;
        var currentBuyBookDetails = buyBook[0];
        var now = new Date();
        var orderData = {
          user_id: inputs.user_id,
          symbol: inputs.symbol,
          side: inputs.side,
          order_type: inputs.order_type,
          created_at: now,
          updated_at: now,
          maximum_time: now,
          fill_price: currentBuyBookDetails.price,
          limit_price: 0,
          stop_price: 0,
          price: 0,
          quantity: inputs.orderQuantity,
          order_status: "partially_filled",
          currency: currency,
          settle_currency: crypto
        }

        var resultData = {
          ...orderData
        }
        resultData.is_market = true;
        resultData.fix_quantity = inputs.orderQuantity;
        resultData.maker_fee = fees.makerFee;
        resultData.taker_fee = fees.takerFee;

        let activity = await sails
          .helpers
          .tradding
          .activity
          .add(resultData);

        if (inputs.orderQuantity <= availableQty) {
          if ((currentBuyBookDetails.price * inputs.orderQuantity) <= wallet.placed_balance) {
            var trade_history_data = {
              ...orderData
            };
            trade_history_data.maker_fee = fees.makerFee;
            trade_history_data.taker_fee = fees.takerFee;
            trade_history_data.quantity = inputs.orderQuantity;
            trade_history_data.requested_user_id = currentBuyBookDetails.user_id;
            trade_history_data.created_at = now;
            trade_history_data.fix_quantity = inputs.orderQuantity;
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
              quantity: inputs.orderQuantity,
              fill_price: currentBuyBookDetails.price
            }

            var tradingFees = await sails
              .helpers
              .wallet
              .tradingFees(request, fees.makerFee, fees.takerFee)
              .intercept("serverError", () => {
                return new Error("serverError")
              });

            trade_history_data.user_fee = tradingFees.userFee;
            trade_history_data.requested_fee = tradingFees.requestedFee;
            trade_history_data.user_coin = crypto;
            trade_history_data.requested_coin = currency;
            let tradeHistory = await sails
              .helpers
              .tradding
              .trade
              .add(trade_history_data);

            let remainigQuantity = availableQty - inputs.orderQuantity;

            if (remainigQuantity > 0) {
              let updatedBuyBook = await sails
                .helpers
                .tradding
                .buy
                .update(currentBuyBookDetails.id, {
                  quantity: remainigQuantity
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
          var remainingQty = inputs.orderQuantity - availableQty;
          if ((currentBuyBookDetails.price * inputs.orderQuantity) <= wallet.placed_balance) {
            var trade_history_data = {
              ...orderData
            };
            trade_history_data.maker_fee = fees.makerFee;
            trade_history_data.taker_fee = fees.takerFee;
            trade_history_data.quantity = availableQty;
            trade_history_data.requested_user_id = currentBuyBookDetails.user_id;
            trade_history_data.created_at = now;

            trade_history_data.fix_quantity = inputs.orderQuantity;
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
              fill_price: currentBuyBookDetails.price
            }
            var tradingFees = await sails
              .helpers
              .wallet
              .tradingFees(request, fees.makerFee, fees.takerFee)
              .intercept("serverError", () => {
                return new Error("serverError")
              });
            trade_history_data.user_fee = tradingFees.userFee;
            trade_history_data.requested_fee = tradingFees.requestedFee;
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
