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
    // var passphrase_value = await sails.helpers.getDecryptData(sails.config.local.BITGO_PASSPHRASE);
    var passphrase_value;
    var coinData = await Coins.findOne({
      where: {
        deleted_at: null,
        is_active: true,
        coin_code: inputs.coin
      }
    })
    var dataa = {
        address: inputs.address,
        amount: parseFloat(inputs.amount)
    };
    console.log("Input data", inputs);
    console.log("coinData",coinData);
    // if (coinData && coinData != undefined) {
    //   if (inputs.coin == "btc") {
    //     if (coinData.warm_wallet_address == inputs.walletId) {
    //       passphrase_value = sails.config.local.BITGO_BTC_WARM_WALLET_PASSPHRASE;
    //       console.log("In warm_wallet_address");
    //     } else if (coinData.hot_send_wallet_address == inputs.walletId) {
    //       passphrase_value = sails.config.local.BITGO_BTC_HOT_SEND_WALLET_PASSPHRASE;
    //       console.log("In hot_send_wallet_address");
    //     } else if (coinData.hot_receive_wallet_address == inputs.walletId) {
    //       passphrase_value = sails.config.local.BITGO_BTC_HOT_RECEIVE_WALLET_PASSPHRASE;
    //       console.log("In hot_receive_wallet_address");
    //     } else if (coinData.custody_wallet_address == inputs.walletId) {
    //       passphrase_value = sails.config.local.BITGO_PASSPHRASE;
    //       console.log("In custody_wallet_address");
    //     }
    //   } else {
    //     passphrase_value = sails.config.local.BITGO_PASSPHRASE;
    //   }
    // } else {
    //   passphrase_value = sails.config.local.BITGO_PASSPHRASE;
    // }
    passphrase_value = sails.config.local.BITGO_BTC_WARM_WALLET_PASSPHRASE

    console.log("passphrase_value", passphrase_value);
    var wallet_passphrase = await sails.helpers.getDecryptData(passphrase_value);
    console.log("wallet_passphrase", wallet_passphrase);
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
        walletPassphrase: wallet_passphrase
      },
      json: true
    }, function (err, httpResponse, body) {
      if (err) {
        console.log("Error", err)
        return exits.error(err);
      }
      console.log("Res Body", body);
      if (body.error) {
        return exits.error(body);
      }
      return exits.success(body);
    });
  }

};
