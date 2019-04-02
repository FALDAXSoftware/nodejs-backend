var KrakenClient = require('kraken-api');
module.exports = {

  friendlyName: 'Get withdrawl cancel',

  description: '',

  inputs: {
    asset: {
      type: 'string',
      example: 'BTC',
      description: 'Asset being deposited.',
      required: true
    },
    refid: {
      type: 'string',
      example: '123vfg',
      description: 'Referrence Id for which withdrawl needs to be cancel.',
      required: true
    }
  },

  exits: {

    success: {
      outputFriendlyName: 'Withdrawl cancel'
    }
  },

  fn: async function (inputs, exits) {

    var status;
    var key = sails.config.local.KRAKEN_API_KEY;
    var secret = sails.config.local.KRAKEN_API_SIGN;
    var key = sails.config.local.KEY_NAME;
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

    try {
      status = await kraken.api('WithdrawCancel', {
        asset: inputs.asset,
        refid: inputs.refid
      });
      return exits.success(status);
    } catch (err) {
      console.log(err);
      return exits.success(err);
    }

  }

};
