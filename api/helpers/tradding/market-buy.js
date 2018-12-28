module.exports = {

  friendlyName: 'Market buy',

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
      let { crypto, currency } = await sails
        .helpers
        .utilities
        .getCurrencies(inputs.symbol);
      let wallet = await sails
        .helpers
        .utilities
        .getWalletBalance(crypto, currency, inputs.user_id).intercept("coinNotFound", () => {
          return new Error("coinNotFound");
        }).intercept("serverError", () => {
          return new Error("serverError")
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

      if (sellBook && sellBook.length > 0) {
        var availableQty = sellBook[0].quantity;
        var currentSellBookDetails = sellBook[0];
        var now = new Date();
        var orderData = {
          user_id: inputs.user_id,
          symbol: inputs.symbol,
          side: inputs.side,
          order_type: inputs.order_type,
          created_at: now,
          updated_at: now,
          maximum_time: now,
          fill_price: currentSellBookDetails.price,
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
          if ((currentSellBookDetails.price * inputs.orderQuantity) <= wallet.placed_balance) {
            var trade_history_data = {
              ...orderData
            };
            trade_history_data.maker_fee = fees.makerFee;
            trade_history_data.taker_fee = fees.takerFee;
            trade_history_data.fix_quantity = inputs.orderQuantity;
            trade_history_data.requested_user_id = currentSellBookDetails.user_id;
            trade_history_data.created_at = now;
            trade_history_data.fix_quantity = inputs.orderQuantity;
            let updatedActivity = await sails
              .helpers
              .tradding
              .activity
              .update(currentSellBookDetails.activity_id, trade_history_data);

            var request = {
              requested_user_id: trade_history_data.requested_user_id,
              user_id: inputs.user_id,
              currency: currency,
              side: inputs.side,
              crypto: crypto,
              quantity: inputs.orderQuantity,
              fill_price: currentSellBookDetails.price
            }
            var tradingFees = await sails
              .helpers
              .wallet
              .tradingFees(request, fees.makerFee, fees.takerFee).intercept("serverError", () => {
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
            // Do Actual Tranasfer In Wallet Here
            //
            let remainigQuantity = availableQty - inputs.orderQuantity;
            console.log(remainigQuantity);
            if (remainigQuantity > 0) {
              let updatedBuyBook = await sails
                .helpers
                .tradding
                .sell
                .update(currentSellBookDetails.id, { quantity: remainigQuantity });
            } else {
              await sails
                .helpers
                .tradding
                .sell
                .deleteOrder(currentSellBookDetails.id);
            }

          } else {
            return exits.insufficientBalance();
            // console.log("insufficient balance");
          }
        } else {
          var remainingQty = inputs.orderQuantity - availableQty;
          if ((currentSellBookDetails.price * inputs.orderQuantity) <= wallet.placed_balance) {
            var trade_history_data = {
              ...orderData
            };
            trade_history_data.maker_fee = fees.makerFee;
            trade_history_data.taker_fee = fees.takerFee;
            trade_history_data.fix_quantity = inputs.orderQuantity;
            trade_history_data.requested_user_id = currentSellBookDetails.user_id;
            trade_history_data.created_at = now;
            trade_history_data.fix_quantity = inputs.orderQuantity;
            let updatedActivity = await sails
              .helpers
              .tradding
              .activity
              .update(currentSellBookDetails.activity_id, trade_history_data);
            var request = {
              requested_user_id: trade_history_data.requested_user_id,
              user_id: inputs.user_id,
              currency: currency,
              side: inputs.side,
              crypto: crypto,
              quantity: inputs.orderQuantity,
              fill_price: currentBuyBookDetails.price
            }
            var tradingFees = await sails
              .helpers
              .wallet
              .tradingFees(request, fees.makerFee, fees.takerFee).intercept("serverError", () => {
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
            // Do Actual Tranasfer In Wallet Here
            //
            await sails
              .helpers
              .tradding
              .sell
              .deleteOrder(currentSellBookDetails.id);
            let requestData = {
              ...inputs
            }
            requestData.orderQuantity = remainingQty;
            let response = await sails
              .helpers
              .tradding
              .marketBuy(requestData.symbol, requestData.user_id, requestData.side, requestData.order_type, requestData.orderQuantity).intercept("coinNotFound", () => {
                return new Error("coinNotFound");
              }).intercept("serverError", () => {
                return new Error("serverError");
              }).intercept("insufficientBalance", () => {
                return new Error("insufficientBalance");
              }).intercept("orderBookEmpty", () => {
                return new Error("orderBookEmpty");
              });
          } else {
            return exits.insufficientBalance();
          }

        }
      } else {
        return exits.orderBookEmpty();
      }
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
