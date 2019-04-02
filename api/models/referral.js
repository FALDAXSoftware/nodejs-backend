/**
 * Referral.js
 *
 * @description :: A model definition.  Represents a database of referral.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  tableName: 'referral',
  attributes: {
    user_id: {
      type: 'string',
      columnName: 'user_id'
    },
    coin_id: {
      type: 'string',
      columnName: 'coin_id'
    },
    coin_name: {
      model: 'coins',
      columnName: 'coin_name'
    },
    amount: {
      type: 'number',
      columnName: 'amount'
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
  beforeCreate: function (val, next) {
    val.created_at = new Date();
    next();
  },
  beforeUpdate: function (val, next) {
    val.updated_at = new Date();
    next();
  }
};
