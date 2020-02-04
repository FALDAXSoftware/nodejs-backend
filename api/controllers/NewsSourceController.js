/**
 * NewsSourceController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
var logger = require("./logger");
module.exports = {
  // ---------------------------Web Api------------------------------
  // -------------------------------CMS Api--------------------------
  getAllActiveNewsSource: async function (req, res) {
    // req.setLocale('en')

    let newsSourceData = await NewsSource.find({
      deleted_at: null
    }).sort('id DESC');

    if (newsSourceData.length > 0) {
      return res.json({
        "status": 200,
        "message": sails.__("New Source list success").message,
        "data": newsSourceData
      });
    } else {
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong").message,
          error_at:sails.__("Something Wrong").message
        });
    }
  },

  updateNewsSourceStatus: async function (req, res) {
    try {
      let {
        id,
        status
      } = req.body;

      if (id || id !== null || id !== undefined) {
        var newSourceDaa = await NewsSource.findOne({
          deleted_at: null,
          id
        });
        if (!newSourceDaa || newSourceDaa === null || newSourceDaa === undefined) {
          return res.json({
            status: 500,
            "message": sails.__("No source found").message,
            error_at:sails.__("No source found").message
          })
        } else {
          var updatedNewSourceData = await NewsSource
            .update({
              id: id
            })
            .set({
              is_active: status
            })
            .fetch();

          if (!updatedNewSourceData) {
            return res.json({
              status: 500,
              "message": sails.__("New Source update fail.").message,
              error_at:sails.__("New Source update fail.").message
            })
          } else {
            return res.status(200).json({
              status: 200,
              "message": sails.__("News Source update success").message,
              data: updatedNewSourceData
            })
          }
        }
      } else {
        return res.json({
          status: 500,
          "message": sails.__("No news source found").message
        })
      }
    } catch (error) {
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
};
