const request = require('request');

module.exports = {


  friendlyName: 'Get wallet',


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
    var access_token_value = await sails.helpers.getDecryptData(sails.config.local.BITGO_ACCESS_TOKEN);
    console.log("${sails.config.local.BITGO_PROXY_URL}/${inputs.coin}/wallet/${inputs.walletId}",${sails.config.local.BITGO_PROXY_URL}/${inputs.coin}/wallet/${inputs.walletId})
    request({
      url: `${sails.config.local.BITGO_PROXY_URL}/${inputs.coin}/wallet/${inputs.walletId}`,
      method: "GET",
      headers: {
        'cache-control': 'no-cache',
        Authorization: `Bearer ${access_token_value}`,
        'Content-Type': 'application/json'
      },
      json: true
    }, function (err, httpResponse, body) {
      console.log("wallet", err, httpResponse, body);
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
