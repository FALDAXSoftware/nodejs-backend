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

    userWalletCryptoBalance = await Wallet.find({
      where: {
        coin_id: cryptoId.id,
        deleted_at: null,
        is_active: true,
        user_id: inputs.user_id
      }
    });

    var sellBookValue,
      buyBookValue;
    let fees = await sails
      .helpers
      .utilities
      .getMakerTakerFees(inputs.crypto, inputs.currency);

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
    var buyEstimatedFee = sellBookValue - (sellBookValue * (fees.takerFee / 100));
    var sellEstimatedFee = buyBookValue - (buyBookValue * (fees.takerFee / 100));

    var buyPay = sellBookValue;
    var sellPay = buyBookValue;

    userWalletBalance = {
      'currency': userWalletCurrencyBalance,
      'crypto': userWalletCryptoBalance,
      'buyEstimatedPrice': buyEstimatedFee,
      'sellEstimatedPrice': sellEstimatedFee,
      'buyPay': buyPay,
      'sellPay': sellPay,
      'fees': fees.takerFee
    };

    // Send back the result through the success exit.
    return exits.success(userWalletBalance);

  }

};
