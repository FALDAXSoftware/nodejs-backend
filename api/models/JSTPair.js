/**
 * Fees.js
 *
 * @description :: Represents a database table pairs.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  tableName: 'jst_pair',
  attributes: {
    original_pair: {
      type: 'string',
      columnName: 'original_pair'
    },
    order_pair: {
      type: 'string',
      columnName: 'order_pair',
      required: true
    },
    crypto: {
      type: 'string',
      columnName: 'crypto',
      required: true
    },
    currency: {
      type: 'number',
      columnName: 'currency',
      required: true
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
