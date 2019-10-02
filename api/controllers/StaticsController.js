/**
 * StaticsController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
var logger = require("./logger")
module.exports = {
  //---------------------------Web Api------------------------------
  getStaticPage: async function (req, res) {
    let staticData = await Statics.findOne({
      slug: req.params.page,
      is_active: true
    });
    if (staticData) {
      return res.view('pages/staticPage', {
        page: staticData
      });
    } else {
      return res.notFound();
    }
  },

  getStaticPageJson: async function (req, res) {
    let staticData = await Statics.findOne({
      slug: req.params.page,
      is_active: true
    });
    if (staticData) {
      return res.json({
        "status": 200,
        "message": sails.__("Static Page retrived success"),
        "data": staticData
      })
    } else {
      return res.notFound();
    }
  },

  //-------------------------------CMS Api--------------------------
  getStatic: async function (req, res) {
    try {
      let staticData = await Statics.find({
        is_active: true,
        deleted_at: null
      });
      let staticCount = await Statics.count({
        is_active: true,
        deleted_at: null
      });
      if (staticData) {
        return res.json({
          "status": 200,
          "message": sails.__("Static Page retrived success"),
          "data": staticData,
          staticCount
        });
      }
    } catch (err) {
      await logger.error(err.message)
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  },
};
