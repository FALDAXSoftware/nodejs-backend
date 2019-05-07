var KrakenClient = require('kraken-api');
module.exports = {

  friendlyName: 'Add standard order',

  description: '',

  inputs: {
    pair: {
      type: 'string',
      example: 'BTC-ETH',
      description: 'Pair of trading.',
      required: true
    },
    type: {
      type: 'string',
      example: 'buy',
      description: 'Side for which is it need to be paired.',
      required: true
    },
    ordertype: {
      type: 'string',
      example: 'market',
      description: 'Order Type',
      required: true
    },
    volume: {
      type: 'number',
      example: 1,
      description: 'Amount of quantity need to done',
      required: true
    }
  },

  exits: {

    success: {
      description: 'All done.'
    },
    orderError: {
      description: "Order Execution Failed"
    }
  },

  fn: async function (inputs, exits) {
    // TODO
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
      console.log("-------------", inputs.pair);

      status = await kraken.api('AddOrder', {
        pair: inputs.pair,
        type: inputs.type,
        ordertype: inputs.ordertype,
        volume: inputs.volume,
        validate: true
      });



      return exits.success(status);
    } catch (err) {
      return exits.orderError();
    }
  }

};
