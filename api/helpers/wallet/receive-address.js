var {
  map
} = require('lodash');
const BitGoJS = require('bitgo');

module.exports = {

  friendlyName: 'Receive address for particular user for which coin wallet address is available.',

  description: '',

  inputs: {
    user: {
      type: 'json',
      example: '{}',
      description: 'User Data for which wallet needs to be created',
      required: true
    },
    test_key: {
      type: 'string',
      example: 'test_key',
      description: 'Testing key',
      required: false,
      defaultsTo: "false"
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

    //Configuring bitgo API with access token
    var bitgo = new BitGoJS.BitGo({
      env: sails.config.local.BITGO_ENV_MODE,
      accessToken: access_token_value
    });

    //Fetching coin list
    const coinData = await Coins.find({
      deleted_at: null,
      is_active: true,
      is_address_created_signup: true
    });

    let walletArray = [];

    for (let index = 0; index < coinData.length; index++) {
      const coin = coinData[index];
      if (coin.coin_name == inputs.user.fiat) {

        //For USD and EURO
        var obj = {
          wallet_id: "wallet",
          coin_id: parseInt(coin.id),
          receive_address: inputs.user.fiat,
          user_id: parseInt(inputs.user.id),
          balance: 0.0
        }
        walletArray.push(obj)

      } else if (coin.coin_name !== 'USD' && coin.coin_name !== 'EUR') {

        //For all the coins accept USD EURO and ETH
        if (coin.type == sails.config.local.COIN_TYPE_BITGO && coin.hot_receive_wallet_address) {
          // For all type 1 (bitgo) coins

          let walletCoinCode = coin.coin_code;
          // let address_label = inputs.user.id.toString();
          let address_label = await sails.helpers.bitgo.generateUniqueUserAddress(user_id.toString());

          // Address Labeling and coin name for erc20 token
          if (coin.iserc) {
            walletCoinCode = sails.config.local.COIN_CODE_FOR_ERC_20_WALLET_BITGO;
            address_label = coin.coin_code + '-' + address_label;
          }
          var wallet = await sails.helpers.bitgo.getWallet(walletCoinCode, coin.hot_receive_wallet_address);
          if (wallet) {
            //Here chain =0 means testnet Generating wallet address
            // Create bitgo wallet address
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
              address_label: address_label
            }

            walletArray.push({
              ...obj
            });
          }
        }
      }
    }

    // Insert all wallet addresses to Database
    if (walletArray.length > 0) {
      await Wallet.createEach([...walletArray]);
    }
    return exits.success();
  }

};
