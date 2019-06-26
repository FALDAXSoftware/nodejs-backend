/**
 * RootController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const BitGoJS = require('bitgo');

module.exports = {
  getPanicStatus: async function (req, res) {
    try {
      let status = await AdminSetting.findOne({
        slug: "panic_status"
      });
      return res.json({
        status: 200,
        message: sails.__("Panic Status"),
        status
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

  panicBtn: async function (req, res) {
    try {
      // let btnCall = await sails
      //   .helpers
      //   .panicButton();

      // if (btnCall.length > 0) {
      //   btnCall.forEach(async (element) => {
      //     let userDetails = await Users.find({ id: element });
      //     let slug = "panic_email"
      //     let template = await EmailTemplate.findOne({ slug });
      //     let emailContent = await sails.helpers.utilities.formatEmail(template.content, {
      //       recipientName: userDetails[0].first_name,
      //     })
      //     sails
      //       .hooks
      //       .email.send("general-email", {
      //         content: emailContent
      //       }, {
      //           to: "krina.soni@openxcellinc.com",
      //           subject: "Panic Button"
      //         }, function (err) {
      //           if (!err) {
      //             return res.json({
      //               "status": 200,
      //               "message": sails.__("Email sent success")
      //             });
      //           }
      //         })
      //   });
      // }

      let { otp, status } = req.allParams();
      let user_id = req.user.id;
      let user = await Admin.findOne({ id: user_id, is_active: true, deleted_at: null });
      if (!user) {
        return res
          .status(401)
          .json({
            "status": 401,
            "err": sails.__("user inactive")
          });
      }
      let verified = speakeasy
        .totp
        .verify({ secret: user.twofactor_secret, encoding: "base32", token: otp });
      if (verified) {
        await AdminSetting.update({
          slug: "panic_status"
        }).set({
          value: status
        });
        return res
          .json({
            "status": 200,
            "message": "Panic status changed successfully."
          });
      } else {
        return res
          .status(500)
          .json({
            "status": 500,
            "err": "OTP is wrong!!"
          });
      }
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
    await sails.helpers.notification.send.text();
    console.log("done");
    return res.json({
      success: true
    });
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
    await sails.helpers.bitgo.getWallet("tbtc", "5ce2deb441a6330d04e59f9b799a182a");
    // console.log(sails.config.local.BITGO_ACCESS_TOKEN);

    // let bitgo = new BitGoJS.BitGo({ env: 'test', accessToken: sails.config.local.BITGO_ACCESS_TOKEN });
    // var wallet = await bitgo
    //   .coin("tbtc")
    //   .wallets()
    //   .get({ id: "5ce2deb441a6330d04e59f9b799a182a" });
    // // let send = await wallet.send({
    // //   "amount": 1000000,
    // //   "address": "2N6c4b6NYho82mfVww1M5gG3ZxyNYd9etpP",
    // //   "walletPassphrase": "F@LD@xt3stpkey"
    // // });

    // let transfer = await wallet.getTransfer({ id: "5ce7ac5251cb11c103a8e077a6f72fcd" });
    // console.log(transfer);

  },
  testemail: function (req, res) {
    sails
      .hooks
      .email.send("testemail", {
      }, {
          to: "ankit.morker@openxcellinc.com",
          subject: "test email"
        }, function (err) {
          if (!err) {
            return res.json({
              "status": 200,
              "message": "dkhsd"
            });
          }
        });
  }
};
