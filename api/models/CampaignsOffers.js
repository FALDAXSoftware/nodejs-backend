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
    transaction_fees: {
      type: 'ref',
      columnType: 'number',
      columnName: 'transaction_fees'
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
