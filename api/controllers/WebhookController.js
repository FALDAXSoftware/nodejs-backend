/**
 * WebhookController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  // set on recive webhook
  setReceiveWebhook: async function (req, res) {
    let coins = await Coins.find({
      deleted_at: null,
      is_active: true,
      isERC: false,
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
  },

  // webhook on receive
  webhookOnReceive: async function (req, res) {
    // res.end();

    console.log(req.body.state)
    if (req.body.state == "confirmed") {
      let transferId = req.body.transfer;
      console.log("transfer Id >>>>>>>>>>.", transferId)
      let transfer = await sails.helpers.bitgo.getTransfer(req.body.coin, req.body.wallet, transferId)
      console.log("Transfer Value ?????????????", transfer);
      if (transfer.state == "confirmed") {
        let alreadyWalletHistory = await WalletHistory.find({
          transaction_type: "receive",
          transaction_id: req.body.hash
        });

        if (alreadyWalletHistory.length == 0) {
          // Object Of receiver
          let dest = transfer.outputs[0];
          // Object of sender
          let source = transfer.outputs[1];

          console.log(dest);
          console.log(source)
          // receiver wallet
          let userWallet = await Wallet.findOne({
            receive_address: dest.address,
            deleted_at: null,
            is_active: true
          });
          if (userWallet == undefined) {
            userWallet = await Wallet.findOne({
              receive_address: source.address,
              deleted_at: null,
              is_active: true
            });
            if (userWallet) {
              let temp = dest;
              dest = source;
              source = temp;
            }
          }

          // transaction amount
          let amount = (dest.value / 100000000);
          // user wallet exitence check
          if (userWallet) {
            // Set wallet history params
            let walletHistory = {
              coin_id: userWallet.coin_id,
              source_address: source.address,
              destination_address: dest.address,
              user_id: userWallet.user_id,
              amount: amount,
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
              amount: (amount),
              transaction_type: 'receive',
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
                balance: userWallet.balance + amount,
                placed_balance: userWallet.placed_balance + amount
              });


            // Send fund to Warm and custody wallet
            let coin = await Coins.findOne({
              id: userWallet.coin_id
            });
            let warmWallet = await sails.helpers.bitgo.getWallet(req.body.coin, coin.warm_wallet_address);
            // console.log("warm wallet", warmWallet.receiveAddress.address);
            console.log(warmWallet)
            let custodialWallet = await sails.helpers.bitgo.getWallet(req.body.coin, coin.custody_wallet_address);
            // check for wallet exist or not
            console.log(custodialWallet)
            if (warmWallet.id && custodialWallet.id) {

              console.log("INDSIDE IF LOOP >>>>>>>>>>>>>>>>>>>");
              // check for warm wallet balance 
              let warmWalletAmount = 0;
              let custodialWalletAmount = 0;
              warmWalletAmount = (dest.value * 80) / 100;
              custodialWalletAmount = (dest.value * 20) / 100;
              // if (warmWallet.confirmedBalance >= coin.min_thresold) {
              //     // send 10% to warm wallet and 90% to custodial wallet
              //     warmWalletAmount = (dest.value * 10) / 100;
              //     custodialWalletAmount = (dest.value * 90) / 100;

              // } else {
              //     // send 50% to warm wallet and 50% to custodial wallet
              //     warmWalletAmount = (dest.value * 50) / 100;
              //     custodialWalletAmount = (dest.value * 50) / 100;
              // }

              // send amount to warm wallet
              console.log(warmWalletAmount, custodialWalletAmount)
              await sails.helpers.bitgo.send(req.body.coin, req.body.wallet, warmWallet.receiveAddress.address, (warmWalletAmount).toString())
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
              });


              // send amount to custodial wallet
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
              });

              // Insert logs in taransaction table
              await TransactionTable.createEach([...transactionLog]);
            }
          }
        }

      }
    }
    res.end();
  },

  // Set webhook of address_confirmation for ethereum wallet
  setAddressWebhook: async function (req, res) {
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

  },

  // Webhook for address confiramtion
  webhookOnAddress: async function (req, res) {

    if (req.body.address && req.body.walletId) {
      console.log("Ethereum Webhook ?????????????", req.body);
      let address = await sails.helpers.bitgo.getAddress("teth", req.body.walletId, req.body.address);
      console.log("Ethereum Address ?????????????/", address)
      let addressLable = address.label;
      let coin = address.coin;
      if (addressLable.includes("-")) {
        coin = addressLable.split("-")[0];
      }
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
            receive_address: address.address
          });
      }

      return res.json({
        success: true
      })

    }
  },


  webhookOnSend: async function (req, res) {

    // Check Status of Transaction
    if (req.body.state == "confirmed") {
      let transferId = req.body.transfer;
      // get transaction details
      let transfer = await sails.helpers.bitgo.getTransfer(req.body.coin, req.body.wallet, transferId);
      // check status of transaction in transaction details
      if (transfer.state == "confirmed") {
        let walletHistory = await WalletHistory.findOne({
          transaction_id: req.body.hash,
          is_executed: false
        });
        if (walletHistory) {

          // Send To user's destination address
          let sendTransfer = await sails.helpers.bitgo.send(req.body.coin, req.body.wallet, walletHistory.destination_address, walletHistory.amount * 1e8)
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
    res.json({
      success: true
    });
  }
};
