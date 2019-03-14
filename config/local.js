const dotenv = require('dotenv');
dotenv.config();
module.exports.local = {
  'BITGO_ACCESS_TOKEN': process.env.BITGO_ACCESS_TOKEN,
  'BITGO_ENV_MODE': process.env.BITGO_ENV_MODE,
  'chain': process.env.CHAIN,
  'BITGO_PASSPHRASE': process.env.BITGO_PASSPHRASE,
  "BITGO_ENTERPRISE": process.env.BITGO_ENTERPRISE,
  "TEST": process.env.TESTDEMO,
  "CRON_STATUS": process.env.CRON_STATUS,
  "COIN_MARKET_CAP_API": process.env.MARKETPRICE,
  "coinArray": {
    'STRAT': {
      'coin_name': 'stratis',
      'rpcuser': 'stratisrpc',
      'rpcpassword': 'JBnWFtwqbwwZXCFyBuHXHsUsMfyU1GhwKYroYy6bzjXv',
      'url': 'http://dev-stratis-currency.faldax.com/'
    }

  }
}