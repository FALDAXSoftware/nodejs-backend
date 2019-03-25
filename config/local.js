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
  "KRAKEN_API_KEY": process.env.API_KEY,
  "KRAKEN_API_SIGN":process.env.API_SIGN,
  "KEY_NAME":process.env.KEY_NAME,
  "COIN_MARKET_CAP_API": process.env.MARKETPRICE,
  "coinArray": {
    'STRAT': {
      'coin_name': 'stratis',
      'rpcuser': 'stratisrpc',
      'rpcpassword': 'JBnWFtwqbwwZXCFyBuHXHsUsMfyU1GhwKYroYy6bzjXv',
      'url': 'http://dev-stratis-currency.faldax.com/'
    },
    'peercoin': {
      'coin_name': 'peercoin',
      'rpcuser': 'peercoin',
      'rpcpassword': 'secret',
      'url': 'http://dev-peercoin-currency.faldax.com/'
    },
    'RADS': {
      'coin_name': 'radium',
      'rpcuser': 'radiumrpc',
      'rpcpassword': 'secret',
      'url': 'http://dev-radium-currency.faldax.com'
    },
    'DGB': {
      'coin_name': 'digibyte',
      'rpcuser': 'digibyterpc',
      'rpcpassword': 'secret',
      'url': 'http://dev-digibyte-currency.faldax.com'
    },
    'XPM': {
      'coin_name': 'primecoin',
      'rpcuser': 'primecoinrpc',
      'rpcpassword': '2aVqjhV2qcdBM4TU2Ncy5Xkh3ZH1pTvq9mZhoUcwgrhn',
      'url': 'http://dev-primecoin-currency.faldax.com/'
    }

  }
}