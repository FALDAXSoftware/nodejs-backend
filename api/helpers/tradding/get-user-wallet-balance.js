var moment = require('moment');

module.exports = {

  friendlyName: 'Get user wallet balance',

  description: '',

  inputs: {
    user_id: {
      type: 'number',
      example: 1,
      description: 'Id of user',
      required: true
    },
    currency: {
      type: 'string',
      example: 'BTC',
      description: 'Coin for which balance need to be obtained',
      required: true
    },
    crypto: {
      type: 'string',
      example: 'XRP',
      description: 'Coin for which balance need to be obtained',
      required: true
    }
  },

  exits: {

    success: {
      outputFriendlyName: 'User wallet balance'
    }
  },

  fn: async function (inputs, exits) {

    // Get user wallet balance.
    var userWalletBalance;
    // TODO

    var coinId = await Coins.findOne({
      where: {
        is_active: true,
        deleted_at: null,
        coin: inputs.currency
      }
    })

    var cryptoId = await Coins.findOne({
      where: {
        is_active: true,
        deleted_at: null,
        coin: inputs.crypto
      }
    })

    userWalletCurrencyBalance = await Wallet.find({
      where: {
        coin_id: coinId.id,
        deleted_at: null,
        is_active: true,
        user_id: inputs.user_id
      }
    });

    var currencyMessage = '';
    if (userWalletCurrencyBalance.length == 0) {
      currencyMessage = "Please create wallet for " + inputs.currency;
    }

    userWalletCryptoBalance = await Wallet.find({
      where: {
        coin_id: cryptoId.id,
        deleted_at: null,
        is_active: true,
        user_id: inputs.user_id
      }
    });

    var cryptoMessage = '';
    if (userWalletCryptoBalance.length == 0) {
      cryptoMessage = "Please create the wallet for " + inputs.crypto;
    }

    var sellBookValue,
      buyBookValue;

    var user_id = parseInt(inputs.user_id);

    // Fetching cryptocurrency data value
    var cryptoData = await Coins.findOne({
      deleted_at: null,
      is_active: true,
      coin: inputs.crypto
    });

    var now = moment().format();
    var yesterday = moment(now)
      .subtract(1, 'months')
      .format();

    //Maker and Taker fee according to trades executed by user

    var getCryptoPriceData = await CurrencyConversion.findOne({
      coin_id: cryptoData.id,
      deleted_at: null
    });

    // Fetching Amount of trade done on the basis of time and usd value
    var currencyAmount = await TradeHistory
      .sum('quantity')
      .where({
        or: [{
          user_id: user_id
        }, {
          requested_user_id: user_id
        }],
        deleted_at: null,
        created_at: {
          ">=": yesterday
        },
        created_at: {
          "<=": now
        }
      });

    var totalCryptoAmount = currencyAmount * (getCryptoPriceData.quote.USD.price);

    // Fetching the fees on the basis of the total trade done in last 30 days
    var cryptoTakerFee = await Fees.findOne({
      select: [
        'maker_fee', 'taker_fee'
      ],
      where: {
        deleted_at: null,
        min_trade_volume: {
          '<=': parseFloat(totalCryptoAmount)
        },
        max_trade_volume: {
          '>=': parseFloat(totalCryptoAmount)
        }
      }
    });

    let sellBook = await sails
      .helpers
      .tradding
      .sell
      .getSellBookOrders(inputs.crypto, inputs.currency);

    let buyBook = await sails
      .helpers
      .tradding
      .buy
      .getBuyBookOrders(inputs.crypto, inputs.currency);

    if (sellBook.length == 0) {
      sellBookValue = 0;
    } else {
      sellBookValue = sellBook[0].price;
    }
    if (buyBook.length == 0) {
      buyBookValue = 0;
    } else {
      buyBookValue = buyBook[0].price;
    }
    var buyEstimatedFee = sellBookValue - (sellBookValue * (cryptoTakerFee.taker_fee / 100));
    var sellEstimatedFee = buyBookValue - (buyBookValue * (cryptoTakerFee.taker_fee / 100));

    var buyPay = sellBookValue;
    var sellPay = buyBookValue;

    userWalletBalance = {
      'currency': userWalletCurrencyBalance,
      'currency_msg': currencyMessage,
      'crypto': userWalletCryptoBalance,
      'crypto_msg': cryptoMessage,
      'buyEstimatedPrice': buyEstimatedFee,
      'sellEstimatedPrice': sellEstimatedFee,
      'buyPay': buyPay,
      'sellPay': sellPay,
      'fees': cryptoTakerFee.taker_fee
    };

    // Send back the result through the success exit.
    return exits.success(userWalletBalance);

  }

};
