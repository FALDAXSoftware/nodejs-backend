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
    var coinData = await Coins.findOne({ deleted_at: null, coin_code: inputs.coin })

    if (coinData !== undefined) {
      //Getting wallet address for particular user and particular wallet
      var walletData = await Wallet.find({ coin_id: coinData.id, user_id: inputs.user_id, deleted_at: null });
      walletData = walletData[0];
      if (coinData.iserc == true) {
        let ethCoin = await Coins.findOne({ deleted_at: null, coin: "ETH" })
        let ethWallet = await Wallet.findOne({ coin_id: ethCoin.id, user_id: inputs.user_id, deleted_at: null });
        walletData = {
          ...walletData,
          receive_address: ethWallet.receive_address,
          send_address: ethWallet.send_address
        }
      }

      //Converting qrcode to data url
      QRCode.toDataURL(walletData.receive_address, function (err, url) {
        if (err) {
          console.log(err);

          return exits.error(err);
        } else {
          return exits.success({ 'url': url, 'receive_address': walletData.receive_address });
        }
      })
    } else {
      return exits.success(1);
    }
  }
};
