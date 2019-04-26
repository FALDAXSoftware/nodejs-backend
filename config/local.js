const dotenv = require('dotenv');
dotenv.config();
module.exports.local = {
  'test_key': 'nikita',
  'BITGO_ACCESS_TOKEN': process.env.BITGO_ACCESS_TOKEN,
  'BITGO_ENV_MODE': process.env.BITGO_ENV_MODE,
  'chain': process.env.CHAIN,
  'BITGO_PASSPHRASE': process.env.BITGO_PASSPHRASE,
  "BITGO_ENTERPRISE": process.env.BITGO_ENTERPRISE,
  "TEST": process.env.TESTDEMO,
  "CRON_STATUS": process.env.CRON_STATUS,
  "KRAKEN_API_KEY": process.env.API_KEY,
  "KRAKEN_API_SIGN": process.env.API_SIGN,
  "KEY_NAME": process.env.KEY_NAME,
  "COIN_MARKET_CAP_API": process.env.MARKETPRICE,
  "AWS_S3_URL": "https://s3.us-east-2.amazonaws.com/production-static-asset/",
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
    },
    'VIA': {
      'coin_name': 'viacoin',
      'rpcuser': 'kishan1',
      'rpcpassword': 'admin1',
      'url': 'http://dev-viacoin-currency.faldax.com/'
    },
    'VTC': {
      'coin_name': 'vertcoin',
      'rpcuser': 'kiddsddhan',
      'rpcpassword': 'kisha34nff',
      'url': 'http://dev-vertcoin-currency.faldax.com/'
    },
    'VRC': {
      'coin_name': 'vericoin',
      'rpcuser': 'vericoinrpc',
      'rpcpassword': 'secret',
      'url': 'http://dev-vericoin-currency.faldax.com/'
    },
    'SYS': {
      'coin_name': 'syscoin',
      'rpcuser': 'user',
      'rpcpassword': 'password',
      'url': 'http://dev-syscoin-currency.faldax.com/'
    },
    //Requires to be done but address is being created
    'QTUM': {
      'coin_name': 'qtum',
      'rpcuser': 'qtumrpc',
      'rpcpassword': 'secret',
      'url': 'http://dev-qtum-currency.faldax.com/'
    },
    'NAV': {
      'coin_name': 'navcoin',
      'rpcuser': 'navcoinrpc',
      'rpcpassword': 'secret',
      'url': 'http://dev-navcoin-currency.faldax.com/'
    },
    'DOGE': {
      'coin_name': 'dogecoin',
      'rpcuser': 'dogecoinrpc',
      'rpcpassword': '2PfZxVnJZVATg9JWpcsE3hxP8jpRWnMA8KhgJRK4NdCe',
      'url': 'http://dev-dogecoin-currency.faldax.com/'
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