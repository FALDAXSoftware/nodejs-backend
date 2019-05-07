var KrakenClient = require('kraken-api');
module.exports = {

  friendlyName: 'Recent withdrawl status',

  description: '',

  inputs: {
    asset: {
      type: 'string',
      example: 'BTC',
      description: 'Asset being deposited.',
      required: true
    }
  },

  exits: {

    success: {
      description: 'All done.'
    }
  },

  fn: async function (inputs, exits) {
    var status;
    var key = sails.config.local.KRAKEN_API_KEY;
    var secret = sails.config.local.KRAKEN_API_SIGN;
    var kraken = new KrakenClient(key, secret);
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
      status = await kraken.api('WithdrawStatus', {asset: inputs.asset});
      return exits.success(status);
    } catch (err) {
      console.log(err);
      return exits.success(err);
    }
  }

};
