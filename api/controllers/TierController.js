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
      // if (userData.account_tier == 4) {
      // var tierDetailsValue = await TierMainRequest.findOne({
      //   where: {
      //     user_id: user_id,
      //     tier_step: 4,
      //     deleted_at: null
      //   }
      // });
      // tierDetails[tierDetails.length - 1].is_verified = true;

      // console.log("tierDetailsValue", tierDetailsValue)

      // if (tierDetailsValue != undefined) {
      //   var previous_tier = tierDetailsValue.previous_tier
      //   console.log("previous_tier", previous_tier)
      //   var previosuTierDetails = await TierMainRequest.findOne({
      //     where: {
      //       user_id: user_id,
      //       tier_step: previous_tier,
      //       deleted_at: null
      //     }
      //   });
      //   if (previosuTierDetails != undefined) {
      //     for (var j = 0; j < previous_tier; j++) {
      //       if (j != (previous_tier - 1))
      //         tierDetails[j].is_verified = true
      //       else {
      //         if (previosuTierDetails.approved == true)
      //           tierDetails[j].is_verified = previosuTierDetails.approved
      //         else {
      //           var object = {
      //             request_id: previosuTierDetails.id,
      //             user_status: previosuTierDetails.user_status,
      //             approved: previosuTierDetails.approved
      //           }
      //           tierDetails[j].account_details = object;
      //           tierDetails[j].is_active = true
      //         }
      //       }
      //     }
      //     if (previosuTierDetails.approved == true && previous_tier != (userData.account_tier - 1))
      //       tierDetails[previous_tier].is_active = true
      //   } else {
      // var tierList = [1, 2, 3]
      // for (var i = 0; i < tierList.length; i++) {
      //   if (i == 0) {
      //     // if ()
      //     var tierValue = await KYC.findOne({

      //     })
      //   } else {

      //   }
      // }
      // if (previous_tier == 0) {
      //   var KYCValue = await KYC.findOne({
      //     where: {
      //       user_id: user_id,
      //       deleted_at: null
      //     }
      //   });

      //   if (KYCValue != undefined) {
      //     if (KYCValue.first_name != null) {
      //       if (KYCValue.direct_response == "ACCEPT" && KYCValue.webhook_response == "ACCEPT") {
      //         tierDetails[previous_tier].is_verified = true;
      //         previous_tier = 1;
      //         var tierDetailsValueExtend = await TierMainRequest.findOne({
      //           where: {
      //             tier_step: (previous_tier + 1),
      //             user_id: user_id,
      //             deleted_at: null
      //           }
      //         })
      //         if (tierDetailsValueExtend == undefined) {
      //           tierDetails[previous_tier + 1].is_active = true;
      //         } else {
      //           console.log("tierDetailsValueExtend", tierDetailsValueExtend)
      //           if (tierDetailsValueExtend.approved == true || tierDetailsValueExtend.approved == "true") {
      //             tierDetails[previous_tier].is_verified = true;
      //             previous_tier = previous_tier + 1
      //             console.log("previous_tier", previous_tier)
      //             var value = await TierMainRequest.findOne({
      //               where: {
      //                 tier_step: (previous_tier + 1),
      //                 user_id: user_id,
      //                 deleted_at: null
      //               }
      //             });
      //             console.log("value", value)
      //             if (value == undefined) {
      //               tierDetails[previous_tier + 1].is_active = true;
      //             } else {
      //               if (value.approved == "true" || value.approved == true) {
      //                 tierDetails[previous_tier].is_verified = true
      //               } else {
      //                 tierDetails[previous_tier].is_active = true;
      //                 var object = {
      //                   request_id: value.id,
      //                   user_status: value.user_status,
      //                   approved: value.approved
      //                 }
      //                 tierDetails[previous_tier].account_details = object;
      //                 tierDetails[previous_tier].is_active = true
      //               }
      //             }
      //           } else {
      //             var object = {
      //               request_id: tierDetailsValueExtend.id,
      //               user_status: tierDetailsValueExtend.user_status,
      //               approved: tierDetailsValueExtend.approved
      //             }
      //             tierDetails[previous_tier].account_details = object;
      //             tierDetails[previous_tier].is_active = true
      //           }
      //         }
      //       } else {
      //         var object = {
      //           approved: (KYCValue.direct_response != "ACCEPT" && KYCValue.webhook_response != "ACCEPT") ? null : 0.0
      //         }
      //         tierDetails[previous_tier].is_active = true;
      //       }
      //     } else {
      //       console.log("previous_tier", previous_tier)
      //       tierDetails[previous_tier].is_active = true
      //     }
      //   } else {
      //     console.log("previous_tier", previous_tier)
      //     tierDetails[previous_tier].is_active = true
      //   }
      // } else {
      //   tierDetails[previous_tier].is_active = true;
      //   for (j = 0; j < previous_tier; j++) {
      //     tierDetails[j].is_verified = true
      //   }
      // }
      // }
      // }
      // } else {
      console.log("INSIDE ELSE")
      for (var i = 0; i < tierDetails.length; i++) {
        if (tierDetails[i].tier_step == (parseInt(userData.account_tier) + 1) && (parseInt(userData.account_tier) != 4)) {
          if ((parseInt(userData.account_tier) + 1) == 1) {
            var userKYCDetails = await KYC.findOne({
              where: {
                deleted_at: null,
                user_id: user_id
              }
            });

            if (userKYCDetails != undefined) {
              if (userKYCDetails.first_name != null) {
                var object = {
                  approved: (userKYCDetails.direct_response != "ACCEPT" && userKYCDetails.webhook_response != "ACCEPT") ? null : 0.0
                }
                tierDetails[i].account_details = object;
              }
            }
          }
          // console.log("tierDetails[i]", tierDetails[i])
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
              tierDetails[j].is_verified = true;
            }
          }
          var getTierDetails = await TierMainRequest.findOne({
            where: {
              deleted_at: null,
              tier_step: 4,
              user_id: user_id
            }
          });
          if (getTierDetails != undefined) {
            var object = {
              request_id: getTierDetails.id,
              user_status: getTierDetails.user_status,
              approved: getTierDetails.approved
            }
            tierDetails[3].account_details = object;
            tierDetails[3].is_active = true;
          } else {
            tierDetails[3].is_active = true;
          }
        } else if ((parseInt(userData.account_tier) == 4)) {
          for (var j = 0; j < 4; j++) {
            tierDetails[j].is_verified = true;
          }
        }
      }
      // if ((parseInt(userData.account_tier) + 1) != 4) {
      //   var tierDetailsValue = await TierMainRequest.findOne({
      //     where: {
      //       user_id: user_id,
      //       tier_step: 4,
      //       deleted_at: null
      //     }
      //   })
      //   if (tierDetailsValue != undefined) {
      //     var object = {
      //       request_id: tierDetailsValue.id,
      //       user_status: tierDetailsValue.user_status,
      //       approved: tierDetailsValue.approved
      //     }
      //     tierDetails[tierDetails.length - 1].account_details = object
      //   }
      //   tierDetails[tierDetails.length - 1].is_active = true;
      // }

      // }

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

        if (upgradeTier.length > 0) {
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

            var getData = await TierMainRequest.find({
              where: {
                deleted_at: null,
                id: request_id
              }
            })

            if (getData != undefined) {
              var statusValue = getData[0].user_status;
              var typeValue = upgradeData[0].type;
              var object = {}
              if (getData[0].tier_step == 2) {
                object = {
                  "1": (typeValue == 1) ? (status) : (statusValue[1]),
                  "2": (typeValue == 2) ? (status) : (statusValue[2]),
                  "3": (typeValue == 3) ? (status) : (statusValue[3]),
                  "4": (typeValue == 4) ? (status) : (statusValue[4]),
                }
              } else if (getData[0].tier_step == 3) {
                object = {
                  "1": (typeValue == 1) ? (status) : (statusValue[1]),
                  "2": (typeValue == 2) ? (status) : (statusValue[2])
                }
              } else if (getData[0].tier_step == 4) {
                object = {
                  "1": (typeValue == 1) ? (status) : (statusValue[1]),
                  "2": (typeValue == 2) ? (status) : (statusValue[2]),
                  "3": (typeValue == 3) ? (status) : (statusValue[3]),
                  "4": (typeValue == 4) ? (status) : (statusValue[4]),
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

            var dataUpdate = await TierMainRequest
              .update({
                deleted_at: null,
                id: request_id
              })
              .set({
                user_status: object
              })
              .fetch();

          } else if (status == false || status == "false") {
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

              var statusValue = getData[0].user_status;
              var typeValue = tierDataValue[0].type;
              var object = {}
              if (getData[0].tier_step == 2) {
                object = {
                  "1": (typeValue == 1) ? (status) : (statusValue[1]),
                  "2": (typeValue == 2) ? (status) : (statusValue[2]),
                  "3": (typeValue == 3) ? (status) : (statusValue[3]),
                  "4": (typeValue == 4) ? (status) : (statusValue[4]),
                }
              } else if (getData[0].tier_step == 3) {
                object = {
                  "1": (typeValue == 1) ? (status) : (statusValue[1]),
                  "2": (typeValue == 2) ? (status) : (statusValue[2])
                }
              } else if (getData[0].tier_step == 4) {
                object = {
                  "1": (typeValue == 1) ? (status) : (statusValue[1]),
                  "2": (typeValue == 2) ? (status) : (statusValue[2]),
                  "3": (typeValue == 3) ? (status) : (statusValue[3]),
                  "4": (typeValue == 4) ? (status) : (statusValue[4]),
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

        console.log("flag", flag)
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
              tier_step: (parseInt(userValue.account_tier) + 1)
            }
          });

          var userData = await Users
            .update({
              deleted_at: null,
              is_active: true,
              id: tierDataFinal.user_id
            })
            .set({
              account_tier: (userValue.account_tier == 4) ? 4 : (parseInt(userValue.account_tier) + 1)
            })
            .fetch();

          await sails.helpers.notification.send.email("tier_force_approved", userData[0])
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
              account_tier: (userValue.account_tier == 4) ? 4 : (parseInt(userValue.account_tier) + 1)
            })
            .fetch();

          await sails.helpers.notification.send.email("tier_force_approved", userData[0])
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

        for (var i = 0; i < 16; i++) {
          if (finalStatus[i + 1] == true || finalStatus[i + 1] == "true") {
            flag = parseInt(flag) + 1;
          }
        }

        if (flag == 16) {
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
          // Add API key for institutional account
          let getUserApiKey = await sails.helpers.getUserApiKeys(tierDataFinal.user_id);
          if (!getUserApiKey) {
            var random_string = await sails
              .helpers
              .randomStringGenerator(32);
            await APIKeys.create({
              user_id: tierDataFinal.user_id,
              api_key: random_string
            });
          }
          var userData = await Users
            .update({
              deleted_at: null,
              is_active: true,
              id: tierDataFinal.user_id
            })
            .set({
              account_tier: 4,
              is_institutional_account: true
            })
            .fetch();
          await sails.helpers.notification.send.email("tier_force_approved", userData[0])
        }

        var flag1 = 0;

        for (var j = 0; j < 16; j++) {
          if (finalStatus[i] == false || finalStatus[i] == "false") {
            flag = parseInt(flag1) + 1;
          }
        }

        if (flag1 == 16) {
          var tierDataUpdate = await TierMainRequest
            .update({
              deleted_at: null,
              id: request_id,
              tier_step: 4
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

      if (tierValue.length > 0) {
        data.request_id = tierValue[0].id;

        if (tierValue[0].approved == "false" || tierValue[0].approved == false) {
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
          return res
            .status(203)
            .json({
              "status": 203,
              "message": sails.__("your application has been force accepted").message
            })
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
      } else {
        query += " ORDER By updated_at ASC"
      }

      query += " limit " + limit + " offset " + (parseInt(limit) * (parseInt(page) - 1))

      tradeData = await sails.sendNativeQuery(`SELECT tier_main_request.*, users.email, users.first_name, users.last_name ` + query, [])

      tradeData = tradeData.rows;

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
        }).sort('updated_at DESC');

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
            requirements: data.requirements,
            requirements_two: data.requirements_two
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
        for (var i = 0; i < tierDetails.length; i++) {
          if (tierDetails[i].type == 1) {
            if (tierDetails[i].is_approved == false) {
              flag = true;
            }
          }
        }
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
        if (flag == true) {
          req
            .file('residence_proof')
            .upload(async function (error1, uploadFile1) {
              try {
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

      if (tierDetails.length == 0) {
        req
          .file('files')
          .upload(async function (error, uploadFile) {
            try {
              var data = {};
              if (uploadFile.length > 0) {
                var dataValue;
                for (var i = 0; i < uploadFile.length; i++) {
                  data.request_id = idValue;
                  data.user_id = user_id;
                  data.file = uploadFile[i]
                  data.description = randomize('Aa0', 10);
                  data.type = (i == 0) ? 1 : 2;

                  dataValue = await sails.helpers.uploadTierDocument(data)
                }
                return res.status(dataValue.status).json(dataValue);
              }

            } catch (error) {
              console.log(error);
            }
          });
      } else if (((dataBody.idcp_flag == true || dataBody.idcp_flag == "true") && (dataBody.proof_of_assets_flag == true || dataBody.proof_of_assets_flag == "true")) && tierDetails != undefined) {
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
                var data = {};
                if (uploadFile.length > 0) {
                  for (var i = 0; i < uploadFile.length; i++) {
                    data.request_id = idValue;
                    data.user_id = user_id;
                    data.file = uploadFile[i]
                    data.description = randomize('Aa0', 10);
                    data.type = (i == 0) ? 1 : 2;

                    var dataValue = await sails.helpers.uploadTierDocument(data)
                  }
                  return res.status(dataValue.status).json(dataValue);
                }

              } catch (error) {
                console.log(error);
              }
            });
        }
      } else if ((dataBody.idcp_flag == true || dataBody.idcp_flag == "true") && tierDetails != undefined) {
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

      } else if ((dataBody.proof_of_assets_flag == true || dataBody.proof_of_assets_flag == "true") && tierDetails != undefined) {
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
            .upload(async function (error, uploadFile) {
              try {
                var data = {};
                data.request_id = idValue;
                data.file = uploadFile[0]
                data.description = randomize('Aa0', 10);
                data.type = 2;
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
                account_tier: (userValue.account_tier == 4) ? 4 : (getTierValue.tier_step)
              })
            if (getTierValueUpdate[0].tier_step == 4) {
              // Add API key for institutional account
              await Users
                .update({
                  where: {
                    id: getTierValue.user_id
                  }
                }).set({
                  is_institutional_account: true
                })
              let getUserApiKey = await sails.helpers.getUserApiKeys(getTierValue.user_id);
              if (!getUserApiKey) {
                var random_string = await sails
                  .helpers
                  .randomStringGenerator(32);
                await APIKeys.create({
                  user_id: getTierValue.user_id,
                  api_key: random_string
                });
              }

            }
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
            }).fetch();


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
                account_tier: (userValue.account_tier == 4) ? 4 : (Update.tier_step)
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
            var data = {};
            // if (uploadFile.length > 0) {
            var dataValue;
            data.request_id = idValue;
            data.user_id = user_id;
            data.file = uploadFile[0];
            data.description = randomize('Aa0', 10);
            data.type = dataBody.type;
            data.tier = 4;

            dataValue = await sails.helpers.uploadTierDocument(data)
            return res.status(dataValue.status).json(dataValue);

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

      // if (body.tier_requested == 4 || body.tier_requested == 1) {
      //   return res
      //     .status(200)
      //     .json({
      //       "status": 200,
      //       "message": sails.__("Tier upgrade applicable").message
      //     })
      // }

      var tierDetailsValue = await TierMainRequest.findOne({
        where: {
          deleted_at: null,
          tier_step: req.body.tier_requested,
          user_id: user_id,
          unlock_by_admin: true
        }
      })

      if (tierDetailsValue != undefined) {
        return res
          .status(200)
          .json({
            "status": 200,
            "message": sails.__("Tier upgrade applicable").message
          })
      }

      console.log("req.body", req.body)

      // Helper for checking tier requirement of user
      var getTierDetails = await sails.helpers.getUserTierReport(user_id, req.body);
      var getTierDetailsValue = getTierDetails.summaryReport
      console.log("getTierDetailsValue", getTierDetailsValue)

      if (getTierDetails == 1) {
        return res
          .status(500)
          .json({
            status: 500,
            message: sails.__("Tier Upgrade not applicable").message
          });
      } else if ((getTierDetailsValue.req1_ageCheck == true && getTierDetailsValue.req1_tradeCountCheck == true && getTierDetailsValue.req1_tradeTotalFiatCheck == true) || getTierDetailsValue.req2_tradeWalletCheck == true) {
        return res
          .status(200)
          .json({
            "status": 200,
            "message": sails.__("Tier upgrade applicable").message
          })
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

      var dataValue = await TierMainRequest.findOne({
        where: {
          deleted_at: null,
          tier_step: parseInt(tier_step) - 1,
          user_id: user_id
        }
      })

      console.log("dataValue", dataValue)

      if ((tier_step == (parseInt(userData.account_tier) + 1) || dataValue.approved === true) || tier_step == 4) {
        var getTierData = await TierMainRequest.findOne({
          where: {
            deleted_at: null,
            user_id: user_id,
            tier_step: tier_step
          }
        })

        if (getTierData == undefined) {
          var objectValue = {};
          if (tier_step == 2) {
            objectValue = {
              "1": false,
              "2": false,
              "3": false,
              "4": false
            }
          } else if (tier_step == 3) {
            objectValue = {
              "1": false,
              "2": false
            }
          } else if (tier_step == 4) {
            objectValue = {
              "1": false,
              "2": false,
              "3": false,
              "4": false,
              "5": false,
              "6": false,
              "7": false,
              "8": false,
              "9": false,
              "10": false,
              "11": false,
              "12": false,
              "13": false,
              "14": false,
              "15": false,
              "16": false
            }
          }
          var tierUpgrade = await TierMainRequest.create({
            unlock_by_admin: true,
            user_id: user_id,
            created_at: new Date(),
            tier_step: tier_step,
            user_status: objectValue,
            previous_tier: userData.account_tier
          }).fetch();
          return res
            .status(200)
            .json({
              "status": 200,
              "message": sails.__("User Unlock Tier Success").message
            })
        } else {
          return res
            .status(200)
            .json({
              "status": 500,
              "message": sails.__("Tier has also been upgraded").message
            })
        }
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
  },

  getUserTierValue: async function (req, res) {
    try {
      var { user_id } = req.allParams();
      var getTierValue = await TierMainRequest.find({
        where: {
          deleted_at: null,
          user_id: user_id,
          unlock_by_admin: true
        }
      }).sort('id DESC')
      if (getTierValue.length > 0) {
        var data = {
          "tier": getTierValue[0].tier_step,
          "unlock_admin": getTierValue[0].unlock_by_admin,
          "is_approved": getTierValue[0].approved
        }
        return res
          .status(200)
          .json({
            "status": 200,
            "message": sails.__("Tier Value Success").message,
            "data": data
          })
      } else {
        var userData = await Users.findOne({
          where: {
            deleted_at: null,
            is_active: true,
            id: user_id
          }
        })
        var data = {
          "teir": userData.account_tier,
          "unlock_by_admin": false
        }
        return res
          .status(200)
          .json({
            "status": 200,
            "message": sails.__("Tier Value Success").message,
            "data": data
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

  getAllTierDetails: async function (req, res) {
    try {
      var allTierValue = await Tiers.find({
        where: {
          deleted_at: null
        }
      }).sort('tier_step ASC')

      return res
        .status(200)
        .json({
          "status": 200,
          "message": sails.__("All Tier Data retrieve success").message,
          "data": allTierValue
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
  }
}
