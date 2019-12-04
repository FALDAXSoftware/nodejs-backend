/**
 * MarketSnapshotPrices.js
 *
 * @description :: Represents a database table trade_history.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  tableName: 'market_snapshot_prices',
  attributes: {
    symbol: {
      type: 'string',
      columnName: 'symbol'
    },
    target_sub_id: {
      type: 'string',
      columnName: 'target_sub_id',
      allowNull:true
    },
    md_req_id: {
      type: 'string',
      columnName: 'md_req_id',
      allowNull:true
    },
    product: {
      type: 'string',
      columnName: 'product',
      allowNull:true
    },
    maturity_date: {
      type: 'string',
      columnName: 'maturity_date',
      allowNull:true
    },   
    md_entries: {
      type: 'ref',
      columnType: 'json',
      columnName: 'md_entries',
      defaultsTo: {}
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
