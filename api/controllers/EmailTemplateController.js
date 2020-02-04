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
      let templates = await EmailTemplate.find().sort('id DESC');
      return res.json({
        status: 200,
        message: sails.__("Email template retrive success").message,
        templates
      });
    } catch (error) {
      // await logger.error(error.message)
      return res
        .status(500)
        .json({
          "status": 500,
          "err": sails.__("Something Wrong").message,
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
        message: sails.__("Email template update success").message,
      });
    } catch (error) {
      // await logger.error(error.message)
      return res
        .status(500)
        .json({
          "status": 500,
          "err": sails.__("Something Wrong").message,
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
        message: sails.__("Email template retrive success").message,
        template
      });
    } catch (error) {
      // await logger.error(error.message)
      return res
        .status(500)
        .json({
          "status": 500,
          "err": sails.__("Something Wrong").message,
          error_at:error.stack
        });
    }
  }

};
