/**
 * WalletHistory.js
 *
 * @description :: A model definition represents a database of wallet history.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  tableName: 'wallet_history',
  attributes: {
    coin_id: {
      columnName: "coin_id",
      model: "coins"
    },
    source_address: {
      type: "string",
      columnName: "source_address"
    },
    is_executed: {
      type: "boolean",
      columnName: "is_executed"
    },
    destination_address: {
      type: "string",
      columnName: "destination_address"
    },
    is_admin: {
      type: 'boolean',
      columnName: 'is_admin',
      defaultsTo: false
    },
    user_id: {
      columnName: "user_id",
      model: "users"
    },
    amount: {
      type: "number",
      columnName: "amount"
    },
    actual_network_fees: {
      type: "number",
      columnName: "actual_network_fees"
    },
    estimated_network_fees: {
      type: "number",
      columnName: "estimated_network_fees"
    },
    residual_amount: {
      type: 'number',
      columnName: "residual_amount"
    },
    is_done: {
      type: 'boolean',
      columnName: 'is_done',
      defaultsTo: false
    },
    faldax_fee: {
      type: "number",
      columnName: "faldax_fee"
    },
    actual_amount: {
      type: "number",
      columnName: "actual_amount"
    },
    transaction_type: {
      type: "string",
      columnName: "transaction_type"
    },
    transaction_id: {
      type: "string",
      columnName: "transaction_id"
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
