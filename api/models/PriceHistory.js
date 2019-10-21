/**
 * PriceHistory.js
 *
 * @description :: Represents a database table PriceHistory.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  tableName: 'price_history',
  attributes: {
    coin: {
      type: 'string',
      columnName: 'coin',
      allowNull: true
    },
    ask_price: {
      type: 'number',
      columnName: 'ask_price',
      required: true
    },
    bid_price: {
      type: 'number',
      columnName: 'bid_price',
      required: true
    },
    ask_size: {
      type: 'number',
      columnName: 'ask_size',
      required: true
    },
    coin: {
      type: 'string',
      columnName: 'coin',
      // required: true
      allowNull: true
    },
    bid_size: {
      type: 'number',
      columnName: 'bid_size',
      required: true
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
