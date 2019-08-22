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

      // Fetching currency data value
      var currencyData = await Coins.findOne({
        deleted_at: null,
        is_active: true,
        coin: request.currency
      });

      // Fetching cryptocurrency data value
      var cryptoData = await Coins.findOne({
        deleted_at: null,
        is_active: true,
        coin: request.settle_currency
      });

      var now = moment().format();
      var resultData;
      var yesterday = moment(now)
        .subtract(1, 'months')
        .format();

      //Maker and Taker fee according to trades executed by user

      var getCurrencyPriceData = await CurrencyConversion.findOne({
        coin_id: currencyData.id,
        deleted_at: null
      });
      var getCryptoPriceData = await CurrencyConversion.findOne({
        coin_id: cryptoData.id,
        deleted_at: null
      });

      console.log("Currency Value >>>>>>>>>>>>", getCurrencyPriceData);
      console.log("Crypto Value >>>>>>>>>>>>", getCryptoPriceData);

      // Fetching Amount of trade done on the basis of time and usd value
      var currencyAmount = await TradeHistory
        .sum('amount')
        .find({
          or: [{
              user_id: user_id,
            },
            {
              requested_user_id: user_id
            }
          ],
          deleted_at: null,
          created_at: {
            ">=": yesterday
          },
          created_at: {
            "<=": now
          }
        });

      console.log("currency amount?????????????", currencyAmount);

      // Fetching Amount of trade done on the basis of time and usd value
      var cryptoAmount = await TradeHistory
        .sum('amount')
        .find({
          or: [{
              user_id: requested_user_id,
            },
            {
              requested_user_id: requested_user_id
            }
          ],
          deleted_at: null,
          created_at: {
            ">=": yesterday
          },
          created_at: {
            "<=": now
          }
        });

      console.log("Crypto Amount ????????????????", cryptoAmount);

      var userData = await User.findOne({
        deleted_at: null,
        is_active: true,
        id: user_id
      });
      var requestData = await User.findOne({
        deleted_at: null,
        is_active: true,
        id: requested_user_id
      });

      var totalCurrencyAmount = currencyAmount * getCurrencyPriceData.qoute[userData.fiat].price;
      var totalCryptoAmount = cryptoAmount * getCryptoPriceData.qoute[requestData.fiat].price;

      // Fetching the fees on the basis of the total trade done in last 30 days
      var currencyMakerFee = await Fees.findOne({
        select: [
          'maker_fee',
          'taker_fee'
        ],
        where: {
          deleted_at: null,
          min_trade_volume: {
            '>=': totalCurrencyAmount
          },
          max_trade_volume: {
            '<=': totalCurrencyAmount
          },
          created_at: {
            '<=': now
          }
        }
      });

      console.log("Maker Fee ??????????????????", currencyMakerFee);

      // Fetching the fees on the basis of the total trade done in last 30 days 
      var cryptoTakerFee = await Fees.findOne({
        select: [
          'maker_fee',
          'taker_fee'
        ],
        where: {
          deleted_at: null,
          min_trade_volume: {
            '>=': totalCryptoAmount
          },
          max_trade_volume: {
            '<=': totalCryptoAmount
          },
          created_at: {
            '<=': now
          }
        }
      });

      console.log("Taker Fee>>>>>>>>>>>>>>>>>", cryptoTakerFee);

      // Just Replace inputs.makerFee and inputs.takerFee with following
      // inputs.makerFee = cryptoTakerFee.maker_fee
      // inputs.takerFee = currencyMakerFee.taker_fee

      var user_usd;

      var currencyWalletUser = await Wallet.findOne({
        deleted_at: null,
        is_active: true,
        coin_id: currencyData.id,
        user_id: request.user_id
      });
      var cryptoWalletRequested = await Wallet.findOne({
        deleted_at: null,
        is_active: true,
        coin_id: cryptoData.id,
        user_id: request.requested_user_id
      });
      var currencyWalletRequested = await Wallet.findOne({
        deleted_at: null,
        is_active: true,
        coin_id: currencyData.id,
        user_id: request.requested_user_id
      });
      var cryptoWalletUser = await Wallet.findOne({
        deleted_at: null,
        is_active: true,
        coin_id: cryptoData.id,
        user_id: request.user_id
      });

      console.log(currencyWalletRequested);
      console.log(cryptoWalletUser);

      // Calculating fees value on basis of the side and order executed
      if (request.side == "Buy") {

        // ---------------------------crypto-------------------------------------- //
        var cryptouserbalance = cryptoWalletUser.balance + (request.quantity - (request.quantity * inputs.takerFee / 100));
        var cryptouserbalance = parseFloat(cryptouserbalance.toFixed(6));
        var cryptouserPlacedbalance = cryptoWalletUser.placed_balance + (request.quantity - (request.quantity * inputs.takerFee / 100));
        var cryptouserPlacedbalance = parseFloat(cryptouserPlacedbalance.toFixed(6));

        var a = await Wallet
          .update({
            id: cryptoWalletUser.id
          })
          .set({
            balance: cryptouserbalance,
            placed_balance: cryptouserPlacedbalance
          });

        var cryptorequestedbalance = cryptoWalletRequested.balance - (request.quantity);
        var cryptorequestedbalance = parseFloat(cryptorequestedbalance.toFixed(6));

        var a = await Wallet
          .update({
            id: cryptoWalletRequested.id
          })
          .set({
            balance: cryptorequestedbalance
          })
          .fetch();

        // -----------------------currency-------------------------------------- //
        var currencyuserbalance = currencyWalletUser.balance - ((request.quantity * request.fill_price));
        var currencyuserbalance = parseFloat(currencyuserbalance.toFixed(6))
        var currencyuserplacedbalance = currencyWalletUser.placed_balance - ((request.quantity * request.fill_price));
        var currencyuserplacedbalance = parseFloat(currencyuserplacedbalance.toFixed(6))
        var b = await Wallet
          .update({
            id: currencyWalletUser.id
          })
          .set({
            balance: currencyuserbalance,
            placed_balance: currencyuserplacedbalance
          })
          .fetch();

        var currencyrequestedbalance = currencyWalletRequested.balance + ((request.quantity * request.fill_price) - (request.quantity * request.fill_price * (inputs.makerFee / 100)));
        var currencyrequestedbalance = parseFloat(currencyrequestedbalance.toFixed(6));
        var currencyrequestedplacedbalance = currencyWalletRequested.placed_balance + ((request.quantity * request.fill_price) - (request.quantity * request.fill_price * (inputs.makerFee / 100)));
        var currencyrequestedplacedbalance = parseFloat(currencyrequestedplacedbalance.toFixed(6));

        var b = await Wallet
          .update({
            id: currencyWalletRequested.id
          })
          .set({
            balance: currencyrequestedbalance,
            placed_balance: currencyrequestedplacedbalance
          })
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
          .update({
            id: cryptoWalletUser.id
          })
          .set({
            balance: cryptouserbalance,
            placed_balance: cryptouserPlacedbalance
          });

        var cryptorequestedbalance = cryptoWalletRequested.balance + (request.quantity - (request.quantity * (inputs.makerFee / 100)));
        var cryptorequestedbalance = parseFloat(cryptorequestedbalance.toFixed(6))
        var cryptorequestedplacedbalance = cryptoWalletRequested.placed_balance + (request.quantity - (request.quantity * (inputs.makerFee / 100)));
        var cryptorequestedplacedbalance = parseFloat(cryptorequestedplacedbalance.toFixed(6))

        var a = await Wallet
          .update({
            id: cryptoWalletRequested.id
          })
          .set({
            balance: cryptorequestedbalance,
            placed_balance: cryptorequestedplacedbalance
          })
          .fetch();

        // -------------------------- currency ---------------------------- //

        var currencyuserbalance = currencyWalletUser.balance + (request.quantity * request.fill_price - (request.quantity * request.fill_price * (inputs.takerFee / 100)));
        var currencyuserbalance = parseFloat(currencyuserbalance.toFixed(6))
        var currencyuserplacedbalance = currencyWalletUser.placed_balance + (request.quantity * request.fill_price - (request.quantity * request.fill_price * (inputs.takerFee / 100)));
        var currencyuserplacedbalance = parseFloat(currencyuserplacedbalance.toFixed(6))

        var b = await Wallet
          .update({
            id: currencyWalletUser.id
          })
          .set({
            balance: currencyuserbalance,
            placed_balance: currencyuserplacedbalance
          });

        var currencyrequestedbalance = currencyWalletRequested.balance - ((request.quantity * request.fill_price));
        var currencyrequestedbalance = parseFloat(currencyrequestedbalance.toFixed(6))
        var b = await Wallet
          .update({
            id: currencyWalletRequested.id
          })
          .set({
            balance: currencyrequestedbalance
          })
          .fetch();

        var requestedFee = request.quantity * (inputs.makerFee / 100);
        var userFee = (request.quantity * request.fill_price * (inputs.takerFee / 100));
        user_usd = (request.quantity * request.fill_price) * (resultData);
      }

      return exits.success({
        'userFee': userFee,
        'requestedFee': requestedFee
      })
    } catch (err) {
      console.log("fees Error", err);

      return exits.serverError();
    }
  }

};
