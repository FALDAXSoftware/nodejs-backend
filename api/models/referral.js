/**
 * referral.js
 *
 * @description :: A model definition.  Represents a database of referral.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  tableName: 'referral',
  attributes: {
    coin_name: {
      type: 'string',
      columnName: 'coin_name',
      allowNull: true
    },
    is_collected: {
      type: 'boolean',
      columnName: 'is_collected',
      defaultsTo : false
    },
    referred_user_id: {
      model: 'users',
      columnName: 'referred_user_id'
    },
    txid :{
      type: 'string',
      columnName: 'txid',
      allowNull: true
    },
    amount: {
      type: 'number',
      columnName: 'amount'
    },
    user_id: {
      model: 'users',
      columnName: 'user_id'
    },
    coin_id: {
      model: 'coins',
      columnName: 'coin_id'
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
