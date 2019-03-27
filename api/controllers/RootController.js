/**
 * RootController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const BitGoJS = require('bitgo');

var request = require('request');
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
                  return res.json({ "status": 200, "message": "Email sent successfully." });
                }
              })
        });
      }
      return res.json({ "status": 200, "message": "Email sent successfully." });
    } catch (error) {
      console.log('error>>>>>>>>>>>>>>>>', error)
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  },

  callKrakenAPI: async function () {
    var data = await sails.helpers.krakenApi('1F1tAaz5x1HUXrCNLbtMDqcw6o5GNn4xqX');
    console.log('>>>>>>>>>DATA', data)
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
    let contactDetails = await AdminSetting.find({ type: "contact" });
    let contacts = {};
    contactDetails.forEach(element => {
      contacts[element.slug] = element.value;
    });
    return res.json({ status: 200, message: "contact details retrived successfully.", data: contacts })
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
        return res.json({ status: 200, message: "Contact details updated successfully." })
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

  sendInquiry: async function (req, res) {
    let inquiryDetails = await Inquiry
      .create({ first_name: req.body.first_name, last_name: req.body.last_name, email: req.body.email, message: req.body.message, created_at: new Date() })
      .fetch();
    if (inquiryDetails) {
      return res.json({ status: 200, message: "Inquiry sent successfully." })
    } else {
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  },

  getAllInquiries: async function (req, res) {
    let { page, limit, data } = req.allParams();

    if (data) {
      let q = {
        deleted_at: null
      }
      q['or'] = [
        {
          first_name: {
            contains: data
          }
        }, {
          last_name: {
            contains: data
          }
        }, {
          email: {
            contains: data
          }
        }
      ]

      let inquiryData = await Inquiry
        .find({
          ...q
        })
        .sort('created_at DESC')
        .paginate(page - 1, parseInt(limit));
      let inquiryCount = await Inquiry.count({
        ...q
      });
      if (inquiryData) {
        return res.json({ "status": 200, "message": "Inquiries retrived successfully", "data": inquiryData, inquiryCount });
      }
    } else {
      let q = {
        deleted_at: null
      }

      let inquiryData = await Inquiry
        .find({
          ...q
        })
        .sort('created_at DESC')
        .paginate(page - 1, parseInt(limit));
      let inquiryCount = await Inquiry.count({
        ...q
      });
      if (inquiryData) {
        return res.json({ "status": 200, "message": "Inquiries retrived successfully", "data": inquiryData, inquiryCount });
      } else {
        return res
          .status(500)
          .json({
            status: 500,
            "err": sails.__("Something Wrong")
          });
      }
    }
  },

  deleteInquiry: async function (req, res) {
    try {
      let { inquiry_id } = req.allParams();
      if (!inquiry_id) {
        res.status(500).json({
          "status": 500,
          "err": "Inquiry id is not sent"
        });
        return;
      }
      let deleteInquiry = await Inquiry.update({ id: inquiry_id }).set({ deleted_at: new Date() }).fetch();
      if (deleteInquiry) {
        return res.json({
          "status": 200,
          "message": "Inquiry removed successfully",
        });
      } else {
        return res.status(500).json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
      }
    } catch (err) {
      return res.status(500).json({
        status: 500,
        "err": sails.__("Something Wrong")
      });
    }
  },

  testnews: async function (req, res) {
    console.log("ip ----- >>>>>>>", req.headers);
    // var greeting = await sails.helpers.kycpicUpload(); console.log('greeting',
    // greeting); res.end();
    // var greeting = await sails
    //   .helpers
    //   .tradding
    //   .marketSell();
    // var stopExecution = await sails
    //   .helpers
    //   .tradding
    //   .executeStopLimit();
    // res.json();
  },

  csvToJson: function (req, res) {
    request('https://restcountries.eu/rest/v2/all', function (error, response, body) {
      jsonObj = JSON.parse(body);
      var countryArray = {};
      jsonObj.forEach(row => {
        countryArray[row['name']] = row['alpha2Code']
      });
      res.json(countryArray)
    });
  },

  webhookOnReciveBitgo: async function (req, res) {
    console.log("Webnhook Req body", req.body);
    if (req.body.state == "confirmed") {
      console.log("Confirmed status");
      var bitgo = new BitGoJS.BitGo({ env: sails.config.local.BITGO_ENV_MODE, accessToken: sails.config.local.BITGO_ACCESS_TOKEN });
      var wallet = await bitgo
        .coin(req.body.coin)
        .wallets()
        .get({ id: req.body.wallet });
      let transferId = req.body.transfer;
      wallet
        .getTransfer({ id: transferId })
        .then(async function (transfer) {
          console.log("Trsnafer success");
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
              console.log("USer WAllet ::: ", userWallet);
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
              console.log("Wallet History :: ", walletHistory);
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
      console.log("Enable Web Socket :: ", req);
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
  }


};
