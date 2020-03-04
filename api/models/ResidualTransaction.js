/**
 * ResidualTransaction.js
 *
 * @description :: Represents a database table transaction_table.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  tableName: 'residual_transactions',
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
    is_executed: {
      type: 'boolean',
      columnName: 'is_executed'
    },
    transaction_type: {
      type: 'string',
      columnName: 'transaction_type'
    },
    coin_id: {
      type: 'number',
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
    },
    is_admin: {
      type: 'boolean',
      columnName: 'is_admin',
      defaultsTo: false
    },
    transaction_id: {
      type: 'string',
      columnName: 'transaction_id'
    },
    faldax_fee: {
      type: "number",
      columnName: "faldax_fee"
    },
    actual_network_fees: {
      type: "number",
      columnName: "actual_network_fees"
    },
    estimated_network_fees: {
      type: "number",
      columnName: "estimated_network_fees"
    },
    actual_amount: {
      type: "number",
      columnName: "actual_amount"
    },
    is_done: {
      type: 'boolean',
      columnName: 'is_done',
      defaultsTo: false
    },
    sender_user_balance_before: {
      type: "number",
      columnName: "sender_user_balance_before"
    },
    receiver_user_balance_before: {
      type: "number",
      columnName: "receiver_user_balance_before"
    },
    warm_wallet_balance_before: {
      type: "number",
      columnName: "warm_wallet_balance_before"
    },
    transaction_from: {
      type: "string",
      columnName: "transaction_from"
    },
    residual_amount: {
      type: "number",
      columnName: "residual_amount"
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
