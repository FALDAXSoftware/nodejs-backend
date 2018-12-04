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
      description: 'All done.',
    },
  },


  fn: async function (inputs, exits) {
    console.log("market sell inputs -- ", inputs);

    let { crypto, currency } = await sails.helpers.utilities.getCurrencies(inputs.symbol);
    let wallet = await sails.helpers.utilities.getSellWalletBalance(crypto, currency, inputs.user_id);
    let buyBook = await sails.helpers.tradding.buy.getBuyBookOrders(crypto, currency);
    let fees = await sails.helpers.utilities.getMakerTakerFees(crypto, currency);
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
      console.log("resultData -- ", resultData);

    }
    console.log("----wallet", wallet);

    return exits.success();

  }


};

