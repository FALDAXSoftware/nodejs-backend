var KrakenClient = require('kraken-api');
module.exports = {

  friendlyName: 'Get order book',

  description: '',

  inputs: {},

  exits: {

    success: {
      outputFriendlyName: 'Order book'
    }
  },

  fn: async function (inputs, exits) {

    // Get order book.
    var orderBook = [];
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

    try {
      var pair_name = await Pairs.find({
        where: {
          kraken_pair: {
            '!=': null
          },
          deleted_at: null,
          is_active: true
        }
      })
      for (let i = 0; i < pair_name.length; i++) {
        status = await kraken.api('Depth', {
          pair: pair_name[i].kraken_pair
        });
        var value = pair_name[i].symbol;
        var askValue = JSON.stringify(status.result[value].asks[0]);
        var bidValue = JSON.stringify(status.result[value].bids[0])
        askValue = JSON.parse(askValue);
        bidValue = JSON.parse(bidValue);

        var updatedData = await Pairs
          .update({
            kraken_pair: pair_name[i].kraken_pair,
            symbol: pair_name[i].symbol
          })
          .set({
            ask_price: askValue[0],
            bid_price: bidValue[0]
          })
          .fetch();
      }
      return exits.success(1);
    } catch (err) {
      console.log(err);
      return exits.success(err);
    }

  }

};
