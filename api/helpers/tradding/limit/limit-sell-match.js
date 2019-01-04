var moment = require('moment');

module.exports = {

  friendlyName: 'Limit sell match',

  description: '',

  inputs: {
    sellLimitOrderData: {
      type: 'json',
      example: '{}',
      description: 'Sell Limit Data',
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
      description: 'Activity of the Sell Limit Data',
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
      let sellLimitOrderData = inputs.sellLimitOrderData
      if (sellLimitOrderData.orderQuantity <= 0) {
        return exits.invalidQuantity()
      }
      var wallet = await sails
        .helpers
        .utilities
        .getSellWalletBalance(sellLimitOrderData.settle_currency, sellLimitOrderData.currency, sellLimitOrderData.user_id)
        .intercept("coinNotFound", () => {
          return new Error("coinNotFound");
        })
        .intercept("serverError", () => {
          return new Error("serverError");
        });
      let buyBook = await sails
        .helpers
        .tradding
        .buy
        .getBuyBookOrders(sellLimitOrderData.settle_currency, sellLimitOrderData.currency);
      let fees = await sails
        .helpers
        .utilities
        .getMakerTakerFees(sellLimitOrderData.settle_currency, sellLimitOrderData.currency);

      if (buyBook && buyBook.length > 0) {
        if ((buyBook[0].price >= sellLimitOrderData.limit_price) || (buyBook[0].price <= sellLimitOrderData.stop_price)) {
          if (buyBook[0].quantity >= sellLimitOrderData.quantity) {
            sellLimitOrderData.fill_price = buyBook[0].price;
            delete sellLimitOrderData.id;
            if ((sellLimitOrderData.fill_price * sellLimitOrderData.quantity) <= wallet.placed_balance) {
              var sellAddedData = {
                ...sellLimitOrderData
              }
              sellAddedData.is_partially_fulfilled = true;
              var trade_history_data = {
                ...sellLimitOrderData
              }
              if (sellLimitOrderData.quantity >= buyBook[0].quantity) {
                trade_history_data.fix_quantity = buyBook[0].quantity;
              } else {
                trade_history_data.fix_quantity = sellLimitOrderData.quantity;
              }
              trade_history_data.maker_fee = fees.makerFee;
              trade_history_data.taker_fee = fees.takerFee;
              trade_history_data.requested_user_id = buyBook[0].user_id;
              trade_history_data.created = moment().utc();

              let updatedActivity = await sails
                .helpers
                .tradding
                .activity
                .update(buyBook[0].activity_id, trade_history_data);

              var request = {
                requested_user_id: trade_history_data.requested_user_id,
                user_id: sellLimitOrderData.user_id,
                currency: sellLimitOrderData.currency,
                side: sellLimitOrderData.side,
                settle_currency: sellLimitOrderData.settle_currency,
                quantity: sellLimitOrderData.quantity,
                fill_price: sellLimitOrderData.fill_price
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
              trade_history_data.user_coin = sellLimitOrderData.settle_currency;
              trade_history_data.requested_coin = sellLimitOrderData.currency;

              var tradeHistory = await sails
                .helpers
                .tradding
                .trade
                .add(trade_history_data);

              // Transfer fees here Updating the trade history data for adding fees
              var remainingQty = buyBook[0].quantity - sellLimitOrderData.quantity;
              console.log(buyBook[0].id);
              if (remainingQty > 0) {
                let updatedBuyBook = await sails
                  .helpers
                  .tradding
                  .buy
                  .update(buyBook[0].id, {'quantity': remainingQty});
                //Emit the socket
                return exits.success(updatedBuyBook);
              } else {
                var deleteData = await sails
                  .helpers
                  .tradding
                  .buy
                  .deleteOrder(buyBook[0].id);
                //Emit the socket here
                return exits.success(deleteData);
              }
            } else {
              //Not enough fund error
              return exits.insufficientBalance();
            }
          } else {
            console.log("Inside else loop :: ");
            var remainingQty = sellLimitOrderData.quantity - buyBook[0].quantity;
            var feeResult = await sails
              .helpers
              .utilities
              .getMakerTakerFees(sellLimitOrderData.settle_currency, sellLimitOrderData.currency);
            if ((sellLimitOrderData.fill_price * sellLimitOrderData.quantity) <= wallet.placed_balance) {
              var sellAddedData = {
                ...sellLimitOrderData
              }
              sellAddedData.is_partially_fulfilled = true;
              var resendData = {
                ...sellLimitOrderData
              };

              sellLimitOrderData.quantity = buyBook[0].quantity;
              sellLimitOrderData.order_status = "partially_filled";
              sellLimitOrderData.fill_price = buyBook[0].price;
              var deleteResult = await sails
                .helpers
                .tradding
                .buy
                .deleteOrder(buyBook[0].id);
              delete sellLimitOrderData.id
              var trade_history_data = {
                ...sellLimitOrderData
              };
              if (sellLimitOrderData.quantity >= buyBook[0].quantity) {
                trade_history_data.fix_quantity = buyBook[0].quantity;
              } else {
                trade_history_data.fix_quantity = sellLimitOrderData.quantity;
              }
              trade_history_data.maker_fee = feeResult.makerFee;
              trade_history_data.taker_fee = feeResult.takerFee;
              trade_history_data.quantity = buyBook[0].quantity;
              trade_history_data.requested_user_id = buyBook[0].user_id;
              trade_history_data.created = moment().utc();

              var activityResult = await sails
                .helpers
                .tradding
                .activity
                .update(buyBook[0].activity_id, trade_history_data);

              var request = {
                requested_user_id: trade_history_data.requested_user_id,
                user_id: sellLimitOrderData.user_id,
                currency: sellLimitOrderData.currency,
                side: sellLimitOrderData.side,
                settle_currency: sellLimitOrderData.settle_currency,
                quantity: buyBook[0].quantity,
                fill_price: sellLimitOrderData.fill_price
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
              trade_history_data.user_coin = sellLimitOrderData.settle_currency;
              trade_history_data.requested_coin = sellLimitOrderData.currency;

              var tradeHistory = await sails
                .helpers
                .tradding
                .trade
                .add(trade_history_data);
              // Wallet actual transfer here Update Trade Data Here
              var deletedResponse = await sails
                .helpers
                .tradding
                .buy
                .deleteOrder(buyBook[0].id);
              //Emit socket here
              var resendDataLimit = {
                ...sellLimitOrderData
              }
              console.log(remainingQty);
              resendDataLimit.quantity = remainingQty;
              resendDataLimit.activity_id = activityResult.id;
              if (remainingQty > 0) {
                var responseData = await sails
                  .helpers
                  .tradding
                  .limit
                  .limitSellMatch(resendDataLimit, resendData.settle_currency, resendData.currency, activityResult)
                return exits.success(responseData);
              }
            } else {
              //Not Enough Fund Error
              return exits.insufficientBalance();
            }
          }
        } else {

          if (sellLimitOrderData.quantity * sellLimitOrderData.limit_price <= wallet.placed_balance) {
            var sellAddedData = {
              ...sellLimitOrderData
            }
            sellAddedData.fix_quantity = sellAddedData.quantity;
            sellAddedData.maker_fee = fees.makerFee;
            sellAddedData.taker_fee = fees.takerFee;
            var addData = await sails
              .helpers
              .tradding
              .activity
              .add(sellAddedData);
            sellAddedData.is_partially_fulfilled = true;
            sellAddedData.activity_id = addData.id;
            var addSellBook = await sails
              .helpers
              .tradding
              .sell
              .addSellOrder(sellAddedData);
            //Add Socket Here Emit
            return exits.success(addSellBook);
          } else {
            //Not enough fund
            return exits.insufficientBalance();
          }
        }
      } else {
        if (sellLimitOrderData.quantity * sellLimitOrderData.limit_price <= wallet.placed_balance) {
          var sellAddedData = {
            ...sellLimitOrderData
          }
          sellAddedData.fix_quantity = sellAddedData.quantity;
          sellAddedData.maker_fee = fees.makerFee;
          sellAddedData.taker_fee = fees.takerFee;
          var addData = await sails
            .helpers
            .tradding
            .activity
            .add(sellAddedData);
          sellAddedData.is_partially_fulfilled = true;
          sellAddedData.activity_id = addData.id;
          var addSellBook = await sails
            .helpers
            .tradding
            .sell
            .addSellOrder(sellAddedData);
          //Add Socket Here Emit
          return exits.success(addSellBook);
        } else {
          //Not enough fund
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
