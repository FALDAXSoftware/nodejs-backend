/**
 * TransactionTable.js
 *
 * @description :: Represents a database table transaction_table.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  tableName: 'transaction_table',
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
    faldax_fee: {
      type: "number",
      columnName: "faldax_fee"
    },
    user_id: {
      type: 'string',
      columnName: 'user_id',
      required: true
    },
    transaction_type: {
      type: 'string',
      columnName: 'transaction_type'
    },
    transaction_id: {
      type: 'string',
      columnName: 'transaction_id'
    },
    is_admin: {
      type: 'boolean',
      columnName: 'is_admin',
      defaultsTo: false
    },
    coin_id: {
      type: 'number',
      columnName: 'coin_id'
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
