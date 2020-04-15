/**
 * TierController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
var request = require('request');
var logger = require("./logger")
var randomize = require('randomatic');

module.exports = {

  // ------------------------------ WEB API ----------------------------
  getUserTierList: async function (req, res) {
    try {
      var user_id = req.user.id;
      var tierDetails = await Tiers.find({
        where: {
          deleted_at: null
        }
      }).sort('tier_step ASC');

      var userData = await Users.findOne({
        where: {
          deleted_at: null,
          is_active: true,
          id: user_id
        }
      });

      for (var i = 0; i < tierDetails.length; i++) {
        if (tierDetails[i].tier_step == (parseInt(userData.account_tier) + 1)) {
          tierDetails[i].is_active = true;
          var accountTierDetails = await TierMainRequest.findOne({
            where: {
              user_id: user_id,
              tier_step: tierDetails[i].tier_step,
              deleted_at: null
            }
          });

          var object = {
            request_id: accountTierDetails.id,
            user_status: accountTierDetails.user_status,
            approved: accountTierDetails.approved
          }
          tierDetails[i].account_details = object;

          if (i != 0) {
            for (var j = 1; j <= i; j++) {
              tierDetails[i - i].is_verified = true;
            }
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
      console.log(error);
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong").message,
          error_at: error.stack
        });
    }
  },

  // Upgrade User Tier
  upgradeUserTier: async function (req, res) {
    try {
      var {
        tier_step,
        id,
        status,
        request_id
      } = req.allParams();

      if (tier_step == 2 || tier_step == 3 || tier_step == 4) {
        var upgradeTier = await TierRequest.find({
          where: {
            deleted_at: null,
            request_id: request_id,
            id: id
          }
        });

        if (upgradeTier.length > 0) {
          console.log("status", status)
          if (status == true || status == "true") {
            var upgradeData = await TierRequest
              .update({
                deleted_at: null,
                user_id: user_id,
                id: id
              })
              .set({
                is_approved: true
              })
              .fetch();

            var getData = await TierMainRequest.find({
              where: {
                deleted_at: null,
                id: request_id
              }
            })
          } else if (status == false || status == "false") {
            var upgradeData = await TierRequest
              .update({
                deleted_at: null,
                user_id: user_id,
                id: id
              })
              .set({
                tier_step: tier_step,
                is_approved: false
              })
          }
        } else {
          var upgradeData = await TierRequest
            .create({
              tier_step: tier_step,
              user_id: user_id,
              is_approved: null
            })
        }

        if (tier_step == 2) {
          var flag = 0;
          var tierData = await TierRequest.find({
            where: {
              deleted_at: null,
              user_id: user_id,
              tier_step: 2
            }
          });

          console.log(tierData)

          // if (tierData.length == 3) {
          for (var i = 0; i < tierData.length; i++) {
            if (tierData[i].is_approved == true) {
              flag = parseInt(flag) + 1
            }
          }
          // }
          console.log(flag)
          var userData = await Users.findOne({
            where: {
              deleted_at: null,
              is_active: true,
              id: user_id
            }
          })
          if (flag == 3) {
            var userValue = await Users
              .update({
                where: {
                  deleted_at: null,
                  is_active: true,
                  id: user_id
                }
              })
              .set({
                account_tier: parseInt(userData.account_tier) + 1
              })
          }
        } else if (tier_step == 3) {
          var flag = 0;
          var tierData = await TierRequest.find({
            where: {
              deleted_at: null,
              user_id: user_id,
              tier_step: 3
            }
          });

          console.log(tierData)

          if (tierData.length == 2) {
            for (var i = 0; i < tierData.length; i++) {
              if (tierData[i].is_approved == true) {
                flag = parseInt(flag) + 1
              }
            }
          }
          console.log(flag)
          var userData = await Users.findOne({
            where: {
              deleted_at: null,
              is_active: true,
              id: user_id
            }
          })
          if (flag == 2) {
            var userValue = await Users
              .update({
                where: {
                  deleted_at: null,
                  is_active: true,
                  id: user_id
                }
              })
              .set({
                account_tier: parseInt(userData.account_tier) + 1
              })
          }
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
          error_at: error.stack
        });
    }
  },

  getUserTierData: async function (req, res) {
    try {
      var data = req.body;

      var length = 0

      var finalData = [];

      if (data.tier_step == 2) {
        length = 4;
      } else if (data.tier_step == 3) {
        length = 2;
      }

      var type = 0;
      if (data.request_id && data.request_id != "") {
        for (var i = 0; i < length; i++) {
          type = parseInt(type) + 1;
          var tierData = await TierRequest.find({
            where: {
              deleted_at: null,
              request_id: data.request_id,
              tier_step: data.tier_step,
              type: type
            }
          }).sort('id DESC');

          finalData.push(tierData[0]);
        }
      }

      return res
        .status(200)
        .json({
          "status": 200,
          "message": sails.__("tier details users retrieve success").message,
          data: finalData
        })


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

  // ------------------------ CMS API --------------------------------------------

  // Get Admin User List for Tier Upgradation
  getUserTierRequest: async function (req, res) {
    try {

      let {
        page,
        limit,
        data,
        step,
        start_date,
        end_date,
        sort_col,
        sort_order,
        status
      } = req.allParams();

      var query;
      if (status == 1) {
        query = `FROM tier_main_request
                    LEFT JOIN users
                    ON tier_main_request.user_id = users.id
                    WHERE tier_main_request.deleted_at IS NULL AND users.deleted_at IS NULL 
                    AND users.is_active = true AND tier_main_request.approved IS NULL
                    AND tier_main_request.tier_step = ${step}`
      } else if (status == 2) {
        query = `FROM tier_main_request
                    LEFT JOIN users
                    ON tier_main_request.user_id = users.id
                    WHERE tier_main_request.deleted_at IS NULL AND users.deleted_at IS NULL 
                    AND users.is_active = true AND tier_main_request.approved = true
                    AND tier_main_request.tier_step = ${step}`
      } else if (status == 3) {
        query = `FROM tier_main_request
                    LEFT JOIN users
                    ON tier_main_request.user_id = users.id
                    WHERE tier_main_request.deleted_at IS NULL AND users.deleted_at IS NULL 
                    AND users.is_active = true AND tier_main_request.approved = false
                    AND tier_main_request.tier_step = ${step}`
      }

      if (data && data != "" && data != null) {
        query += " AND (LOWER(users.email) LIKE '%" + data.toLowerCase() + "%' OR LOWER(users.first_name) LIKE '%" + data.toLowerCase() + "%'  OR LOWER(users.last_name) LIKE '%" + data.toLowerCase() + "%')";
      }

      // if (type) {
      //   query += " AND tier_request.type = '" + type + "'";
      // }

      if (start_date && end_date) {
        query += whereAppended ?
          " AND " :
          " WHERE ";

        query += " tier_main_request.created_at >= '" + await sails
          .helpers
          .dateFormat(start_date) + " 00:00:00' AND tier_main_request.created_at <= '" + await sails
            .helpers
            .dateFormat(end_date) + " 23:59:59'";
      }

      countQuery = query;

      if (sort_col && sort_order) {
        let sortVal = (sort_order == 'descend' ?
          'DESC' :
          'ASC');
        query += " ORDER BY " + sort_col + " " + sortVal;
      }

      query += " limit " + limit + " offset " + (parseInt(limit) * (parseInt(page) - 1))

      console.log(query)

      // console.log("SELECT tier_request.id, tier_request.user_id ,tier_request.tier_step, tier_request.unique_key,tier_request.is_approved, users.email, users.first_name, users.last_name, tier_request.ssn, tier_request.type" + query)

      tradeData = await sails.sendNativeQuery(`SELECT tier_main_request.*, users.email, users.first_name, users.last_name ` + query, [])

      tradeData = tradeData.rows;
      console.log(tradeData)

      tradeCount = await sails.sendNativeQuery("Select COUNT(tier_main_request.id)" + countQuery, [])
      tradeCount = tradeCount.rows[0].count;

      return res
        .status(200)
        .json({
          "status": 200,
          "message": sails.__("tier data retrieve").message,

          tradeData,
          tradeCount
        })

    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong").message,
          error_at: error.stack
        });
    }
  },

  getRequestTierData: async function (req, res) {
    try {
      var data = req.body

      var getRequestData = await TierRequest.find({
        where: {
          deleted_at: null,
          request_id: request_id,
          tier_step: data.tier_step
        }
      });

      return res
        .status(200)
        .json({
          "status": 200,
          "message": ""
        })
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
          error_at: error.stack
        });
    }
  },

  getTierList: async function (req, res) {
    try {
      var tierDetails = await Tiers.find({
        where: {
          deleted_at: null
        }
      }).sort('id DESC');

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
          error_at: error.stack
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
          error_at: error.stack
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
          error_at: error.stack
        });
    }
  },

  uploadRejectedDocument: async function (req, res) {
    try {
      var user_id = req.user.id;
      var dataBody = req.body;
      var tierDetails = await TierRequest.find({
        where: {
          deleted_at: null,
          user_id: user_id,
          is_approved: false
        }
      });

      console.log("dataBody", dataBody);
      console.log("tierDetails", tierDetails)

      if ((dataBody.valid_id_flag == true || dataBody.valid_id_flag == "true") && (dataBody.proof_residence_flag == true || dataBody.proof_residence_flag == "true")) {
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

                if (dataValue.status == 200) {
                  req
                    .file('residence_proof')
                    .upload(async function (error1, uploadFile1) {
                      try {
                        var data1 = {};
                        data1.user_id = user_id;
                        data1.file = uploadFile1[0]
                        data1.description = randomize('Aa0', 10);
                        data1.type = 2;

                        var dataValue1 = await sails.helpers.uploadTierDocument(data1)

                        return res.json(dataValue1)
                      } catch (error1) {
                        console.log(error1);
                      }
                    });
                }

              } catch (error) {
                console.log(error);
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
      } else if (dataBody.valid_id_flag == true || dataBody.valid_id_flag == "true") {
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
      } else if (dataBody.proof_residence_flag == true || dataBody.proof_residence_flag == "true") {
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
      console.log(error);
    }
  },

  uploadTier3Document: async function (req, res) {
    try {
      var dataBody = req.body;

      var tierDetailsValue = await TierRequest.find({
        where: {
          deleted_at: null,
          user_id: req.user.id,
          tier_step: 3
        }
      });

      var tierDetails = await TierRequest.find({
        where: {
          deleted_at: null,
          tier_step: 3,
          user_id: req.user.id,
          is_approved: false
        }
      })

      console.log("tierDetailsValue", tierDetailsValue)
      console.log("tierDetails", tierDetails);
      console.log("dataBody", dataBody)

      if (tierDetailsValue.length == 0) {
        req
          .file('files')
          .upload(async function (error, uploadFile) {
            try {
              console.log(uploadFile)
              var data = {};
              if (uploadFile.length > 0) {
                var dataValue;
                for (var i = 0; i < uploadFile.length; i++) {
                  data.user_id = req.user.id;
                  data.file = uploadFile[i]
                  data.description = randomize('Aa0', 10);
                  data.type = (i == 0) ? 1 : 2;

                  console.log("data", data)

                  dataValue = await sails.helpers.uploadTierDocument(data)
                  console.log(dataValue)
                }
                console.log(dataValue)
                return res.json(dataValue)
              }

            } catch (error) {
              console.log(error);
            }
          });
      } else if (((dataBody.idcp_flag == true || dataBody.idcp_flag == "true") && (dataBody.proof_of_assets_flag == true || dataBody.proof_of_assets_flag == "true")) && tierDetails != undefined) {
        var flag = 0;
        for (var i = 0; i < tierDetails.length; i++) {
          if (tierDetails[i].type != 3) {
            if (tierDetails[i].is_approved == false) {
              flag = parseInt(flag) + 1;
            }
          }
        }

        if (flag == 2) {
          req
            .file('files')
            .upload(async function (error, uploadFile) {
              try {
                console.log(uploadFile)
                var data = {};
                if (uploadFile.length > 0) {
                  for (var i = 0; i < uploadFile.length; i++) {
                    data.user_id = req.user.id;
                    data.file = uploadFile[i]
                    data.description = randomize('Aa0', 10);
                    data.type = (i == 0) ? 1 : 2;

                    console.log("data", data)

                    var dataValue = await sails.helpers.uploadTierDocument(data)
                  }
                  return res.json(dataValue)
                }

              } catch (error) {
                console.log(error);
              }
            });
        }
      } else if ((dataBody.idcp_flag == true || dataBody.idcp_flag == "true") && tierDetails != undefined) {
        console.log("INSIDe IF")
        var flag = false;

        for (var i = 0; i < tierDetails.length; i++) {
          console.log("tierDetails[i].type", tierDetails[i].type)
          if (tierDetails[i].type == 1) {
            console.log("tierDetails[i].is_approved", tierDetails[i].is_approved)
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
                data.user_id = req.user.id;
                data.file = uploadFile[0]
                data.description = randomize('Aa0', 10);
                data.type = 1;

                var dataValue = await sails.helpers.uploadTierDocument(data)
                return res.json(dataValue)
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

      } else if ((dataBody.proof_of_assets_flag == true || dataBody.proof_of_assets_flag == "true") && tierDetails != undefined) {
        var flag = false;

        for (var i = 0; i < tierDetails.length; i++) {
          console.log("tierDetails[i].type", tierDetails[i].type)
          if (tierDetails[i].type == 2) {
            console.log("tierDetails[i].is_approved", tierDetails[i].is_approved)
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
                data.user_id = req.user.id;
                data.file = uploadFile[0]
                data.description = randomize('Aa0', 10);
                data.type = 1;

                var dataValue = await sails.helpers.uploadTierDocument(data)
                return res.json(dataValue)
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
      }

    } catch (error) {
      console.log(error)
    }
  }
}
