var fetch = require('node-fetch')
var request = require('request');

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

    const key = 'YL4+gCHMerqCbiTHlKO6N3l8qaNib9JHvXPJhN+Fa3dZK1F4KUNFhxjw'; //API Key
    const secret = 'xfAlQbL6KvD3pWGqJ7uXzHSLykmn19bXoV5Oic5+QNCqx4/5ipth8uBCAMPtJUSmkF9iDf4gqMJee Hy' +
        'NjMl4LQ == '; // API Private Key
    var kraken = new KrakenClient(key, secret);
    console.log(kraken);
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
      var data = await kraken.api('AddOrder', {
        pair: 'XRPXBT',
        type: 'buy',
        ordertype: 'market',
        volume: '40',
        validate:true
      })
      console.log(data);
      return exits.success(data);
    } catch (err) {
      console.log(err);
    }
    // url = "http://dev-monero-currency.faldax.com/json_rpc" headers = {
    // 'content-type': 'application/json' } rpc_input = {   "method":
    // "create_wallet",   "params": {     "filename": "monero-wallet-rpc",
    // "password": "Admin@123$",     "language": "English"   },   "jsonrpc": "2.0",
    // "id": "0",   "rpc_username": "monerorpc",   "rpc_password": "secret" } //
    // rpc_input.update({"jsonrpc": "2.0", "id": "0"})response = request.post(url,
    // data = JSON.stringify(rpc_input), headers = headers)print(response.text)
    // options = {   uri: 'http://dev-monero-currency.faldax.com/json_rpc/',   json:
    // true,   headers: {     "Authorization": "Basic bW9uZXJvcnBjOnNlY3JldA==",
    // "Content-Type": "application/json"   },   method: 'POST',   method:
    // "create_wallet",   params: {     "filename": "monero-wallet-rpc", "password":
    // "Admin@123$",     "language": "English"   },   jsonrpc: "2.0", id: "0" };
    // console.log(options); request(options, function (err, resp, body) {
    // console.log(err, resp, body); });
  }
};
