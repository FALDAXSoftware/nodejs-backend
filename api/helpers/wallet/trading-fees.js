var moment = require('moment');

module.exports = {

  friendlyName: 'Trading fees',

  description: '',

  inputs: {
    request: {
      type: 'json',
      example: '{}',
      description: 'Object for which transfer needs to be done',
      required: true
    },
    makerFee: {
      type: 'number',
      example: 1,
      description: 'Maker Fee',
      required: true
    },
    takerFee: {
      type: 'number',
      example: 1,
      description: 'Taker Fee.',
      required: true
    }
  },

  exits: {

    success: {
      description: 'All done.'
    },
    error: {
      description: 'Error.'
    },
    serverError: {
      descritpion: 'serverError'
    }
  },

  fn: async function (inputs, exits) {
    try {
      var request = inputs.request;
      var user_id = parseInt(request.user_id);
      var requested_user_id = parseInt(request.requested_user_id);

      var resultData;

      // resultData = await sails
      //   .helpers
      //   .wallet
      //   .getFiatValue(request.currency, request.quantity);

      var now = moment().format();
      var yesterday = moment(now)
        .subtract(1, 'months')
        .format();

      // var userTakerTradeData = await TradeHistory
      //   .sum('usd_user_value')
      //   .find({
      //     where: {
      //       deleted_at: null,
      //       user_id: request.user_id,
      //       created_at: {
      //         '>=': yesterday,
      //         '<=': now
      //       }
      //     }
      //   });

      // if (isNaN(userTakerTradeData) || userTakerTradeData == undefined || userTakerTradeData.length == 0) {
      //   userTakerTradeData = 0;
      // }

      // var totalUserTrade = userTakerTradeData;

      // var userMakerTradeData = await TradeHistory
      //   .sum('usd_user_value')
      //   .find({
      //     where: {
      //       deleted_at: null,
      //       user_id: request.requested_user_id,
      //       created_at: {
      //         '>=': yesterday,
      //         '<=': now
      //       }
      //     }
      //   });

      // if (isNaN(userMakerTradeData) || userMakerTradeData == undefined || userMakerTradeData.length == 0) {
      //   userMakerTradeData = 0;
      // }

      // var totalRequestedTrade = userMakerTradeData;

      // var feeResultUser = await Pairs.find({
      //   where: {
      //     total_value: {
      //       '>=': totalUserTrade,
      //       '<=': totalUserTrade
      //     },
      //     deleted_at: null,
      //     is_active: true
      //   }
      // });

      // var = await Pairs.find({
      //   where: {
      //     total_value: {
      //       '>=': totalRequestedTrade,
      //       '<=': totalRequestedTrade
      //     },
      //     deleted_at: null,
      //     is_active: true
      //   }
      // });

      var user_usd;

      var currencyData = await Coins.findOne({deleted_at: null, is_active: true, coin: request.currency});
      var cryptoData = await Coins.findOne({deleted_at: null, is_active: true, coin: request.settle_currency});
      var currencyWalletUser = await Wallet.findOne({deleted_at: null, is_active: true, coin_id: currencyData.id, user_id: request.user_id});
      var cryptoWalletRequested = await Wallet.findOne({deleted_at: null, is_active: true, coin_id: cryptoData.id, user_id: request.requested_user_id});
      var currencyWalletRequested = await Wallet.findOne({deleted_at: null, is_active: true, coin_id: currencyData.id, user_id: request.requested_user_id});
      var cryptoWalletUser = await Wallet.findOne({deleted_at: null, is_active: true, coin_id: cryptoData.id, user_id: request.user_id});

      if (request.side == "Buy") {

        // ---------------------------crypto-------------------------------------- //
        var cryptouserbalance = cryptoWalletUser.balance + (request.quantity - (request.quantity * inputs.takerFee / 100));
        var cryptouserbalance = parseFloat(cryptouserbalance.toFixed(6));
        var cryptouserPlacedbalance = cryptoWalletUser.placed_balance + (request.quantity - (request.quantity * inputs.takerFee / 100));
        var cryptouserPlacedbalance = parseFloat(cryptouserPlacedbalance.toFixed(6));

        var a = await Wallet
          .update({id: cryptoWalletUser.id})
          .set({balance: cryptouserbalance, placed_balance: cryptouserPlacedbalance});

        var cryptorequestedbalance = cryptoWalletRequested.balance - (request.quantity);
        var cryptorequestedbalance = parseFloat(cryptorequestedbalance.toFixed(6));

        var a = await Wallet
          .update({id: cryptoWalletRequested.id})
          .set({balance: cryptorequestedbalance})
          .fetch();

        // -----------------------currency-------------------------------------- //
        var currencyuserbalance = currencyWalletUser.balance - ((request.quantity * request.fill_price));
        var currencyuserbalance = parseFloat(currencyuserbalance.toFixed(6))
        var currencyuserplacedbalance = currencyWalletUser.placed_balance - ((request.quantity * request.fill_price));
        var currencyuserplacedbalance = parseFloat(currencyuserplacedbalance.toFixed(6))
        var b = await Wallet
          .update({id: currencyWalletUser.id})
          .set({balance: currencyuserbalance, placed_balance: currencyuserplacedbalance})
          .fetch();

        var currencyrequestedbalance = currencyWalletRequested.balance + ((request.quantity * request.fill_price) - (request.quantity * request.fill_price * (inputs.makerFee / 100)));
        var currencyrequestedbalance = parseFloat(currencyrequestedbalance.toFixed(6));
        var currencyrequestedplacedbalance = currencyWalletRequested.placed_balance + ((request.quantity * request.fill_price) - (request.quantity * request.fill_price * (inputs.makerFee / 100)));
        var currencyrequestedplacedbalance = parseFloat(currencyrequestedplacedbalance.toFixed(6));

        var b = await Wallet
          .update({id: currencyWalletRequested.id})
          .set({balance: currencyrequestedbalance, placed_balance: currencyrequestedplacedbalance})
          .fetch();

        var requestedFee = (request.quantity * request.fill_price * (inputs.makerFee / 100));
        var userFee = (request.quantity * inputs.takerFee / 100);

        user_usd = (request.quantity * request.fill_price) * (resultData);

      } else if (request.side == "Sell") {

        // --------------------------------------crypto--------------------------- //
        var cryptouserbalance = cryptoWalletUser.balance - (request.quantity);
        var cryptouserbalance = parseFloat(cryptouserbalance.toFixed(6))
        var cryptouserPlacedbalance = cryptoWalletUser.placed_balance - ((request.quantity));
        var cryptouserPlacedbalance = parseFloat(cryptouserPlacedbalance.toFixed(6))

        var a = await Wallet
          .update({id: cryptoWalletUser.id})
          .set({balance: cryptouserbalance, placed_balance: cryptouserPlacedbalance});

        var cryptorequestedbalance = cryptoWalletRequested.balance + (request.quantity - (request.quantity * (inputs.makerFee / 100)));
        var cryptorequestedbalance = parseFloat(cryptorequestedbalance.toFixed(6))
        var cryptorequestedplacedbalance = cryptoWalletRequested.placed_balance + (request.quantity - (request.quantity * (inputs.makerFee / 100)));
        var cryptorequestedplacedbalance = parseFloat(cryptorequestedplacedbalance.toFixed(6))

        var a = await Wallet
          .update({id: cryptoWalletRequested.id})
          .set({balance: cryptorequestedbalance, placed_balance: cryptorequestedplacedbalance})
          .fetch();

        // -------------------------- currency ---------------------------- //

        var currencyuserbalance = currencyWalletUser.balance + (request.quantity * request.fill_price - (request.quantity * request.fill_price * (inputs.takerFee / 100)));
        var currencyuserbalance = parseFloat(currencyuserbalance.toFixed(6))
        var currencyuserplacedbalance = currencyWalletUser.placed_balance + (request.quantity * request.fill_price - (request.quantity * request.fill_price * (inputs.takerFee / 100)));
        var currencyuserplacedbalance = parseFloat(currencyuserplacedbalance.toFixed(6))

        var b = await Wallet
          .update({id: currencyWalletUser.id})
          .set({balance: currencyuserbalance, placed_balance: currencyuserplacedbalance});

        var currencyrequestedbalance = currencyWalletRequested.balance - ((request.quantity * request.fill_price));
        var currencyrequestedbalance = parseFloat(currencyrequestedbalance.toFixed(6))
        var b = await Wallet
          .update({id: currencyWalletRequested.id})
          .set({balance: currencyrequestedbalance})
          .fetch();

        var requestedFee = request.quantity * (inputs.makerFee / 100);
        var userFee = (request.quantity * request.fill_price * (inputs.takerFee / 100));
        user_usd = (request.quantity * request.fill_price) * (resultData);
      }
      return exits.success({'userFee': userFee, 'requestedFee': requestedFee})
    } catch (err) {
      console.log("fees Error", err);

      return exits.serverError();
    }
  }

};
