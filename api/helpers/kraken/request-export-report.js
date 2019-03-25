var KrakenClient = require('kraken-api');
module.exports = {

  friendlyName: 'Request export report',

  description: '',

  inputs: {
    description: {
      type: 'string',
      example: 'Export Report',
      description: 'Description for exporting report',
      required: true
    },
    report: {
      type: 'string',
      example: 'trades',
      description: 'Type of report',
      required: true
    },
    format: {
      type: 'string',
      example: 'CSV',
      description: 'Type of report',
      required: false
    }
  },

  exits: {

    success: {
      description: 'All done.'
    }
  },

  fn: async function (inputs, exits) {
    var status,
      format;
    if (inputs.format == undefined || inputs.format == '' || inputs.format == null) {
      format = 'CSV'
    } else {
      format = inputs.format;
    }
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
      status = await kraken.api('AddExport', {
        description: inputs.description,
        report: inputs.report,
        format: format
      })

      return exits.success(status)
    } catch (err) {
      console.log(err);
    }
  }

};
