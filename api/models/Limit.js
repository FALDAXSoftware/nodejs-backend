/**
 * Limit.js
 *
 * @description :: Represents a database table limit.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  tableName: 'limit',
  attributes: {
    user: {
      type: 'string',
      columnName: 'user'
    },
    monthly_deposit_crypto: {
      type: 'number',
      columnName: 'monthly_deposit_crypto'
    },
    monthly_deposit_fiat: {
      type: 'number',
      columnName: 'monthly_deposit_fiat'
    },
    monthly_withdraw_crypto: {
      type: 'number',
      columnName: 'monthly_withdraw_crypto'
    },
    monthly_withdraw_fiat: {
      type: 'number',
      columnName: 'monthly_withdraw_fiat'
    },
    daily_deposit_crypto: {
      type: 'number',
      columnName: 'daily_deposit_crypto'
    },
    daily_deposit_fiat: {
      type: 'number',
      columnName: 'daily_deposit_fiat'
    },
    daily_withdraw_crypto: {
      type: 'number',
      columnName: 'daily_withdraw_crypto'
    },
    daily_withdraw_fiat: {
      type: 'number',
      columnName: 'daily_withdraw_fiat'
    },
    min_withdrawl_crypto: {
      type: 'number',
      columnName: 'min_withdrawl_crypto'
    },
    min_withdrawl_fiat: {
      type: 'number',
      columnName: 'min_withdrawl_fiat'
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
