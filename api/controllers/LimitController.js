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
    // req.setLocale('en')
    let {coin_id} = req.allParams();
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
  },

  updateLimit: async function (req, res) {
    try {
      if (req.body.id) {
        const limit_details = await Limit.findOne({id: req.body.id});
        if (!limit_details) {
          return res
            .status(401)
            .json({
              'status': 401,
              err: sails.__("Invalid limit")
            });
        }
        var updatedLimit;
        if(limit_details == undefined || limit_details == null || !limit_details){
          updatedLimit = await Limit
            .create(req.body);
        }else{
          updatedLimit = await Limit
          .update({id: req.body.id})
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
        return res
          .status(400)
          .json({
            'status': 400,
            'message': sails._("limit id is not sent.")
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
