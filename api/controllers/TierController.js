/**
 * TierController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
var request = require('request');
var logger = require("./logger")
var randomize = require('randomatic');
var moment = require('moment');

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

      tierDetails = tierDetails.map((each) => {
        if (each.daily_withdraw_limit == -1) {
          each.daily_withdraw_limit = 'Unlimited'
        }
        if (each.monthly_withdraw_limit == -1) {
          each.monthly_withdraw_limit = 'Unlimited'
        }
        return each;
      })
      if (userData.account_tier == 4) {
        for (var i = 0; i < tierDetails.length; i++) {
          tierDetails[i].is_verified = true;
        }
      } else {
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

            if (accountTierDetails != undefined) {
              var object = {
                request_id: accountTierDetails.id,
                user_status: accountTierDetails.user_status,
                approved: accountTierDetails.approved
              }
              tierDetails[i].account_details = object;
            }

            if (i != 0) {
              for (var j = 0; j < i; j++) {
                console.log(j)
                console.log("tierDetails[i - i]", tierDetails[i - i])
                tierDetails[j].is_verified = true;
              }
            }
          }
        }
        if ((parseInt(userData.account_tier) + 1) != 4)
          tierDetails[tierDetails.length - 1].is_active = true;
      }


      // console.log("tierDetails", tierDetails[tierDetails.length - 1])


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

      var adminName;

      if (req.user.isAdmin) {
        var userData = await Admin.findOne({
          id: req.user.id
        });

        adminName = userData.first_name;
      }

      var bodyValue = req.body;

      if (tier_step == 2 || tier_step == 3 || tier_step == 4) {
        var upgradeTier = await TierRequest.find({
          where: {
            deleted_at: null,
            request_id: request_id,
            id: id
          }
        });

        console.log("upgradeTier", upgradeTier)

        if (upgradeTier.length > 0) {
          console.log("status", status)
          if (status == true || status == "true") {
            var upgradeData = await TierRequest
              .update({
                deleted_at: null,
                request_id: request_id,
                id: id
              })
              .set({
                is_approved: status,
                updated_by: adminName,
                private_note: bodyValue.private_note,
                public_note: bodyValue.public_note
              })
              .fetch();

            console.log("upgradeData", upgradeData)

            var getData = await TierMainRequest.find({
              where: {
                deleted_at: null,
                id: request_id
              }
            })

            console.log("getData", getData)

            if (getData != undefined) {
              var statusValue = getData[0].user_status;

              console.log("statusValue", statusValue)
              var typeValue = upgradeData[0].type;
              console.log("typeValue", typeValue)
              var object = {}
              if (typeValue == 1) {
                object = {
                  "1": status,
                  "2": statusValue[2],
                  "3": statusValue[3],
                  "4": statusValue[4]
                }
              } else if (typeValue == 2) {
                object = {
                  "1": statusValue[1],
                  "2": status,
                  "3": statusValue[3],
                  "4": statusValue[4]
                }
              } else if (typeValue == 3) {
                object = {
                  "1": statusValue[1],
                  "2": statusValue[2],
                  "3": status,
                  "4": statusValue[4]
                }
              } else {
                object = {
                  "1": statusValue[1],
                  "2": statusValue[2],
                  "3": statusValue[3],
                  "4": statusValue[4],
                  "5": (typeValue == 5) ? (true) : (statusValue[5]),
                  "6": (typeValue == 6) ? (true) : (statusValue[6]),
                  "7": (typeValue == 7) ? (true) : (statusValue[7]),
                  "8": (typeValue == 8) ? (true) : (statusValue[8]),
                  "9": (typeValue == 9) ? (true) : (statusValue[9]),
                  "10": (typeValue == 10) ? (true) : (statusValue[10]),
                  "11": (typeValue == 11) ? (true) : (statusValue[11]),
                  "12": (typeValue == 12) ? (true) : (statusValue[12]),
                  "13": (typeValue == 13) ? (true) : (statusValue[13]),
                  "14": (typeValue == 14) ? (true) : (statusValue[14]),
                  "15": (typeValue == 15) ? (true) : (statusValue[15]),
                  "16": (typeValue == 16) ? (true) : (statusValue[16])
                }
              }
            }

            console.log("Object ???????", object)

            var dataUpdate = await TierMainRequest
              .update({
                deleted_at: null,
                id: request_id
              })
              .set({
                user_status: object
              })
              .fetch();

            console.log("dataUpdate", dataUpdate);
            // }
            // console.log("getData", getData[0].user_status)
            // var statusValue = getData[0].user_status;
            // var typeValue = upgradeData[0].type
            // var value = JSON.parse(statusValue);
            // console.log("value>>>>", value)
            // console.log("status Value", statusValue[typeValue])

          } else if (status == false || status == "false") {
            console.log("INSIDE LESE IF")
            var tierDataValue = await TierRequest
              .update({
                deleted_at: null,
                request_id: request_id,
                id: id
              })
              .set({
                is_approved: status,
                public_note: bodyValue.public_note,
                private_note: bodyValue.private_note,
                updated_by: adminName
              })
              .fetch();

            var getData = await TierMainRequest.find({
              where: {
                deleted_at: null,
                id: request_id
              }
            })

            if (tierDataValue != undefined) {

              console.log("getData[0].user_status", getData[0].user_status)

              var statusValue = getData[0].user_status;
              var typeValue = tierDataValue[0].type;
              var object = {}
              if (typeValue == 1) {
                object = {
                  "1": status,
                  "2": statusValue[2],
                  "3": statusValue[3],
                  "4": statusValue[4]
                }
              } else if (typeValue == 2) {
                object = {
                  "1": statusValue[1],
                  "2": status,
                  "3": statusValue[3],
                  "4": statusValue[4]
                }
              } else if (typeValue == 3) {
                object = {
                  "1": statusValue[1],
                  "2": statusValue[2],
                  "3": status,
                  "4": statusValue[4]
                }
              } else {
                object = {
                  "1": statusValue[1],
                  "2": statusValue[2],
                  "3": statusValue[3],
                  "4": statusValue[4],
                  "5": (typeValue == 5) ? (status) : (statusValue[5]),
                  "6": (typeValue == 6) ? (status) : (statusValue[6]),
                  "7": (typeValue == 7) ? (status) : (statusValue[7]),
                  "8": (typeValue == 8) ? (status) : (statusValue[8]),
                  "9": (typeValue == 9) ? (status) : (statusValue[9]),
                  "10": (typeValue == 10) ? (status) : (statusValue[10]),
                  "11": (typeValue == 11) ? (status) : (statusValue[11]),
                  "12": (typeValue == 12) ? (status) : (statusValue[12]),
                  "13": (typeValue == 13) ? (status) : (statusValue[13]),
                  "14": (typeValue == 14) ? (status) : (statusValue[14]),
                  "15": (typeValue == 15) ? (status) : (statusValue[15]),
                  "16": (typeValue == 16) ? (status) : (statusValue[16])
                }
              }
            }

            var upgradeData = await TierRequest
              .update({
                deleted_at: null,
                request_id: request_id,
                id: id
              })
              .set({
                user_status: object
              })

            var userData = await Users.findOne({
              where: {
                deleted_at: null,
                is_active: true,
                id: getData[0].user_id
              }
            })

            userData.reason = bodyValue.public_note;

            await sails.helpers.notification.send.email("tier_force_rejected", userData)
          }
        }
        // }
      }

      if (tier_step == 2) {
        var tierDataFinal = await TierMainRequest.findOne({
          where: {
            deleted_at: null,
            id: request_id,
            tier_step: tier_step
          }
        })

        var finalStatus = tierDataFinal.user_status;
        var flag = 0;

        for (var i = 0; i < 4; i++) {
          if (finalStatus[i + 1] == true || finalStatus[i + 1] == "true") {
            flag = parseInt(flag) + 1;
          }
        }

        console.log(flag)

        if (flag == 4) {
          var tierDataUpdate = await TierMainRequest
            .update({
              deleted_at: null,
              id: request_id,
              tier_step: tier_step
            })
            .set({
              approved: true
            })

          console.log("tierDataFinal.user_id", tierDataFinal.user_id)

          var userValue = await Users.findOne({
            where: {
              deleted_at: null,
              is_active: true,
              id: tierDataFinal.user_id
            }
          })

          var getTier = await Tiers.findOne({
            where: {
              deleted_at: null,
              tier_step: parseInt(userValue.account_tier) + 1
            }
          });

          var userData = await Users
            .update({
              deleted_at: null,
              is_active: true,
              id: tierDataFinal.user_id
            })
            .set({
              account_tier: parseInt(userValue.account_tier) + 1
            })

          await sails.helpers.notification.send.email("tier_force_approved", userData)
        }

        var flag1 = 0;

        for (var j = 0; j < 4; j++) {
          if (finalStatus[i] == false || finalStatus[i] == "false") {
            flag = parseInt(flag1) + 1;
          }
        }

        if (flag1 == 4) {
          var tierDataUpdate = await TierMainRequest
            .update({
              deleted_at: null,
              id: request_id,
              tier_step: tier_step
            })
            .set({
              approved: false
            })

            ``
        }
      } else if (tier_step == 3) {
        var tierDataFinal = await TierMainRequest.findOne({
          where: {
            deleted_at: null,
            id: request_id,
            tier_step: tier_step
          }
        })

        var finalStatus = tierDataFinal.user_status;
        var flag = 0;

        for (var i = 0; i < 2; i++) {
          if (finalStatus[i + 1] == true || finalStatus[i + 1] == "true") {
            flag = parseInt(flag) + 1;
          }
        }

        if (flag == 2) {
          var tierDataUpdate = await TierMainRequest
            .update({
              deleted_at: null,
              id: request_id,
              tier_step: tier_step
            })
            .set({
              approved: true
            })

          var userValue = await Users.findOne({
            where: {
              deleted_at: null,
              is_active: true,
              id: tierDataFinal.user_id
            }
          })

          var userData = await Users
            .update({
              deleted_at: null,
              is_active: true,
              id: tierDataFinal.user_id
            })
            .set({
              account_tier: parseInt(userValue.account_tier) + 1
            })

          await sails.helpers.notification.send.email("tier_force_approved", userData)
        }

        for (var i = 0; i < 2; i++) {
          if (finalStatus[i] == false || finalStatus[i] == "false") {
            flag = parseInt(flag) + 1;
          }
        }

        if (flag == 3) {
          var tierDataUpdate = await TierMainRequest
            .update({
              deleted_at: null,
              id: request_id,
              tier_step: tier_step
            })
            .set({
              approved: false
            })
        }
      } else if (tier_step == 4) {
        var tierDataFinal = await TierMainRequest.findOne({
          where: {
            deleted_at: null,
            id: request_id,
            tier_step: tier_step
          }
        })

        var finalStatus = tierDataFinal.user_status;
        var flag = 0;

        for (var i = 0; i < 12; i++) {
          if (finalStatus[i + 1] == true || finalStatus[i + 1] == "true") {
            flag = parseInt(flag) + 1;
          }
        }

        console.log(flag)

        if (flag == 12) {
          var tierDataUpdate = await TierMainRequest
            .update({
              deleted_at: null,
              id: request_id,
              tier_step: tier_step
            })
            .set({
              approved: true
            })

          console.log("tierDataFinal.user_id", tierDataFinal.user_id)

          var userValue = await Users.findOne({
            where: {
              deleted_at: null,
              is_active: true,
              id: tierDataFinal.user_id
            }
          })

          var userData = await Users
            .update({
              deleted_at: null,
              is_active: true,
              id: tierDataFinal.user_id
            })
            .set({
              account_tier: 4
            })
        }

        var flag1 = 0;

        for (var j = 0; j < 12; j++) {
          if (finalStatus[i] == false || finalStatus[i] == "false") {
            flag = parseInt(flag1) + 1;
          }
        }

        if (flag1 == 12) {
          var tierDataUpdate = await TierMainRequest
            .update({
              deleted_at: null,
              id: request_id,
              tier_step: tier_step
            })
            .set({
              approved: false
            })
        }
      }

      return res
        .status(200)
        .json({
          "status": 200,
          "message": sails.__("tier upgrade request success").message
        })
    } catch (error) {
      console.log(error);
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

      var user_id = req.user.id;

      var length = 0
      var userData = await Users.findOne({
        where: {
          deleted_at: null,
          is_active: true,
          id: user_id
        }
      });

      var finalData = [];

      if (data.tier_step == 2) {
        length = 4;
      } else if (data.tier_step == 3) {
        length = 2;
      } else if (data.tier_step == 4) {
        length = 16;
      }


      var tierValue = await TierMainRequest.find({
        where: {
          deleted_at: null,
          user_id: user_id,
          tier_step: data.tier_step
        }
      });

      console.log("tierValue", tierValue)

      if (tierValue.length > 0) {
        data.request_id = tierValue[0].id;

        if (tierValue[0].approved == "false" || tierValue[0].approved == false) {
          console.log("INSIDE IF")
          return res
            .status(202)
            .json({
              "status": 202,
              "message": sails.__("your application has been force rejected").message,
              "data": {
                "public_note": tierValue[0].public_note,
                approved: tierValue[0].approved,
                "request_id": tierValue[0].id
              }
            })
        }

        if (tierValue[0].approved == "true" || tierValue[0].approved == true) {
          // console.log("INSIDE IF")
          return res
            .status(203)
            .json({
              "status": 203,
              "message": sails.__("your application has been force accepted").message
            })
        }

        console.log("data.request_id", data.request_id)

        var type = 0;
        if (data.request_id && data.request_id != "") {
          console.log(length);
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

            console.log("tierData[0]", tierData[0])

            if (tierData[0] != undefined) {
              delete tierData[0].private_note;
              delete tierData[0].updated_by;
              finalData.push(tierData[0]);
            }
          }
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

      var typeObject = [];
      var finalData = []
      if (data.tier_step == 2) {
        typeObject.push(1);
        typeObject.push(2);
        typeObject.push(3);
        typeObject.push(4)
      } else if (data.tier_step == 3) {
        typeObject.push(1);
        typeObject.push(2);
      } else if (data.tier_step == 4) {
        typeObject.push(1);
        typeObject.push(2);
        typeObject.push(3);
        typeObject.push(4)
        typeObject.push(5);
        typeObject.push(6);
        typeObject.push(7);
        typeObject.push(8)
        typeObject.push(9);
        typeObject.push(10);
        typeObject.push(11);
        typeObject.push(12)
        typeObject.push(13);
        typeObject.push(14);
        typeObject.push(15);
        typeObject.push(16)
      }


      for (var i = 0; i < typeObject.length; i++) {
        var getRequestData = await TierRequest.find({
          where: {
            deleted_at: null,
            request_id: data.request_id,
            tier_step: data.tier_step,
            type: typeObject[i]
          }
        }).sort('id DESC');

        if (getRequestData.length > 1) {
          for (var j = 0; j < getRequestData.length; j++) {
            if (j == 0 && (getRequestData[j].is_approved == "false" || getRequestData[j].is_approved == false)) {
              getRequestData[j].is_resubmit = true;
            } else {
              getRequestData[j].is_resubmit = false;
            }
          }
        } else {
          if (getRequestData.length > 0) {
            getRequestData[0].is_resubmit = false;
          }
        }

        finalData.push(getRequestData);
      }

      console.log("finalData", finalData)

      return res
        .status(200)
        .json({
          "status": 200,
          "message": sails.__("Request User retrieve success").message,
          "data": finalData
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
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong").message,
          error_at: error.stack
        });
    }
  },

  uploadTier3Document: async function (req, res) {
    try {
      var dataBody = req.allParams();
      var user_id = req.user.id;

      var tierDetailsValue = await TierMainRequest.findOne({
        where: {
          deleted_at: null,
          user_id: req.user.id,
          tier_step: 3
        }
      });

      var idValue = 0;
      var object = {
        "1": false,
        "2": false
      }
      if (tierDetailsValue == undefined) {
        var getDetails = await TierMainRequest.create({
          created_at: new Date(),
          tier_step: 3,
          user_id: req.user.id,
          user_status: object
        }).fetch();

        idValue = getDetails.id
      } else {
        idValue = tierDetailsValue.id
      }

      var tierDetails = await TierRequest.find({
        where: {
          deleted_at: null,
          tier_step: 3,
          request_id: idValue
        }
      })

      console.log("tierDetailsValue", tierDetailsValue)
      console.log("tierDetails", tierDetails);
      console.log("dataBody", dataBody)

      if (tierDetails.length == 0) {
        req
          .file('files')
          .upload(async function (error, uploadFile) {
            try {
              console.log(uploadFile)
              console.log("error", error)
              var data = {};
              if (uploadFile.length > 0) {
                var dataValue;
                for (var i = 0; i < uploadFile.length; i++) {
                  data.request_id = idValue;
                  data.user_id = user_id;
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
        console.log("INSIDE BOTH FLAGS")
        var flag = 0;
        for (var i = 0; i < tierDetails.length; i++) {
          // if (tierDetails[i].type != 3) {
          if (tierDetails[i].is_approved == false) {
            flag = parseInt(flag) + 1;
          }
          // }
        }

        if (flag >= 2) {
          req
            .file('files')
            .upload(async function (error, uploadFile) {
              try {
                console.log(uploadFile)
                var data = {};
                if (uploadFile.length > 0) {
                  for (var i = 0; i < uploadFile.length; i++) {
                    data.request_id = idValue;
                    data.user_id = user_id;
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
                data.request_id = idValue;
                data.file = uploadFile[0]
                data.description = randomize('Aa0', 10);
                data.type = 1;
                data.user_id = user_id;

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
                data.request_id = idValue;
                data.file = uploadFile[0]
                data.description = randomize('Aa0', 10);
                data.type = 2;
                data.user_id = user_id;

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
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong").message,
          error_at: error.stack
        });
    }
  },

  userForceAccept: async function (req, res) {
    try {
      var value = req.allParams();

      var bodyValue = req.body;

      var adminName;

      if (req.user.isAdmin) {
        var userData = await Admin.findOne({
          id: req.user.id
        });

        adminName = userData.first_name;
      }

      var getTierValue = await TierMainRequest.findOne({
        where: {
          deleted_at: null,
          id: value.id
        }
      })

      if (getTierValue != undefined) {
        if (value.status == "true" || value.status == true) {
          var getTierValueUpdate = await TierMainRequest
            .update({
              id: value.id,
              deleted_at: null
            })
            .set({
              approved: true,
              updated_by: adminName,
              private_note: bodyValue.private_note,
              public_note: bodyValue.public_note
            }).fetch();

          var userValue = await Users.findOne({
            where: {
              deleted_at: null,
              is_active: true,
              id: getTierValue.user_id
            }
          });

          if (userValue != undefined) {
            var userDataUpdate = await Users
              .update({
                deleted_at: null,
                is_active: true,
                id: getTierValue.user_id
              })
              .set({
                account_tier: getTierValue.tier_step
              })

            await sails.helpers.notification.send.email("tier_force_approved", userValue)
          }

          return res
            .status(200)
            .json({
              "status": 200,
              "message": sails.__("Force Accept Success").message
            })
        } else if (value.status == false || value.status == "false") {
          var Update = await TierMainRequest
            .update({
              id: value.id,
              deleted_at: null
            })
            .set({
              approved: false,
              updated_by: adminName,
              private_note: bodyValue.private_note,
              public_note: bodyValue.public_note
            });


          var userValue = await Users.findOne({
            where: {
              deleted_at: null,
              is_active: true,
              id: getTierValue.user_id
            }
          });

          if (userValue != undefined) {

            var tierValue = 0;
            if (parseInt(userValue.account_tier) != getTierValue.tier_step) {
              tierValue = parseInt(userValue.account_tier);
            } else if (parseInt(userValue.account_tier) == getTierValue.tier_step) {
              tierValue = parseInt(getTierValue.tier_step) - 1;
            }

            var userDataUpdate = await Users
              .update({
                deleted_at: null,
                is_active: true,
                id: getTierValue.user_id
              })
              .set({
                account_tier: tierValue
              })

            userValue.reason = bodyValue.public_note;

            // console.log("userValue", userValue)

            await sails.helpers.notification.send.email("tier_force_rejected", userValue)
          }

          return res
            .status(200)
            .json({
              "status": 200,
              "message": sails.__("Force Reject Success").message
            })
        } else if (value.status == "truefalse") {
          var getTierValueUpdate = await TierMainRequest
            .update({
              id: value.id,
              deleted_at: null
            })
            .set({
              approved: null,
              updated_by: adminName,
              private_note: bodyValue.private_note,
              public_note: bodyValue.public_note
            }).fetch();

          return res
            .status(200)
            .json({
              "status": 200,
              "message": sails.__("Force Pending Success").message
            })
        }
      } else {
        return res
          .status(500)
          .json({
            "status": 500,
            "message": sails.__("no tier details retrieve success").message
          })
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
  },

  uploadTier4UserDocument: async function (req, res) {
    try {
      var dataBody = req.allParams();
      var user_id = req.user.id;

      var userData = await Users.findOne({
        where: {
          deleted_at: null,
          is_active: true,
          id: user_id
        }
      })

      var getTierValue = await TierMainRequest.findOne({
        where: {
          user_id: user_id,
          deleted_at: null,
          tier_step: 4
        }
      });

      console.log("getTierValue", getTierValue)

      var idValue = 0;

      var valueObject = {
        1: false,
        2: false,
        3: false,
        4: false,
        5: false,
        6: false,
        7: false,
        8: false,
        9: false,
        10: false,
        11: false,
        12: false,
        13: false,
        14: false,
        15: false,
        16: false
      }

      if (getTierValue == undefined) {
        var getTierData = await TierMainRequest.create({
          deleted_at: null,
          created_at: new Date(),
          user_id: user_id,
          tier_step: 4,
          user_status: valueObject
        }).fetch();

        idValue = getTierData.id;
      } else {
        idValue = getTierValue.id
      }

      req
        .file('files')
        .upload(async function (error, uploadFile) {
          try {
            console.log(uploadFile)
            console.log("error", error)
            var data = {};
            // if (uploadFile.length > 0) {
            var dataValue;
            data.request_id = idValue;
            data.user_id = user_id;
            data.file = uploadFile[0];
            data.description = randomize('Aa0', 10);
            data.type = dataBody.type;
            data.tier = 4;

            console.log("data", data)

            dataValue = await sails.helpers.uploadTierDocument(data)
            console.log(dataValue)
            return res.json(dataValue)

          } catch (error) {
            console.log(error);
          }
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
  /* Check Pre Tier Upgrade */
  checkTierUpgrade: async function (req, res) {
    try {
      var body = req.body;
      var user_id = req.user.id;
      console.log("user_id", user_id);

      if (body.tier_requested == 4) {
        return res
          .status(200)
          .json({
            "status": 200,
            "message": sails.__("Tier upgrade applicable").message
          })
      }

      var tierDetailsValue = await TierMainRequest.findOne({
        where: {
          deleted_at: null,
          tier_step: req.body.tier_requested,
          user_id: user_id,
          unlock_by_admin: true
        }
      })

      if (tierDetailsValue && tierDetailsValue.length > 0) {
        return res
          .status(200)
          .json({
            "status": 200,
            "message": sails.__("Tier upgrade applicable").message
          })
      }

      // Helper for checking tier requirement of user
      var getTierDetails = await sails.helpers.getUserTierReport(user_id, req.body);

      console.log("getTierDetails", getTierDetails)
      var getTierDetailsValue = getTierDetails.summaryReport

      if ((getTierDetailsValue.req1_ageCheck == true && getTierDetailsValue.req1_tradeCountCheck == true && getTierDetailsValue.req1_tradeTotalFiatCheck == true) || getTierDetailsValue.req2_tradeWalletCheck == true) {
        return res
          .status(200)
          .json({
            "status": 200,
            "message": sails.__("Tier upgrade applicable").message
          })
      } else if (getTierDetails == 1) {
        return res
          .status(500)
          .json({
            status: 500,
            message: sails.__("Tier Upgrade not applicable").message
          });
      } else {
        var getTierData = getTierDetails.getTierData
        return res
          .status(202)
          .json({
            "status": 202,
            "message": sails.__("Need to fulfill requirements for tier").message,
            "data": getTierDetails.summaryReport,
            getTierData
          })
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
  },

  adminUnlockTier: async function (req, res) {
    try {
      var {
        user_id,
        tier_step
      } = req.allParams();

      var userData = await Users.findOne({
        where: {
          deleted_at: null,
          is_active: true,
          id: user_id
        }
      })

      if (tier_step == (parseInt(userData.account_tier) + 1)) {
        var tierUpgrade = await TierMainRequest.create({
          unlock_by_admin: true,
          user_id: user_id,
          created_at: new Date(),
          tier_step: tier_step
        }).fetch();

        return res
          .status(200)
          .json({
            "status": 200,
            "message": sails.__("User Unlock Tier Success").message
          })
      } else {
        return res
          .status(500)
          .json({
            "status": 500,
            "message": sails.__("User cannot upgrade tier").message
          })
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
  },

  getUserAdminTierUnlock: async function (req, res) {
    try {
      var {
        user_id,
        tier_step
      } = req.allParams();

      if (tier_step == 4) {
        return res
          .status(200)
          .json({
            "status": 200,
            "message": sails.__("User Tier can be upgrade").message
          })
      }
      var userData = await Users.findOne({
        where: {
          deleted_at: null,
          is_active: true,
          id: user_id
        }
      });

      var body = {
        tier_requested: tier_step
      }
      var getTierDetails = await sails.helpers.getUserTierReport(user_id, body);
      var tierDetailsValue = getTierDetails.summaryReport

      if (getTierDetails == 1) {
        return res
          .status(500)
          .json({
            "status": 500,
            "message": sails.__("User cannot upgrade tier").message
          })
      } else if ((tierDetailsValue.req1_ageCheck == true && tierDetailsValue.req1_tradeCountCheck == true && tierDetailsValue.req1_tradeTotalFiatCheck == true) || tierDetailsValue.req2_tradeWalletCheck == true) {
        return res
          .status(200)
          .json({
            "status": 200,
            "message": sails.__("User Tier can be upgrade").message
          })
      } else {
        var getTierData = getTierDetails.getTierData
        return res
          .status(202)
          .json({
            "status": 202,
            "message": sails.__("Need to fulfill requirements for tier by admin").message,
            "data": getTierDetails.summaryReport,
            getTierData
          })
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
}
