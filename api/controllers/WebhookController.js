/**
 * WebhookController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

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
      // await sails.helpers.loggerFormat(
      //   "setReceiveWebhook",
      //   sails.config.local.LoggerWebhook,
      //   req.url,
      //   2,
      //   sails.config.local.LoggerSuccess
      // );
      return res.json({
        success: true
      });
    } catch (error) {
      console.log("error", error);
      // await sails.helpers.loggerFormat(
      //   "setReceiveWebhook",
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
  },

  // webhook on receive
  webhookOnReceive: async function (req, res) {
    try {
      // await sails.helpers.loggerFormat(
      //   "webhookOnReceive",
      //   sails.config.local.LoggerWebhook,
      //   req.url,
      //   1,
      //   req,
      //   sails.config.local.LoggerIncoming
      // );
      // res.end();
      console.log("-------------Recieved----------------");
      console.log("req.body", req.body.state);
      // Check For Confirmed transfer
      if (req.body.state == "confirmed") {
        let isToken = false;
        let transferId = req.body.transfer;
        console.log("transferId", transferId)
        let transfer = await sails.helpers.bitgo.getTransfer(req.body.coin, req.body.wallet, transferId)
        console.log("transfer", transfer)
        if (transfer.state == "confirmed" && transfer.type == "receive") {
          let alreadyWalletHistory = await WalletHistory.find({
            transaction_type: "receive",
            transaction_id: req.body.hash
          });

          console.log("alreadyWalletHistory", alreadyWalletHistory)

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


            // receiver wallet
            let userWallet = await Wallet.findOne({
              receive_address: dest.address,
              deleted_at: null,
              is_active: true
            });

            if (userWallet == undefined) {
              var userSendWallet = await Wallet.findOne({
                send_address: dest.address,
                deleted_at: null,
                is_active: true
              });
            }

            if (userWallet == undefined && userSendWallet == undefined) {
              userWallet = await Wallet.findOne({
                receive_address: source.address,
                deleted_at: null,
                is_active: true
              });

              if (userWallet == undefined) {
                userWallet = await Wallet.findOne({
                  send_address: source.address,
                  deleted_at: null,
                  is_active: true
                });
              }

              if (userWallet) {
                let temp = dest;
                dest = source;
                source = temp;
              }
            }
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
            console.log("dest", dest, "source", source)

            // transaction amount
            let amount = (dest.value / 1e8);

            console.log("amount", amount)
            console.log("userWallet", userWallet)

            // user wallet exitence check
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
                transaction_id: req.body.hash
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
                user_id: userData.id,
                deleted_at: null,
                slug: 'receive'
              })

              // if (userNotification != undefined) {
              //   if (userNotification.email == true || userNotification.email == "true") {
              //     if (userData.email != undefined)
              //       // Pass Amount
              //       var coin_data = await Coins.findOne({
              //         id: userWallet.coin_id
              //       });
              //     if (coin_data != undefined) {
              //       userData.coinName = coin_data.coin;
              //     } else {
              //       userData.coinName = "-";
              //     }
              //     userData.amountReceived = (amount).toFixed(8);

              //     await sails.helpers.notification.send.email("receive", userData)
              //   }
              //   // if (userNotification.text == true || userNotification.text == "true") {
              //   //   if (userData.phone_number != undefined && userData.phone_number != null && userData.phone_number != '')
              //   //     await sails.helpers.notification.send.text("receive", userData)
              //   // }
              // }


              // Send fund to Warm and custody wallet

              let warmWallet = await sails.helpers.bitgo.getWallet(req.body.coin, coin.warm_wallet_address);
              console.log("warmWallet", warmWallet)
              let custodialWallet = await sails.helpers.bitgo.getWallet(req.body.coin, coin.custody_wallet_address);
              console.log("custodialWallet", custodialWallet)
              // check for wallet exist or not
              if (warmWallet.id && custodialWallet.id) {

                // check for warm wallet balance
                let warmWalletAmount = 0;
                let custodialWalletAmount = 0;
                warmWalletAmount = (dest.value * 80) / 100;
                custodialWalletAmount = (dest.value * 20) / 100;

                console.log("warmWalletAmount", warmWalletAmount)
                console.log("custodialWalletAmount", custodialWalletAmount)

                // if (warmWallet.confirmedBalance >= coin.min_thresold) {
                //     // send 10% to warm wallet and 90% to custodial wallet
                //     warmWalletAmount = (dest.value * 10) / 100;
                //     custodialWalletAmount = (dest.value * 90) / 100;
                // } else {
                //     // send 50% to warm wallet and 50% to custodial wallet
                //     warmWalletAmount = (dest.value * 50) / 100;
                //     custodialWalletAmount = (dest.value * 50) / 100;
                // }
                if (!Number.isInteger(warmWalletAmount) || !Number.isInteger(custodialWalletAmount)) {
                  warmWalletAmount = Math.ceil(warmWalletAmount)
                  custodialWalletAmount = Math.floor(custodialWalletAmount)
                }
                console.log("warmWalletAmount", warmWalletAmount)
                console.log("custodialWalletAmount", custodialWalletAmount)
                // send amount to warm wallet
                await sails.helpers.bitgo.send(req.body.coin, req.body.wallet, warmWallet.receiveAddress.address, warmWalletAmount)
                let transactionLog = [];
                // Log Transafer in transaction table
                transactionLog.push({
                  source_address: userWallet.receive_address,
                  destination_address: warmWallet.receiveAddress.address,
                  amount: (warmWalletAmount / 1e8),
                  user_id: userWallet.user_id,
                  transaction_type: "receive",
                  coin_id: coin.id,
                  is_executed: true,
                  transaction_id: req.body.hash
                });


                // send amount to custodial wallet
                if (custodialWalletAmount > 0) {
                  await sails.helpers.bitgo.send(req.body.coin, req.body.wallet, custodialWallet.receiveAddress.address, (custodialWalletAmount).toString())

                  // Log Transafer in transaction table
                  transactionLog.push({
                    source_address: userWallet.receive_address,
                    destination_address: custodialWallet.receiveAddress.address,
                    amount: (custodialWalletAmount / 1e8),
                    user_id: userWallet.user_id,
                    transaction_type: "receive",
                    coin_id: coin.id,
                    is_executed: true,
                    transaction_id: req.body.hash
                  });
                }

                // Insert logs in taransaction table
                await TransactionTable.createEach([...transactionLog]);
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

  // Set webhook of address_confirmation for ethereum wallet
  setAddressWebhook: async function (req, res) {
    try {
      // await sails.helpers.loggerFormat(
      //   "setAddressWebhook",
      //   sails.config.local.LoggerWebhook,
      //   req.url,
      //   1,
      //   req,
      //   sails.config.local.LoggerIncoming
      // );
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
        await sails.helpers.bitgo.addWebhook(coin.coin_code, coin.hot_send_wallet_address, `${sails.config.local.WEBHOOK_BASE_URL}/webhook-on-send-address`, "address_confirmation", allToken);
      }
      // await sails.helpers.loggerFormat(
      //   "setAddressWebhook",
      //   sails.config.local.LoggerWebhook,
      //   req.url,
      //   2,
      //   sails.config.local.LoggerSuccess
      // );
      res.json({
        success: true
      });
    } catch (error) {
      // await sails.helpers.loggerFormat(
      //   "setAddressWebhook",
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

  },

  // Webhook for address confiramtion
  webhookOnAddress: async function (req, res) {
    try {
      // await sails.helpers.loggerFormat(
      //   "webhookOnAddress",
      //   sails.config.local.LoggerWebhook,
      //   req.url,
      //   1,
      //   req,
      //   sails.config.local.LoggerIncoming
      // );
      if (req.body.address && req.body.walletId) {
        let address = await sails.helpers.bitgo.getAddress("teth", req.body.walletId, req.body.address);
        let addressLable = address.label;
        let coin = address.coin;
        // if (addressLable.includes("-")) {
        //   coin = addressLable.split("-")[0];
        // }
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
          var walletData = await Coins.find({
            where: {
              is_active: true,
              deleted_at: null,
              iserc: true
            }
          });

          for (var i = 0; i < walletData.length; i++) {
            var walletValue = await Wallet.find({
              user_id: data[0].user_id,
              coin_id: walletData[i].id,
              is_active: true,
              deleted_at: null
            })
            if (walletValue.length == 0) {
              var walletCode = await Wallet
                .create({
                  user_id: data[0].user_id,
                  deleted_at: null,
                  coin_id: walletData[i].id,
                  wallet_id: 'wallet',
                  is_active: true,
                  balance: 0.0,
                  placed_balance: 0.0,
                  address_label: addressLable,
                  is_admin: false
                }).fetch();
            }
          }
        }
        // await sails.helpers.loggerFormat(
        //   "webhookOnAddress",
        //   sails.config.local.LoggerWebhook,
        //   req.url,
        //   2,
        //   sails.config.local.LoggerSuccess
        // );
        return res.json({
          success: true
        })

      }
    } catch (error) {
      // await sails.helpers.loggerFormat(
      //   "webhookOnAddress",
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
  },


  // Webhook for address confiramtion
  webhookOnSendAddress: async function (req, res) {
    try {
      // await sails.helpers.loggerFormat(
      //   "webhookOnSendAddress",
      //   sails.config.local.LoggerWebhook,
      //   req.url,
      //   1,
      //   req,
      //   sails.config.local.LoggerIncoming
      // );
      if (req.body.address && req.body.walletId) {
        let address = await sails.helpers.bitgo.getAddress("teth", req.body.walletId, req.body.address);
        let addressLable = address.label;
        let coin = address.coin;
        // if (addressLable.includes("-")) {
        //   coin = addressLable.split("-")[0];
        // }
        let coinObject = await Coins.findOne({
          coin_code: coin,
          deleted_at: null,
          is_active: true
        });
        if (coinObject) {

          await Wallet
            .update({
              coin_id: coinObject.id,
              address_label: addressLable
            })
            .set({
              send_address: address.address
            });
        }
        // await sails.helpers.loggerFormat(
        //   "webhookOnSendAddress",
        //   sails.config.local.LoggerWebhook,
        //   req.url,
        //   2,
        //   sails.config.local.LoggerSuccess
        // );
        return res.json({
          success: true
        })

      }
    } catch (error) {
      // await sails.helpers.loggerFormat(
      //   "webhookOnSendAddress",
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
  },



  webhookOnSend: async function (req, res) {
    try {
      // await sails.helpers.loggerFormat(
      //   "webhookOnSend",
      //   sails.config.local.LoggerWebhook,
      //   req.url,
      //   1,
      //   req,
      //   sails.config.local.LoggerIncoming
      // );
      // Check Status of Transaction
      console.log("webhook from send", req.body);

      if (req.body.state == "confirmed") {

        let transferId = req.body.transfer;
        // get transaction details
        let transfer = await sails.helpers.bitgo.getTransfer(req.body.coin, req.body.wallet, transferId);
        console.log("transfer", transfer)
        // let warmWallet = await sails.helpers.bitgo.getWallet(req.body.coin, req.body.wallet);
        // check status of transaction in transaction details
        if (transfer.state == "confirmed" && transfer.type == "receive") {
          let walletHistory = await WalletHistory.findOne({
            transaction_id: req.body.hash,
            is_executed: false
          });
          console.log("walletHistory", walletHistory)
          if (walletHistory) {

            // Send To user's destination address
            var amount = ((walletHistory.amount - walletHistory.faldax_fee) * 1e8).toFixed(2);
            console.log("amount ?????", amount)
            let sendTransfer = await sails.helpers.bitgo.send(req.body.coin, req.body.wallet, walletHistory.destination_address, amount)
            let warmWallet = await sails.helpers.bitgo.getWallet(req.body.coin, req.body.wallet);
            // Update in wallet history
            await WalletHistory.update({
              id: walletHistory.id
            }).set({
              is_executed: true,
              transaction_id: sendTransfer.txid
            });

            // Log transaction in transaction table
            // await TransactionTable.create({
            //   coin_id: walletHistory.coin_id,
            //   source_address: wallet.receiveAddress.address,
            //   destination_address: walletHistory.destination_address,
            //   user_id: walletHistory.user_id,
            //   amount: walletHistory.amount,
            //   transaction_type: 'send',
            //   is_executed: true
            // });
          }
        }
      }
      // await sails.helpers.loggerFormat(
      //   "webhookOnSend",
      //   sails.config.local.LoggerWebhook,
      //   req.url,
      //   2,
      //   sails.config.local.LoggerSuccess
      // );
      res.json({
        success: true
      });
    } catch (error) {
      // await sails.helpers.loggerFormat(
      //   "webhookOnSend",
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
  },

  webhookOnWarmSend: async function (req, res) {
    try {
      // await sails.helpers.loggerFormat(
      //   "webhookOnWarmSend",
      //   sails.config.local.LoggerWebhook,
      //   req.url,
      //   1,
      //   req,
      //   sails.config.local.LoggerIncoming
      // );
      if (req.body.state == "unconfirmed") {
        let transferId = req.body.transfer;
        let transfer = await sails.helpers.bitgo.getTransfer(req.body.coin, req.body.wallet, transferId)
        if (transfer.type == "send" && transfer.state == "unconfirmed") {
          // Wallet balance checking for admin notification
          await sails.helpers.notification.checkAdminWalletNotification();
        }
      }
      // await sails.helpers.loggerFormat(
      //   "webhookOnWarmSend",
      //   sails.config.local.LoggerWebhook,
      //   req.url,
      //   2,
      //   sails.config.local.LoggerSuccess
      // );
      res.send({
        success: true
      })
    } catch (error) {
      // await sails.helpers.loggerFormat(
      //   "webhookOnWarmSend",
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
  }

};