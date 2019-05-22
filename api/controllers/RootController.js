/**
 * RootController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const BitGoJS = require('bitgo');

module.exports = {
  panicBtn: async function (req, res) {
    try {
      let btnCall = await sails
        .helpers
        .panicButton();

      if (btnCall.length > 0) {
        btnCall.forEach(async (element) => {
          let userDetails = await Users.find({ id: element });
          sails
            .hooks
            .email
            .send("panicButton", {
              homelink: sails.config.urlconf.APP_URL,
              recipientName: userDetails[0].first_name,
              senderName: "Faldax"
            }, {
                to: "krina.soni@openxcellinc.com",
                subject: "Panic Button"
              }, function (err) {
                if (!err) {
                  return res.json({
                    "status": 200,
                    "message": sails.__("Email sent success")
                  });
                }
              })
        });
      }
      return res.json({
        "status": 200,
        "message": sails.__("Email sent success")
      });
    } catch (error) {
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  },

  callKrakenAPI: async function (req, res) {
    var data = await sails
      .helpers
      .krakenApi('1F1tAaz5x1HUXrCNLbtMDqcw6o5GNn4xqX');
    return res.json({ status: 200, "data": data });
  },

  sendOpenTicketForm: async function (req, res) {
    return res.view('pages/openTicket');
  },

  sendSubscriberForm: async function (req, res) {
    return res.view('pages/subscriber');
  },

  sendListTokenForm: async function (req, res) {
    return res.view('pages/listYourToken');
  },

  getContactInfo: async function (req, res) {
    let adminSettingDetails = await AdminSetting.find();
    let contacts = {};
    adminSettingDetails.forEach(element => {
      contacts[element.slug] = element.value;
    });
    return res.json({
      status: 200,
      message: sails.__("contact details retrived success"),
      data: contacts
    })
  },

  updateContactInfo: async function (req, res) {
    try {
      let contactDetails = [];
      Object
        .keys(req.body)
        .forEach(async function eachKey(key) {
          contactDetails = await AdminSetting
            .update({ slug: key })
            .set({ value: req.body[key] })
            .fetch();
        });
      if (contactDetails) {
        return res.json({
          status: 200,
          message: sails.__("Contact details updated success")
        })
      } else {
        return res
          .status(500)
          .json({
            status: 500,
            "err": sails.__("Something Wrong")
          });
      }
    } catch (error) {
      console.log('index', error)
    }
  },

  webhookOnReciveBitgo: async function (req, res) {
    if (req.body.state == "confirmed") {
      var bitgo = new BitGoJS.BitGo({ env: sails.config.local.BITGO_ENV_MODE, accessToken: sails.config.local.BITGO_ACCESS_TOKEN });
      var wallet = await bitgo
        .coin(req.body.coin)
        .wallets()
        .get({ id: req.body.wallet });
      let transferId = req.body.transfer;
      wallet
        .getTransfer({ id: transferId })
        .then(async function (transfer) {
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
            }
          }
        });
    }
    res.end();
  },

  queryTest: async function (req, res) {
    var bitcoinistNews = await sails
      .helpers
      .bitcoinistNewsUpdate();
    var bitcoinNews = await sails
      .helpers
      .bitcoinNews();
    var ccnPodcast = await sails
      .helpers
      .ccnPodcast();
    var coinTelegraph = await sails
      .helpers
      .coinTelegraph();
    res.end();
  },

  enableWebSocket: async function (req, res) {
    try {
      return res
        .status(101)
        .json({ status: 101 });
    } catch (err) {
      console.log("error :: ", err);
    }
  },

  createAllWallet: async function (req, res) {
    await sails
      .helpers
      .wallet
      .createAll();
    return res.end();
  },

  bitgoTest: async function (req, res) {
    console.log(sails.config.local.BITGO_ACCESS_TOKEN);

    let bitgo = new BitGoJS.BitGo({ env: 'prod', accessToken: sails.config.local.BITGO_ACCESS_TOKEN });
    var wallet = await bitgo
      .coin("rep")
      .wallets()
      .get({ id: "5cb784fc414b361707ef9658a7d738cc" });
    let webhook = await wallet.removeWebhook({
      url: "http://04d6a0de.ngrok.io/webhook-on-address",
      type: "address_confirmation"
    });

  },
  setAddressWebhook: async function (req, res) {
    let bitgo = new BitGoJS.BitGo({ env: sails.config.local.BITGO_ENV_MODE, accessToken: sails.config.local.BITGO_ACCESS_TOKEN });
    var wallet = await bitgo
      .coin("teth")
      .wallets()
      .get({ id: "5ce30d1da30fec890365c2a10c8ccba0" });

    let walletWebHok = await wallet.addWebhook({
      url: "http://f9fd6ad1.ngrok.io/webhook-on-address",
      type: "address_confirmation",
      allToken: true
    });
    console.log(walletWebHok);
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
      let coinObject = await Coins.findOne({
        coin_code: coin,
        deleted_at: null,
        is_active: true
      });
      if (coinObject) {
        await Wallet.update({
          coin_id: coinObject.id,
          label: addressLable
        }).set({
          receive_address: address.address
        });
      }

      return res.json({ success: true })

    }
  }
};
