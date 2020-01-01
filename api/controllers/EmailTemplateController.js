/**
 * EmailTemplateController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
var logger = require("./logger");
module.exports = {

  get: async function (req, res) {
    try {
      let templates = await EmailTemplate.find().sort('id ASC');
      return res.json({
        status: 200,
        message: sails.__("Email template retrive success"),
        templates
      });
    } catch (error) {
      // await logger.error(error.message)
      return res
        .status(500)
        .json({
          "status": 500,
          "err": sails.__("Something Wrong"),
          error_at:error.stack
        });
    }
  },
  update: async function (req, res) {
    try {
      let {
        id,
        content
      } = req.allParams();

      await EmailTemplate.update({
        id
      }).set({
        content
      });
      return res.json({
        status: 200,
        message: sails.__("Email template update success"),
      });
    } catch (error) {
      // await logger.error(error.message)
      return res
        .status(500)
        .json({
          "status": 500,
          "err": sails.__("Something Wrong"),
          error_at:error.stack
        });
    }
  },

  getById: async function (req, res) {
    try {
      let {
        id
      } = req.allParams();
      let template = await EmailTemplate.findOne({
        id
      });
      return res.json({
        status: 200,
        message: sails.__("Email template retrive success"),
        template
      });
    } catch (error) {
      // await logger.error(error.message)
      return res
        .status(500)
        .json({
          "status": 500,
          "err": sails.__("Something Wrong"),
          error_at:error.stack
        });
    }
  }

};
