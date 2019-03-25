var KrakenClient = require('kraken-api');
module.exports = {

  friendlyName: 'Get deposit address',

  description: '',

  inputs: {
    asset: {
      type: 'string',
      example: 'BTC',
      description: 'Asset being deposited.',
      required: true
    },
    method: {
      type: 'string',
      example: 'Bitcoin',
      description: 'Method for which address in needed.',
      required: true
    }
  },

  exits: {

    success: {
      outputFriendlyName: 'Deposit address'
    }
  },

  fn: async function (inputs, exits) {
    var status;
    var key = sails.config.local.KRAKEN_API_KEY;
    var secret = sails.config.local.KRAKEN_API_SIGN;
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
      status = await kraken.api('DepositAddresses', {
        asset: inputs.asset,
        method: inputs.method
      });
      return exits.success(status);
    } catch (err) {
      console.log(err);
    }
  }

};
