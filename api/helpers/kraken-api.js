var fetch = require('node-fetch')
// var Kraken = require("kraken");
var Kraken = require('kraken-exchange');
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

    const key = 'rEnog9yX4OCr0oGs6aPy2MUtT9yHushTSzGh6aWovyPwhlw0z858DXot'; // API Key
    const secret = '8F16MdjpzhbrAzyfNQ7TeyG1feopxZ1ngeZnsxVVFd4MnjGwLgPJvv5xT0fRpCj3B7a/QXEMN2U3F4Ih' +
        'LwphgA==4lSiCw=='; // API Private Key

    const kraken = new Kraken(key, secret);

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

    // kraken.depositAddresses('XBT', 'Bitocin' [, newAddress])

    var method;

    await kraken
      .depositMethods('XBT')
      .then(response => {
        method = response;
      })

    console.log(method[0].method);

    kraken
      .depositAddress('XBT', method[0].method)
      .then(response => console.log("Reponse :: ", response))
      .catch(err => console.error("Error :: ", err));

    // var data = await kraken.api('DepositAddresses', {   asset: 'XBT',   method:
    // 'Bitcoin',   nonce: 0,   wait: true,   dev: true,   validate: true })
    // console.log(JSON.stringify(data)); return exits.success(data);
  }
};
