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
    start_date: {
      type: 'ref',
      columnType: 'date',
      columnName: 'start_date'
    },
    end_date: {
      type: 'ref',
      columnType: 'date',
      columnName: 'end_date'
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
