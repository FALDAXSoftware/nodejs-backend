/**
 * RootController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const BitGoJS = require('bitgo');
const speakeasy = require('speakeasy');
var aesjs = require('aes-js');
var logger = require("./logger");
var requestIp = require('request-ip');

module.exports = {
  getPanicStatus: async function (req, res) {
    try {
      let panicStatus = await AdminSetting.findOne({
        slug: "panic_status"
      });
      return res.json({
        status: 200,
        message: sails.__("Panic Status").message,
        panicStatus
      });
    } catch (error) {
      // await logger.error(error.message)
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong").message,
          error_at: error.stack
        });
    }
  },

  panicBtn: async function (req, res) {
    try {
      let {
        otp,
        status
      } = req.allParams();
      let user_id = req.user.id;
      let user = await Admin.findOne({
        id: user_id,
        is_active: true,
        deleted_at: null
      });

      if (!user) {
        return res
          .status(401)
          .json({
            "status": 401,
            "err": sails.__("user inactive").message
          });
      }

      let verified = speakeasy
        .totp
        .verify({
          secret: user.twofactor_secret,
          encoding: "base32",
          token: otp
        });
      if (verified) {
        var emailData = await Users.find({
          select: [
            'email'
          ],
          where: {
            deleted_at: null,
            is_active: true,
            is_verified: true
          }
        });

        // var usersEmail = ((emailData.email).join(','));
        var all_user_emails = [];
        emailData.map(function (each) {
          all_user_emails.push(each.email);
          return each;
        });
        var splitted_users = all_user_emails.join(",");
        var value = Object.values(all_user_emails)

        let slug = "";
        if (status == "true" || status == true) {
          slug = "panic_status_enabled"
        } else {
          slug = "panic_status_disabled"
        }
        let template = await EmailTemplate.findOne({
          slug
        });
        let user_language = (user.default_language ? user.default_language : 'en');
        let language_content = template.all_content[user_language].content;
        let language_subject = template.all_content[user_language].subject;
        console.log("all_user_emails", all_user_emails.length)
        if (all_user_emails.length > 0) {
          for (var i = 0; i < all_user_emails.length; i++) {
            // console.log(all_user_emails[i])
            if (all_user_emails[i] && all_user_emails[i] != undefined) {
              let emailContent = await sails
                .helpers
                .utilities
                .formatEmail(language_content, {
                  recipientName: ''
                })
              // console.log("emailContent", emailContent)
              if (template) {
                // console.log(template)
                sails
                  .hooks
                  .email
                  .send("general-email", {
                    content: emailContent
                  }, {
                    to: all_user_emails[i],
                    // to: value,
                    subject: language_subject
                  }, function (err) {
                    console.log("err", err);
                  });
              }
            }
          }
        }
        // if (verified) {
        await AdminSetting.update({
          slug: "panic_status"
        }).set({
          value: status
        });
        var ip = requestIp.getClientIp(req);
        await PanicHistory.create({
          'panic_status': status,
          'ip': ip,
          created_at: new Date()
        })
        return res
          .json({
            "status": 200,
            "message": sails.__("Panic status changed successfully").message
          });
      } else {
        return res
          .status(500)
          .json({
            "status": 500,
            "err": sails.__("invalid otp").message,
            error_at: sails.__("invalid otp").message
          });
      }
    } catch (error) {
      // console.log(error);
      // await logger.error(error.message)
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong").message,
          error_at: error.stack
        });
    }
  },

  getPanicHistory: async function (req, res) {
    try {

      let {
        page,
        limit,
        data,
        status,
        start_date,
        end_date,
        sort_col,
        sort_order
      } = req.allParams();

      var query = " from panic_history WHERE deleted_at IS NULL"

      if (data && data != "" && data != null) {
        query += " AND LOWER(ip) LIKE '%" + data.toLowerCase() + "%' "
      }

      if (status) {
        query += " AND status = '" + status + "'"
      }

      if (start_date && end_date) {

        query += " AND created_at >= '" + await sails
          .helpers
          .dateFormat(start_date) + " 00:00:00' AND created_at <= '" + await sails
            .helpers
            .dateFormat(end_date) + " 23:59:59'";
      }

      countQuery = query;

      if (sort_col && sort_order) {
        let sortVal = (sort_order == 'descend' ?
          'DESC' :
          'ASC');
        query += " ORDER BY " + sort_col + " " + sortVal;
      } else {
        query += " ORDER BY created_at DESC";
      }

      query += " limit " + limit + " offset " + (parseInt(limit) * (parseInt(page) - 1))
      console.log(query)
      var tradeData = await sails.sendNativeQuery("Select *" + query, [])

      tradeData = tradeData.rows;

      var tradeCount = await sails.sendNativeQuery("Select COUNT(id)" + countQuery, [])
      tradeCount = tradeCount.rows[0].count;

      return res.json({
        "status": 200,
        "message": sails.__("Trade list").message,
        "data": tradeData,
        tradeCount
      });
    } catch (error) {
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong").message,
          error_at: error.stack
        });
    }
  },

  callKrakenAPI: async function (req, res) {
    var data = await sails
      .helpers
      .krakenApi();
    return res.json({
      status: 200,
      "data": data
    });
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

  sendTokenComingSoonForm: async function (req, res) {
    return res.view('pages/tokenComingSoon');
  },

  getContactInfo: async function (req, res) {
    let adminSettingDetails = await AdminSetting.find({
      where: {
        deleted_at: null,
        or: [{
          slug: 'fb_profile'
        }, {
          slug: 'linkedin_profile'
        },
        {
          slug: 'twitter_profile'
        }
        ]
      }
    });
    let contacts = {};
    adminSettingDetails.forEach(element => {
      contacts[element.slug] = element.value;
    });
    return res.json({
      status: 200,
      message: sails.__("contact details retrived success").message,
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
            .update({
              slug: key
            })
            .set({
              value: req.body[key]
            })
            .fetch();
        });
      if (contactDetails) {
        return res.json({
          status: 200,
          message: sails.__("Contact details updated success").message
        })
      } else {
        return res
          .status(500)
          .json({
            status: 500,
            "err": sails.__("Something Wrong").message,
            error_at: sails.__("Something Wrong").message
          });
      }
    } catch (error) {
      console.log('index', error)
      await logger.error(error.message)
    }
  },

  webhookOnReciveBitgo: async function (req, res) {
    if (req.body.state == "confirmed") {
      var bitgo = new BitGoJS.BitGo({
        env: sails.config.local.BITGO_ENV_MODE,
        accessToken: sails.config.local.BITGO_ACCESS_TOKEN
      });
      var wallet = await bitgo
        .coin(req.body.coin)
        .wallets()
        .get({
          id: req.body.wallet
        });
      let transferId = req.body.transfer;
      wallet
        .getTransfer({
          id: transferId
        })
        .then(async function (transfer) {
          if (transfer.state == "confirmed") {
            // Object Of receiver
            let dest = transfer.outputs[0];
            // Object of sender
            let source = transfer.outputs[1];
            // receiver wallet
            let userWallet = await Wallet.findOne({
              receive_address: dest.address,
              deleted_at: null,
              is_active: true
            });
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
                .update({
                  id: userWallet.id
                })
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
    // let user_id = 1347;
    // let slug = 'kyc'
    let data = await sails.helpers.notification.checkAdminWalletNotification();
    return res.json({
      success: true
    });
  },

  getEncryptKey: async function (req, res) {
    var key = sails.config.local.key;
    var iv = sails.config.local.iv;
    console.log(key);
    console.log(iv)
    var value = req.body.encryptKey;
    console.log(value);
    var encryptData = await sails.helpers.getEncryptData(value);
    console.log("encryptData", encryptData);
    var decryptData = await sails.helpers.getDecryptData(encryptData);
    console.log("decryptData", decryptData)
    return res.json(200);
  },

  queryTestThresold: async function (req, res) {
    let data = await sails.helpers.notification.checkTheresoldNotification();
    return res.json({
      success: true
    });
  },

  enableWebSocket: async function (req, res) {
    try {
      return res
        .status(101)
        .json({
          status: 101
        });
    } catch (error) {
      // console.log("error :: ", error);
      return res
        .status(500)
        .json({
          status: 500,
          err: sails.__("Something Wrong").message,
          error_at: error.stack
        })
    }
  },

  createAllWallet: async function (req, res) {
    await sails
      .helpers
      .wallet
      .createAll();
    return res.end();
  },

  createWallet: async function (req, res) {

    var {
      coin_code,
      wallet_type
    } = req.allParams();

    await sails
      .helpers
      .wallet
      .create(coin_code, wallet_type);
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
  // testemail: function (req, res) {
  //   sails
  //     .hooks
  //     .email.send("testemail", {}, {
  //       to: "ankit.morker@openxcellinc.com",
  //       subject: "test email"
  //     }, function (err) {
  //       if (!err) {
  //         return res.json({
  //           "status": 200,
  //           "message": "dkhsd"
  //         });
  //       }
  //     });
  // },

  testMetabaseIntegrate: async function (req, res) {
    var frameURL = await sails.helpers.metabaseSetup();
    return res.json({
      "status": 200,
      "data": frameURL
    })
  },

  testPanicStatus: async function (req, res) {
    try {
      var panicStatus = await AdminSetting.findOne({
        where: {
          deleted_at: null,
          slug: 'panic_status'
        }
      })

      return res
        .status(200)
        .json({
          "status": 200,
          "message": sails.__("panic button status").message,
          "data": panicStatus.value
        })
    } catch (error) {
      console.log(error);
    }
  },

  checkSystemHealth: async function (req, res) {
    try {
      var system_health = await AdminSetting.findOne({
        where: {
          deleted_at: null,
          slug: 'system_health'
        }
      })

      if (system_health && system_health.value == "ok_from_db") {
        return res.status(200).json({
          "status": 200,
          "message": sails.__("system_health_ok").message,
        })
      }
      return res.status(500).json({
        "status": 500,
        "message": sails.__("system_health_not_ok").message,
        error_at: sails.__("system_health_not_ok").message
      })
    } catch (error) {
      return res.status(500).json({
        "status": 500,
        "message": sails.__("system_health_not_ok").message,
        error_at: error.stack
      })
    }
  },

  getResponseData: async function (req, res) {
    try {
      var dataObject = {
        "1": "1",
        "2": "2"
      }
      return res
        .status(200)
        .json({
          "status": 200,
          "message": "object retrive success",
          "data": dataObject
        })
    } catch (error) {
      console.log(error);
    }
  },

  getDatabaseRetrieve: async function (req, res) {
    try {
      var getDataValue = await Pairs.find({
        where: {
          deleted_at: null,
          is_active: true,
          name: {
            contains: "ETH-BTC"
          }
        }
      })

      return res
        .status(200)
        .json({
          "status": 200,
          "message": "Database retrieve success",
          "data": getDataValue
        })
    } catch (error) {
      console.log(error)
    }
  }
};
