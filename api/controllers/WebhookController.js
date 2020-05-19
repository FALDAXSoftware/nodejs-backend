/**
 * WebhookController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
var logger = require("../controllers/logger");
module.exports = {

  // set on recive webhook
  setReceiveWebhook: async function (req, res) {
    try {
      // await sails.helpers.loggerFormat(
      //   "setReceiveWebhook",
      //   sails.config.local.LoggerWebhook,
      //   req.url,
      //   1,
      //   req,
      //   sails.config.local.LoggerIncoming
      // );
      let coins = await Coins.find({
        deleted_at: null,
        is_active: true,
        iserc: false,
        type: 1,
        hot_receive_wallet_address: {
          '!=': null
        }
      });

      for (let index = 0; index < coins.length; index++) {
        const coin = coins[index];

        // remove Existing webhooks
        let webhookres = await sails.helpers.bitgo.listWebhooks(coin.coin_code, coin.hot_receive_wallet_address);

        let webhooks = webhookres.webhooks
        for (let webhookIndex = 0; webhookIndex < webhooks.length; webhookIndex++) {
          const webhook = webhooks[webhookIndex];
          if (webhook.type == "transfer") {
            await sails.helpers.bitgo.removeWebhook(coin.coin_code, coin.hot_receive_wallet_address, webhook.url, "transfer");
          }
        }
        // Create new webhook
        let allToken = false;
        if (coin.coin == "ETH") {
          allToken = true
        }
        await sails.helpers.bitgo.addWebhook(coin.coin_code, coin.hot_receive_wallet_address, `${sails.config.local.WEBHOOK_BASE_URL}/webhook-on-receive`, "transfer", allToken);
        // Send Webhooks on Hot send wallets
        // remove Existing webhooks
        let sendwebhookres = await sails.helpers.bitgo.listWebhooks(coin.coin_code, coin.hot_send_wallet_address);
        let sendwebhooks = sendwebhookres.webhooks
        for (let sendwebhookIndex = 0; sendwebhookIndex < sendwebhooks.length; sendwebhookIndex++) {
          const webhook = sendwebhooks[sendwebhookIndex];
          if (webhook.type == "transfer") {
            await sails.helpers.bitgo.removeWebhook(coin.coin_code, coin.hot_send_wallet_address, webhook.url, "transfer");

          }
        }

        // Create new webhook
        allToken = false;
        if (coin.coin == "ETH") {
          allToken = true
        }
        await sails.helpers.bitgo.addWebhook(coin.coin_code, coin.hot_send_wallet_address, `${sails.config.local.WEBHOOK_BASE_URL}/webhook-on-send`, "transfer", allToken);
      }
      return res.json({
        success: true
      });
    } catch (error) {
      console.log("error", error);
      return res.status(500).json({
        success: false,
        error_at: error.stack
      });
    }
  },

  // Set webhook of address_confirmation for ethereum wallet
  setAddressWebhook: async function (req, res) {
    try {
      let coin = await Coins.findOne({
        coin: "ETH",
        deleted_at: null,
        is_active: true
      });
      if (coin) {
        // remove Existing webhooks
        let webhookres = await sails.helpers.bitgo.listWebhooks(coin.coin_code, coin.hot_receive_wallet_address);

        let webhooks = webhookres.webhooks
        for (let webhookIndex = 0; webhookIndex < webhooks.length; webhookIndex++) {
          const webhook = webhooks[webhookIndex];
          if (webhook.type == "address_confirmation") {
            await sails.helpers.bitgo.removeWebhook(coin.coin_code, coin.hot_receive_wallet_address, webhook.url, "address_confirmation");
          }
        }
        // Create new webhook
        let allToken = false;
        if (coin.coin == "ETH") {
          allToken = true
        }

        await sails.helpers.bitgo.addWebhook(coin.coin_code, coin.hot_receive_wallet_address, `${sails.config.local.WEBHOOK_BASE_URL}/webhook-on-address`, "address_confirmation", allToken);
      }
      res.json({
        success: true
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error_at: error.stack
      });
    }

  },

  // Webhook for address confiramtion
  webhookOnAddress: async function (req, res) {
    try {
      if (req.body.address && req.body.walletId) {
        let address = await sails.helpers.bitgo.getAddress("eth", req.body.walletId, req.body.address);
        let addressLable = address.label;
        let coin = address.coin;
        let coinObject = await Coins.findOne({
          coin_code: coin,
          deleted_at: null,
          is_active: true
        });
        if (coinObject) {

          var data = await Wallet
            .update({
              coin_id: coinObject.id,
              address_label: addressLable,
              deleted_at: null
            })
            .set({
              receive_address: address.address
            })
            .fetch();

          var userData = await Users.findOne({
            where: {
              id: data[0].user_id,
              is_active: true,
              deleted_at: null
            }
          });
          if (userData) {
            // Send Email to the user to inform, wallet has created
            await sails.helpers.notification.send.email("wallet_created_successfully", userData);
          }
        }
        return res.json({
          success: true
        })

      }
    } catch (error) {

      return res.status(500).json({
        success: false,
        error_at: error.stack
      });
    }
  },

  webhookOnWarmSend: async function (req, res) {
    try {
      if (req.body.state == "unconfirmed") {
        let transferId = req.body.transfer;
        let transfer = await sails.helpers.bitgo.getTransfer(req.body.coin, req.body.wallet, transferId)
        if (transfer.type == "send" && transfer.state == "unconfirmed") {
          // Wallet balance checking for admin notification
          await sails.helpers.notification.checkAdminWalletNotification();
        }
      }
      res.send({
        success: true
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        error_at: error.stack
      });
    }
  },

  // webhook on receive
  webhookOnReceive: async function (req, res) {
    try {
      // Check For Confirmed transfer
      console.log("Confirmed Before Receive ?????????", req.body);
      if (req.body.state == "confirmed") {
        let coin = await Coins.findOne({
          deleted_at: null,
          is_active: true,
          coin_code: req.body.coin
        });
        console.log("Confirmed On Receive ?????????", req.body);
        var division;
        // if (req.body.coin == "teth" || req.body.coin == "eth" || coin.iserc == true) {
        //   division = sails.config.local.DIVIDE_EIGHTEEN;
        // } else if (req.body.coin == "txrp" || req.body.coin == "xrp") {
        //   division = sails.config.local.DIVIDE_SIX;
        // }
        division = coin.coin_precision
        let isToken = false;
        let transferId = req.body.transfer;
        let transfer = await sails.helpers.bitgo.getTransfer(req.body.coin, req.body.wallet, transferId)
        console.log("transfer", transfer)
        console.log("coinSpecific", transfer.coinSpecific)
        if (transfer.state == "confirmed" && (transfer.type == "receive" || transfer.type == "send")) {
          let alreadyWalletHistory = await WalletHistory.find({
            transaction_type: "receive",
            transaction_id: req.body.hash
          });

          if (alreadyWalletHistory.length == 0) {
            // Object Of receiver
            let dest = null
            let source = null
            if (transfer.outputs) {
              dest = transfer.outputs[0];
              // Object of sender
              source = transfer.outputs[1];
            } else if (transfer.entries) {
              dest = transfer.entries[0];
              source = transfer.entries[1];
            }

            if (source == undefined) {
              source = transfer.inputs[0]
            }

            if (dest == undefined) {
              dest = transfer.inputs[0]
            }

            let coinDataValue = await Coins.findOne({
              coin_code: req.body.coin
            });

            // receiver wallet
            let userWallet = await Wallet.findOne({
              receive_address: dest.address,
              deleted_at: null,
              is_active: true,
              coin_id: coinDataValue.id
            });

            if (userWallet == undefined) {
              if (source != undefined) {
                userWallet = await Wallet.findOne({
                  receive_address: source.address,
                  deleted_at: null,
                  is_active: true,
                  coin_id: coinDataValue.id
                });

                if (userWallet == undefined) {
                  if (transfer.outputs && transfer.outputs != undefined && transfer.outputs.length > 0) {
                    if (transfer.outputs.length > 2) {
                      var flag = false;
                      for (var i = 0; i < transfer.outputs.length; i++) {
                        if (userWallet == undefined && flag == false) {
                          userWallet = await Wallet.findOne({
                            receive_address: transfer.outputs[i].address,
                            deleted_at: null,
                            is_active: true,
                            coin_id: coinDataValue.id
                          })

                          if (userWallet && userWallet != undefined) {
                            source = transfer.outputs[i];
                            flag = true;
                            break;
                          }
                        }
                      }
                      if (flag == false) {
                        if (transfer.entries != undefined) {
                          if (transfer.entries.length > 2) {
                            for (var i = 0; i < transfer.entries.length; i++) {
                              if (userWallet == undefined) {
                                userWallet = await Wallet.findOne({
                                  receive_address: transfer.entries[i].address,
                                  deleted_at: null,
                                  is_active: true,
                                  coin_id: coinDataValue.id
                                })

                                if (userWallet && userWallet != undefined) {
                                  source = transfer.entries[i];
                                  break;
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  } else if (transfer.entries && transfer.entries != undefined && transfer.entries.length > 0) {
                    if (transfer.entries.length > 2) {
                      for (var i = 0; i < transfer.entries.length; i++) {
                        if (userWallet == undefined) {
                          userWallet = await Wallet.findOne({
                            receive_address: transfer.entries[i].address,
                            deleted_at: null,
                            is_active: true,
                            coin_id: coinDataValue.id
                          })

                          if (userWallet && userWallet != undefined) {
                            source = transfer.entries[i];
                            break;
                          }
                        }
                      }
                    }
                  }
                }
              }

              if (userWallet) {
                let temp = dest;
                dest = source;
                source = temp;
              }
            }
            console.log("userWallet", userWallet)
            let coin = await Coins.findOne({
              id: userWallet.coin_id
            });
            // Check For Token
            if (coin.coin == "ETH" && req.body.coin != coin.coin_code) {
              let token = await Coins.findOne({
                coin_code: req.body.coin,
                deleted_at: null
              })
              let tokenUserWallet = await Wallet.findOne({
                coin_id: token.id,
                user_id: userWallet.user_id
              })
              userWallet = {
                ...tokenUserWallet,
                receive_address: userWallet.receiveAddress,
                send_address: userWallet.send_address
              }
              isToken = true
            }

            // transaction amount
            let amount = (dest.value / division);

            // user wallet exitence check
            // let warmWallet = await sails.helpers.bitgo.getWallet(req.body.coin, coin.warm_wallet_address);

            if (userWallet) {
              // Set wallet history params
              let walletHistory = {
                coin_id: userWallet.coin_id,
                source_address: source.address,
                destination_address: dest.address,
                user_id: userWallet.user_id,
                amount: (amount).toFixed(8),
                transaction_type: 'receive',
                transaction_id: req.body.hash
              }

              // Entry in wallet history
              await WalletHistory.create({
                ...walletHistory
              });

              let transactionHistory = {
                coin_id: userWallet.coin_id,
                source_address: source.address,
                destination_address: dest.address,
                user_id: userWallet.user_id,
                amount: (amount).toFixed(8),
                transaction_type: 'receive',
                transaction_id: req.body.hash,
                actual_amount: (amount).toFixed(8),
                receiver_user_balance_before: userWallet.balance,
                warm_wallet_balance_before: 0.0,
                transaction_from: sails.config.local.RECEIVE_TO_DESTINATION,
                actual_network_fees: 0.0,
                faldax_fee: 0.0,
                estimated_network_fees: 0.0,
                residual_amount: 0.0,
                is_done: false,
                is_admin: false
              }

              await TransactionTable.create({
                ...transactionHistory
              })


              // update wallet balance
              await Wallet
                .update({
                  id: userWallet.id
                })
                .set({
                  balance: (userWallet.balance + amount).toFixed(8),
                  placed_balance: (userWallet.placed_balance + amount).toFixed(8)
                });

              // Sending Notification To users

              var userData = await Users.findOne({
                deleted_at: null,
                is_active: true,
                id: userWallet.user_id
              })

              var userNotification = await UserNotification.findOne({
                user_id: userWallet.user_id,
                deleted_at: null,
                slug: 'receive'
              })

              if (userNotification != undefined) {
                if (userNotification.email == true || userNotification.email == "true") {
                  if (userData.email != undefined)
                    // Pass Amount
                    var coin_data = await Coins.findOne({
                      id: userWallet.coin_id
                    });
                  if (coin_data != undefined) {
                    userData.coinName = coin_data.coin;
                  } else {
                    userData.coinName = "-";
                  }
                  userData.amountReceived = (amount).toFixed(8);
                  await sails.helpers.notification.send.email("receive", userData)
                }
                // if (userNotification.text == true || userNotification.text == "true") {
                //   if (userData.phone_number != undefined && userData.phone_number != null && userData.phone_number != '')
                //     await sails.helpers.notification.send.text("receive", userData)
                // }
              }
            }
          }

        }
      }
      // await sails.helpers.loggerFormat(
      //   "webhookOnReceive",
      //   sails.config.local.LoggerWebhook,
      //   req.url,
      //   2,
      //   sails.config.local.LoggerSuccess
      // );
    } catch (error) {
      // await sails.helpers.loggerFormat(
      //   "webhookOnReceive",
      //   sails.config.local.LoggerWebhook,
      //   req.url,
      //   3,
      //   error.stack
      // );
      return res.status(500).json({
        success: false,
        error_at: error.stack
      });
    }
    res.end();
  },

};