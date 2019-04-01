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

      var methodData = await Coins.findOne({
        where: {
          kraken_coin_name: inputs.asset,
          is_active: true,
          deleted_at: null
        }
      });

      status = await kraken.api('DepositAddresses', {
        asset: inputs.asset,
        method: methodData.deposit_method,
        new: true
      });
      return exits.success(status);
    } catch (err) {
      console.log(err);
      return exits.success(err);
    }
  }

};
