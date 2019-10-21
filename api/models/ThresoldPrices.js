/**
 * ThresoldPrices.js
 *
 * @description :: Represents a database table thresold_prices.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  tableName: 'thresold_prices',
  attributes: {
    coin_id: {
      model: "coins",
      columnName: 'coin_id'
    },
    symbol: {
      type: 'string',
      columnName: 'symbol',
      required: true
    },
    quote: {
      type: 'ref',
      columnType: 'json',
      columnName: 'quote'
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
  },
};
