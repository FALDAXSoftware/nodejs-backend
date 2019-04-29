/**
 * KYCController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
var UploadFiles = require('../services/UploadFiles');

module.exports = {
  updateKYCInfo: async function (req, res) {
    try {
      let user_id = req.user.id;
      req.body.user_id = user_id;
      let kyc_details = await KYC.findOne({ user_id });
      req.body.city = req.body.city_town;

      console.log('kyc_details', kyc_details);
      if (kyc_details) {
        if (kyc_details.steps == 3) {
          return res.json({
            'status': 200,
            'message': sails.__('KYC Updated')
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
        console.log(req.body);
        if (req.body.test_key == sails.config.local.test_key) {
          console.log("INSIDE THIS :: ")
          req.body.isApprove = true;
          req.body.direct_response = "ACCEPT";
          req.body.webhook_response = "ACCEPT";
          req.body.steps = 1;
          updated_kyc = await KYC
            .update({ id: kyc_details.id })
            .set(req.body)
            .fetch();
        } else {
          updated_kyc = await KYC
            .update({ id: kyc_details.id })
            .set(req.body)
            .fetch();
        }
        if (updated_kyc) {
          // KYC API start if (updated_kyc[0].steps == 3) {     var greeting = await
          // sails.helpers.kycpicUpload(updated_kyc[0]);     console.log('greeting',
          // greeting);     return res.json({ 'status': 200, 'message': sails.__('Update
          // KYC') }) } KYC API end
          return res.json({
            'status': 200,
            'message': sails.__('Update KYC')
          })
        } else {
          return res
            .status(400)
            .json({
              'status': 400,
              'message': sails.__('Update KYC')
            })
        }
      } else {
        if (req.body.test_key == sails.config.local.test_key) {
          req.body.isApprove = true;
          req.body.direct_response = "ACCEPT";
          req.body.webhook_response = "ACCEPT";
          req.body.steps = 1;
        }
        let kyc_created = await KYC
          .create(req.body)
          .fetch();
        if (kyc_created) {
          return res.json({
            'status': 200,
            'message': sails.__('Create KYC')
          })
        } else {
          return res
            .status(400)
            .json({
              'status': 400,
              'message': sails.__('Create KYC')
            })
        }
      }
    } catch (e) {
      console.log(e);
      return res
        .status(500)
        .json({
          "status": 500,
          "err": sails.__("Something Wrong")
        })
    }
  },

  uploadKYCDoc: async function (req, res) {
    req
      .file('image')
      .upload(function (err, file) {
        if (err) {
          return res
            .status(500)
            .json({
              "status": 500,
              "err": sails.__("Something Wrong")
            })
        } else {
          if (file.length <= 0) {
            return res
              .status(500)
              .json({
                "status": 500,
                "err": sails.__("Something Wrong")
              })
          }
          return res.json({
            'status': 200,
            'message': sails.__('KYC Doc Upload'),
            data: file[0].fd
          })
        }
      });
  },

  callbackKYC: async function (req, res) {
    let data = req.body;
    console.log("call back call ----->>", JSON.stringify(req.body));
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
                .update({ mtid: data.mtid })
                .set({
                  kycDoc_details: data.ednaScoreCard.er.reportedRule.details
                    ? data.ednaScoreCard.er.reportedRule.details
                    : '',
                  direct_response: resultState[data.state],
                  webhook_response: resultState[data.state]
                })
                .fetch();
            }
          }
        }
      } catch (err) {
        if (data.mtid) {
          let updated = await KYC
            .update({ mtid: data.mtid })
            .set({ kycDoc_details: 'Something went wrong', webhook_response: 'MANUAL_REVIEW' })
            .fetch();
        }
      }
    }
    res.end();
  },

  getKYCDetails: async function (req, res) {
    try {
      let user_id = req.user.id;
      let KYCData = await KYC.findOne({ user_id });
      if (KYCData) {
        KYCData.city_town = KYCData.city;
        delete KYCData.city;
      }

      var kycCron = await sails
        .helpers
        .kycCron();

      if (KYCData == undefined) {
        KYCData = [];
        return res.json({ "status": 200, "message": "KYC Data", "data": KYCData });
      } else if (KYCData) {
        return res.json({ "status": 200, "message": "KYC Data", "data": KYCData });
      } else {
        return res
          .status(500)
          .json({
            status: 500,
            "err": sails.__("No KYC")
          });
      }
    } catch (e) {
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  },

  getAllKYCData: async function (req, res) {
    try {
      let { page, limit, data, sortCol, sortOrder } = req.allParams();
      let query = " from kyc LEFT JOIN users ON kyc.user_id = users.id ";
      if ((data && data != "")) {
        query += " WHERE"
        if (data && data != "" && data != null) {
          query += " LOWER(first_name) LIKE '%" + data.toLowerCase() +
            "%' OR LOWER(last_name) LIKE '%" + data.toLowerCase() +
            "%'OR LOWER(users.email) LIKE '%" + data.toLowerCase() +
            "%' OR LOWER(direct_response) LIKE '%" + data.toLowerCase() + "%'";
        }
      }

      countQuery = query;
      if (sortCol && sortOrder) {
        let sortVal = (sortOrder == 'descend'
          ? 'DESC'
          : 'ASC');
        query += " ORDER BY " + sortCol + " " + sortVal;
      }

      query += " limit " + limit + " offset " + (parseInt(limit) * (parseInt(page) - 1))

      let KYCData = await sails.sendNativeQuery("Select kyc.*, users.email" + query, [])

      KYCData = KYCData.rows;

      let KYCCount = await sails.sendNativeQuery("Select COUNT(kyc.id)" + countQuery, [])
      KYCCount = KYCCount.rows[0].count;

      if (KYCData) {
        return res.json({
          "status": 200,
          "message": sails.__("KYC list"),
          "data": KYCData,
          KYCCount
        });
      }
    } catch (err) {
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  },

  approveDisapproveKYC: async function (req, res) {
    try {
      let { id, isApprove } = req.body;
      let kyc_details = await KYC.findOne({ id });

      if (kyc_details) {
        if (isApprove == true) {
          let updated_kyc = await KYC
            .update({ id: kyc_details.id })
            .set({ direct_response: 'ACCEPT', webhook_response: 'ACCEPT', isApprove: true, updated_at: new Date() })
            .fetch();
          if (updated_kyc) {
            return res.json({ 'status': 200, 'message': 'KYC application approved' })
          }
        } else {
          let updated_kyc = await KYC
            .update({ id: kyc_details.id })
            .set({
              isApprove: false,
              steps: 2,
              direct_response: null,
              webhook_response: null,
              mtid: null,
              kycDoc_details: null,
              updated_at: new Date()
            })
            .fetch();
          if (updated_kyc) {
            return res.json({ 'status': 200, 'message': 'KYC application rejected' })
          }
        }
      } else {
        return res
          .status(500)
          .json({ status: 500, "err": "Details Not Found" });
      }
    } catch (e) {
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  },

  getUserKYCDetails: async function (req, res) {
    try {
      let { user_id } = req.allParams();

      let KYCData = await KYC.findOne({ user_id });
      if (KYCData) {
        return res.json({ "status": 200, "message": "KYC Data", "data": KYCData });
      } else {
        return res
          .status(500)
          .json({
            status: 500,
            "err": sails.__("No KYC")
          });
      }
    } catch (e) {
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  }
};
