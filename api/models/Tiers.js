/**
 * Tiers.js
 *
 * @description :: Represents a database table currency_conversion.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  tableName: 'tiers',
  attributes: {
    tier_step: {
      type: 'number',
      columnName: 'tier_step'
    },
    minimum_activity_thresold: {
      type: 'ref',
      columnType: 'json',
      columnName: 'minimum_activity_thresold'
    },
    requirements: {
      type: 'ref',
      columnType: 'json',
      columnName: 'requirements'
    },
    daily_withdraw_limit: {
      type: 'number',
      columnName: 'daily_withdraw_limit'
    },
    monthly_withdraw_limit: {
      type: 'number',
      columnName: 'monthly_withdraw_limit'
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
  },
};
