/**
 * TierController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

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
            tierDetails[index - 1].is_verified = true;
        }
      }

      if (tierDetails) {
        return res
          .status(200)
          .json({
            "status": 200,
            "message": sails.__("tier details retrieve success"),
            "data": tierDetails
          })
      } else {
        return res
          .status(201)
          .json({
            "status": 201,
            "message": sails.__("no tier details retrieve success")
          })
      }
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  },

  tierDocumentUpload: async function (req, res) {
    try {
      let { description } = req.allParams();
      console.log('>>>>if', description)
      if (req.file('document') && description) {
        console.log('>>>>if')
        let kycDocUploadDetails = {};

        kycDocUploadDetails.file = req.file('document');
        kycDocUploadDetails.description = description;
        console.log('kycDocUploadDetails', kycDocUploadDetails)
        let idm_key = await sails.helpers.getDecryptData(sails.config.local.IDM_TOKEN);

        if (req._fileparser.upstreams.length) {
          // request.post({
          //   headers: {
          //     'Authorization': 'Basic ' + idm_key,
          //     'content-type: application/json'
          //   },
          //   url: 'https://edna.identitymind.com/im/account/consumer/' + appId + '/files',
          //   json: kycDocUploadDetails
          // }, async function (error, response, body) {
          //   try {

          //     kyc_details.direct_response = response.body.res;
          //     kyc_details.webhook_response = null;
          //     await KYC.update({
          //       id: kyc_details.id
          //     }).set({
          //       direct_response: response.body.res,
          //       webhook_response: null,
          //       mtid: response.body.mtid,
          //       comments: response.body.frd,
          //       status: true,
          //     });

          //     if (kyc_details.front_doc != null) {
          //       let profileData = {
          //         Bucket: S3BucketName,
          //         Key: kyc_details.front_doc
          //       }

          //       s3.deleteObject(profileData, function (err, response) {
          //         if (err) {
          //           console.log(err)
          //         } else { }
          //       })
          //     }
          //     if (kyc_details.back_doc != null) {
          //       let profileData = {
          //         Bucket: S3BucketName,
          //         Key: kyc_details.back_doc
          //       }

          //       s3.deleteObject(profileData, function (err, response) {
          //         if (err) {
          //           console.log(err)
          //         } else { }
          //       })
          //     }

          //   } catch (error) {
          //     console.log('error', error);
          //     await KYC.update({
          //       id: kyc_details.id
          //     }).set({
          //       direct_response: "MANUAL_REVIEW",
          //       webhook_response: "MANUAL_REVIEW",
          //       comments: "Could Not Verify",
          //       status: true,
          //     });
          //   }
          // });
        } else {
          return res.status(200).json({
            'status': 200,
            'message': sails.__("Image Required")
          })
        }
      } else {
        console.log('>>>>else')
      }
    } catch (err) {
      console.log("errrrr:", err);
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
            "message": sails.__("tier upgrade request success")
          })
      }

    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
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
          "message": sails.__("tier data retrieve"),
          getUserPendingTierData,
          getUserApprovedTierData,
          getUserRejectedTierData
        })

    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
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
            "message": sails.__("request changed successfully")
          })

      } else {
        return res
          .status(201)
          .json({
            "status": 201,
            "message": sails.__("no request found")
          })
      }
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
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
            "message": sails.__("tier details retrieve success"),
            "data": tierDetails
          })
      } else {
        return res
          .status(201)
          .json({
            "status": 201,
            "message": sails.__("no tier details retrieve success")
          })
      }
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
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
          "message": sails.__("tier update success"),
          "data": tierUpdateData
        })

    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
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
            "message": sails.__("tier data retrieve success"),
            "data": tierData
          });
      } else {
        return res
          .status(201)
          .json({
            status: 201,
            "message": sails.__("no tier data found")
          });
      }

    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  }
}
