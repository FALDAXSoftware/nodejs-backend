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

    //Getting receive address for all coins
    var coinData = await Coins.findOne({deleted_at: null, coin: inputs.coin})

    //Getting wallet address for particular user and particular wallet
    var walletData = await Wallet.find({coin_id: coinData.id, user_id: inputs.user_id, deleted_at: null});
    walletData = walletData[0];

    //Converting qrcode to data url
    QRCode.toDataURL(walletData.receive_address, function (err, url) {
      if (err) {
        console.log(err);

        return exits.error(err);
      } else {
        return exits.success({'url': url, 'receive_address': walletData.receive_address});
      }
    })
  }
};
