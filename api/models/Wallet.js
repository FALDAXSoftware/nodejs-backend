/**
 * Wallet.js
 *
 * @description :: A model definition represents a database of wallets.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  tableName: 'wallets',
  attributes: {
    wallet_id: {
      type: "string",
      columnName: "wallet_id"
    },
    coin_id: {
      columnName: "coin_id",
      model: "coins"
    },
    receive_address: {
      type: "string",
      columnName: "receive_address"
    },
    user_id: {
      columnName: "user_id",
      model: "users"
    },
    balance: {
      type: "number",
      columnName: "balance",
      defaultsTo: 0
    },
    placed_balance: {
      type: "number",
      columnName: "placed_balance"
    },
    is_active: {
      type: 'boolean',
      columnName: 'is_active',
      defaultsTo: true
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
