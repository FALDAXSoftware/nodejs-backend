var QRCode = require('qrcode')

module.exports = {

  friendlyName: 'Receive coin from outside.',

  description: '',

  inputs: {
    coin: {
      type: 'string',
      example: 'BTC',
      description: 'Coin name for which coin need to be received',
      required: true
    },
    user_id: {
      type: 'number',
      example: 1,
      description: 'User id of user for which coin need to be received',
      required: true
    }
  },

  exits: {
    success: {
      description: 'All done.'
    },
    error: {
      description: 'Error.'
    }
  },

  fn: async function (inputs, exits) {
    var coinData = await Coins.findOne({deleted_at: null, coin: inputs.coin})
    console.log(coinData.id);
    console.log(inputs.user_id);
    var walletData = await Wallet.find({coin_id: coinData.id, user_id: inputs.user_id, deleted_at: null});
    console.log("Wallet Data ::: ", walletData);
    walletData = walletData[0];
    QRCode.toDataURL(walletData.receive_address, function (err, url) {
      if (err) {
        console.log(err);

        return exits.error(err);
      } else {
        console.log("URL VALUE ::: ");
        return exits.success({'url': url, 'receive_address': walletData.receive_address});
      }
    })
  }
};
