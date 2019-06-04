var KrakenClient = require('kraken-api');
module.exports = {

  friendlyName: 'Query trade info',

  description: '',

  inputs: {
    txid: {
      type: 'string',
      example: '2s514d54d1s5d4s',
      description: 'Transaction ID of Trade.',
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
    var key_name = sails.config.local.KEY_NAME;
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
      // status = await kraken.api('QueryTrades', { txid: inputs.txid });
      status = { "error": [], "result": { "O3JQ5B-NWDT7-BIJX5O": { "ordertxid": "O25XKV-LOB2R-4IHRRL", "postxid": "TKH2SE-M7IF5-CFI7LT", "posstatus": "open", "pair": "XXBTZUSD", "time": 1556004008.5228, "type": "buy", "ordertype": "market", "price": "5530.00000", "cost": "11.06000", "fee": "0.02986", "vol": "0.00200000", "margin": "2.21200", "misc": "" } } }
      return exits.success(status);
    } catch (err) {
      console.log(err);
      return exits.success(err);
    }

  }

};
