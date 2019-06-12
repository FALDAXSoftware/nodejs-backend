const request = require('request');
module.exports = {


  friendlyName: 'Add webhook',


  description: '',


  inputs: {
    coin: {
      type: 'string',
      example: 'btc',
      description: 'Code of Coin',
      required: true
    },
    walletId: {
      type: 'string',
      example: 'qwertyuiopasdfghjklzxcvbnm',
      description: 'Id Of Bitgo Wallet',
      required: true
    },
    url: {
      type: 'string',
      example: 'https://dev-backend.faldax.com/receive-webhook',
      description: 'URL of web hook',
      required: true
    },
    type: {
      type: 'string',
      example: 'transfer',
      description: 'type of webhook',
      required: true
    },
    allTokens: {
      type: 'boolean',
      example: true,
      description: 'for all token true or false',
      required: true
    }
  },


  exits: {

    success: {
      description: 'All done.',
    },
    error: {
      description: 'Something Error'
    }
  },


  fn: async function (inputs, exits) {
    request({
      url: `${sails.config.local.BITGO_PROXY_URL}/${inputs.coin}/wallet/${inputs.walletId}/webhooks`,
      method: "POST",
      headers: {
        'cache-control': 'no-cache',
        Authorization: `Bearer ${sails.config.local.BITGO_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: {
        url: inputs.url,
        type: inputs.type,
        allToken: inputs.allTokens
      },
      json: true
    }, function (err, httpResponse, body) {
      if (err) {
        return exits.error(err);
      }
      if (body.error) {
        return exits.error(body);
      }
      return exits.success(body);
    });
  }


};

