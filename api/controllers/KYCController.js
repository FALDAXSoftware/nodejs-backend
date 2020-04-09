/**
 * KYCController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
var UploadFiles = require('../services/UploadFiles');
var csc = require('country-state-city');
var logger = require("./logger");
const uuidv1 = require('uuid/v1');
var randomize = require('randomatic');

module.exports = {

  /**
   * API for updating kyc information
   * Renders this api when kyc info needs to be updated
   *
   * @param <kyc related all information>
   *
   * @return <KYC update success message or error data>
   */

  updateKYCInfo: async function (req, res) {
    try {
      let user_id = req.user.id;
      req.body.user_id = user_id;
      let kyc_details = await KYC.findOne({
        user_id
      });
      req.body.city = req.body.city_town;

      if (kyc_details) {
        if (kyc_details.steps == 3) {
          return res.json({
            'status': 200,
            'message': sails.__('KYC Updated').message
          })
        }

        if (req.body.front_doc) {
          let extension = req
            .body
            .front_doc
            .split('.');
          let filename = new Date()
            .getTime()
            .toString();
          filename += '.' + extension[extension.length - 1];
          await UploadFiles.upload(req.body.front_doc, 'kyc/' + filename)
          req.body.front_doc = 'kyc/' + filename;
        }

        if (req.body.back_doc) {
          let extension = req
            .body
            .back_doc
            .split('.');
          let filename = new Date()
            .getTime()
            .toString();
          filename += '.' + extension[extension.length - 1];
          await UploadFiles.upload(req.body.back_doc, 'kyc/' + filename)
          req.body.back_doc = 'kyc/' + filename;
        }

        req.body.created_at = new Date();
        if (req.body.steps == 3) {
          req.body['status'] = false;
        }
        var updated_kyc;
        updated_kyc = await KYC
          .update({
            id: kyc_details.id
          })
          .set(req.body)
          .fetch();

        // var user_value = await Users.findOne({
        //   where: {
        //     deleted_at: null,
        //     is_active: true,
        //     id: user_id
        //   }
        // });

        // if (user_value != undefined) {
        //   var user_update = await Users.
        //     update({
        //       deleted_at: null,
        //       is_active: true,
        //       id: user_id
        //     })
        //     .set({
        //       phone_number: req.body.phone_number
        //     })
        // }
        if (updated_kyc) {
          // KYC API start if (updated_kyc[0].steps == 3) {     var greeting = await
          // sails.helpers.kycpicUpload(updated_kyc[0]);     console.log('greeting',
          // greeting);     return res.json({ 'status': 200, 'message': sails.__('Update
          // KYC').message }) } KYC API end
          return res.json({
            'status': 200,
            'message': sails.__('Update KYC').message
          })
        } else {
          return res
            .status(400)
            .json({
              'status': 400,
              'message': sails.__('Update KYC').message
            })
        }
      } else {
        let kyc_created = await KYC
          .create(req.body)
          .fetch();

        var user_value = await Users.findOne({
          where: {
            deleted_at: null,
            is_active: true,
            id: user_id
          }
        });

        if (user_value != undefined) {
          var user_update = await Users.
            update({
              deleted_at: null,
              is_active: true,
              id: user_id
            })
            .set({
              phone_number: req.body.phone_number
            })
        }
        if (kyc_created) {
          return res.json({
            'status': 200,
            'message': sails.__('Create KYC').message
          })
        } else {
          return res
            .status(400)
            .json({
              'status': 400,
              'message': sails.__('Create KYC').message
            })
        }
      }
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

  /**
   * API for uploading kyc documents
   * Renders this api when kyc documents needs to be uploaded
   *
   * @param <frontimage and backimage>
   *
   * @return <document uploaded success message or error data>
   */

  uploadKYCDoc: async function (req, res) {
    try {
      // console.log(req.file('image'));
      console.log(req._fileparser.upstreams.length)
      if (req._fileparser.upstreams.length) {
        req
          .file('image')
          .upload(function (error, file) {
            console.log(file[0])
            console.log((file[0].size) > 5242880)
            // console.log(error);
            if (error) {
              return res
                .status(500)
                .json({
                  "status": 500,
                  "err": sails.__("Something Wrong").message,
                  error_at: error.stack
                })
            } else if ((file[0].size) > 5242880) {
              return res
                .status(500)
                .json({
                  status: 500,
                  "err": sails.__("File Max Size").message,
                  error_at: sails.__("Something Wrong").message
                });
            } else {
              if (file.length <= 0) {
                return res
                  .status(500)
                  .json({
                    status: 500,
                    "err": sails.__("Something Wrong").message,
                    error_at: sails.__("Something Wrong").message
                  });
              }
              return res.json({
                'status': 200,
                'message': sails.__('KYC Doc Upload').message,
                data: file[0].fd
              })
            }
          });
      } else {
        return res.status(200).json({
          'status': 200,
          'message': sails.__("Image Required").message
        })
      }
    } catch (error) {
      // console.log("errrrr:", error);
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

  callbackKYC: async function (req, res) {
    let data = req.body;


    let resultState = {
      "A": "ACCEPT",
      "D": "DENY",
      "R": "REVIEW"
    }
    if (data) {
      try {
        if (data.ednaScoreCard) {
          if (data.ednaScoreCard.er) {
            if (data.ednaScoreCard.er.reportedRule) {
              let updated = await KYC
                .update({
                  mtid: data.mtid
                })
                .set({
                  kyc_doc_details: data.ednaScoreCard.er.reportedRule.details ?
                    data.ednaScoreCard.er.reportedRule.details : '',
                  direct_response: resultState[data.state],
                  webhook_response: resultState[data.state]
                })
                .fetch();

              if (resultState[data.state] == "ACCEPT") {
                // Send email notification
                var user_data_kyc = await KYC.findOne({
                  mtid: data.mtid
                });

                // var tier_step = parseInt(user_data.account_tier) + 1;
                var user_data = await Users
                  .update({
                    id: user_data_kyc.user_id,
                    deleted_at: null,
                    is_active: true
                  })
                  .set({
                    account_tier: parseInt(user_data_kyc.account_tier) + 1
                  })
                  .fetch()

                console.log("user_data", user_data[0])

                var userNotification = await UserNotification.findOne({
                  user_id: user_data[0].id,
                  deleted_at: null,
                  slug: 'kyc_approved'
                })

                console.log("userNotification", userNotification)
                if (userNotification != undefined) {
                  if (userNotification.email == true || userNotification.email == "true") {
                    if (user_data[0].email != undefined)
                      await sails.helpers.notification.send.email("kyc_approved", user_data[0])
                  }
                  if (userNotification.text == true || userNotification.text == "true") {
                    if (user_data[0].phone_number != undefined && user_data[0].phone_number != null && user_data[0].phone_number != '')
                      await sails.helpers.notification.send.text("kyc_approved", user_data[0])
                  }
                }
                // if (user_data[0] != undefined) {
                //   let slug = 'kyc_approved';
                //   let template = await EmailTemplate.findOne({
                //     slug
                //   });
                //   let user_language = (user_data[0].default_language ? user_data[0].default_language : 'en');
                //   let language_content = template.all_content[user_language].content;
                //   let language_subject = template.all_content[user_language].subject;
                //   let emailContent = await sails
                //     .helpers
                //     .utilities
                //     .formatEmail(language_content, {
                //       recipientName: user_data[0].first_name
                //     })
                //   console.log("user_data[0].email", user_data[0].email)
                //   sails
                //     .hooks
                //     .email
                //     .send("general-email", {
                //       content: emailContent
                //     }, {
                //       to: user_data[0].email,
                //       subject: language_subject
                //     }, function (err) {
                //       if (err) {
                //         console.log("err in sending email, while kyc approved", err);
                //       }
                //     })
                // }
              } else if (resultState[data.state] == "DENY") {
                var user_data_kyc = await KYC.findOne({
                  mtid: data.mtid
                });

                var user_data = await Users.find({
                  where: {
                    id: user_data_kyc.user_id,
                    deleted_at: null,
                    is_active: true
                  }
                })

                console.log("user_data", user_data[0])

                var userNotification = await UserNotification.findOne({
                  user_id: user_data[0].id,
                  deleted_at: null,
                  slug: 'kyc_rejected'
                })

                if (userNotification != undefined) {
                  if (userNotification.email == true || userNotification.email == "true") {
                    if (user_data[0].email != undefined)
                      await sails.helpers.notification.send.email("kyc_rejected", user_data[0])
                  }
                  if (userNotification.text == true || userNotification.text == "true") {
                    if (user_data[0].phone_number != undefined && user_data[0].phone_number != null && user_data[0].phone_number != '')
                      await sails.helpers.notification.send.text("kyc_rejected", user_data[0])
                  }
                }

                console.log("user_data[0]", user_data[0])
                // if (user_data[0] != undefined) {
                //   let slug = 'kyc_rejected';
                //   let template = await EmailTemplate.findOne({
                //     slug
                //   });
                //   console.log(template)
                //   let user_language = (user_data[0].default_language ? user_data[0].default_language : 'en');
                //   let language_content = template.all_content[user_language].content;
                //   let language_subject = template.all_content[user_language].subject;
                //   let emailContent = await sails
                //     .helpers
                //     .utilities
                //     .formatEmail(language_content, {
                //       recipientName: user_data[0].first_name
                //     })

                //   console.log("emailContent", emailContent)
                //   console.log("user_data[0].email", user_data[0].email)
                //   sails
                //     .hooks
                //     .email
                //     .send("general-email", {
                //       content: emailContent
                //     }, {
                //       to: user_data[0].email,
                //       subject: language_subject
                //     }, function (err) {
                //       if (err) {
                //         console.log("err in sending email, while kyc approved", err);
                //       }
                //     })
                // }

              }
            }
          }
        }
      } catch (err) {
        // console.log(err);

        if (data.mtid) {
          let updated = await KYC
            .update({
              mtid: data.mtid
            })
            .set({
              kyc_doc_details: 'Something went wrong',
              webhook_response: 'MANUAL_REVIEW'
            })
            .fetch();
        }
      }
    }
    res.end();
  },

  /**
   * API for getting user kyc details
   * Renders this api when user kyc data need to be egt
   *
   * @param <>
   *
   * @return <User KYC data or error data>
   */

  getKYCDetails: async function (req, res) {
    try {
      let user_id = req.user.id;
      let KYCData = await KYC.findOne({
        user_id
      });
      if (KYCData) {
        KYCData.city_town = KYCData.city;
        delete KYCData.city;

        if (KYCData.country) {
          let AllCountries = csc.getAllCountries();
          KYCData["countryJsonId"] = null;
          for (let index = 0; index < AllCountries.length; index++) {
            const element = AllCountries[index];
            if (element.name == KYCData.country) {
              KYCData["countryJsonId"] = element.id
            }
          }

          if (KYCData.state) {
            let allStates = csc.getStatesOfCountry(KYCData["countryJsonId"]);
            KYCData["stateJsonId"] = null;
            for (let index = 0; index < allStates.length; index++) {
              const element = allStates[index];
              if (element.name == KYCData.state) {
                KYCData["stateJsonId"] = element.id
              }
            }
          }
        }
      }

      var kycCron = await sails
        .helpers
        .kycCron();

      if (KYCData == undefined) {
        KYCData = [];
        return res.json({
          "status": 200,
          "message": sails.__("KYC Data success").message,
          "data": KYCData
        });
      } else if (KYCData) {
        return res.json({
          "status": 200,
          "message": sails.__("KYC Data success").message,
          "data": KYCData
        });
      } else {
        return res
          .status(500)
          .json({
            status: 500,
            "err": sails.__("No KYC").message,
            error_at: sails.__("No KYC").message
          });
      }
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

  getAllKYCData: async function (req, res) {
    try {
      let {
        page,
        limit,
        data,
        sortCol,
        sortOrder,
        start_date,
        end_date,
        status
      } = req.allParams();
      let query = " from kyc LEFT JOIN users ON kyc.user_id = users.id ";

      query += ' WHERE kyc.deleted_at IS NULL'
      let whereAppended = false;
      if ((data && data != "")) {
        query += " AND"
        whereAppended = true;
        if (data && data != "" && data != null) {
          query += " (LOWER(kyc.first_name) LIKE '%" + data.toLowerCase() + "%' OR LOWER(users.country) LIKE '%" + data.toLowerCase() + "%' OR LOWER(kyc.last_name) LIKE '%" + data.toLowerCase() + "%' OR LOWER(kyc.mtid) LIKE '%" + data.toLowerCase() + "%'OR LOWER(users.email) LIKE '%" + data.toLowerCase() + "%' OR LOWER(kyc.direct_response) LIKE '%" + data.toLowerCase() + "%')";
        }
      }

      if (status && status != "") {
        query += " AND"
        query += " kyc.direct_response = '" + status + "'";
        whereAppended = true;
      }

      if (start_date && end_date) {
        query += " AND"
        // query += whereAppended ?
        //   " AND " :
        //   " WHERE ";

        query += " kyc.created_at >= '" + await sails
          .helpers
          .dateFormat(start_date) + " 00:00:00' AND kyc.created_at <= '" + await sails
            .helpers
            .dateFormat(end_date) + " 23:59:59'";
      }
      countQuery = query;
      console.log(query)
      if (sortCol && sortOrder) {
        var sortVal
        if (sortCol = "account_tier") {
          sortVal = (sortOrder == 'descend' ?
            'DESC' :
            'ASC');
          query += " ORDER BY users." + sortCol + " " + sortVal;
        } else {
          sortVal = (sortOrder == 'descend' ?
            'DESC' :
            'ASC');
          query += " ORDER BY kyc." + sortCol + " " + sortVal;
        }

      } else {
        query += " ORDER BY kyc.id DESC";
      }

      query += " limit " + limit + " offset " + (parseInt(limit) * (parseInt(page) - 1))
      console.log(query);
      let KYCData = await sails.sendNativeQuery("Select kyc.*, users.email, users.account_tier" + query, [])

      KYCData = KYCData.rows;
      console.log("Select COUNT(kyc.id)" + countQuery)
      let KYCCount = await sails.sendNativeQuery("Select COUNT(kyc.id)" + countQuery, [])
      KYCCount = KYCCount.rows[0].count;

      if (KYCData) {
        return res.json({
          "status": 200,
          "message": sails.__("KYC list").message,
          "data": KYCData,
          KYCCount
        });
      }
    } catch (error) {
      // console.log("err", error);
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

  getUserKYCDetails: async function (req, res) {
    try {
      let {
        user_id
      } = req.allParams();

      let KYCData = await KYC.findOne({
        user_id
      });
      if (KYCData) {
        return res.json({
          "status": 200,
          "message": sails.__("KYC Data success").message,
          "data": KYCData
        });
      } else {
        return res
          .status(500)
          .json({
            status: 500,
            "err": sails.__("No KYC").message,
            error_at: sails.__("No KYC").message
          });
      }
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

  userDocumentUpload: async function (req, res) {
    try {

      var flagReUpload = req.body.reupload;
      console.log("req.body", req.body)

      if (req.body.ssn) {

        console.log("INSIDE IF")

        var getTierDetails = await TierRequest.findOne({
          where: {
            deleted_at: null,
            user_id: req.user.id,
            type: 3
          }
        });
        if (flagReUpload == true) {
          var getTierDetails = await TierRequest.findOne({
            where: {
              deleted_at: null,
              user_id: req.user.id,
              type: 3
            }
          });

          if (getTierDetails.is_approved == true || getTierDetails.is_approved == null) {
            return res
              .status(500)
              .json({
                status: 500,
                "err": sails.__("Your Current is approved or under approval").message
              })
          }
        }
        var value = req.body.ssn;

        var userData = await Users.findOne({
          where: {
            id: req.user.id,
            deleted_at: null,
            is_active: true
          }
        });

        if (getTierDetails != undefined) {
          var updateDetails = await TierRequest
            .update({
              deleted_at: null,
              user_id: req.user.id,
              type: 3
            })
            .set({
              unique_key: randomize('Aa0', 10),
              ssn: value,
              is_approved: null
            })
        } else {
          await TierRequest.create({
            unique_key: randomize('Aa0', 10),
            user_id: req.user.id,
            tier_step: parseInt(userData.account_tier) + 1,
            created_at: new Date(),
            ssn: value,
            type: 3
          })
        }
      }



      var dataBody = req.body;
      var tierDetailsValue = await TierRequest.find({
        where: {
          deleted_at: null,
          user_id: req.user.id
        }
      });

      var tierDetails = await TierRequest.find({
        where: {
          deleted_at: null,
          tier_step: 2,
          user_id: req.user.id,
          is_approved: false
        }
      })

      console.log("dataBody", dataBody);
      console.log("tierDetails", tierDetailsValue)
      console.log("tierDetailsValue.length", tierDetailsValue.length)

      if (tierDetailsValue.length == 1) {
        req
          .file('valid_id')
          .upload(async function (error, uploadFile) {
            try {
              console.log("error", error)
              console.log("uploadFile", uploadFile)
              var data = {};
              data.user_id = req.user.id;
              data.file = uploadFile[0]
              data.description = randomize('Aa0', 10);
              data.type = 1;
              console.log("data", data)
              var dataValue = await sails.helpers.uploadTierDocument(data)
            } catch (error) {
              console.log(error);
            }
          });

        req
          .file('residence_proof')
          .upload(async function (error1, uploadFile1) {
            try {
              console.log(uploadFile1)
              var data1 = {};
              data1.user_id = req.user.id;
              data1.file = uploadFile1[0]
              data1.description = randomize('Aa0', 10);
              data1.type = 2;

              var dataValue1 = await sails.helpers.uploadTierDocument(data1)

              return res.json(dataValue1)
            } catch (error1) {
              console.log(error1);
            }
          });
      } else if (((dataBody.valid_id_flag == true || dataBody.valid_id_flag == "true") && (dataBody.proof_residence_flag == true || dataBody.proof_residence_flag == "true")) && tierDetails != undefined) {
        var flag = 0;
        for (var i = 0; i < tierDetails.length; i++) {
          if (tierDetails[i].type != 3) {
            if (tierDetails[i].is_approved == false) {
              flag = parseInt(flag) + 1;
            }
          }
        }

        if (flag = 2) {
          req
            .file('valid_id')
            .upload(async function (error, uploadFile) {
              try {
                var data = {};
                data.user_id = user_id;
                data.file = uploadFile[0]
                data.description = randomize('Aa0', 10);
                data.type = 1;

                var dataValue = await sails.helpers.uploadTierDocument(data)

              } catch (error) {
                console.log(error);
              }
            });

          req
            .file('residence_proof')
            .upload(async function (error1, uploadFile1) {
              try {
                console.log(uploadFile1)
                var data1 = {};
                data1.user_id = req.user.id;
                data1.file = uploadFile1[0]
                data1.description = randomize('Aa0', 10);
                data1.type = 2;

                var dataValue1 = await sails.helpers.uploadTierDocument(data1)

                return res.json(dataValue1)
              } catch (error1) {
                console.log(error1);
              }
            });
        } else {
          return res
            .status(500)
            .json({
              status: 500,
              "err": sails.__("Your Current is approved or under approval")
            })
        }
      } else if ((dataBody.valid_id_flag == true || dataBody.valid_id_flag == "true") && tierDetails != undefined) {
        var flag = false;
        console.log("flag", flag)
        for (var i = 0; i < tierDetails.length; i++) {
          console.log("tierDetails[i].type", tierDetails[i].type)
          if (tierDetails[i].type == 1) {
            console.log("tierDetails[i].is_approved", tierDetails[i].is_approved)
            if (tierDetails[i].is_approved == false) {
              flag = true;
            }
          }
        }
        console.log("flag after", flag)
        if (flag == true) {
          req
            .file('valid_id')
            .upload(async function (error, uploadFile) {
              try {
                var data = {};
                data.user_id = req.user.id;
                data.file = uploadFile[0]
                data.description = randomize('Aa0', 10);
                data.type = 1;

                var dataValue = await sails.helpers.uploadTierDocument(data)

                return res.json(dataValue);

              } catch (error) {
                console.log(error);
              }
            });
        } else {
          return res
            .status(500)
            .json({
              status: 500,
              "err": sails.__("Your Current is approved or under approval").message
            })
        }
      } else if ((dataBody.proof_residence_flag == true || dataBody.proof_residence_flag == "true") && tierDetails != undefined) {
        var flag = false;
        for (var i = 0; i < tierDetails.length; i++) {
          if (tierDetails[i].type == 2) {
            if (tierDetails[i].is_approved == false) {
              flag = true;
            }
          }
        }
        console.log("after flag", flag)
        if (flag == true) {
          req
            .file('residence_proof')
            .upload(async function (error1, uploadFile1) {
              try {
                console.log(error1);
                console.log(uploadFile1)
                var data1 = {};
                data1.user_id = req.user.id;
                data1.file = uploadFile1[0]
                data1.description = randomize('Aa0', 10);
                data1.type = 2;

                console.log(data1)
                var dataValue1 = await sails.helpers.uploadTierDocument(data1)

                return res.json(dataValue1)
              } catch (error1) {
                console.log(error1);
              }
            });
        } else {
          return res
            .status(500)
            .json({
              status: 500,
              "err": sails.__("Your Current is approved or under approval").message
            })
        }
      }

    } catch (error) {
      console.log(error)
    }
  }
};
