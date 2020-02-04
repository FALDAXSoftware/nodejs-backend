const BitGoJS = require('bitgo');
const request = require('request');

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
    console.log("access_token_value",access_token_value)
    console.log("sails.config.local.BITGO_ENV_MODE",sails.config.local.BITGO_ENV_MODE)
    //Configuring bitgo
    var bitgo = new BitGoJS.BitGo({
      env: sails.config.local.BITGO_ENV_MODE,
      accessToken: access_token_value
    });

    //Fetching coin list
    const coin = await Coins.findOne({
      deleted_at: null,
      // is_active: true,
      coin: inputs.coin
    });

  console.log("coin",coin);

    var walletData = await Wallet.findOne({
      deleted_at: null,
      coin_id: coin.id,
      user_id: parseInt(inputs.user.id),
    })
    console.log((coin.type == 1))
    let address_label = await sails.helpers.bitgo.generateUniqueUserAddress((inputs.user.id).toString(), (inputs.user.flag == true ? true : false));
    if (coin.type == 1) {
      //For all the coins accept USD EURO and ETH
      if (coin.type == sails.config.local.COIN_TYPE_BITGO && coin.hot_receive_wallet_address) {
        // For all type 1 (bitgo) coins

        let walletCoinCode = coin.coin_code;
        // let address_label = inputs.user.id.toString();


        // Address Labeling and coin name for erc20 token
        if (coin.iserc) {
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
    } else if (inputs.coin == "SUSU") {
      console.log("INSIDE ELSE IF>>>>>>")
      var value = {
        "user_id": parseInt(inputs.user.id),
        "label": address_label
      }
      console.log(sails.config.local.SUSUCOIN_URL + "get-susu-coin-address")
      await request({
        url: sails.config.local.SUSUCOIN_URL + "create-susu-coin-address",
        method: "POST",
        headers: {
          // 'cache-control': 'no-cache',
          // Authorization: `Bearer ${sails.config.local.BITGO_ACCESS_TOKEN}`,
          'x-token': 'faldax-susucoin-node',
          'Content-Type': 'application/json'
        },
        body: value,
        json: true
      }, function (err, httpResponse, body) {
        if (err) {
          return exits.error(err);
        }
        if (body.error) {
          return exits.error(body);
        }
        return exits.success(body);
        // return body;
      });
    }
  }

};
