/**
 * WithdrawRequest.js
 *
 * @description :: Represents a database table withdraw_request.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  tableName: 'withdraw_request',
  attributes: {
    source_address: {
      type: 'string',
      columnName: 'source_address'
    },
    destination_address: {
      type: 'string',
      columnName: 'destination_address'
    },
    amount: {
      type: 'string',
      columnName: 'amount'
    },
    user_id: {
      type: 'string',
      columnName: 'user_id',
      required: true
    },
    is_approve: {
      type: 'boolean',
      columnName: 'is_approve',
      allowNull: true
    },
    transaction_type: {
      type: 'string',
      columnName: 'transaction_type'
    },
    coin_id: {
      type: 'number',
      columnName: 'coin_id'
    },
    fees: {
      type: 'number',
      columnName: 'fees'
    },
    is_executed: {
      type: 'boolean',
      columnName: 'is_executed'
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
  beforeCreate: function (values, next) {
    values.created_at = new Date();
    next();
  },

  beforeUpdate: function (values, next) {
    values.updated_at = new Date();
    next();
  }
};
