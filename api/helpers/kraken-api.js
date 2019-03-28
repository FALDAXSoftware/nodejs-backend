var fetch = require('node-fetch')
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
    const KrakenClient = require('kraken-api');
    const kraken = new KrakenClient(key, secret);

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

    // const defaults = {   url: 'https://api.kraken.com/0/private',   version: 0,
    // timeout: 5000,   wait: true }; console.log('>>>>>>>>>>>>>>>>>>', await
    // kraken.api('Balance')); console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>", await
    // kraken.api('Ticker', { pair: 'XXBTZUSD' }));
    var data = await kraken.api('DepositAddresses', {
      asset: 'XBT',
      method: 'Bitcoin',
      // ordertype: 'market', volume: 0.1,
      nonce: 0,
      wait: true
    });
    console.log(data);
    // var data = await kraken.api('DepositMethods', {asset: 'XBT'}) await
    // fetch('https://api.kraken.com/0/private/AddOrder', {   method: "POST", body:
    // {     "pair": "XXBTZUSD",     "type": "buy",     "ordertype": "market",
    // "volume": 1,     "nonce": 0   },     headers: {       'API-Key':
    // 'rEnog9yX4OCr0oGs6aPy2MUtT9yHushTSzGh6aWovyPwhlw0z858DXot',       'API-Sign':
    // '8F16MdjpzhbrAzyfNQ7TeyG1feopxZ1ngeZnsxVVFd4MnjGwLgPJvv5xT0fRpCj3B7a/QXEMN2U3
    // F4Ih' +           'LwphgA==',       'Content-Type': 'application/json'     }
    // })   .then(resData => resData.json())   .then(resData => { console.log("HERE
    // ::: ");     risingFallingData = resData; console.log(risingFallingData); //
    // return exits.success(risingFallingData);   });
    // console.log(JSON.stringify(data)); return exits.success(data);
  }

};
