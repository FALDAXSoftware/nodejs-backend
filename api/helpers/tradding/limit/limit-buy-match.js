var moment = require('moment');
module.exports = {

  friendlyName: 'Limit buy match',

  description: '',

  inputs: {
    buyLimitOrderData: {
      type: 'json',
      example: '{}',
      description: 'Buy Limit Data',
      required: true
    },
    currency: {
      type: 'string',
      example: 'BTC',
      description: 'Currency of the pair',
      required: true
    },
    crypto: {
      type: 'string',
      example: 'ETH',
      description: 'Cryptocurrency of the pair',
      required: true
    },
    activity: {
      type: 'json',
      example: '{}',
      description: 'Activity of the Buy Limit Data',
      required: true
    }
  },

  exits: {

    success: {
      description: 'All done.'
    },
    invalidQuantity: {
      descritpion: 'Quantity can not be less than zero'
    },
    coinNotFound: {
      description: 'Error when coin not found'
    },
    insufficientBalance: {
      description: 'Error when insufficient balance in wallet.'
    },
    serverError: {
      description: 'serverError'
    }
  },

  fn: async function (inputs, exits) {
    try {
      let buyLimitOrderData = inputs.buyLimitOrderData
      if (buyLimitOrderData.orderQuantity <= 0) {
        // quantity can not be less than zero
        return exits.invalidQuantity()
      }
      var wallet = await sails
        .helpers
        .utilities
        .getWalletBalance(buyLimitOrderData.settle_currency, buyLimitOrderData.currency, buyLimitOrderData.user_id)
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
        .getSellBookOrders(buyLimitOrderData.settle_currency, buyLimitOrderData.currency);
      let fees = await sails
        .helpers
        .utilities
        .getMakerTakerFees(buyLimitOrderData.settle_currency, buyLimitOrderData.currency);

      if (sellBook && sellBook.length > 0) {
        if ((sellBook[0].price >= buyLimitOrderData.limit_price) || (sellBook[0].price <= buyLimitOrderData.stop_price)) {
          if (sellBook[0].quantity >= buyLimitOrderData.quantity) {
            buyLimitOrderData.fill_price = sellBook[0].price;
            delete buyLimitOrderData.id;
            if ((buyLimitOrderData.fill_price * buyLimitOrderData.quantity) <= wallet.placed_balance) {
              var buyAddedData = {
                ...buyLimitOrderData
              }
              buyAddedData.is_partially_fulfilled = true;
              var trade_history_data = {
                ...buyLimitOrderData
              }
              if (buyLimitOrderData.quantity >= sellBook[0].quantity) {
                trade_history_data.fix_quantity = sellBook[0].quantity;
              } else {
                trade_history_data.fix_quantity = buyLimitOrderData.quantity;
              }
              trade_history_data.maker_fee = fees.makerFee;
              trade_history_data.taker_fee = fees.takerFee;
              trade_history_data.requested_user_id = sellBook[0].user_id;
              trade_history_data.created = moment().utc();

              let updatedActivity = await sails
                .helpers
                .tradding
                .activity
                .update(sellBook[0].activity_id, trade_history_data);

              var request = {
                request_user_id: trade_history_data.requested_user_id,
                user_id: inputs.user_id,
                currency: buyLimitOrderData.currency,
                side: buyLimitOrderData.side,
                settle_currency: buyLimitOrderData.settle_currency,
                qty: buyLimitOrderData.quantity,
                fill_price: buyLimitOrderData.fill_price
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

              var tradeHistory = await sails
                .helpers
                .tradding
                .trade
                .add(trade_history_data);

              // Transfer fees here Updating the trade history data for adding fees

              var remainingQty = sellBook[0].quantity - buyLimitOrderData.quantity;

              if (remainingQty > 0) {
                let updatedbuyBook = await sails
                  .helpers
                  .tradding
                  .sell
                  .update(sellBook[0].id, {'quantity': remainingQty});
                //Emit the socket
                return exits.success(updatedbuyBook);
              } else {
                var deleteData = await sails
                  .helpers
                  .tradding
                  .sell
                  .deleteOrder(sellBook[0].id);
                //Emit the socket here
                return exits.success(deleteData);
              }
            } else {
              return exits.insufficientBalance();
            }
          } else {
            var remainingQty = buyLimitOrderData.quantity - sellBook[0].quantity;
            var feeResult = await sails
              .helpers
              .utilities
              .getMakerTakerFees(buyLimitOrderData.settle_currency, buyLimitOrderData.currency);
            if ((buyLimitOrderData.fill_price * buyLimitOrderData.quantity) <= wallet.placed_balance) {
              var buyAddedData = {
                ...buyLimitOrderData
              }
              buyAddedData.is_partially_fulfilled = true;
              var resendData = {
                ...buyLimitOrderData
              };

              buyLimitOrderData.quantity = sellBook[0].quantity;
              buyLimitOrderData.order_status = "partially_filled";
              buyLimitOrderData.fill_price = sellBook[0].price;
              var deleteResult = await sails
                .helpers
                .tradding
                .sell
                .deleteOrder(sellBook[0].id);
              delete buyLimitOrderData.id
              var trade_history_data = {
                ...buyLimitOrderData
              };
              if (buyLimitOrderData.quantity >= sellBook[0].quantity) {
                trade_history_data.fix_quantity = sellBook[0].quantity;
              } else {
                trade_history_data.fix_quantity = buyLimitOrderData.quantity;
              }
              trade_history_data.maker_fee = feeResult.makerFee;
              trade_history_data.taker_fee = feeResult.takerFee;
              trade_history_data.quantity = sellBook[0].quantity;
              trade_history_data.requested_user_id = sellBook[0].user_id;
              trade_history_data.created = moment().utc();

              var activityResult = await sails
                .helpers
                .tradding
                .activity
                .update(sellBook[0].activity_id, trade_history_data);
              var request = {
                requestUser_id: trade_history_data.requested_user_id,
                user_id: inputs.user_id,
                currency: buyLimitOrderData.currency,
                side: buyLimitOrderData.side,
                settle_currency: buyLimitOrderData.settle_currency,
                qty: sellBook[0].quantity,
                fill_price: buyLimitOrderData.fill_price
              }

              //Wallet Transfer
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

              var tradeHistory = await sails
                .helpers
                .tradding
                .trade
                .add(trade_history_data);
              // Wallet actual transfer here Update Trade Data Here
              var deletedResponse = await sails
                .helpers
                .tradding
                .sell
                .deleteOrder(sellBook[0].id);
              //Emit socket here
              var resendDataLimit = {
                ...buyLimitOrderData
              }

              resendDataLimit.quantity = remainingQty;
              resendDataLimit.activity_id = activityResult.id;
              if (remainingQty > 0) {
                var responseData = await sails
                  .helpers
                  .tradding
                  .limit
                  .limitBuyMatch(resendDataLimit, resendData.settle_currency, resendData.currency, activityResult)
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
                return exits.success(responseData);
              }
            } else {
              //Not Enough Fund Error
              return exits.insufficientBalance();
            }
          }
        } else {

          if (buyLimitOrderData.quantity * buyLimitOrderData.limit_price <= wallet.placed_balance) {
            var buyAddedData = {
              ...buyLimitOrderData
            }
            buyAddedData.fix_quantity = buyAddedData.quantity;
            buyAddedData.maker_fee = fees.makerFee;
            buyAddedData.taker_fee = fees.takerFee;
            var addData = await sails
              .helpers
              .tradding
              .activity
              .add(buyAddedData);
            buyAddedData.is_partially_fulfilled = true;
            buyAddedData.activity_id = addData.id;
            var addSellBook = await sails
              .helpers
              .tradding
              .buy
              .addBuyOrder(buyAddedData);
            //Add Socket Here Emit
            return exits.success(addSellBook);
          } else {
            //Not enough fund
            return exits.insufficientBalance();
          }
        }
      } else {
        if (buyLimitOrderData.quantity * buyLimitOrderData.limit_price <= wallet.placed_balance) {
          var buyAddedData = {
            ...buyLimitOrderData
          }
          buyAddedData.fix_quantity = buyAddedData.quantity;
          buyAddedData.maker_fee = fees.makerFee;
          buyAddedData.taker_fee = fees.takerFee;
          var addData = await sails
            .helpers
            .tradding
            .activity
            .add(buyAddedData);
          buyAddedData.is_partially_fulfilled = true;
          buyAddedData.activity_id = addData.id;
          var addSellBook = await sails
            .helpers
            .tradding
            .buy
            .addBuyOrder(buyAddedData);
          //Add Socket Here Emit
          return exits.success(addSellBook);
        } else {
          //Not enough fund
          return exits.insufficientBalance();
        }
      }
    } catch (error) {
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
