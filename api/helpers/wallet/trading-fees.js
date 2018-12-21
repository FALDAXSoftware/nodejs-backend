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
    }

  },

  fn: async function (inputs,exits) {
    var request = inputs.request;
    var user_id = parseInt(request.user_id);
    var requested_user_id = parseInt(request.requested_user_id);
    var currencyData = await Coins.findOne({deleted_at: null, is_active: true, coin: request.currency});
    var cryptoData = await Coins.findOne({deleted_at: null, is_active: true, coin: request.settle_currency});
    var currencyWalletUser = await Wallet.findOne({deleted_at: null, is_active: true, coin_id: currencyData.id, user_id: request.user_id});
    var cryptoWalletRequested = await Wallet.findOne({deleted_at: null, is_active: true, coin_id: cryptoData.id, user_id: request.requested_user_id});
    var currencyWalletRequested = await Wallet.findOne({deleted_at: null, is_active: true, coin_id: currencyData.id, user_id: request.requested_user_id});
    var cryptoWalletUser = await Wallet.findOne({deleted_at: null, is_active: true, coin_id: cryptoData.id, user_id: request.user_id});

    try {
      if (request.side == "Buy") {

        // ---------------------------crypto-------------------------------------- //
        var cryptouserbalance = cryptoWalletUser.balance + (request.quantity - (request.quantity * request.takerFee / 100));
        var cryptouserbalance = parseFloat(cryptouserbalance.toFixed(6));
        var cryptouserPlacedbalance = cryptoWalletUser.placed_balance + (request.quantity - (request.quantity * request.takerFee / 100));
        var cryptouserPlacedbalance = parseFloat(cryptouserPlacedbalance.toFixed(6));
        var a = await Wallet
          .update({id: cryptoWalletUser.id})
          .set({balance: cryptouserbalance, placed_balance: cryptouserPlacedbalance});

        var cryptorequestedbalance = cryptoWalletRequested.balance - (request.quantity);
        var cryptorequestedbalance = parseFloat(cryptorequestedbalance.toFixed(6));
        var a = await Wallet
          .update({id: cryptoWalletRequested.id})
          .set({balance: cryptorequestedbalance});

        // -----------------------currency-------------------------------------- //
        var currencyuserbalance = currencyWalletUser.balance - ((request.quantity * request.fill_price));
        var currencyuserbalance = parseFloat(currencyuserbalance.toFixed(6))
        var currencyuserplacedbalance = currencyWalletUser.placed_balance - ((request.quantity * request.fill_price));
        var currencyuserplacedbalance = parseFloat(currencyuserplacedbalance.toFixed(6))
        var b = await Wallet
          .update({id: currencyWalletUser, id})
          .set({balance: currencyuserbalance, placed_balance: currencyuserplacedbalance});

        var currencyrequestedbalance = currencyWalletRequested.balance + ((request.quantity * request.fill_price) - (request.quantity * request.fill_price * (request.makerFee / 100)));
        var currencyrequestedbalance = parseFloat(currencyrequestedbalance.toFixed(6));
        var currencyrequestedplacedbalance = currencyWalletRequested.placed_balance + ((request.quantity * request.fill_price) - (request.quantity * request.fill_price * (request.makerFee / 100)));
        var currencyrequestedplacedbalance = parseFloat(currencyrequestedplacedbalance.toFixed(6));

        var b = await Wallet
          .update({id: currencyWalletRequested.id})
          .set({balance: currencyrequestedbalance, placed_balance: currencyrequestedplacedbalance});

        var requestedFee = (request.quantity * request.fill_price * (request.makerFee / 100));
        var userFee = (request.quantity * request.takerFee / 100);

      } else if (request.side == "Sell") {

        // --------------------------------------crypto--------------------------- //
        var cryptouserbalance = cryptoWalletUser.balance - (request.quantity);
        var cryptouserbalance = parseFloat(cryptouserbalance.toFixed(6))
        var cryptouserPlacedbalance = cryptoWalletUser.placed_balance - ((quantity));
        var cryptouserPlacedbalance = parseFloat(cryptouserPlacedbalance.toFixed(6))
        var a = await Wallet
          .update({id: cryptoWalletUser.id})
          .set({balance: cryptouserbalance, placed_balance: cryptouserPlacedbalance});

        var cryptorequestedbalance = cryptoWalletRequested.balance + (request.quantity - (request.quantity * (request.makerFee / 100)));
        var cryptorequestedbalance = parseFloat(cryptorequestedbalance.toFixed(6))
        var cryptorequestedplacedbalance = cryptoWalletRequested.placed_balance + (request.quantity - (request.quantity * (request.makerFee / 100)));
        var cryptorequestedplacedbalance = parseFloat(cryptorequestedplacedbalance.toFixed(6))

        var a = await Wallet
          .update({id: cryptoWalletRequested.id})
          .set({balance: cryptorequestedbalance, placed_balance: cryptorequestedplacedbalance});

        // -------------------------- currency ---------------------------- //
        var currencyuserbalance = currencyWalletUser.balance + (request.quantity * request.fill_price - (request.quantity * request.fill_price * (request.takerFee / 100)));
        var currencyuserbalance = parseFloat(currencyuserbalance.toFixed(6))
        var currencyuserplacedbalance = currencyWalletUser.placed_balance + (request.quantity * request.fill_price - (request.quantity * request.fill_price * (request.takerFee / 100)));
        var currencyuserplacedbalance = parseFloat(currencyuserplacedbalance.toFixed(6))

        var b = await Wallet
          .update({id: currencyWalletUser.id})
          .set({balance: currencyuserbalance, placed_balance: currencyuserplacedbalance});

        var currencyrequestedbalance = currencyWalletRequested.balance - ((request.quantity * request.fill_price));
        var currencyrequestedbalance = parseFloat(currencyrequestedbalance.toFixed(6))
        var b = await Wallet
          .update({id: currencyWalletRequested.id})
          .set({balance: currencyrequestedbalance});

        var requestedFee = request.quantity * (request.makerFee / 100);
        var userFee = (request.quantity * request.fill_price * (request.takerFee / 100));
      }
      return inputs.success({'userFee': userFee, 'requestedFee': requestedFee})
    } catch (err) {}
  }

};
