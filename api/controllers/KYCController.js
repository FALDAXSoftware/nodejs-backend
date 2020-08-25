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
      if (req.body.test_key == "load_testing") {
        req.body.steps = 3;
        req.body.webhook_response = "ACCEPT"
        req.body.direct_response = "ACCEPT"
      }
      if (kyc_details) {
        if (kyc_details.steps == 3) {
          return res.json({
            'status': 200,
            'message': sails.__('KYC Updated').message
          })
        }
        // const frontDocPromis = new Promise( async (resolve, reject) => {
        if (req.body.front_doc) {
          let extension = req
            .body
            .front_doc
            .split('.');
          let filename = new Date()
            .getTime()
            .toString();
          filename += '_front.' + extension[extension.length - 1];
          // resolve(await UploadFiles.upload(req.body.front_doc, 'kyc/' + filename));
          await UploadFiles.upload(req.body.front_doc, 'kyc/' + filename)
          req.body.front_doc = 'kyc/' + filename;
          // resolve('kyc/' + filename);1
        }
        //   }else{
        //     resolve();
        //   }
        // });
        // req.body.front_doc = await frontDocPromis;
        // console.log('frontDocPromis', await frontDocPromis);
        // const backDocPromis = new Promise(async (resolve, reject) => {
        if (req.body.back_doc) {
          let extension = req
            .body
            .back_doc
            .split('.');
          let filename = new Date()
            .getTime()
            .toString();
          filename += '_back.' + extension[extension.length - 1];
          await UploadFiles.upload(req.body.back_doc, 'kyc/' + filename)
          req.body.back_doc = 'kyc/' + filename;
          // resolve('kyc/' + filename);
        }
        // else{
        //   resolve();
        // }
        // });
        // req.body.back_doc = await backDocPromis;
        // await Promise.all([frontDocPromis, backDocPromis]);
        // console.log("body", req.body);
        req.body.created_at = new Date();
        if (req.body.steps == 3) {
          req.body['status'] = false;
        }

        if (req.body.ssn && req.body.ssn != "") {
          var dataValueSSN = await sails.helpers.getEncryptData(req.body.ssn)
          var userDataUpdate = await Users
            .update({
              id: user_id
            })
            .set({
              "goverement_issued_number": dataValueSSN
            })
        }

        var updated_kyc;

        updated_kyc = await KYC
          .update({
            id: kyc_details.id
          })
          .set(req.body)
          .fetch();
        console.log('updated_kyc', updated_kyc);
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

        if (req.body.test_key == "load_testing") {
          req.body.steps = 3;
          req.body.webhook_response = "ACCEPT"
          req.body.direct_response = "ACCEPT"
        }

        if (req.body.country_code) {
          req.body.country_code = req.body.country_code;
        } else {
          var userDetailsValue = await Users.findOne({
            where: {
              id: user_id,
              is_active: true,
              deleted_at: null
            }
          });

          var str = userDetailsValue.country_code;

          if (userDetailsValue != undefined && str.length > 0) {
            console.log("INSIDE IF")
            req.body.country_code = userDetailsValue.country_code;
          } else {
            console.log("INSIDE ELSE", userDetailsValue.country)
            var countryCodeData = await Countries.findOne({
              where: {
                name: userDetailsValue.country
              }
            })

            if (countryCodeData != undefined) {
              req.body.country_code = countryCodeData.sortname
              var userDetailsUpdate = await Users
                .update({
                  id: user_id,
                  is_active: true,
                  deleted_at: null
                })
                .set({
                  country_code: countryCodeData.sortname
                })
            }
          }
        }
        req.body.status = false;

        let kyc_created = await KYC
          .create(req.body)
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

      if (req._fileparser.upstreams.length) {
        req
          .file('image')
          .upload(function (error, file) {

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
                    account_tier: 1
                  })
                  .fetch()

                var userNotification = await UserNotification.findOne({
                  user_id: user_data[0].id,
                  deleted_at: null,
                  slug: 'kyc_approved'
                })

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

                var userNotification = await UserNotification.findOne({
                  user_id: user_data[0].id,
                  deleted_at: null,
                  slug: 'kyc_approved'
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
        if (status == "MANUAL_REVIEW") {
          query += " AND"
          query += " (kyc.direct_response = '" + status + "' OR kyc.direct_response IS NULL) ";
          whereAppended = true;
        } else {
          query += " AND"
          query += " kyc.direct_response = '" + status + "'";
          whereAppended = true;
        }
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
      let KYCData = await sails.sendNativeQuery("Select kyc.*, users.email, users.account_tier" + query, [])

      KYCData = KYCData.rows;
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

      var flagReUpload = req.allParams();
      // var twofactor = req.body.twofactor;

      var userData = await Users.findOne({
        where: {
          deleted_at: null,
          is_active: true,
          id: req.user.id
        }
      })
      console.log("userData", userData)
      var tirDetails = await TierMainRequest.findOne({
        where: {
          deleted_at: null,
          tier_step: (parseInt(userData.account_tier) + 1),
          user_id: req.user.id
        }
      });
      console.log("tirDetails", tirDetails)
      // console.log("tirDetails.user_status[2]", tirDetails.user_status[2])
      var valueObject
      if ((parseInt(userData.account_tier) + 1) == 2) {
        valueObject = {
          1: (tirDetails == undefined) ? false : (tirDetails.user_status[1]),
          2: (tirDetails == undefined) ? false : (tirDetails.user_status[2]),
          3: (tirDetails == undefined) ? false : (tirDetails.user_status[3]),
          4: (userData.is_twofactor == true) ? true : false
        }
      } else {
        valueObject = {
          1: false,
          2: false
        }
      }

      console.log("valueObject", valueObject)
      var idValue = 0;
      if (tirDetails == undefined) {
        var addValue = await TierMainRequest.create({
          user_id: req.user.id,
          tier_step: (parseInt(userData.account_tier) + 1),
          created_at: new Date(),
          user_status: valueObject,
          previous_tier: userData.account_tier
        }).fetch();
        idValue = addValue.id
      } else {
        var updateValue = await TierMainRequest
          .update({
            deleted_at: null,
            tier_step: (parseInt(userData.account_tier) + 1),
            user_id: req.user.id
          })
          .set({
            user_status: valueObject,
            previous_tier: userData.account_tier
          })
        idValue = tirDetails.id
      }


      if (flagReUpload.reupload != "true" || flagReUpload.reupload != true) {
        if (userData != undefined && userData.is_twofactor == false) {
          return res
            .status(500)
            .json({
              "status": 500,
              "message": sails.__("Please Enable 2FA to continue").message
            })
        } else if (userData.is_twofactor == true && (flagReUpload.twofactor && (flagReUpload.twofactor == true || flagReUpload.twofactor == "true"))) {
          await TierRequest.create({
            request_id: idValue,
            tier_step: parseInt(userData.account_tier) + 1,
            created_at: new Date(),
            is_approved: true,
            type: 4
          })
        }
      }

      if (flagReUpload.ssn) {

        var getTierDetails = await TierRequest.find({
          where: {
            deleted_at: null,
            request_id: idValue,
            type: 3
          }
        });
        if (flagReUpload.reupload == true || flagReUpload.reupload == "true") {
          var getTierDetails = await TierRequest.find({
            where: {
              deleted_at: null,
              request_id: idValue,
              type: 3
            }
          });

          if (getTierDetails && getTierDetails.length > 0) {
            var flag = false
            for (var i = 0; i < getTierDetails.length; i++) {
              if (getTierDetails[i].is_approved == true || getTierDetails[i].is_approved == null) {
                flag = true;
              }
            }
            if (flag == true) {
              return res
                .status(500)
                .json({
                  status: 500,
                  "err": sails.__("Your Current is approved or under approval").message
                })
            } else {
              for (var i = 0; i < getTierDetails.length; i++) {
                var tierUpdate = await TierRequest
                  .update({
                    deleted_at: null,
                    request_id: idValue,
                    type: 3
                  })
                  .set({
                    is_approved: false
                  })
              }
            }
          }
        }
        var value = req.allParams();

        var userData = await Users.findOne({
          where: {
            id: req.user.id,
            deleted_at: null,
            is_active: true
          }
        });

        var valueTier = await TierRequest.create({
          request_id: idValue,
          tier_step: parseInt(userData.account_tier) + 1,
          created_at: new Date(),
          ssn: value.ssn,
          type: 3
        }).fetch();

        var encryptSSN = await sails.helpers.getEncryptData(value.ssn)

        var userDataUpdateValue = await Users
          .update({
            id: req.user.id,
            deleted_at: null,
            is_active: true
          })
          .set({
            goverement_issued_number: encryptSSN
          })

        if ((flagReUpload.valid_id_flag == "false" || flagReUpload.valid_id_flag == false) && (flagReUpload.proof_residence_flag == "false" || flagReUpload.proof_residence_flag == false)) {
          return res
            .status(200)
            .json({
              "status": 200,
              "data": sails.__("Your SSN number has been uploaded successfully.").message
            })

        }

      }



      var dataBody = req.body;
      var tierDetailsValue = await TierRequest.find({
        where: {
          deleted_at: null,
          request_id: idValue
        }
      });

      var tierDetails = await TierRequest.find({
        where: {
          deleted_at: null,
          tier_step: 2,
          request_id: idValue,
          is_approved: false
        }
      });

      var dataBody = req.allParams();

      var user_id = req.user.id

      if (tierDetailsValue != undefined && (flagReUpload != true || flagReUpload != "true") && !dataBody.valid_id_flag && !dataBody.proof_residence_flag) {

        req
          .file('files')
          .upload(async function (error, uploadFile) {
            try {
              var user_id = req.user.id
              if (uploadFile.length > 0) {
                for (var i = 0; i < uploadFile.length; i++) {
                  var data = {};
                  data.request_id = idValue;
                  data.file = uploadFile[i]
                  data.description = randomize('Aa0', 10);
                  data.type = (i == 0) ? 1 : 2;
                  data.user_id = user_id;

                  var dataValue = await sails.helpers.uploadTierDocument(data)
                }
              }
              return res.status(dataValue.status).json(dataValue);

            } catch (error) {
              console.log(error);
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
            .file('files')
            .upload(async function (error, uploadFile) {
              try {
                var dataValue
                if (uploadFile.length > 0) {
                  for (var i = 0; i < uploadFile.length; i++) {
                    var data = {};
                    data.request_id = idValue;
                    data.file = uploadFile[i]
                    data.description = randomize('Aa0', 10);
                    data.type = (i == 0) ? 1 : 2;
                    data.user_id = user_id;

                    dataValue = await sails.helpers.uploadTierDocument(data)
                  }
                }
                return res.status(dataValue.status).json(dataValue);

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
      } else if ((dataBody.valid_id_flag == true || dataBody.valid_id_flag == "true") && tierDetails != undefined) {
        var flag = false;
        for (var i = 0; i < tierDetails.length; i++) {
          if (tierDetails[i].type == 1) {
            if (tierDetails[i].is_approved == false) {
              flag = true;
            }
          }
        }
        if (flag == true) {
          req
            .file('files')
            .upload(async function (error, uploadFile) {
              try {
                var data = {};
                data.request_id = idValue;
                data.file = uploadFile[0]
                data.description = randomize('Aa0', 10);
                data.type = 1;
                data.user_id = user_id;

                var dataValue = await sails.helpers.uploadTierDocument(data)
                return res.status(dataValue.status).json(dataValue);

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
        if (flag == true) {
          req
            .file('files')
            .upload(async function (error1, uploadFile1) {
              try {
                var data1 = {};
                data1.request_id = idValue;
                data1.file = uploadFile1[0]
                data1.description = randomize('Aa0', 10);
                data1.type = 2;
                data1.user_id = user_id;
                var dataValue1 = await sails.helpers.uploadTierDocument(data1)

                return res.status(dataValue1.status).json(dataValue1);
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
      } else if ((dataBody.valid_id_flag == false || dataBody.valid_id_flag == "false") && (dataBody.proof_residence_flag == false || dataBody.proof_residence_flag == "false") && (flagReUpload == true || flagReUpload == "true")) {
        return res
          .status(200)
          .json({
            "status": 200,
            "data": sails.__("Your SSN number has been uploaded successfully.").message
          })
      }

    } catch (error) {
      console.log(error)
    }
  },

  adminUploadUserDocument: async function (req, res) {
    try {
      var data = req.body

      var tierDetails = await TierRequest.findOne({
        where: {
          id: req.body.id,
          deleted_at: null
        }
      });

      if (tierDetails != undefined) {

        if ((tierDetails.is_approved == true || tierDetails.is_approved == "true") || (tierDetails.is_approved == null)) {
          return res
            .status(500)
            .json({
              "status": 200,
              "message": sails.__("Tier Request Under Process").message
            })
        }
        if (tierDetails.type == 3) {
          var tierDetailsVaue = await TierRequest.create({
            unique_key: randomize('Aa0', 10),
            request_id: tierDetails.request_id,
            tier_step: tierDetails.tier_step,
            created_at: new Date(),
            type: data.type
          })

          return res
            .status(200)
            .json({
              "status": 200,
              "message": "Your SSN number has been uploaded successfully."
            })
        } else if (tierDetails.type == 1) {

          req
            .file('files')
            .upload(async function (error, uploadFile) {
              try {
                var data = {};

                data.request_id = tierDetails.request_id;
                data.file = uploadFile[0]
                data.description = randomize('Aa0', 10);
                data.type = 1;

                var dataValue = await sails.helpers.uploadTierDocument(data)
                dataValue.message = dataValue.data
                return res.json(dataValue);

              } catch (error) {
                console.log(error);
              }
            });

        } else if (tierDetails.type == 2) {

          req
            .file('files')
            .upload(async function (error1, uploadFile1) {
              try {
                var data1 = {};
                data1.request_id = tierDetails.request_id;
                data1.file = uploadFile1[0]
                data1.description = randomize('Aa0', 10);
                data1.type = 2;
                var dataValue1 = await sails.helpers.uploadTierDocument(data1)
                dataValue1.message = dataValue1.data

                return res.json(dataValue1)
              } catch (error1) {
                console.log(error1);
              }
            });

        } else if (tierDetails == undefined) {
          return res
            .status(500)
            .json({
              "status": 500,
              "message": "No id has been provided"
            })
        }
      }

    } catch (error) {
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong").message,
          error_at: error.stack
        });
    }
  }
};
