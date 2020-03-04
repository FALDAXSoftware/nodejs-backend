/**
 * Campaigns.js
 *
 * @description :: Represents a database table PriceHistory.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  tableName: 'campaigns',
  attributes: {
    label: {
      type: 'string',
      columnName: 'label'
    },  
    description: {
      type: 'string',
      columnName: 'description'
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
    start_date: {
      type: 'string',
      columnName: 'start_date'
    },
    end_date: {
      type: 'string',
      columnName: 'end_date'
    },
    usage: {
      type: 'ref',
      columnType: 'number', // 1:One time, 2:Multiple time
      columnName: 'usage'
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
