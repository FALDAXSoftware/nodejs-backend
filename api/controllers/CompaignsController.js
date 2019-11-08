/**
 * CampaignsController
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
          err: 'Unauthorized access'
        });
      }
      let {
        sortCol,
        sortOrder,
        data,
        page,
        limit
      } = req.allParams();
      let query = " from campaigns WHERE deleted_at IS NULL ";

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
            "message": sails.__("compaigns retrieve success"),
            "data":{
              campaigns: get_data.rows,
              total
            }
          })
      }else{
        return res
          .status(500)
          .json({
            status: 500,
            "err": sails.__("compaigns not found")
          });
      }
     
    } catch (error) {
      console.log("error", error);
      await logger.error(error.message)
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
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
          err: 'Unauthorized access'
        });
      }
      let req_body = req.body;
      let validator = new Validator(req_body, { 
        label: 'required',
        description: 'required',
        no_of_transactions: 'required|integer',
        transaction_fees: 'required|decimal',
        usage: 'required|in:1,2',
        start_date: 'required|date',
        end_date: 'required|date'        
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

      // create
      let data_object = {
        label: req_body.label,
        description:req_body.description,
        no_of_transactions: req_body.no_of_transactions,
        transaction_fees: req_body.transaction_fees,
        start_date: req_body.start_date,
        end_date: req_body.end_date,
        usage:req_body.usage
      };

      let create_data = await Campaigns.create( data_object );
      return res.json({
        "status": 200,
        "message": sails.__("campaign created"),
        "data": []
      });
    } catch (error) {
      console.log("error", error);
      await logger.error(error.message)
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
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
          err: 'Unauthorized access'
        });
      }
      var data_object = {
        id:req.params.id
      };
      var get_data = await Campaigns.findOne( data_object );
      if ( get_data != undefined ) {
        return res
          .status(200)
          .json({
            "status": 200,
            "message": sails.__("campaigns retrieve success"),
            "data":get_data
          })
      }else{
        return res
          .status(500)
          .json({
            status: 500,
            "err": sails.__("campaigns not found")
          });
      }
     
    } catch (error) {
      console.log("error", error);
      await logger.error(error.message)
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  },


  /** 
   * Update Compaign Status
   */
  changeStatus: async function (req, res) {
    try {
      if (!req.user.isAdmin) {
        return res.status(403).json({
          status: 403,
          err: 'Unauthorized access'
        });
      }

      let req_body = req.body;
      let validator = new Validator(req_body, {
        status: 'required|boolean',
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
      var data_object = {
        id:req.params.id
      };
      var get_data = await Campaigns.findOne( data_object );
      if ( get_data == undefined ) {
        return res
          .status(500)
          .json({
            status: 500,
            "err": sails.__("campaigns not found")
          });
        
      }
      var update_data = await Campaigns.updateOne( data_object ).set({is_active:req_body.status});
      
      if( update_data ){
        var message = '';
        console.log("req_body.status",req_body.status);
        if( req_body.status == true || req_body.status === "true" ){
          message = sails.__("campaign activated");
        }else{
          message = sails.__("campaign deactivated");
        }
        return res
          .status(200)
          .json({
            "status": 200,
            "message": message,
            "data":update_data
          })
        
      }else{
        return res
          .status(500)
          .json({
            "status": 500,
            "message": sails.__("campaigns not updated"),
            "data":[]
          })        
      }      
     
    } catch (error) {
      console.log("error", error);
      await logger.error(error.message)
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  },

};
