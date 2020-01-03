/**
 * TierController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
var request = require('request');
var logger = require("./logger")

module.exports = {

  // ------------------------------ WEB API ----------------------------
  getUserTierList: async function (req, res) {
    try {
      var user_id = req.user.id;
      var tierDetails = await Tiers.find({
        where: {
          deleted_at: null
        }
      }).sort('id ASC');

      var userData = await Users.findOne({
        where: {
          deleted_at: null,
          is_active: true,
          id: user_id
        }
      });

      for (let index = 0; index < tierDetails.length; index++) {
        if (tierDetails[index].tier_step == userData.account_tier) {
          tierDetails[index].is_active = true;
          if (index != 0)
            for (var i = 1; i <= index; i++) {
              tierDetails[index - i].is_verified = true;
            }
        }
      }

      if (tierDetails) {
        return res
          .status(200)
          .json({
            "status": 200,
            "message": sails.__("tier details retrieve success").message,
            "data": tierDetails
          })
      } else {
        return res
          .status(201)
          .json({
            "status": 201,
            "message": sails.__("no tier details retrieve success").message
          })
      }
    } catch (error) {
      // console.log(error);
      // await logger.error(error.message)
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong").message,
          error_at:error.stack
        });
    }
  },

  //document upload to IDM Platform API
  tierDocumentUpload: async function (req, res) {
    try {
      let {
        description,
        appId
      } = req.allParams();
      req.file('document').upload(async function (err, uploadedFiles) {
        var fs = require("fs");
        let kycDocUploadDetails = {};
        // kycDocUploadDetails.file = (uploadedFiles[0].fd);
        kycDocUploadDetails.description = description;
        kycDocUploadDetails.file = fs.createReadStream(uploadedFiles[0].fd);

        // console.log('kycDocUploadDetails', kycDocUploadDetails)
        let idm_key = await sails.helpers.getDecryptData(sails.config.local.IDM_TOKEN);
        // console.log("idm_key", idm_key);
        // console.log("filep", req._fileparser.upstreams.length);
        if (req._fileparser.upstreams.length) {
          request.post({
            headers: {
              'Authorization': 'Basic ' + idm_key,
              'Content-Type': 'multipart/mixed'
            },
            // url: 'https://edna.identitymind.com/im/account/consumer/' + appId + '/files',
            url: 'https://edna.identitymind.com/im/account/consumer/8bb1146e615e4c3dab63180db81732f1/files',
            //
            encoding: null, //  if you expect binary data
            responseType: 'buffer',
            body: JSON.stringify(kycDocUploadDetails)
          }, async function (error, response, body) {
            try {
              console.log("error", error);
              // console.log('response', response);
              // console.log('body', body);
              // console.log('response_body', response.body);
              if (response) {

              } else {

              }
            } catch (error) {
              console.log('error', error);
            }
          });
        } else {
          return res.status(200).json({
            'status': 200,
            'message': sails.__("Image Required").message
          })
        }

      });
      return 1;
      if (req.file('document') && description) {
        let kycDocUploadDetails = new FormData();

        kycDocUploadDetails.append("description", description);
        kycDocUploadDetails.append("file", req.file('document'));
        // kycDocUploadDetails.file = req.file('document');

        let idm_key = await sails.helpers.getDecryptData(sails.config.local.IDM_TOKEN);
        if (req._fileparser.upstreams.length) {
          request.post({
            headers: {
              'Authorization': 'Basic ' + idm_key
            },
            // url: 'https://edna.identitymind.com/im/account/consumer/' + appId + '/files',
            url: 'https://edna.identitymind.com/im/account/consumer/8bb1146e615e4c3dab63180db81732f1/files',
            //
            body: kycDocUploadDetails
          }, async function (error, response, body) {
            try {
              if (response) {

              } else {

              }
            } catch (error) {
              console.log('error', error);
            }
          });
        } else {
          return res.status(200).json({
            'status': 200,
            'message': sails.__("Image Required").message
          })
        }
      } else {
        console.log('>>>>else')
      }
    } catch (error) {
      // console.log("errrrr:", error);
      // await logger.error(error.message)
      return res
        .status(500)
        .json({
          status: 500,
          err: sails.__("Something Wrong").message,
          error_at:error.stack
        })
    }
  },

  // Upgrade User Tier
  upgradeUserTier: async function (req, res) {
    try {
      var {
        tier_step
      } = req.allParams();

      var user_id = req.user.id;

      if (tier_step == 2 || tier_step == 3 || tier_step == 4) {
        var upgradeTier = await TierRequest.find({
          where: {
            deleted_at: null,
            user_id: user_id
          }
        });

        if (upgradeTier.length > 0) {
          var upgradeData = await TierRequest
            .update({
              deleted_at: null,
              user_id: user_id
            })
            .set({
              tier_step: tier_step,
              is_approved: null
            })
        } else {
          var upgradeData = await TierRequest
            .create({
              tier_step: tier_step,
              user_id: user_id,
              is_approved: null
            })
        }
        return res
          .status(200)
          .json({
            "status": 200,
            "message": sails.__("tier upgrade request success").message
          })
      }
    } catch (error) {
      // console.log(error);
      // await logger.error(error.message)
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong").message,
          error_at:error.stack
        });
    }
  },

  // ------------------------ CMS API --------------------------------------------

  // Get Admin User List for Tier Upgradation
  getUserTierRequest: async function (req, res) {
    try {

      var getUserPendingTierData = await sails.sendNativeQuery("SELECT tier_request.id, tier_request.user_id ,tier_request.tier_step, tier_request.is_approved, users.email, users.first_name, users.last_name FROM tier_request LEFT JOIN users ON tier_request.user_id = users.id WHERE tier_request.is_approved IS NULL AND tier_request.deleted_at IS NULL");
      getUserPendingTierData = getUserPendingTierData.rows;

      var getUserApprovedTierData = await sails.sendNativeQuery("SELECT tier_request.id, tier_request.user_id ,tier_request.tier_step, tier_request.is_approved, users.email, users.first_name, users.last_name FROM tier_request LEFT JOIN users ON tier_request.user_id = users.id WHERE tier_request.is_approved = true AND tier_request.deleted_at IS NULL");
      getUserApprovedTierData = getUserApprovedTierData.rows;

      var getUserRejectedTierData = await sails.sendNativeQuery("SELECT tier_request.id, tier_request.user_id ,tier_request.tier_step, tier_request.is_approved, users.email, users.first_name, users.last_name FROM tier_request LEFT JOIN users ON tier_request.user_id = users.id WHERE tier_request.is_approved = false AND tier_request.deleted_at IS NULL");
      getUserRejectedTierData = getUserRejectedTierData.rows;

      return res
        .status(200)
        .json({
          "status": 200,
          "message": sails.__("tier data retrieve").message,
          getUserPendingTierData,
          getUserApprovedTierData,
          getUserRejectedTierData
        })

    } catch (error) {
      // console.log(error);
      // await logger.error(error.message)
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong").message,
          error_at:error.stack
        });
    }
  },

  updateUserTierRequest: async function (req, res) {
    try {
      var {
        id,
        status
      } = req.allParams();

      var tierData = await TierRequest.findOne({
        where: {
          deleted_at: null,
          id: id
        }
      });

      if (tierData != undefined) {

        var tierApproveData = await TierRequest
          .update({
            deleted_at: null,
            id: id
          })
          .set({
            is_approved: status
          })
          .fetch();

        if (status == true || status == "true") {
          var tier_step
          if (tierData.tier_step != 4)
            tier_step = parseInt(tierData.tier_step) + 1;
          else
            tier_step = 4;
          var userData = await Users
            .update({
              deleted_at: null,
              is_active: true,
              id: tierApproveData.user_id
            }).set({
              account_tier: tier_step
            });
        }

        return res
          .status(200)
          .json({
            "status": 200,
            "message": sails.__("request changed successfully").message
          })

      } else {
        return res
          .status(201)
          .json({
            "status": 201,
            "message": sails.__("no request found").message
          })
      }
    } catch (error) {
      // console.log(error);
      // await logger.error(error.message)
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong").message,
          error_at:error.stack
        });
    }
  },

  getTierList: async function (req, res) {
    try {
      var tierDetails = await Tiers.find({
        where: {
          deleted_at: null
        }
      }).sort('id ASC');

      if (tierDetails) {
        return res
          .status(200)
          .json({
            "status": 200,
            "message": sails.__("tier details retrieve success").message,
            "data": tierDetails
          })
      } else {
        return res
          .status(201)
          .json({
            "status": 201,
            "message": sails.__("no tier details retrieve success").message
          })
      }
    } catch (error) {
      // console.log(error);
      // await logger.error(error.message)
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong").message,
          error_at:error.stack
        });
    }
  },

  updateTierList: async function (req, res) {
    try {
      var data = req.body;

      var tierData = await Tiers.findOne({
        deleted_at: null,
        id: data.id
      });


      if (tierData != undefined) {
        var updateTierData = await Tiers
          .update({
            deleted_at: null,
            id: data.id
          })
          .set({
            minimum_activity_thresold: data.minimum_activity_thresold,
            daily_withdraw_limit: data.daily_withdraw_limit,
            monthly_withdraw_limit: data.monthly_withdraw_limit,
            requirements: data.requirements
          });
      }

      var tierUpdateData = await Tiers.find({
        deleted_at: null,
        id: data.id
      });

      return res
        .status(200)
        .json({
          "status": 200,
          "message": sails.__("tier update success").message,
          "data": tierUpdateData
        })

    } catch (error) {
      // console.log(error);
      // await logger.error(error.message)
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong").message,
          error_at:error.stack
        });
    }
  },

  // Get Tier Data on basis fo the id
  getTierData: async function (req, res) {
    try {
      var {
        id
      } = req.allParams();

      var tierData = await Tiers.findOne({
        where: {
          deleted_at: null,
          id: id
        }
      });

      if (tierData) {
        return res
          .status(200)
          .json({
            status: 200,
            "message": sails.__("tier data retrieve success").message,
            "data": tierData
          });
      } else {
        return res
          .status(201)
          .json({
            status: 201,
            "message": sails.__("no tier data found").message
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
          error_at:error.stack
        });
    }
  }
}
