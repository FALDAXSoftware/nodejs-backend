// const key = 'm0suGU/Fq5W4CE7SlDevBZgaFD4ttfPm5A2DTZRsyxDOoAyoriumd3Wx'; // API Key
// const secret = 'UrDm1iGcMS9fSkZjvJUy1u5ni0FgHWfj8ivqA4JdpMungTIoO91k1DEZP0LlxjcRHZaUZrTBksxS6IDK4lSiCw=='; // API Private Key
// const KrakenClient = require('kraken-api');
// const kraken = new KrakenClient(key, secret);

// console.log("Kraken :::: ", kraken);

// const methods = {
//     public: ['Time', 'Assets', 'AssetPairs', 'Ticker', 'Depth', 'Trades', 'Spread', 'OHLC'],
//     private: ['Balance', 'TradeBalance', 'OpenOrders', 'ClosedOrders', 'QueryOrders', 'TradesHistory', 'QueryTrades', 'OpenPositions', 'Ledgers', 'QueryLedgers', 'TradeVolume', 'AddOrder', 'CancelOrder', 'DepositMethods', 'DepositAddresses', 'DepositStatus', 'WithdrawInfo', 'Withdraw', 'WithdrawStatus', 'WithdrawCancel'],
// };

// const defaults = {
//     url: 'https://api.kraken.com',
//     version: 0,
//     timeout: 5000,
// };

// async function getBlanace() {
//     console.log('>>>>>>>>>>>>>>>>>>', await kraken.api('Balance'));
// }

// // (async () => {
// //     // Display user's balance
// //     console.log('>>>>>>>>>>>>>>>>>>', await kraken.api('Balance'));

// //     // Get Ticker Info
// //     console.log(await kraken.api('Ticker', { pair: 'XXBTZUSD' }));
// // })();

// var fetch = require('node-fetch')
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

        const key = 'm0suGU/Fq5W4CE7SlDevBZgaFD4ttfPm5A2DTZRsyxDOoAyoriumd3Wx'; // API Key
        const secret = 'UrDm1iGcMS9fSkZjvJUy1u5ni0FgHWfj8ivqA4JdpMungTIoO91k1DEZP0LlxjcRHZaUZrTBksxS6IDK4lSiCw=='; // API Private Key
        const KrakenClient = require('kraken-api');
        const kraken = new KrakenClient(key, secret);

        console.log("Kraken :::: ", kraken);

        const methods = {
            public: ['Time', 'Assets', 'AssetPairs', 'Ticker', 'Depth', 'Trades', 'Spread', 'OHLC'],
            private: ['Balance', 'TradeBalance', 'OpenOrders', 'ClosedOrders', 'QueryOrders', 'TradesHistory', 'QueryTrades', 'OpenPositions', 'Ledgers', 'QueryLedgers', 'TradeVolume', 'AddOrder', 'CancelOrder', 'DepositMethods', 'DepositAddresses', 'DepositStatus', 'WithdrawInfo', 'Withdraw', 'WithdrawStatus', 'WithdrawCancel'],
        };

        const defaults = {
            url: 'https://api.kraken.com',
            version: 0,
            timeout: 5000,
        };

        // console.log('>>>>>>>>>>>>>>>>>>', await kraken.api('Balance'));

        // console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>", await kraken.api('Ticker', { pair: 'XXBTZUSD' }));
        //var data = await kraken.api('AddOrder', { pair: 'XXBTZUSD', type: 'buy', ordertype: 'market', volume: 1 })
        var data = await kraken.api('ExportStatus', { report: 'trades' })
        console.log(JSON.stringify(data));
        return exits.success(data);
    }

};
