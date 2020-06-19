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
      console.log("req.body", req.body)
      if (req.body.address && req.body.walletId) {
        var coinValue;
        if (sails.config.local.TESTNET == 1) {
          coinValue = "teth"
        } else {
          coinValue = "eth"
        }
        let address = await sails.helpers.bitgo.getAddress(coinValue, req.body.walletId, req.body.address);
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

  // // webhook on receive
  // webhookOnReceive: async function (req, res) {
  //   try {
  //     // Check For Confirmed transfer
  //     console.log("Confirmed Before Receive ?????????", req.body);
  //     if (req.body.state == "confirmed") {
  //       let coin = await Coins.findOne({
  //         deleted_at: null,
  //         is_active: true,
  //         coin_code: req.body.coin
  //       });
  //       console.log("Confirmed On Receive ?????????", req.body);
  //       var division;
  //       // if (req.body.coin == "teth" || req.body.coin == "eth" || coin.iserc == true) {
  //       //   division = sails.config.local.DIVIDE_EIGHTEEN;
  //       // } else if (req.body.coin == "txrp" || req.body.coin == "xrp") {
  //       //   division = sails.config.local.DIVIDE_SIX;
  //       // }
  //       division = coin.coin_precision
  //       let isToken = false;
  //       let transferId = req.body.transfer;
  //       let transfer = await sails.helpers.bitgo.getTransfer(req.body.coin, req.body.wallet, transferId)

  //       if (transfer.state == "confirmed" && (transfer.type == "receive" || transfer.type == "send")) {
  //         let alreadyWalletHistory = await WalletHistory.find({
  //           transaction_type: "receive",
  //           transaction_id: req.body.hash
  //         });

  //         if (alreadyWalletHistory.length == 0) {
  //           // Object Of receiver
  //           let dest = null
  //           let source = null
  //           if (transfer.outputs) {
  //             dest = transfer.outputs[0];
  //             // Object of sender
  //             source = transfer.outputs[1];
  //           } else if (transfer.entries) {
  //             dest = transfer.entries[0];
  //             source = transfer.entries[1];
  //           }

  //           if (source == undefined) {
  //             source = transfer.inputs[0]
  //           }

  //           if (dest == undefined) {
  //             dest = transfer.inputs[0]
  //           }

  //           let coinDataValue = await Coins.findOne({
  //             coin_code: req.body.coin
  //           });

  //           // receiver wallet
  //           let userWallet = await Wallet.findOne({
  //             receive_address: dest.address,
  //             deleted_at: null,
  //             is_active: true,
  //             coin_id: coinDataValue.id
  //           });

  //           if (userWallet == undefined) {
  //             if (source != undefined) {
  //               userWallet = await Wallet.findOne({
  //                 receive_address: source.address,
  //                 deleted_at: null,
  //                 is_active: true,
  //                 coin_id: coinDataValue.id
  //               });

  //               if (userWallet == undefined) {
  //                 if (transfer.outputs && transfer.outputs != undefined && transfer.outputs.length > 0) {
  //                   if (transfer.outputs.length > 2) {
  //                     var flag = false;
  //                     for (var i = 0; i < transfer.outputs.length; i++) {
  //                       if (userWallet == undefined && flag == false) {
  //                         userWallet = await Wallet.findOne({
  //                           receive_address: transfer.outputs[i].address,
  //                           deleted_at: null,
  //                           is_active: true,
  //                           coin_id: coinDataValue.id
  //                         })

  //                         if (userWallet && userWallet != undefined) {
  //                           source = transfer.outputs[i];
  //                           flag = true;
  //                           break;
  //                         }
  //                       }
  //                     }
  //                     if (flag == false) {
  //                       if (transfer.entries != undefined) {
  //                         if (transfer.entries.length > 2) {
  //                           for (var i = 0; i < transfer.entries.length; i++) {
  //                             if (userWallet == undefined) {
  //                               userWallet = await Wallet.findOne({
  //                                 receive_address: transfer.entries[i].address,
  //                                 deleted_at: null,
  //                                 is_active: true,
  //                                 coin_id: coinDataValue.id
  //                               })

  //                               if (userWallet && userWallet != undefined) {
  //                                 source = transfer.entries[i];
  //                                 break;
  //                               }
  //                             }
  //                           }
  //                         }
  //                       }
  //                     }
  //                   }
  //                 } else if (transfer.entries && transfer.entries != undefined && transfer.entries.length > 0) {
  //                   if (transfer.entries.length > 2) {
  //                     for (var i = 0; i < transfer.entries.length; i++) {
  //                       if (userWallet == undefined) {
  //                         userWallet = await Wallet.findOne({
  //                           receive_address: transfer.entries[i].address,
  //                           deleted_at: null,
  //                           is_active: true,
  //                           coin_id: coinDataValue.id
  //                         })

  //                         if (userWallet && userWallet != undefined) {
  //                           source = transfer.entries[i];
  //                           break;
  //                         }
  //                       }
  //                     }
  //                   }
  //                 }
  //               }
  //             }

  //             if (userWallet) {
  //               let temp = dest;
  //               dest = source;
  //               source = temp;
  //             }
  //           }
  //           let coin = await Coins.findOne({
  //             id: userWallet.coin_id
  //           });
  //           // Check For Token
  //           if (coin.coin == "ETH" && req.body.coin != coin.coin_code) {
  //             let token = await Coins.findOne({
  //               coin_code: req.body.coin,
  //               deleted_at: null
  //             })
  //             let tokenUserWallet = await Wallet.findOne({
  //               coin_id: token.id,
  //               user_id: userWallet.user_id
  //             })
  //             userWallet = {
  //               ...tokenUserWallet,
  //               receive_address: userWallet.receiveAddress,
  //               send_address: userWallet.send_address
  //             }
  //             isToken = true
  //           }

  //           // transaction amount
  //           let amount = (dest.value / division);

  //           // user wallet exitence check
  //           // let warmWallet = await sails.helpers.bitgo.getWallet(req.body.coin, coin.warm_wallet_address);

  //           if (userWallet) {
  //             // Set wallet history params
  //             let walletHistory = {
  //               coin_id: userWallet.coin_id,
  //               source_address: source.address,
  //               destination_address: dest.address,
  //               user_id: userWallet.user_id,
  //               amount: (amount).toFixed(8),
  //               transaction_type: 'receive',
  //               transaction_id: req.body.hash
  //             }

  //             // Entry in wallet history
  //             await WalletHistory.create({
  //               ...walletHistory
  //             });

  //             let transactionHistory = {
  //               coin_id: userWallet.coin_id,
  //               source_address: source.address,
  //               destination_address: dest.address,
  //               user_id: userWallet.user_id,
  //               amount: (amount).toFixed(8),
  //               transaction_type: 'receive',
  //               transaction_id: req.body.hash,
  //               actual_amount: (amount).toFixed(8),
  //               receiver_user_balance_before: userWallet.balance,
  //               warm_wallet_balance_before: 0.0,
  //               transaction_from: sails.config.local.RECEIVE_TO_DESTINATION,
  //               actual_network_fees: 0.0,
  //               faldax_fee: 0.0,
  //               estimated_network_fees: 0.0,
  //               residual_amount: 0.0,
  //               is_done: false,
  //               is_admin: false
  //             }

  //             await TransactionTable.create({
  //               ...transactionHistory
  //             })


  //             // update wallet balance
  //             await Wallet
  //               .update({
  //                 id: userWallet.id
  //               })
  //               .set({
  //                 balance: (userWallet.balance + amount).toFixed(8),
  //                 placed_balance: (userWallet.placed_balance + amount).toFixed(8)
  //               });

  //             // Sending Notification To users

  //             var userData = await Users.findOne({
  //               deleted_at: null,
  //               is_active: true,
  //               id: userWallet.user_id
  //             })

  //             var userNotification = await UserNotification.findOne({
  //               user_id: userWallet.user_id,
  //               deleted_at: null,
  //               slug: 'receive'
  //             })

  //             if (userNotification != undefined) {
  //               if (userNotification.email == true || userNotification.email == "true") {
  //                 if (userData.email != undefined)
  //                   // Pass Amount
  //                   var coin_data = await Coins.findOne({
  //                     id: userWallet.coin_id
  //                   });
  //                 if (coin_data != undefined) {
  //                   userData.coinName = coin_data.coin;
  //                 } else {
  //                   userData.coinName = "-";
  //                 }
  //                 userData.amountReceived = (amount).toFixed(8);
  //                 await sails.helpers.notification.send.email("receive", userData)
  //               }
  //               // if (userNotification.text == true || userNotification.text == "true") {
  //               //   if (userData.phone_number != undefined && userData.phone_number != null && userData.phone_number != '')
  //               //     await sails.helpers.notification.send.text("receive", userData)
  //               // }
  //             }
  //           }
  //         }

  //       }
  //     }
  //     // await sails.helpers.loggerFormat(
  //     //   "webhookOnReceive",
  //     //   sails.config.local.LoggerWebhook,
  //     //   req.url,
  //     //   2,
  //     //   sails.config.local.LoggerSuccess
  //     // );
  //   } catch (error) {
  //     // await sails.helpers.loggerFormat(
  //     //   "webhookOnReceive",
  //     //   sails.config.local.LoggerWebhook,
  //     //   req.url,
  //     //   3,
  //     //   error.stack
  //     // );
  //     return res.status(500).json({
  //       success: false,
  //       error_at: error.stack
  //     });
  //   }
  //   res.end();
  // },

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
        console.log("transferId", transferId)
        let transfer = await sails.helpers.bitgo.getTransfer(req.body.coin, req.body.wallet, transferId)
        console.log("transfer", transfer)

        if (transfer.state == "confirmed" && (transfer.type == "receive" || transfer.type == "send")) {
          console.log("transfer.state", transfer.state)
          let alreadyWalletHistory = await WalletHistory.find({
            transaction_type: "receive",
            transaction_id: req.body.hash,
            deleted_at: null
          });

          console.log("alreadyWalletHistory", alreadyWalletHistory)

          if (alreadyWalletHistory.length == 0) {
            var receiveArray = [];
            // Object Of receiver
            // let dest = null
            let source = null
            // if (transfer.outputs) {
            //   dest = transfer.outputs[0];
            //   console.log("dest", dest)
            //   // Object of sender
            //   source = transfer.outputs[1];
            // } else if (transfer.entries) {
            //   dest = transfer.entries[0];
            //   source = transfer.entries[1];
            // }

            if (transfer.entries) {
              for (var i = 0; i < transfer.entries.length; i++) {
                if (transfer.entries[i].value < 0) {
                  source = transfer.entries[i].address;
                  break;
                }
              }
            }

            console.log("source", source)

            if (source == null) {
              for (var i = 0; i < transfer.inputs.length; i++) {
                if (transfer.inputs[i].value < 0) {
                  source = transfer.inputs[i].address;
                  break;
                }
              }
            }

            console.log("source", source)
            // Inputs
            let coinDataValue = await Coins.findOne({
              coin_code: req.body.coin
            });

            console.log("coinDataValue", coinDataValue)

            if (transfer.outputs) {
              console.log("transfer.outputs.length", transfer.outputs.length)
              if (transfer.outputs.length > 0) {
                for (let index = 0; index < transfer.outputs.length; index++) {
                  const element = transfer.outputs[index];
                  var getTransferData = await Wallet.findOne({
                    where: {
                      deleted_at: null,
                      receive_address: element.address,
                      deleted_at: null,
                      is_active: true,
                      coin_id: coinDataValue.id
                    }
                  })
                  if (getTransferData != undefined) {
                    receiveArray.push(element)
                  }
                }
              }
            }

            console.log("receiveArray", receiveArray)
            // if (source == undefined) {
            //   source = transfer.inputs[0]
            // }

            // if (dest == undefined) {
            //   dest = transfer.inputs[0]
            // }
            console.log("receiveArray.length", receiveArray.length)
            if (receiveArray.length == 0) {
              console.log("INSIDE IF", transfer.entries.length)
              if (transfer.entries) {
                if (transfer.entries.length > 0) {
                  for (let index = 0; index < transfer.entries.length; index++) {
                    const element = transfer.entries[index];
                    if (element.value > 0) {
                      var getTransferData = await Wallet.findOne({
                        where: {
                          deleted_at: null,
                          receive_address: element.address,
                          deleted_at: null,
                          is_active: true,
                          coin_id: coinDataValue.id
                        }
                      })
                      if (getTransfer != undefined) {
                        receiveArray.push(element)
                      }
                    }
                  }
                }
              }
            }

            console.log("receiveArray", receiveArray)

            // receiver wallet
            // let userWallet = await Wallet.findOne({
            //   receive_address: dest.address,
            //   deleted_at: null,
            //   is_active: true,
            //   coin_id: coinDataValue.id
            // });

            // if (userWallet == undefined) {
            //   if (source != undefined) {
            //     userWallet = await Wallet.findOne({
            //       receive_address: source.address,
            //       deleted_at: null,
            //       is_active: true,
            //       coin_id: coinDataValue.id
            //     });
            //     console.log("userWallet", userWallet)
            //     if (userWallet == undefined) {
            //       if (transfer.outputs && transfer.outputs != undefined && transfer.outputs.length > 0) {
            //         if (transfer.outputs.length > 2) {
            //           var flag = false;
            //           for (var i = 0; i < transfer.outputs.length; i++) {
            //             if (userWallet == undefined && flag == false) {
            //               userWallet = await Wallet.findOne({
            //                 receive_address: transfer.outputs[i].address,
            //                 deleted_at: null,
            //                 is_active: true,
            //                 coin_id: coinDataValue.id
            //               })
            //               console.log("User Wallet at " + userWallet + " at transfer.output", transfer.outputs[i]);
            //               if (userWallet && userWallet != undefined) {
            //                 source = transfer.outputs[i];
            //                 flag = true;
            //                 break;
            //               }
            //             }
            //           }
            //           if (flag == false) {
            //             if (transfer.entries != undefined) {
            //               if (transfer.entries.length > 2) {
            //                 for (var i = 0; i < transfer.entries.length; i++) {
            //                   if (userWallet == undefined) {
            //                     userWallet = await Wallet.findOne({
            //                       receive_address: transfer.entries[i].address,
            //                       deleted_at: null,
            //                       is_active: true,
            //                       coin_id: coinDataValue.id
            //                     })

            //                     console.log("User Wallet at " + userWallet + " at transfer.output", transfer.entries[i]);
            //                     if (userWallet && userWallet != undefined) {
            //                       source = transfer.entries[i];
            //                       break;
            //                     }
            //                   }
            //                 }
            //               }
            //             }
            //           }
            //         }
            //       } else if (transfer.entries && transfer.entries != undefined && transfer.entries.length > 0) {
            //         if (transfer.entries.length > 2) {
            //           for (var i = 0; i < transfer.entries.length; i++) {
            //             if (userWallet == undefined) {
            //               userWallet = await Wallet.findOne({
            //                 receive_address: transfer.entries[i].address,
            //                 deleted_at: null,
            //                 is_active: true,
            //                 coin_id: coinDataValue.id
            //               })

            //               console.log("User Wallet at " + userWallet + " at transfer.output", transfer.entries[i]);
            //               if (userWallet && userWallet != undefined) {
            //                 source = transfer.entries[i];
            //                 break;
            //               }
            //             }
            //           }
            //         }
            //       }
            //     }
            //   }
            //   console.log("source", source)
            //   console.log("dest", dest)
            //   if (userWallet) {
            //     let temp = dest;
            //     dest = source;
            //     source = temp;
            //   }
            // }
            // let coin = await Coins.findOne({
            //   id: userWallet.coin_id
            // });

            console.log(coin);
            // Check For Token
            if (coin.coin == "ETH" && req.body.coin != coin.coin_code) {
              let token = await Coins.findOne({
                coin_code: req.body.coin,
                deleted_at: null
              })
              if (receiveArray.length > 0) {
                for (let index = 0; index < receiveArray.length; index++) {
                  const element = receiveArray[index];
                  let tokenUserWallet = await Wallet.findOne({
                    coin_id: token.id,
                    receive_address: element.address
                  })
                  userWallet = {
                    ...tokenUserWallet,
                    receive_address: element.receiveAddress,
                    send_address: source
                  }
                  isToken = true
                }
              }
            }
            console.log("source", source)

            // console.log("dest", dest)
            // transaction amount

            for (let index = 0; index < receiveArray.length; index++) {
              const element = receiveArray[index];
              console.log("element", element)
              let amount = (element.value / division);
              console.log("amount", amount)
              var getUserData = await Wallet.findOne({
                where: {
                  deleted_at: null,
                  is_active: true,
                  receive_address: element.address
                }
              })

              console.log("getUserData", getUserData)

              if (getUserData) {
                // Set wallet history params
                let walletHistory = {
                  coin_id: getUserData.coin_id,
                  source_address: source,
                  destination_address: element.address,
                  user_id: getUserData.user_id,
                  amount: (amount).toFixed(8),
                  transaction_type: 'receive',
                  transaction_id: req.body.hash
                }

                console.log("walletHistory", walletHistory)
                // Entry in wallet history
                await WalletHistory.create({
                  ...walletHistory
                });

                let transactionHistory = {
                  coin_id: getUserData.coin_id,
                  source_address: source,
                  destination_address: element.address,
                  user_id: getUserData.user_id,
                  amount: (amount).toFixed(8),
                  transaction_type: 'receive',
                  transaction_id: req.body.hash,
                  actual_amount: (amount).toFixed(8),
                  receiver_user_balance_before: getUserData.balance,
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

                await Wallet
                  .update({
                    id: getUserData.id
                  })
                  .set({
                    balance: (getUserData.balance + amount).toFixed(8),
                    placed_balance: (getUserData.placed_balance + amount).toFixed(8)
                  });

                var userData = await Users.findOne({
                  deleted_at: null,
                  is_active: true,
                  id: getUserData.user_id
                })

                var userNotification = await UserNotification.findOne({
                  user_id: getUserData.user_id,
                  deleted_at: null,
                  slug: 'receive'
                })

                console.log(userNotification)

                if (userNotification != undefined) {
                  if (userNotification.email == true || userNotification.email == "true") {
                    if (userData.email != undefined)
                      // Pass Amount
                      var coin_data = await Coins.findOne({
                        id: getUserData.coin_id
                      });
                    if (coin_data != undefined) {
                      userData.coinName = coin_data.coin;
                    } else {
                      userData.coinName = "-";
                    }
                    userData.amountReceived = (amount).toFixed(8);
                    console.log(userData);
                    await sails.helpers.notification.send.email("receive", userData)
                  }
                  // if (userNotification.text == true || userNotification.text == "true") {
                  //   if (userData.phone_number != undefined && userData.phone_number != null && userData.phone_number != '')
                  //     await sails.helpers.notification.send.text("receive", userData)
                  // }
                }

              }
            }

            // console.log("userWallet", userWallet)

            // user wallet exitence check
            // let warmWallet = await sails.helpers.bitgo.getWallet(req.body.coin, coin.warm_wallet_address);

            // if (userWallet) {
            //   // Set wallet history params
            //   // let walletHistory = {
            //   //   coin_id: userWallet.coin_id,
            //   //   source_address: source.address,
            //   //   destination_address: dest.address,
            //   //   user_id: userWallet.user_id,
            //   //   amount: (amount).toFixed(8),
            //   //   transaction_type: 'receive',
            //   //   transaction_id: req.body.hash
            //   // }

            //   // // Entry in wallet history
            //   // await WalletHistory.create({
            //   //   ...walletHistory
            //   // });

            //   // let transactionHistory = {
            //   //   coin_id: userWallet.coin_id,
            //   //   source_address: source.address,
            //   //   destination_address: dest.address,
            //   //   user_id: userWallet.user_id,
            //   //   amount: (amount).toFixed(8),
            //   //   transaction_type: 'receive',
            //   //   transaction_id: req.body.hash,
            //   //   actual_amount: (amount).toFixed(8),
            //   //   receiver_user_balance_before: userWallet.balance,
            //   //   warm_wallet_balance_before: (parseFloat(warmWallet.balance / division).toFixed(sails.config.local.TOTAL_PRECISION)),
            //   //   transaction_from: sails.config.local.RECEIVE_TO_DESTINATION,
            //   //   actual_network_fees: 0.0,
            //   //   faldax_fee: 0.0,
            //   //   estimated_network_fees: 0.0,
            //   //   residual_amount: 0.0,
            //   //   is_done: false,
            //   //   is_admin: false
            //   // }

            //   // await TransactionTable.create({
            //   //   ...transactionHistory
            //   // })


            //   // update wallet balance
            //   // await Wallet
            //   //   .update({
            //   //     id: userWallet.id
            //   //   })
            //   //   .set({
            //   //     balance: (userWallet.balance + amount).toFixed(8),
            //   //     placed_balance: (userWallet.placed_balance + amount).toFixed(8)
            //   //   });

            //   // Sending Notification To users

            //   // var userData = await Users.findOne({
            //   //   deleted_at: null,
            //   //   is_active: true,
            //   //   id: userWallet.user_id
            //   // })

            //   // var userNotification = await UserNotification.findOne({
            //   //   user_id: userWallet.user_id,
            //   //   deleted_at: null,
            //   //   slug: 'receive'
            //   // })

            //   // console.log(userNotification)

            //   // if (userNotification != undefined) {
            //   //   if (userNotification.email == true || userNotification.email == "true") {
            //   //     if (userData.email != undefined)
            //   //       // Pass Amount
            //   //       var coin_data = await Coins.findOne({
            //   //         id: userWallet.coin_id
            //   //       });
            //   //     if (coin_data != undefined) {
            //   //       userData.coinName = coin_data.coin;
            //   //     } else {
            //   //       userData.coinName = "-";
            //   //     }
            //   //     userData.amountReceived = (amount).toFixed(8);
            //   //     console.log(userData);
            //   //     await sails.helpers.notification.send.email("receive", userData)
            //   //   }
            //   //   // if (userNotification.text == true || userNotification.text == "true") {
            //   //   //   if (userData.phone_number != undefined && userData.phone_number != null && userData.phone_number != '')
            //   //   //     await sails.helpers.notification.send.text("receive", userData)
            //   //   // }
            //   // }
            // }
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