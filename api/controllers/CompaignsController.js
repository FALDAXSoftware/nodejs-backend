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
        description: 'string',
        no_of_transactions: 'required|integer|min:1',
        fees_allowed: 'required|decimal|min:10.0',
        usage: 'required|in:1,2',
        start_date: 'date',
        end_date: 'date',
        is_active: 'required|boolean',        
        campaign_offers:'required|array|arrayUniqueObjects:code',        
        'campaign_offers.*.code': 'required',        
        'campaign_offers.*.is_default_values': 'required|boolean',        
        'campaign_offers.*.no_of_transactions': 'required|integer|min:1',        
        'campaign_offers.*.fees_allowed': 'required|decimal|min:10.0',
        'campaign_offers.*.user_id': 'integer',
        'campaign_offers.*.start_date': 'date',        
        'campaign_offers.*.end_date': 'date',        
        'campaign_offers.*.is_active': 'required|boolean',        
      }
      // ,{
      //   "usage":"Usage field must be either Onetime or Mutiple",
      //   "campaign_offers":"Offers should be array of object"
      // }
      );

      
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
        fees_allowed: req_body.fees_allowed,
        start_date: req_body.start_date,
        end_date: req_body.end_date,
        usage:req_body.usage,
        is_active:req_body.is_active
      };

      let create_data = await Campaigns.create( data_object ).fetch();
      // Store Offers Code in tables
      var insert_offers = [];
      if( (req_body.campaign_offers).length > 0 ){
        var campaign_offers_object = (req_body.campaign_offers).map( function(each, index){
            each.campaign_id = create_data.id;           
            return each;
        })
        insert_offers = await CampaignsOffers.createEach( campaign_offers_object ).fetch();
      }
      create_data.campaign_offers = insert_offers;
      var all_data = create_data;
      
      return res.json({
        "status": 200,
        "message": sails.__("campaign created"),
        "data": all_data
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
   * Update Compaign
   *
   */
  update: async function (req, res) {
    try {
      if (!req.user.isAdmin) {
        return res.status(403).json({
          status: 403,
          err: 'Unauthorized access'
        });
      }
      let validator1 = new Validator(req.params, { 
        id: 'required'
      });
      let matched1 = await validator1.check();
      if (!matched1) {
        for (var key in validator1.errors) {
          return res
            .status(400)
            .json({
              status: 400,
              "message": validator1.errors[key].message
            });
        }
      }
      let campaign_id = req.params.id;
      let req_body = req.body;
      let validator = new Validator(req_body, { 
        label: 'required',
        description: 'string',
        is_active: 'required|boolean',        
        campaign_offers:'required|array',        
        'campaign_offers.*.is_active': 'boolean',        
        campaign_offers_new:'array|arrayUniqueObjects:code',        
        'campaign_offers_new.*.code': 'required',        
        'campaign_offers_new.*.is_default_values': 'required|boolean',        
        'campaign_offers_new.*.no_of_transactions': 'required|integer|min:1',        
        'campaign_offers_new.*.fees_allowed': 'required|decimal|min:10.0',
        'campaign_offers_new.*.user_id': 'integer',
        'campaign_offers_new.*.is_active': 'required|boolean'       
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
        is_active:req_body.is_active                
      };

      let create_data = await Campaigns.updateOne({id:campaign_id}).set(data_object);
      
      // Update Offers
      var updated_offers=[];
      if( (req_body.campaign_offers).length > 0 ){
        var campaign_offers_data = req_body.campaign_offers;
        for( var i=0; i<(req_body.campaign_offers).length; i++ ){  
            var each_object = {
              description:campaign_offers_data[i].description,
              is_active:campaign_offers_data[i].is_active
            };
            updated_offers = await CampaignsOffers.updateOne({id:campaign_offers_data[i].id}).set(each_object);                 
        }
      }
      
      // Store Offers Code in tables
      var insert_offers = [];
      if( (req_body.campaign_offers_new) && (req_body.campaign_offers_new).length > 0 ){
        var campaign_offers_new_object = (req_body.campaign_offers_new).map( function(each, index){
            each.campaign_id = campaign_id;                       
            return each;
        })
        insert_offers = await CampaignsOffers.createEach( campaign_offers_new_object ).fetch();
      }
      
      var get_campaign_offers = await CampaignsOffers.find({campaign_id:campaign_id}).sort('created_at DESC');
      create_data.campaign_offers = get_campaign_offers;
      var all_data = create_data;
      return res.json({
        "status": 200,
        "message": sails.__("campaign updated"),
        "data": all_data
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
