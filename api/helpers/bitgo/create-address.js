const request = require('request');
module.exports = {


  friendlyName: 'Create address',


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
      example: 'qwer7860tyuiopasAdfghjklzxcvbnm',
      description: 'Id Of Bitgo Wallet',
      required: true
    },
    label: {
      type: 'string',
      example: 'test',
      description: 'label of address',
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
    console.log("inputs", inputs)
    // var coinData = await Coins.findOne({
    //   where: {
    //     deleted_at: null,
    //     is_active: true,
    //     coin_code: inputs.coin
    //   }
    // })
    // if (coinData != undefined) {

    // }
    var access_token_value = await sails.helpers.getDecryptData(sails.config.local.BITGO_ACCESS_TOKEN);
    if (inputs.coin == "ttrx") {
      access_token_value = "ea19ff4c1d333620823c5d54b346d5d356094084108b245036424af8fdb80f67"
    }
    if (inputs.coin == "teos") {
      access_token_value = "7639b1c292ad363771e5e2b0a0327efc17d70bd86ccd0b00b75c45947c91de64"
    }
    var passphrase_value = await sails.helpers.getDecryptData(sails.config.local.BITGO_PASSPHRASE);
    if (inputs.coin == "ttrx") {
      passphrase_value = "x7tR8nPDZymGT1I6dugpkdn5CIjKJ!mI4EKn@8jwkNenDJmbP@1#i$E*Tm9&"
    }
    if (inputs.coin == "teos") {
      passphrase_value = "sU9#37bwQ78FIAovllxCKnSQORCVVSFb&2!1biPR*avWfRu#cL46MVg&LvcD"
    }
    var enterprise_value = await sails.helpers.getDecryptData(sails.config.local.BITGO_ENTERPRISE);
    console.log(`${sails.config.local.BITGO_PROXY_URL}/${inputs.coin}/wallet/${inputs.walletId}/address`)
    console.log({
      label: inputs.label,
      walletPassphrase: passphrase_value,
      enterprise: enterprise_value
    })
    var url = `${sails.config.local.BITGO_PROXY_URL}/${inputs.coin}/wallet/${inputs.walletId}/address`
    if (inputs.coin == "ttrx") {
      url = `${sails.config.local.BITGO_PROXY_URL}/${inputs.coin}/wallet/generate`
    }
    console.log("url", url)
    request({
      url: url,
      method: "POST",
      headers: {
        'cache-control': 'no-cache',
        Authorization: `Bearer ${access_token_value}`,
        'Content-Type': 'application/json'
      },
      body: {
        label: inputs.label,
        walletPassphrase: passphrase_value,
        enterprise: enterprise_value
      },
      json: true
    }, function (err, httpResponse, body) {
      console.log("body", body);
      console.log("err", err)
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
