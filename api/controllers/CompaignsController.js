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
        sort_col,
        sort_order,
        data,
        start_date,
        end_date,
        type,
        page,
        limit
      } = req.allParams();
      let query = " from campaigns WHERE deleted_at IS NULL ";

      if ((data && data != "")) {
        if (data && data != "" && data != null) {
          query = query + " AND (label LIKE '%" + data + "%')";
        }
      }

      if (type) {
        query += " AND usage = " + type
      }

      if (start_date && end_date) {
        query += " AND start_date >= '" + await sails
          .helpers
          .dateFormat(start_date) + " 00:00:00' AND end_date <= '" + await sails
            .helpers
            .dateFormat(end_date) + " 23:59:59'";
      }
      countQuery = query;

      if (sort_col && sort_order) {
        let sortVal = (sort_order == 'descend' ?
          'DESC' :
          'ASC');
        query += " ORDER BY " + sort_col + " " + sortVal;
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
            "data": {
              campaigns: get_data.rows,
              total
            }
          })
      } else {
        return res
          .status(200)
          .json({
            status: 200,
            "message": sails.__("compaigns not found"),
            data: []
          });
      }

    } catch (error) {
      // console.log("error", error);
      // await logger.error(error.message)
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong"),
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
        campaign_offers: 'required|array|arrayUniqueObjects:code',
        'campaign_offers.*.code': 'required',
        'campaign_offers.*.is_default_values': 'required|boolean',
        'campaign_offers.*.no_of_transactions': 'required|integer|min:1',
        'campaign_offers.*.fees_allowed': 'required|decimal|min:10.0',
        'campaign_offers.*.user_id': 'integer',
        'campaign_offers.*.start_date': 'date',
        'campaign_offers.*.end_date': 'date',
        'campaign_offers.*.is_active': 'required|boolean',
      }
        , {
          "usage": sails.__("Campaign usage"),
          "label": sails.__("Campaign label"),
          "no_of_transactions": sails.__("Campaign no_of_transactions"),
          "fees_allowed": sails.__("Campaign fees_allowed"),
          "start_date": sails.__("Campaign start_date"),
          "end_date": sails.__("Campaign end_date"),
          "is_active": sails.__("Campaign is_active"),
          "campaign_offers.*.code": sails.__("Campaign code"),
          "campaign_offers.*.is_default_values": sails.__("Campaign is_default_values"),
          "campaign_offers.*.no_of_transactions": sails.__("Campaign no_of_transactions"),
          "campaign_offers.*.fees_allowed": sails.__("Campaign fees_allowed"),
          "campaign_offers.*.user_id": sails.__("Campaign user_id"),
          "campaign_offers.*.start_date": sails.__("Campaign start_date"),
          "campaign_offers.*.end_date": sails.__("Campaign end_date"),
          "campaign_offers.*.is_active": sails.__("Campaign is_active"),
        }
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
        description: req_body.description,
        no_of_transactions: req_body.no_of_transactions,
        fees_allowed: req_body.fees_allowed,
        start_date: req_body.start_date,
        end_date: req_body.end_date,
        usage: req_body.usage,
        is_active: req_body.is_active
      };

      let create_data = await Campaigns.create(data_object).fetch();
      // Store Offers Code in tables
      var insert_offers = [];
      if ((req_body.campaign_offers).length > 0) {
        var campaign_offers_object = (req_body.campaign_offers).map(function (each, index) {
          if (each.is_default_values == true) {
            each.no_of_transactions = req_body.no_of_transactions;
            each.fees_allowed = req_body.fees_allowed;
          }
          each.campaign_id = create_data.id;
          return each;
        })
        insert_offers = await CampaignsOffers.createEach(campaign_offers_object).fetch();
      }
      create_data.campaign_offers = insert_offers;
      var all_data = create_data;

      return res.json({
        "status": 200,
        "message": sails.__("campaign created"),
        "data": all_data
      });
    } catch (error) {
      // console.log("error", error);
      // await logger.error(error.message)
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong"),
          error_at:error.stack
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
      // let validator1 = new Validator(req.params, { 
      //   id: 'required'
      // });
      // let matched1 = await validator1.check();
      // if (!matched1) {
      //   for (var key in validator1.errors) {
      //     return res
      //       .status(400)
      //       .json({
      //         status: 400,
      //         "message": validator1.errors[key].message
      //       });
      //   }
      // }
      let campaign_id = req.param("id");
      var get_campaign_data = await Campaigns.findOne({ id: campaign_id });
      let req_body = req.body;
      let validator = new Validator(req_body, {
        label: 'required',
        description: 'string',
        is_active: 'required|boolean',
        start_date: 'date',
        end_date: 'date',
        campaign_offers: 'required|array',
        'campaign_offers.*.is_active': 'boolean',
        'campaign_offers.*.start_date': 'date',
        'campaign_offers.*.end_date': 'date',
        campaign_offers_new: 'array|arrayUniqueObjects:code',
        'campaign_offers_new.*.code': 'required',
        'campaign_offers_new.*.is_default_values': 'required|boolean',
        'campaign_offers_new.*.no_of_transactions': 'required|integer|min:1',
        'campaign_offers_new.*.fees_allowed': 'required|decimal|min:10.0',
        'campaign_offers_new.*.user_id': 'integer',
        'campaign_offers_new.*.is_active': 'required|boolean',
        'campaign_offers_new.*.start_date': 'date',
        'campaign_offers_new.*.end_date': 'date',
      },
        {
          "label": sails.__("Campaign label"),
          "no_of_transactions": sails.__("Campaign no_of_transactions"),
          "start_date": sails.__("Campaign start_date"),
          "end_date": sails.__("Campaign end_date"),
          "is_active": sails.__("Campaign is_active"),
          "campaign_offers.*.start_date": sails.__("Campaign start_date"),
          "campaign_offers.*.end_date": sails.__("Campaign end_date"),
          "campaign_offers.*.is_active": sails.__("Campaign is_active"),
          "campaign_offers_new.*.code": sails.__("Campaign code"),
          "campaign_offers_new.*.is_default_values": sails.__("Campaign is_default_values"),
          "campaign_offers_new.*.no_of_transactions": sails.__("Campaign no_of_transactions"),
          "campaign_offers_new.*.fees_allowed": sails.__("Campaign fees_allowed"),
          "campaign_offers_new.*.user_id": sails.__("Campaign user_id"),
          "campaign_offers_new.*.start_date": sails.__("Campaign start_date"),
          "campaign_offers_new.*.end_date": sails.__("Campaign end_date"),
          "campaign_offers_new.*.is_active": sails.__("Campaign is_active"),
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
        description: req_body.description,
        is_active: req_body.is_active,
        start_date: req_body.start_date,
        end_date: req_body.end_date
      };

      let create_data = await Campaigns.updateOne({ id: campaign_id }).set(data_object);

      // Update Offers
      var updated_offers = [];
      if ((req_body.campaign_offers).length > 0) {
        var campaign_offers_data = req_body.campaign_offers;
        for (var i = 0; i < (req_body.campaign_offers).length; i++) {
          if (get_campaign_data.usage == 2) {
            campaign_offers_data[i].start_date = req_body.start_date
            campaign_offers_data[i].end_date = req_body.end_date
          }
          var each_object = {
            description: campaign_offers_data[i].description,
            start_date: campaign_offers_data[i].start_date,
            end_date: campaign_offers_data[i].end_date,
            is_active: campaign_offers_data[i].is_active
          };
          updated_offers = await CampaignsOffers.updateOne({ id: campaign_offers_data[i].id }).set(each_object);
        }
      }

      // Store Offers Code in tables
      var insert_offers = [];
      if ((req_body.campaign_offers_new) && (req_body.campaign_offers_new).length > 0) {
        var campaign_offers_new_object = (req_body.campaign_offers_new).map(function (each, index) {
          if (get_campaign_data.usage == 2) {
            each.start_date = req_body.start_date
            each.end_date = req_body.end_date
          }
          if (each.is_default_values == true) {
            each.no_of_transactions = create_data.no_of_transactions;
            each.fees_allowed = create_data.fees_allowed;
          }
          each.campaign_id = campaign_id;
          return each;
        })
        insert_offers = await CampaignsOffers.createEach(campaign_offers_new_object).fetch();
      }

      var get_campaign_offers = await CampaignsOffers.find({ campaign_id: campaign_id }).sort('created_at DESC');
      create_data.campaign_offers = get_campaign_offers;
      var all_data = create_data;
      return res.json({
        "status": 200,
        "message": sails.__("campaign updated"),
        "data": all_data
      });
    } catch (error) {
      // console.log("error", error);
      // await logger.error(error.message)
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong"),
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
          err: 'Unauthorized access'
        });
      }
      var id = req.param('id');

      var data_object = {
        id: id
      };
      var get_data = await Campaigns.findOne(data_object);
      if (get_data != undefined) {
        var get_campaign_offers = await CampaignsOffers.find({ campaign_id: get_data.id }).sort('created_at DESC');
        if (get_campaign_offers.length > 0) {
          for (var i = 0; i < get_campaign_offers.length; i++) {
            let user_data = {};

            if (get_campaign_offers[i].user_id > 0) {
              user_data = await module.exports.getOffercodeUserDetails(get_campaign_offers[i].user_id)
              if (user_data != undefined) {
                user_data = user_data;
              } else {
                user_data = {};
              }
            } else {
              user_data = {};
            }

            get_campaign_offers[i].user_data = user_data;
            // Count Offercodes used by any user
            var get_used_offercodes = await JSTTradeHistory.count({ campaign_offer_id: get_campaign_offers[i].id, offer_applied: true })
            get_campaign_offers[i].offercode_used = get_used_offercodes;
          }
        }
        get_data.campaign_offers = get_campaign_offers;

        return res
          .status(200)
          .json({
            "status": 200,
            "message": sails.__("campaigns retrieve success"),
            "data": get_data
          })
      } else {
        return res
          .status(500)
          .json({
            status: 500,
            "err": sails.__("campaigns not found"),
            error_at:sails.__("campaigns not found")
          });
      }

    } catch (error) {
      // console.log("error", error);
      // await logger.error(error.message)
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong"),
          error_at:error.stack
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
        id: req.param('id')
      };
      var get_data = await Campaigns.findOne(data_object);
      if (get_data == undefined) {
        return res
          .status(500)
          .json({
            status: 500,
            "err": sails.__("campaigns not found"),
            error_at:sails.__("campaigns not found")
          });

      }
      var update_data = await Campaigns.updateOne(data_object).set({ is_active: req_body.status });

      if (update_data) {
        var message = '';
        if (req_body.status == true || req_body.status === "true") {
          message = sails.__("campaign activated");
        } else {
          message = sails.__("campaign deactivated");
        }
        return res
          .status(200)
          .json({
            "status": 200,
            "message": message,
            "data": update_data
          })

      } else {
        return res
          .status(500)
          .json({
            "status": 500,
            "message": sails.__("campaigns not updated"),
            "data": [],
            error_at:sails.__("campaigns not updated")
          })
      }

    } catch (error) {
      // console.log("error", error);
      // await logger.error(error.message)
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong"),
          error_at:error.stack
        });
    }
  },


  /** 
   * get Verify Offer Code
   */
  verifyOfferCode: async function (req, res) {
    try {
      if (!req.user.isAdmin) {
        return res.status(403).json({
          status: 403,
          err: 'Unauthorized access'
        });
      }
      var data_object = {
        code: req.param("code")
      };
      var get_data = await CampaignsOffers.count(data_object);
      if (get_data > 0) {
        return res
          .status(500)
          .json({
            "status": 500,
            "message": sails.__("Offercode is exist"),
            error_at:sails.__("Offercode is exist")
          })
      } else {
        return res
          .status(200)
          .json({
            status: 200,
            "message": sails.__("Offercode is notexist")
          });
      }

    } catch (error) {
      // console.log("error", error);
      // await logger.error(error.message)
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong"),
          error_at:error.stack
        });
    }
  },

  getOffercodeUserDetails: async function (user_id) {
    let get_user = await Users.findOne({ id: user_id }).select(["id", "first_name", "last_name", "email"])
    return get_user;
  },


  /** 
   * Get Offer code used
   */
  getOffercodeUsed: async function (req, res) {
    try {
      if (!req.user.isAdmin) {
        return res.status(403).json({
          status: 403,
          err: 'Unauthorized access'
        });
      }
      var id = req.param('id');
      var data_object = {
        id: req.params.id
      };
      var all_data = {};
      var get_campaign_offers = await CampaignsOffers.find(data_object).sort('created_at DESC');

      if (get_campaign_offers.length > 0) {
        // get_campaign_offers = get_campaign_offers[0];
        let {
          sortCol,
          sortOrder,
          data,
          page,
          limit,
          action_type
        } = req.allParams();

        let query = '';
        let filter = '';

        let from = '';
        let order_by_field = selected_data = select = '';
        var total = '';
        if (action_type && action_type != "") {
          if (action_type == 'attempted') {
            if ((data && data != "")) {
              if (data && data != "" && data != null) {
                filter = " AND (uch.code LIKE '%" + data.toLowerCase() + "%' OR LOWER(users.full_name) LIKE '%" + data.toLowerCase() + "%' OR LOWER(users.email) LIKE '%" + data.toLowerCase() + "%' )";
              }
            }
            // from += ' from users_campaign_history INNER JOIN users ON users_campaign_history.user_id = users.id where campaign_offer_id='+id;
            select = `select uch.id,uch.user_id,uch.created_at,uch.campaign_offer_id,uch.code as order_id,users.full_name, users.email,'Attempted' offer_type, uch.wrong_attempted as is_attempted,'0' waived_fees,'0' faldax_fees 
                      from users_campaign_history AS uch
                      INNER JOIN users
                      on uch.user_id=users.id
                      where uch.campaign_offer_id='${id}' AND wrong_attempted=true` + filter

            // selected_data = ' users_campaign_history.user_id,users_campaign_history.campaign_id,users_campaign_history.campaign_offer_id,users_campaign_history.created_at ';
            total = await sails.sendNativeQuery(select + query, [])
            total = total.rowCount;
          }
          if (action_type == 'applied') {
            if ((data && data != "")) {
              if (data && data != "" && data != null) {
                filter = " AND (jth.order_id LIKE '%" + data.toLowerCase() + "%' OR LOWER(users.full_name) LIKE '%" + data.toLowerCase() + "%' OR LOWER(users.email) LIKE '%" + data.toLowerCase() + "%' )";
              }
            }
            // from += ' from jst_trade_history INNER JOIN users ON jst_trade_history.user_id = users.id where campaign_offer_id='+id;
            select = `select jth.id,jth.user_id,jth.created_at,jth.campaign_offer_id,jth.order_id as order_id, users.full_name, users.email,'Applied' offer_type,false is_attempted, (CASE WHEN jth.side = 'Buy' THEN ((jth.faldax_fees_actual-jth.faldax_fees)*(jth.asset1_usd_value)) ELSE ((jth.faldax_fees_actual-jth.faldax_fees)*(jth.asset2_usd_value)) END) as waived_fees, CONCAT((jth.faldax_fees_actual-jth.faldax_fees),' ', (CASE when jth.side = 'Buy' THEN jth.currency ELSE jth.settle_currency END)) as faldax_fees  
                      from jst_trade_history AS jth
                      INNER JOIN users
                      on jth.user_id=users.id
                      where jth.campaign_offer_id='${id}'` + filter
            // selected_data = ' jst_trade_history.user_id,jst_trade_history.campaign_id,jst_trade_history.campaign_offer_id,jst_trade_history.created_at,jst_trade_history.order_id ';
            total = await sails.sendNativeQuery(select + query, [])
            total = total.rowCount;
          }
        } else {
          let filter1 = filter2 = '';
          if ((data && data != "")) {
            if (data && data != "" && data != null) {
              filter1 = " AND (LOWER(full_name) LIKE '%" + data.toLowerCase() + "%' OR LOWER(email) LIKE '%" + data.toLowerCase() + "%' )";
              filter2 = " AND (order_id LIKE '%" + data.toLowerCase() + "%' OR LOWER(full_name) LIKE '%" + data.toLowerCase() + "%' OR LOWER(email) LIKE '%" + data.toLowerCase() + "%' )";
            }
          }
          select = "select uch.id,uch.user_id,uch.created_at,uch.campaign_offer_id,uch.code as order_id,users.full_name, users.email,'Attempted' offer_type, uch.wrong_attempted as is_attempted,'0' waived_fees,'0' faldax_fees   from users_campaign_history AS uch INNER JOIN users on uch.user_id=users.id where uch.campaign_offer_id='" + id + "'" + filter1 + " AND uch.wrong_attempted=true  UNION ALL select jth.id,jth.user_id,jth.created_at,jth.campaign_offer_id,jth.order_id as order_id, users.full_name, users.email,'Applied' offer_type,false is_attempted, (CASE WHEN jth.side = 'Buy' THEN ((jth.faldax_fees_actual-jth.faldax_fees)*(jth.asset1_usd_value)) ELSE ((jth.faldax_fees_actual-jth.faldax_fees)*(jth.asset2_usd_value)) END) as waived_fees, CONCAT((jth.faldax_fees_actual-jth.faldax_fees),' ', (CASE when jth.side = 'Buy' THEN jth.currency ELSE jth.settle_currency END)) as faldax_fees from jst_trade_history AS jth INNER JOIN users on jth.user_id=users.id where jth.campaign_offer_id=" + id + filter2;
          // selected_data = ' users_campaign_history.user_id,users_campaign_history.campaign_id,users_campaign_history.campaign_offer_id,users_campaign_history.created_at,jst_trade_history.user_id,jst_trade_history.campaign_id,jst_trade_history.campaign_offer_id,jst_trade_history.created_at,jst_trade_history.order_id';          
          total = await sails.sendNativeQuery(select + query, [])
          total = total.rowCount;
        }

        // countQuery = select + query;

        if (sortCol && sortOrder) {
          let sortVal = (sortOrder == 'descend' ?
            'DESC' :
            'ASC');
          query += " ORDER BY " + sortCol + " " + sortVal;
        } else {
          query += " ORDER BY created_at DESC";
        }

        query += " limit " + limit + " offset " + (parseInt(limit) * (parseInt(page) - 1));
        // console.log(select + query);
        // let get_data = await sails.sendNativeQuery("Select  "+selected_data+",users.first_name, users.last_name, users.email " + from +  query, [])
        let get_data = await sails.sendNativeQuery(select + query, [])

        // get_campaign_offers[0].offer_used_data = get_data.rows;
        // var total = await sails.sendNativeQuery( countQuery, [])
        // total = total.rows[0].count;        
        if (get_data.rowCount > 0) {
          return res
            .status(200)
            .json({
              "status": 200,
              "message": sails.__("compaigns retrieve success"),
              "data": {
                used_data: get_data.rows,
                // campaigns: get_data.rows,
                total
              }
            })
        } else {
          return res
            .status(200)
            .json({
              status: 200,
              "message": sails.__("No records for offercode"),
              "data": {
                used_data: [],
                // campaigns: get_data.rows,
                total
              }
            });
        }
      } else {
        return res
          .status(500)
          .json({
            status: 500,
            "err": sails.__("No records for offercode"),
            error_at:sails.__("No records for offercode")
          });
      }

    } catch (error) {
      // console.log("error", error);
      // await logger.error(error.message)
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong"),
          error_at:error.stack
        });
    }
  },

};
