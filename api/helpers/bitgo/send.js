const request = require('request');
module.exports = {


  friendlyName: 'Send',


  description: 'Send bitgo.',


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
    address: {
      type: 'string',
      example: 'qwertyuiopasdfghjklzxcvbnm',
      description: 'address of destination',
      required: true
    },
    amount: {
      type: 'number',
      example: 10000,
      description: 'amount of transfer',
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
    var passphrase_value = await sails.helpers.getDecryptData(sails.config.local.BITGO_PASSPHRASE);
    request({
      url: `${sails.config.local.BITGO_PROXY_URL}/${inputs.coin}/wallet/${inputs.walletId}/sendcoins`,
      method: "POST",
      headers: {
        'cache-control': 'no-cache',
        Authorization: `Bearer ${access_token_value}`,
        'Content-Type': 'application/json'
      },
      body: {
        address: inputs.address,
        amount: parseFloat(inputs.amount),
        walletPassphrase: passphrase_value
      },
      json: true
    }, function (err, httpResponse, body) {
      if (err) {
        console.log(err)
        return exits.error(err);
      }
      if (body.error) {
        return exits.error(body);
      }
      return exits.success(body);
    });
  }


};
