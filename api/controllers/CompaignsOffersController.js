/**
 * CampaignsOffersController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const moment = require('moment');
var logger = require('../controllers/logger')
const {
  Validator
} = require('node-input-validator');

module.exports = {

  /**
   * get Compaigns list
   */
  list: async function (req, res) {
    try {
      if (!req.user.isAdmin) {
        return res.status(403).json({
          status: 403,
          err: sails.__('Unauthorized Access').message
        });
      }
      let {
        sortCol,
        sortOrder,
        data,
        page,
        limit
      } = req.allParams();
      let query = " from campaigns_offers WHERE deleted_at IS NULL ";

      if ((data && data != "")) {
        if (data && data != "" && data != null) {
          query = query + " AND (label LIKE '%" + data.toLowerCase() + "%')";
        }
      }
      countQuery = query;

      if (sortCol && sortOrder) {
        let sortVal = (sortOrder == 'descend' ?
          'DESC' :
          'ASC');
        query += " ORDER BY " + sortCol + " " + sortVal;
      } else {
        query += " ORDER BY id DESC";
      }

      query += " limit " + limit + " offset " + (parseInt(limit) * (parseInt(page) - 1));

      let get_data = await sails.sendNativeQuery("Select *" + query, [])
      let total = await sails.sendNativeQuery("Select COUNT(id)" + countQuery, [])
      total = total.rows[0].count;
      if (get_data.rowCount > 0) {
        return res
          .status(200)
          .json({
            "status": 200,
            "message": sails.__("offer retrieve success").message,
            "data": {
              campaigns: get_data.rows,
              total
            }
          })
      } else {
        return res
          .status(500)
          .json({
            status: 500,
            "err": sails.__("offer not found").message,
            error_at:sails.__("offer not found").message
          });
      }

    } catch (error) {
      // console.log("error", error);
      // await logger.error(error.message)
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong").message,
          error_at:error.stack
        });
    }
  },



  /**
   * Create Compaign
   *
   */
  create: async function (req, res) {
    try {
      if (!req.user.isAdmin) {
        return res.status(403).json({
          status: 403,
          err: sails.__('Unauthorized Access').message
        });
      }
      let req_body = req.body;
      let validator = new Validator(req_body, {
        code: 'required',
        no_of_transactions: 'required|integer',
        transaction_fees: 'required|decimal',
        campaign_id: 'required|integer',
        is_default_values: 'required|boolean'
      });


      let matched = await validator.check();
      if (!matched) {
        for (var key in validator.errors) {
          return res
            .status(400)
            .json({
              status: 400,
              "message": validator.errors[key].message
            });
        }
      }

      // var user_id = req.user.id;
      // create
      let data_object = {
        code: req_body.code,
        no_of_transactions: req_body.no_of_transactions,
        transaction_fees: req_body.transaction_fees,
        campaign_id: req_body.campaign_id,
        is_default_values: req_body.is_default_values
      };

      let create_data = await CampaignsOffers.create(data_object);
      return res.json({
        "status": 200,
        "message": sails.__("offer created").message,
        "data": []
      });
    } catch (error) {
      // console.log("error", error);
      // await logger.error(error.message)
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong").message,
          error_at:error.stack
        });
    }
  },

  /**
   * get Single Compaign
   */
  get: async function (req, res) {
    try {
      if (!req.user.isAdmin) {
        return res.status(403).json({
          status: 403,
          err: sails.__('Unauthorized Access').message
        });
      }
      var data_object = {
        id: req.param("id")
      };
      var get_data = await CampaignsOffers.findOne(data_object).populate('campaign_id');;
      if (get_data != undefined) {
        return res
          .status(200)
          .json({
            "status": 200,
            "message": sails.__("offer retrieve success").message,
            "data": get_data
          })
      } else {
        return res
          .status(500)
          .json({
            status: 500,
            "err": sails.__("offer not found").message,
            error_at:sails.__("offer not found").message
          });
      }

    } catch (error) {
      // console.log("error", error);
      // await logger.error(error.message)
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong").message,
          error_at:error.stack
        });
    }
  },


  /**
   * Update Compaign Offer data
   */
  // update: async function (req, res) {
  //   try {
  //     if (!req.user.isAdmin) {
  //       return res.status(403).json({
  //         status: 403,
  //         err: sails.__('Unauthorized Access').message
  //       });
  //     }

  //     let req_body = req.body;
  //     let validator = new Validator(req_body, {
  //       status: 'required|boolean',
  //     });


  //     let matched = await validator.check();
  //     if (!matched) {
  //       for (var key in validator.errors) {
  //         return res
  //           .status(400)
  //           .json({
  //             status: 400,
  //             "message": validator.errors[key].message
  //           });
  //       }
  //     }
  //     var data_object = {
  //       id:req.params.id
  //     };
  //     var get_data = await CampaignsOffers.findOne( data_object );
  //     if ( get_data == undefined ) {
  //       return res
  //         .status(500)
  //         .json({
  //           status: 500,
  //           "err": sails.__("offer not found").message
  //         });

  //     }
  //     var update_data = await CampaignsOffers.updateOne( data_object ).set({is_active:req_body.status});

  //     if( update_data ){
  //       var message = '';
  //       console.log("req_body.status",req_body.status);
  //       if( req_body.status == true || req_body.status === "true" ){
  //         message = sails.__("offer activated");
  //       }else{
  //         message = sails.__("offer deactivated").message;
  //       }
  //       return res
  //         .status(200)
  //         .json({
  //           "status": 200,
  //           "message": message,
  //           "data":update_data
  //         })

  //     }else{
  //       return res
  //         .status(500)
  //         .json({
  //           "status": 500,
  //           "message": sails.__("offer not updated").message,
  //           "data":[]
  //         })
  //     }

  //   } catch (error) {
  //     console.log("error", error);
  //     await logger.error(error.message)
  //     return res
  //       .status(500)
  //       .json({
  //         status: 500,
  //         "err": sails.__("Something Wrong").message
  //       });
  //   }
  // },

};
