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
    destination_address: {
      type: "string",
      columnName: "destination_address"
    },
    user_id: {
      columnName: "user_id",
      model: "users"
    },
    amount: {
      type: "number",
      columnName: "amount"
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
