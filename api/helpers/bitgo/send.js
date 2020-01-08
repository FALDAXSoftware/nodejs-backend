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
    var enterprise_value = await sails.helpers.getDecryptData(sails.config.local.BITGO_ENTERPRISE);
    console.log("---------------------WebhookOnReceive----------");
    console.log("access_token_value", access_token_value);
    console.log("passphrase_value", passphrase_value);
    console.log("enterprise_value", enterprise_value);
    var obj = {
        'cache-control': 'no-cache',
        Authorization: `Bearer ${access_token_value}`,
        'Content-Type': 'application/json'
      }
    console.log("obj",obj);
    var bb ={
        address: inputs.address,
        amount: parseFloat(inputs.amount),
        walletPassphrase: passphrase_value,
        enterprise: enterprise_value
      };
    console.log("bb",bb);  
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
        console.log("Error in wb:",err)
        return exits.error(err);
      }
      console.log("body",body);
      console.log("----------");
      if (body.error) {
        return exits.error(body);
      }
      return exits.success(body);
    });
  }


};
