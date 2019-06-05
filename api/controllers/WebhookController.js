/**
 * WebhookController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const BitGoJS = require('bitgo');

module.exports = {
    // set on recive webhook
    setReceiveWebhook: async function (req, res) {
        let coins = await Coins.find({
            deleted_at: null,
            is_active: true,
            isERC: false,
            type: 1,
            hot_receive_wallet_address: { '!=': null }
        });
        console.log("----------", coins);

        let bitgo = new BitGoJS.BitGo({ env: sails.config.local.BITGO_ENV_MODE, accessToken: sails.config.local.BITGO_ACCESS_TOKEN });
        for (let index = 0; index < coins.length; index++) {
            const coin = coins[index];


            // Receive Webhook on Hot receive wallets
            let wallet = await bitgo
                .coin(coin.coin_code)
                .wallets()
                .get({ id: coin.hot_receive_wallet_address });
            // remove Existing webhooks
            let webhookres = await wallet.listWebhooks();
            let webhooks = webhookres.webhooks
            for (let webhookIndex = 0; webhookIndex < webhooks.length; webhookIndex++) {
                const webhook = webhooks[webhookIndex];
                if (webhook.type == "transfer") {
                    await wallet.removeWebhook({
                        url: webhook.url,
                        type: "transfer",
                    });
                }
            }
            // Create new webhook
            let reciveWebhookParams = {
                url: `${sails.config.local.WEBHOOK_BASE_URL}/webhook-on-receive`,
                type: "transfer",
            };
            if (coin.coin == "ETH") {
                reciveWebhookParams["allToken"] = true
            }
            await wallet.addWebhook(reciveWebhookParams);

            // Send Webhooks on Hot send wallets
            let sendWallet = await bitgo
                .coin(coin.coin_code)
                .wallets()
                .get({ id: coin.hot_send_wallet_address });
            // remove Existing webhooks
            let sendwebhookres = await sendWallet.listWebhooks();
            let sendwebhooks = sendwebhookres.webhooks
            for (let sendwebhookIndex = 0; sendwebhookIndex < sendwebhooks.length; sendwebhookIndex++) {
                const webhook = sendwebhooks[sendwebhookIndex];
                if (webhook.type == "transfer") {
                    await sendWallet.removeWebhook({
                        url: webhook.url,
                        type: "transfer",
                    });
                }
            }
            // Create new webhook
            let sendWebhookParams = {
                url: `${sails.config.local.WEBHOOK_BASE_URL}/webhook-on-send`,
                type: "transfer"
            };
            if (coin.coin == "ETH") {
                sendWebhookParams["allToken"] = true
            }
            await sendWallet.addWebhook(sendWebhookParams);
        }
        return res.json({ success: true });
    },

    // webhook on receive
    webhookOnReceive: async function (req, res) {
        // console.log("webhook", req.body);
        // res.end();

        if (req.body.state == "confirmed") {
            var bitgo = new BitGoJS.BitGo({ env: sails.config.local.BITGO_ENV_MODE, accessToken: sails.config.local.BITGO_ACCESS_TOKEN });
            var wallet = await bitgo
                .coin(req.body.coin)
                .wallets()
                .get({ id: req.body.wallet });
            let transferId = req.body.transfer;
            let transfer = await wallet.getTransfer({ id: transferId })
            if (transfer.state == "confirmed") {
                // Object Of receiver
                let dest = transfer.outputs[0];
                // Object of sender
                let source = transfer.outputs[1];
                // receiver wallet
                let userWallet = await Wallet.findOne({ receive_address: dest.address, deleted_at: null, is_active: true });
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
                    // update wallet balance
                    await Wallet
                        .update({ id: userWallet.id })
                        .set({
                            balance: userWallet.balance + amount,
                            placed_balance: userWallet.placed_balance + amount
                        });


                    // Send fund to Warm and custody wallet
                    let coin = await Coins.findOne({ id: userWallet.coin_id });
                    let warmWallet = await bitgo
                        .coin(req.body.coin)
                        .wallets()
                        .get({ id: coin.warm_wallet_address });
                    let custodialWallet = await bitgo.coin(req.body.coin).wallets().get({ id: coin.custody_wallet_address });
                    // check for wallet exist or not
                    if (warmWallet.id && custodialWallet.id) {
                        // check for warm wallet balance 
                        let warmWalletAmount = 0;
                        let custodialWalletAmount = 0;
                        if (warmWallet.confirmedBalance >= coin.min_thresold) {
                            // send 10% to warm wallet and 90% to custodial wallet
                            warmWalletAmount = (dest.value * 10) / 100;
                            custodialWalletAmount = (dest.value * 90) / 100;

                        } else {
                            // send 50% to warm wallet and 50% to custodial wallet
                            warmWalletAmount = (dest.value * 50) / 100;
                            custodialWalletAmount = (dest.value * 50) / 100;
                        }

                        // send amount to warm wallet
                        await wallet.send({
                            amount: warmWalletAmount,
                            address: warmWallet.receiveAddress.address,
                            walletPassphrase: sails.config.local.BITGO_PASSPHRASE
                        });

                        let transactionLog = [];
                        // Log Transafer in transaction table
                        transactionLog.push({
                            source_address: userWallet.receive_address,
                            destination_address: warmWallet.receiveAddress.address,
                            amount: warmWalletAmount,
                            user_id: userWallet.user_id,
                            transaction_type: "receive",
                            coin_id: coin.id,
                            is_executed: true,
                        });


                        // send amount to custodial wallet
                        await wallet.send({
                            amount: custodialWalletAmount,
                            address: custodialWallet.receiveAddress.address,
                            walletPassphrase: sails.config.local.BITGO_PASSPHRASE
                        });

                        // Log Transafer in transaction table
                        transactionLog.push({
                            source_address: userWallet.receive_address,
                            destination_address: custodialWallet.receiveAddress.address,
                            amount: custodialWalletAmount,
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
        res.end();
    },

    // Set webhook of address_confirmation for ethereum wallet
    setAddressWebhook: async function (req, res) {
        let etheriumCoin = await Coins.findOne({
            coin: "ETH",
            deleted_at: null,
            is_active: true
        });
        if (etheriumCoin) {
            let bitgo = new BitGoJS.BitGo({ env: sails.config.local.BITGO_ENV_MODE, accessToken: sails.config.local.BITGO_ACCESS_TOKEN });
            var wallet = await bitgo
                .coin(etheriumCoin.coin_code)
                .wallets()
                .get({ id: etheriumCoin.hot_receive_wallet_address });

            let walletWebHok = await wallet.addWebhook({ url: `${sails.config.local.WEBHOOK_BASE_URL}/webhook-on-address`, type: "address_confirmation", allToken: true });
            console.log(walletWebHok);
        }
        res.json({ success: true });

    },

    // Webhook for address confiramtion
    webhookOnAddress: async function (req, res) {
        let bitgo = new BitGoJS.BitGo({ env: sails.config.local.BITGO_ENV_MODE, accessToken: sails.config.local.BITGO_ACCESS_TOKEN });
        if (req.body.address && req.body.walletId) {
            let wallet = await bitgo
                .coin("teth")
                .wallets()
                .get({ id: req.body.walletId });
            let address = await wallet.getAddress({ address: req.body.address });
            let addressLable = address.label;
            let coin = address.coin;
            if (addressLable.includes("-")) {
                coin = addressLable.split("-")[0];
            }
            let coinObject = await Coins.findOne({ coin_code: coin, deleted_at: null, is_active: true });
            if (coinObject) {
                await Wallet
                    .update({ coin_id: coinObject.id, address_label: addressLable })
                    .set({ receive_address: address.address });
            }

            return res.json({ success: true })

        }
    },


    webhookOnSend: async function (req, res) {
        // Check Status of Transaction
        if (req.body.state == "confirmed") {
            // Connect Bitgo Wallet
            var bitgo = new BitGoJS.BitGo({ env: sails.config.local.BITGO_ENV_MODE, accessToken: sails.config.local.BITGO_ACCESS_TOKEN });
            // get Wallet Bitgo
            var wallet = await bitgo
                .coin(req.body.coin)
                .wallets()
                .get({ id: req.body.wallet });
            let transferId = req.body.transfer;
            // get transaction details
            let transfer = await wallet.getTransfer({ id: transferId })
            // check status of transaction in transaction details
            if (transfer.state == "confirmed") {
                let walletHistory = await WalletHistory.findOne({
                    transaction_id: req.body.hash,
                    is_executed: false
                });
                if (walletHistory) {

                    // Send To user's destination address
                    let sendTransfer = await wallet.send({
                        amount: walletHistory.amount,
                        address: walletHistory.destination_address,
                        walletPassphrase: sails.config.local.BITGO_PASSPHRASE
                    });

                    // Update in wallet history
                    await WalletHistory.update({
                        id: walletHistory.id
                    }).set({
                        is_executed: true,
                        transaction_id: sendTransfer.txid
                    });

                    // Log transaction in transaction table
                    await TransactionTable.create({
                        coin_id: walletHistory.coin_id,
                        source_address: wallet.receiveAddress.address,
                        destination_address: walletHistory.destination_address,
                        user_id: walletHistory.user_id,
                        amount: walletHistory.amount,
                        transaction_type: 'send',
                        is_executed: true
                    });
                }
            }
        }
        res.json({ success: true });
    }
};

