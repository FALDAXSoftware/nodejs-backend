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
    //Configuring bitgo
    var bitgo = new BitGoJS.BitGo({ env: sails.config.local.BITGO_ENV_MODE, accessToken: sails.config.local.BITGO_ACCESS_TOKEN });

    //Fetching coin list
    const coin = await Coins.find({ deleted_at: null, is_active: true, coin_name: inputs.coin });
    //For all the coins accept USD EURO and ETH
    if (coin.type == sails.config.local.COIN_TYPE_BITGO && coin.hot_receive_wallet_address) {
      // For all type 1 (bitgo) coins

      let walletCoinCode = coin.coin_code;
      let address_label = inputs.user.id.toString();

      // Address Labeling and coin name for erc20 token
      if (coin.isERC) {
        walletCoinCode = sails.config.local.COIN_CODE_FOR_ERC_20_WALLET_BITGO;
        address_label = coin.coin_code + '-' + address_label;
      }

      var wallet = await bitgo
        .coin(walletCoinCode)
        .wallets()
        .get({ id: coin.hot_receive_wallet_address });

      if (wallet) {
        //Here chain =0 means testnet Generating wallet address
        // Create bitgo wallet address
        let address = await wallet.createAddress({ "chain": parseInt(sails.config.local.chain), "label": address_label });
        let obj = {
          wallet_id: "wallet",
          coin_id: parseInt(coin.id),
          receive_address: address.address,
          user_id: parseInt(inputs.user.id),
          balance: 0.0,
          placed_balance: 0.0,
          address_label: address_label
        }
        // walletArray.push({ ...obj });
        await wallet.create({ ...obj }).fetch();
      }
    }
    return exits.success();
  }

};
