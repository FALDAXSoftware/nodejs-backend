var KrakenClient = require('kraken-api');
module.exports = {

  friendlyName: 'Get export status',

  description: '',

  inputs: {
    report: {
      type: 'string',
      example: 'trades',
      description: 'Type of report',
      required: true
    }
  },

  exits: {

    success: {
      outputFriendlyName: 'Export status'
    }
  },

  fn: async function (inputs) {

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
      status = await kraken.api('ExportStatus', {report: inputs.report});
      return exits.success(status)
    } catch (err) {
      console.log(err);
      return exits.success(err);
    }
  }

};
