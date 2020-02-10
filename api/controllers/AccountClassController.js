/**
 * AccountClassController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
var speakeasy = require('speakeasy');
var logger = require("../controllers/logger")

module.exports = {
  /**
   * API for getting activity data
   * Renders this api when user activity data needs to be fecthed
   *
   * @param <>
   *
   * @return <User acticity data>
   */
  // CMS all class api
  getAllAccountClasses: async function (req, res) {
    try {
      let {
        sort_col,
        sort_order
      } = req.allParams();
      sort_col = (sort_col != undefined && sort_col != "" ? sort_col : "id")
      sort_order = (sort_order != undefined && sort_order != "" ? sort_order : "descend")
      let sortVal = (sort_order == 'descend' ?
        'DESC' :
        'ASC');
      let allClasses = await AccountClass.find({
        deleted_at: null
      }).sort(`${sort_col} ${sortVal}`);

      return res.json({
        "status": 200,
        "message": sails.__("Account Class Data").message,
        allClasses
      });
    } catch (error) {
      // await logger.error(error.message)
      return res
        .status(500)
        .json({
          status: 500,
          "error": sails.__("Something Wrong").message,
          error_at: error.stack
        });
    }
  },

  addAccountClass: async function (req, res) {
    let params = req.body.class_name;
    try {
      let accountClass = await AccountClass
        .create({
          class_name: params
        })
        .fetch();
      if (!accountClass) {
        return res
          .status(500)
          .json({
            status: 500,
            error: sails.__("Something Wrong").message,
            error_at: sails.__("Something Wrong").message
          });
      }
      return res.json({
        status: 200,
        message: sails.__("Class added success").message
      })
    } catch (error) {
      // await logger.error(error.message)
      return res
        .status(500)
        .json({
          status: 500,
          error: sails.__("Something Wrong").message,
          error_at: error.stack
        })
    }
  },

  updateAccountClass: async function (req, res) {
    let {
      id,
      class_name
    } = req.body;
    try {
      let accountClass = await AccountClass.findOne({
        id,
        deleted_at: null
      });
      if (accountClass) {
        var updatedClass = await AccountClass
          .update({
            id
          })
          .set({
            class_name
          })
          .fetch();
        return res.json({
          status: 200,
          message: sails.__("Class Update Success").message
        })
      } else {
        return res
          .status(500)
          .json({
            status: 500,
            error: sails.__("Something Wrong").message,
            error_at: sails.__("Something Wrong").message
          });
      }
    } catch (error) {
      // await logger.error(error.message)
      return res
        .status(500)
        .json({
          status: 500,
          error: sails.__("Something Wrong").message,
          error_at: error.stack
        })
    }
  },

  deleteAccountClass: async function (req, res) {
    try {
      let {
        class_id,
        otp,
        admin_id
      } = req.allParams();

      let user = await Admin.findOne({
        id: admin_id,
        is_active: true,
        deleted_at: null
      });
      if (!user) {
        return res
          .status(401)
          .json({
            "status": 401,
            "error": sails.__("user inactive").message
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
        if (!class_id) {
          return res
            .status(500)
            .json({
              "status": 500,
              "error": sails.__("Class id is not sent").message,
              error_at: sails.__("Class id is not sent").message
            });
        }
        let classData = await AccountClass
          .update({
            id: class_id
          })
          .set({
            deleted_at: new Date()
          })
          .fetch();
        if (classData) {
          return res
            .status(200)
            .json({
              "status": 200,
              "message": sails.__("Class deleted success").message
            });
        }
      } else {
        return res
          .status(500)
          .json({
            "status": 500,
            "error": sails.__("invalid otp").message,
            error_at: sails.__("invalid otp").message
          });
      }
    } catch (error) {
      // await logger.error(error.message)
      return res
        .status(500)
        .json({
          status: 500,
          error: sails.__("Something Wrong").message,
          error_at: error.stack
        })
    }
  }
};
