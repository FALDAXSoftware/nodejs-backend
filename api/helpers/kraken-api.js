var fetch = require('node-fetch')
// var Kraken = require("kraken");
var KrakenClient = require('kraken-api');
// var Kraken = require('kraken-exchange');
module.exports = {

  friendlyName: 'Get new address',

  description: '',

  inputs: {
    address: {
      type: 'string',
      example: 'abcd',
      description: 'coin code of coin',
      required: true
    }
  },

  exits: {

    success: {
      outputFriendlyName: 'New address'
    }
  },

  fn: async function (inputs, exits) {

    const key = 'YL4+gCHMerqCbiTHlKO6N3l8qaNib9JHvXPJhN+Fa3dZK1F4KUNFhxjw'; // API Key
    const secret = '8F16MdjpzhbrAzyfNQ7TeyG1feopxZ1ngeZnsxVVFd4MnjGwLgPJvv5xT0fRpCj3B7a/QXEMN2U3F4Ih' +
        'LwphgA==4lSiCw=='; // API Private Key

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

    var data = await kraken.api('OpenOrders')
    console.log(data);
    return exits.success(data);
  }
};
