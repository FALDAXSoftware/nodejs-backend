/**
 * Limit.js
 *
 * @description :: Represents a database table limit.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  tableName: 'tier_limit',
  attributes: {
    tier_step: {
      type: 'number',
      columnName: 'tier_step'
    },
    coin_id: {
      type: 'number',
      columnName: 'coin_id'
    },
    monthly_withdraw_crypto: {
      type: 'number',
      columnName: 'monthly_withdraw_crypto',
      allowNull: true
    },
    monthly_withdraw_fiat: {
      type: 'number',
      columnName: 'monthly_withdraw_fiat',
      allowNull: true
    },
    daily_withdraw_crypto: {
      type: 'number',
      columnName: 'daily_withdraw_crypto',
      allowNull: true
    },
    daily_withdraw_fiat: {
      type: 'number',
      columnName: 'daily_withdraw_fiat',
      allowNull: true
    },
    min_withdrawl_crypto: {
      type: 'number',
      columnName: 'min_withdrawl_crypto',
      allowNull: true
    },
    min_withdrawl_fiat: {
      type: 'number',
      columnName: 'min_withdrawl_fiat',
      allowNull: true
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
