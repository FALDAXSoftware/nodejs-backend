const BitGoJS = require('bitgo');

module.exports = {

  friendlyName: 'Receive address for one coin',

  description: '',

  inputs: {
    coin: {
      type: 'string',
      example: 'BTC',
      description: 'Name Of Coin',
      required: true
    },
    user: {
      type: 'json',
      example: '{}',
      description: 'User Data for which wallet needs to be created',
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

    var access_token_value = await sails.helpers.getDecryptData(sails.config.local.BITGO_ACCESS_TOKEN);

    //Configuring bitgo
    var bitgo = new BitGoJS.BitGo({
      env: sails.config.local.BITGO_ENV_MODE,
      accessToken: access_token_value
    });

    //Fetching coin list
    const coin = await Coins.findOne({
      deleted_at: null,
      is_active: true,
      coin: inputs.coin
    });


    var walletData = await Wallet.findOne({
      deleted_at: null,
      coin_id: coin.id,
      user_id: parseInt(inputs.user.id),
    })
    //For all the coins accept USD EURO and ETH
    if (coin.type == sails.config.local.COIN_TYPE_BITGO && coin.hot_receive_wallet_address) {
      // For all type 1 (bitgo) coins

      let walletCoinCode = coin.coin_code;
      // let address_label = inputs.user.id.toString();
      let address_label = await sails.helpers.bitgo.generateUniqueUserAddress((inputs.user.id).toString(), (inputs.user.flag == true ? true : false));

      // Address Labeling and coin name for erc20 token
      if (coin.isERC) {
        walletCoinCode = sails.config.local.COIN_CODE_FOR_ERC_20_WALLET_BITGO;
        address_label = coin.coin_code + '-' + address_label;
      }
      var wallet = await sails.helpers.bitgo.getWallet(walletCoinCode, coin.hot_receive_wallet_address);


      if (!walletData) {
        if (wallet) {
          // Here chain =0 means testnet Generating wallet address Create bitgo wallet
          // address

          //Address generation for receiving coin
          let address = await sails.helpers.bitgo.createAddress(walletCoinCode, coin.hot_receive_wallet_address, address_label);

          //Address generation for sending the coin
          let sendAddress = await sails.helpers.bitgo.createAddress(walletCoinCode, coin.hot_send_wallet_address, address_label);
          let obj = {
            wallet_id: "wallet",
            coin_id: parseInt(coin.id),
            receive_address: address.address,
            send_address: sendAddress.address,
            user_id: parseInt(inputs.user.id),
            balance: 0.0,
            placed_balance: 0.0,
            address_label: address_label,
            is_admin: (inputs.user.flag == true ? true : false)
          }

          // walletArray.push({ ...obj });
          var data = await Wallet
            .create({
              ...obj
            })
            .fetch();

          return exits.success(data);
        }
      } else {
        return exits.success(1);
      }
    }
  }

};
