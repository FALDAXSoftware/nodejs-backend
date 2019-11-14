/**
 * CampaignsOffers.js
 *
 * @description :: Represents a database table PriceHistory.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  tableName: 'campaigns_offers',
  attributes: {
    code: {
      type: 'string',
      columnName: 'code'
    },    
    campaign_id: {
      // required: true,
      model: 'campaigns',      
    },
    user_id: {
      type: 'number'
    },
    description: {
      type: 'string',
      columnName: 'description'
    },
    is_default_values:{
      type: 'boolean',
      columnName: 'is_default_values',
      defaultsTo: true,
    },
    no_of_transactions: {
      type: 'ref',
      columnType: 'number',
      columnName: 'no_of_transactions'
    },
    fees_allowed: {
      type: 'ref',
      columnType: 'number',
      columnName: 'fees_allowed'
    },
    is_active: {
      type: 'boolean',
      columnName: 'is_active',
      defaultsTo: true,
    },
    created_at: {
      type: 'ref',
      columnType: 'datetime',
      columnName: 'created_at'
    },
    updated_at: {
      type: 'ref',
      columnType: 'datetime',
      columnName: 'updated_at'
    },
    deleted_at: {
      type: 'ref',
      columnType: 'datetime',
      columnName: 'deleted_at'
    },
    start_date: {
      type: 'ref',
      columnType: 'date',
      columnName: 'start_date'
    },
    end_date: {
      type: 'ref',
      columnType: 'date',
      columnName: 'end_date'
    }
  },
  beforeCreate: (values, next) => {
    values.created_at = new Date();
    next();
  },
  beforeUpdate: (values, next) => {
    values.updated_at = new Date();
    next();
  }
};
