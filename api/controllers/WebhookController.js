/**
 * WebhookController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const BitGoJS = require('bitgo');

module.exports = {

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
        let bitgoAdmin = new BitGoJS.BitGo({ env: sails.config.local.BITGO_ENV_MODE, accessToken: sails.config.local.BITGO_ACCESS_TOKEN_ADMIN })
        for (let index = 0; index < coins.length; index++) {
            const coin = coins[index];

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
                    let walletAdmin = await bitgoAdmin
                        .coin(coin.coin_code)
                        .wallets()
                        .get({ id: coin.hot_receive_wallet_address });
                    await walletAdmin.removeWebhook({
                        url: webhook.url,
                        type: "transfer",
                    });
                }
            }
            // Create new webhook
            await wallet.addWebhook({
                url: `${sails.config.local.WEBHOOK_BASE_URL}/webhook-on-receive`,
                type: "transfer",
                allToken: true
            });


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
                    // check for warm wallet balance 
                    // if (warmWallet.confirmedBalance >= ) {

                    // }
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
    }
};

