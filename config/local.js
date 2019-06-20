const dotenv = require('dotenv');
dotenv.config();
module.exports.local = {
  'test_key': 'nikita',
  'CURRENCY_LIST': process.env.CURRENCY,
  'DEFAULT_SENDING_EMAIL': process.env.DEFAULT_SENDING_EMAIL,
  'EMAIL_USER': process.env.EMAIL_USER,
  'EMAIL_HOST': process.env.EMAIL_HOST,
  'EMAIL_PORT': process.env.EMAIL_PORT,
  'EMAIL_PASSWORD': process.env.EMAIL_PASSWORD,
  'BITGO_ACCESS_TOKEN': process.env.BITGO_ACCESS_TOKEN,
  'BITGO_ACCESS_TOKEN_ADMIN': process.env.BITGO_ACCESS_TOKEN_ADMIN,
  'BITGO_ENV_MODE': process.env.BITGO_ENV_MODE,
  'chain': process.env.CHAIN,
  'BITGO_PASSPHRASE': process.env.BITGO_PASSPHRASE,
  "BITGO_ENTERPRISE": process.env.BITGO_ENTERPRISE,
  "BITGO_PROXY_URL": process.env.BITGO_PROXY_URL,
  "TEST": process.env.TESTDEMO,
  "CRON_STATUS": process.env.CRON_STATUS,
  "KRAKEN_API_KEY": process.env.API_KEY,
  "KRAKEN_API_SIGN": process.env.API_SIGN,
  "KEY_NAME": process.env.KEY_NAME,
  "COIN_MARKET_CAP_API": process.env.MARKETPRICE,
  "GOOGLE_SECRET_KEY": process.env.GOOGLE_SECRET_KEY,
  "COIN_CODE_FOR_ERC_20_WALLET_BITGO": "teth",
  "JWT_TOKEN_SECRET": process.env.JWT_TOKEN_SECRET,
  "WEBHOOK_BASE_URL": process.env.WEBHOOK_BASE_URL,
  "IDM_URL": process.env.IDM_URL,
  "IDM_TOKEN": process.env.IDM_TOKEN,
  "AWS_S3_URL": "https://s3.us-east-2.amazonaws.com/production-static-asset/",
  "COIN_TYPE_BITGO": 1,
  "coinArray": {
    'STRAT': {
      'coin_name': 'stratis',
      'rpcuser': 'stratisrpc',
      'rpcpassword': 'JBnWFtwqbwwZXCFyBuHXHsUsMfyU1GhwKYroYy6bzjXv',
      'url': 'http://dev-stratis-currency.faldax.com/',
      'type': 1
    },
    'peercoin': {
      'coin_name': 'peercoin',
      'rpcuser': 'peercoin',
      'rpcpassword': 'secret',
      'url': 'http://dev-peercoin-currency.faldax.com/',
      'type': 1
    },
    'RADS': {
      'coin_name': 'radium',
      'rpcuser': 'radiumrpc',
      'rpcpassword': 'secret',
      'url': 'http://dev-radium-currency.faldax.com',
      'type': 1
    },
    'DGB': {
      'coin_name': 'digibyte',
      'rpcuser': 'digibyterpc',
      'rpcpassword': 'secret',
      'url': 'http://dev-digibyte-currency.faldax.com',
      'type': 1
    },
    'XPM': {
      'coin_name': 'primecoin',
      'rpcuser': 'primecoinrpc',
      'rpcpassword': '2aVqjhV2qcdBM4TU2Ncy5Xkh3ZH1pTvq9mZhoUcwgrhn',
      'url': 'http://dev-primecoin-currency.faldax.com/',
      'type': 1
    },
    'VIA': {
      'coin_name': 'viacoin',
      'rpcuser': 'kishan1',
      'rpcpassword': 'admin1',
      'url': 'http://dev-viacoin-currency.faldax.com/',
      'type': 1
    },
    'VTC': {
      'coin_name': 'vertcoin',
      'rpcuser': 'kiddsddhan',
      'rpcpassword': 'kisha34nff',
      'url': 'http://dev-vertcoin-currency.faldax.com/',
      'type': 1
    },
    'VRC': {
      'coin_name': 'vericoin',
      'rpcuser': 'vericoinrpc',
      'rpcpassword': 'secret',
      'url': 'http://dev-vericoin-currency.faldax.com/',
      'type': 1
    },
    'XBC': {
      'coin_name': 'bitcoin-plus',
      'rpcuser': 'bitcoinplusrpc',
      'rpcpassword': 'secret',
      'url': 'http://dev-bitcoinplus-currency.faldax.com/',
      'type': 1
    },
    'FLO': {
      'coin_name': 'florincoin',
      'rpcuser': 'florincoinrpc',
      'rpcpassword': 'secret',
      'url': 'http://dev-florin-currency.faldax.com/',
      'type': 1
    },
    'SYS': {
      'coin_name': 'syscoin',
      'rpcuser': 'user',
      'rpcpassword': 'password',
      'url': 'http://dev-syscoin-currency.faldax.com/',
      'type': 1
    },
    //Requires to be done but address is being created
    'QTUM': {
      'coin_name': 'qtum',
      'rpcuser': 'qtumrpc',
      'rpcpassword': 'secret',
      'url': 'http://dev-qtum-currency.faldax.com/',
      'type': 1
    },
    'NAV': {
      'coin_name': 'navcoin',
      'rpcuser': 'navcoinrpc',
      'rpcpassword': 'secret',
      'url': 'http://dev-navcoin-currency.faldax.com/',
      'type': 1
    },
    'DOGE': {
      'coin_name': 'dogecoin',
      'rpcuser': 'dogecoinrpc',
      'rpcpassword': '2PfZxVnJZVATg9JWpcsE3hxP8jpRWnMA8KhgJRK4NdCe',
      'url': 'http://dev-dogecoin-currency.faldax.com/',
      'type': 1
    },
    'BLK': {
      'coin_name': 'blackcoin',
      'rpcuser': 'blackcoinrpc',
      'rpcpassword': 'secret',
      'url': 'dev-blackcoin-currency.faldax.com',
      'type': 2
    },
    'CLAM': {
      'coin_name': 'clamcoin',
      'rpcuser': 'clamrpc',
      'rpcpassword': 'secret',
      'url': 'dev-clam-currency.faldax.com',
      'type': 2
    },
    'NEO': {
      'coin_name': 'neo',
      'url': 'http://dev-neo-currency.faldax.com',
      'type': 3
    },
    'ETC': {
      'coin_name': 'ethereum classic',
      'url': 'https://ethereumclassic.network',
      'type': 4
    },
    'MIOTA': {
      'coin_name': 'iota',
      'url': 'http://dev-iota-currency.faldax.com',
      'type': 5
    },
    'LBC': {
      'coin_name': 'lbry credits',
      'url': 'http://dev-lbry-currency.faldax.com/',
      'type': 6
    },
    'USDT': {
      'coin_name': 'Tether',
      'rpcuser': 'omnirpc',
      'rpcpassword': 'secret',
      'url': 'http://dev-tether-currency.faldax.com/',
      'type': 7
    }
  },
  hubspot: {
    url: "https://api.hubapi.com",
    apiKey: "e2032f87-8de8-4e18-8f16-f4210e714245",
    endpoints: {
      contact: {
        create: "/contacts/v1/contact/",
        getByEmail: "/contacts/v1/contact/email/:email/profile",
        update: "/contacts/v1/contact/vid/:vid/profile"
      },
      ticket: {
        getUsersTicket: "/crm-associations/v1/associations/:objectId/HUBSPOT_DEFINED/15",
        getTicketsById: "/crm-objects/v1/objects/tickets/batch-read"
      }
    }
  }
}