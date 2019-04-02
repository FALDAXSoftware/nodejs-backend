var KrakenClient = require('kraken-api');
module.exports = {

  friendlyName: 'Get withdrawl info',

  description: '',

  inputs: {
    asset: {
      type: 'string',
      example: 'BTC',
      description: 'Asset being deposited.',
      required: true
    },
    amount: {
      type: 'number',
      example: 1,
      description: 'Amount of coin which need to be withdraw.',
      required: true
    }
  },

  exits: {

    success: {
      outputFriendlyName: 'Withdrawl info'
    }
  },

  fn: async function (inputs, exits) {

    var status;
    var key = sails.config.local.KRAKEN_API_KEY;
    var secret = sails.config.local.KRAKEN_API_SIGN;
    var key_name = sails.config.local.KEY_NAME;
    var kraken = new KrakenClient(key, secret);
    console.log("Kraken :::: ", kraken);
    const methods = {
      public: [
        'Time',
        'Assets',
        'AssetPairs',
        'Ticker',
        'Depth',
        'Trades',
        'Spread',
        'OHLC'
      ],
      private: [
        'Balance',
        'TradeBalance',
        'OpenOrders',
        'ClosedOrders',
        'QueryOrders',
        'TradesHistory',
        'QueryTrades',
        'OpenPositions',
        'Ledgers',
        'QueryLedgers',
        'TradeVolume',
        'AddOrder',
        'CancelOrder',
        'DepositMethods',
        'DepositAddresses',
        'DepositStatus',
        'WithdrawInfo',
        'Withdraw',
        'WithdrawStatus',
        'WithdrawCancel'
      ]
    };

    const defaults = {
      url: 'https://api.kraken.com',
      version: 0,
      timeout: 5000
    };
    try {
      status = await kraken.api('WithdrawInfo', {
        asset: inputs.asset,
        key: key_name,
        amount: inputs.amount,
        new: true,
        validate: true
      });
      console.log(status);
      return exits.success(status);
    } catch (err) {
      console.log(err);
      return exits.success(err);
    }

  }

};
