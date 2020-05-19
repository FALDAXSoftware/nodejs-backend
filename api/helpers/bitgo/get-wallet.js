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
    var coinData = await Coins.findOne({
      where: {
        is_active: true,
        deleted_at: null,
        coin_code: inputs.coin
      }
    });
    console.log("coinData", coinData)
    var token_value = coinData.access_token_value;
    console.log("Token Value in get walet", token_value);
    var access_token_value = await sails.helpers.getDecryptData(sails.config.local[token_value]);
    // console.log("${sails.config.local.BITGO_PROXY_URL}/${inputs.coin}/wallet/${inputs.walletId}",`${sails.config.local.BITGO_PROXY_URL}/${inputs.coin}/wallet/${inputs.walletId}`)
    request({
      url: `${sails.config.local.BITGO_PROXY_URL}/${inputs.coin}/wallet/${inputs.walletId}`,
      method: "GET",
      headers: {
        'cache-control': 'no-cache',
        Authorization: `Bearer ${access_token_value}`,
        'Content-Type': 'application/json'
      },
      json: true
    }, async function (err, httpResponse, body) {
      if (err) {
        return exits.error(err);
      }
      if (body.error) {
        return exits.error(body);
      }
      var coinData = await Coins.findOne({
        where: {
          is_active: true,
          deleted_at: null,
          coin_code: inputs.coin
        }
      })
      if (inputs.coin == "txrp" || inputs.coin == "xrp" || inputs.coin == 'teth' || inputs.coin == 'eth' || coinData.iserc == true) {
        body.balance = body.balanceString;
      }
      return exits.success(body);
    });
  }


};
