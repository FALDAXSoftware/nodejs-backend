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
    const secret = 'xfAlQbL6KvD3pWGqJ7uXzHSLykmn19bXoV5Oic5+QNCqx4/5ipth8uBCAMPtJUSmkF9iDf4gqMJeeHyN' +
        'jMl4LQ=='; // API Private Key

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

    var data = await kraken.api('TradesHistory')
    console.log(data);
    return exits.success(data);
  }
};
