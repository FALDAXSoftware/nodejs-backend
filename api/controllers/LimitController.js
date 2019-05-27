/**
 * LimitController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  // ---------------------------Web Api------------------------------
  // -------------------------------CMS Api--------------------------
  getAllLimit: async function (req, res) {
    try {
      // req.setLocale('en')
      let { coin_id } = req.allParams();
      console.log(coin_id)
      let limitData = await Limit
        .find({
          where: {
            deleted_at: null,
            coin_id: coin_id
          }
        })
        .sort("id ASC");

      if (limitData.length > 0) {
        return res.json({
          "status": 200,
          "message": sails.__("Limit list"),
          "data": limitData
        });
      } else {
        return res.json({
          "status": 200,
          "message": sails.__("No Limit Data List"),
          "data": limitData
        });
      }
    } catch (err) {
      console.log('>>>>>', err)
    }
  },

  updateLimit: async function (req, res) {
    try {
      if (req.body.id) {
        const limit_details = await Limit.findOne({ id: req.body.id, deleted_at: null });
        if (!limit_details) {
          return res
            .status(401)
            .json({
              'status': 401,
              err: sails.__("Invalid limit")
            });
        }
        var updatedLimit;
        if (limit_details == undefined || limit_details == null || !limit_details) {
          updatedLimit = await Limit
            .create(req.body);
        } else {
          updatedLimit = await Limit
            .update({ id: req.body.id })
            .set(req.body)
            .fetch();
        }
        if (!updatedLimit) {
          return res.json({
            "status": 200,
            "message": sails.__("Something Wrong")
          });
        }
        return res.json({
          "status": 200,
          "message": sails.__('Update Limit')
        });
      } else {
        var updatedLimit = await Limit
          .create(req.body);
        return res
          .status(200)
          .json({
            'status': 200,
            'message': sails._("limit id added sucess")
          })
      }
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
      return;
    }
  }
};
