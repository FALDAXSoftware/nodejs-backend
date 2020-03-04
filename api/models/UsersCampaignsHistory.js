/**
 * UsersCampaignsHistory.js
 *
 * @description :: Represents a database table PriceHistory.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  tableName: 'users_campaign_history',
  attributes: {
    code: {
      type: 'string',
      columnName: 'code'
    },    
    user_id: {
      type: 'number'
    },
    campaign_id: {
      type: 'number',
      columnName: 'campaign_id'
    },
    campaign_offer_id: {
      type: 'number',
      columnName: 'campaign_offer_id'
    },
    wrong_attempted:{
      type: 'boolean',
      columnName: 'wrong_attempted',
      defaultsTo: false
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
