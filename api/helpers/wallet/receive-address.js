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

    let address_label = await sails.helpers.bitgo.generateUniqueUserAddress((inputs.user.id).toString(), (inputs.user.flag == true ? true : false));

    for (let index = 0; index < coinData.length; index++) {
      const coin = coinData[index];

      if (coin.iserc == true) {
        const get_eth_data = await Coins.findOne({
          deleted_at: null,
          is_active: true,
          coin_code: {
            'in': ["eth", "teth"]
          }
        });
        var eth_address_data = await Wallet.findOne({
          deleted_at: null,
          coin_id: get_eth_data.id,
          user_id: parseInt(inputs.user.id)
        });

        if (eth_address_data && eth_address_data.send_address != null && eth_address_data.receive_address != null) {
          let check_erc_data = await Wallet.findOne({
            deleted_at: null,
            coin_id: coin.id,
            user_id: parseInt(inputs.user.id)
          });
          if (check_erc_data) {
            return exits.success(1);
          } else {
            var create_erc_address = await Wallet
              .create({
                user_id: parseInt(inputs.user.id),
                deleted_at: null,
                coin_id: coin.id,
                wallet_id: 'wallet',
                is_active: true,
                balance: 0.0,
                placed_balance: 0.0,
                address_label: eth_address_data.address_label,
                is_admin: false,
                receive_address: eth_address_data.receive_address
              }).fetch();
            return exits.success(create_erc_address);
          }
        } else {
          return exits.success(0);
        }
      } else if (coin.coin_name == inputs.user.fiat) {

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
        if (coin.type == sails.config.local.COIN_TYPE_BITGO && coin.hot_receive_wallet_address && sails.config.local.coinArray[coin.coin] != undefined && Object.keys(sails.config.local.coinArray[coin.coin]).length == 0) {
          // For all type 1 (bitgo) coins

          let walletCoinCode = coin.coin_code;
          // let address_label = inputs.user.id.toString();
          let address_label = await sails.helpers.bitgo.generateUniqueUserAddress((inputs.user.id).toString());

          // Address Labeling and coin name for erc20 token
          if (coin.iserc) {
            walletCoinCode = sails.config.local.COIN_CODE_FOR_ERC_20_WALLET_BITGO;
            address_label = coin.coin_code + '-' + address_label;
          }
          var wallet = await sails.helpers.bitgo.getWallet(walletCoinCode, coin.hot_receive_wallet_address);
          if (wallet) {

            //Address generation for receiving coin
            let address = await sails.helpers.bitgo.createAddress(walletCoinCode, coin.hot_receive_wallet_address, address_label);

            let obj = {
              wallet_id: "wallet",
              coin_id: parseInt(coin.id),
              receive_address: address.address,
              user_id: parseInt(inputs.user.id),
              balance: 0.0,
              placed_balance: 0.0,
              address_label: address_label
            }

            walletArray.push({
              ...obj
            });
          }

          if (walletArray.length > 0) {
            await Wallet.createEach([...walletArray]);
          }
        } else if (coin.coin == "SUSU") {
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
          }, async function (err, httpResponse, body) {
            console.log("body", body);
            if (err) {
              return exits.error(err);
            }
            if (body.error) {
              return exits.error(body);
            }
            if (inputs.user.flag == true) {
              var walletData = await Wallet
                .update({
                  "receive_address": body.data.receive_address,
                  deleted_at: null
                })
                .set({
                  "is_admin": true
                })
                .fetch();
            } else {
              var walletData = await Wallet.findOne({
                where: {
                  deleted_at: null,
                  "receive_address": body.data.receive_address
                }
              })
            }
            console.log("walletData", walletData);
            body.data = walletData;
            console.log(body)
            return exits.success(body);
            // return body;
          });
        } else if (sails.config.local.coinArray[coin.coin] != undefined && Object.keys(sails.config.local.coinArray[coin.coin]).length > 0 && sails.config.local.coinArray[coin.coin].type == 8) {
          var value = {
            "user_id": parseInt(inputs.user.id),
            "label": address_label
          }
          await request({
            url: sails.config.local.coinArray[coin.coin].url + "ripple-get-new-address",
            method: "POST",
            headers: {
              // 'cache-control': 'no-cache',
              // Authorization: `Bearer ${sails.config.local.BITGO_ACCESS_TOKEN}`,
              'x-token': 'faldax-ripple-node',
              'Content-Type': 'application/json'
            },
            body: value,
            json: true
          }, async function (err, httpResponse, body) {
            console.log("body", body);
            if (err) {
              return exits.error(err);
            }
            if (body.error) {
              return exits.error(body);
            }
            if (body.status == 201) {
              if (inputs.user.flag == true) {
                var walletData = await Wallet
                  .update({
                    "receive_address": body.data,
                    deleted_at: null
                  })
                  .set({
                    "is_admin": true
                  })
                  .fetch();
              } else {
                var walletData = await Wallet.findOne({
                  where: {
                    deleted_at: null,
                    "receive_address": body.data
                  }
                })
              }
              console.log("walletData", walletData);
              body.data = walletData;
            } else {

            }
            console.log(body)
            return exits.success(body);
            // return body;
          });
        } else if (sails.config.local.coinArray[coin.coin] != undefined && Object.keys(sails.config.local.coinArray[coin.coin]).length > 0 && sails.config.local.coinArray[coin.coin].type == 9) {
          console.log("INSIDE ELSE IF " + sails.config.local.coinArray[coin.coin].name + ">>>>>>")
          var value = {
            "user_id": parseInt(inputs.user.id),
            "label": address_label
          }
          // console.log(sails.config.local.SUSUCOIN_URL + "get-litecoin-coin-address")
          console.log(sails.config.local.coinArray[coin.coin].url + "create-" + sails.config.local.coinArray[coin.coin].name + "-coin-address")
          await request({
            url: sails.config.local.coinArray[coin.coin].url + "create-" + sails.config.local.coinArray[coin.coin].name + "-coin-address",
            method: "POST",
            headers: {
              // 'cache-control': 'no-cache',
              // Authorization: `Bearer ${sails.config.local.BITGO_ACCESS_TOKEN}`,
              'x-token': `faldax-${sails.config.local.coinArray[coin.coin].name}-node`,
              'Content-Type': 'application/json'
            },
            body: value,
            json: true
          }, async function (err, httpResponse, body) {
            console.log("body", body);
            if (err) {
              return exits.error(err);
            }
            if (body.error) {
              return exits.error(body);
            }
            if (inputs.user.flag == true) {
              var walletData = await Wallet
                .update({
                  "receive_address": body.data.receive_address,
                  deleted_at: null
                })
                .set({
                  "is_admin": true
                })
                .fetch();
            } else {
              var walletData = await Wallet.findOne({
                where: {
                  deleted_at: null,
                  "receive_address": body.data.receive_address
                }
              })
            }
            console.log("walletData", walletData);
            body.data = walletData;
            console.log(body)
            return exits.success(body);
            // return body;
          });
        }
      }
    }

    // Insert all wallet addresses to Database
    return exits.success();
  }

};
