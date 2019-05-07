/**
 * PendingBook.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  tableName: 'pending_book',
  attributes: {
    maximum_time: {
      type: 'ref',
      columnType: 'datetime',
      columnName: 'maximum_time'
    },
    fill_price: {
      type: 'number',
      columnName: 'fill_price'
    },
    limit_price: {
      type: 'number',
      columnName: 'limit_price'
    },
    stop_price: {
      type: 'number',
      columnName: 'stop_price'
    },
    price: {
      type: 'number',
      columnName: 'price'
    },
    quantity: {
      type: 'number',
      columnName: 'quantity'
    },
    user_id: {
      type: 'string',
      columnName: 'user_id',
      required: true
    },
    avg_price: {
      type: 'number',
      columnName: 'avg_price'
    },
    currency: {
      type: 'string',
      columnName: 'currency'
    },
    settle_currency: {
      type: 'string',
      columnName: 'settle_currency'
    },
    working_indicator: {
      type: 'boolean',
      columnName: 'working_indicator',
      defaultsTo: false
    },
    order_type: {
      type: 'string',
      columnName: 'order_type'
    },
    order_status: {
      type: 'string',
      columnName: 'order_status'
    },
    time: {
      type: 'ref',
      columnType: 'datetime',
      columnName: 'time'
    },
    side: {
      type: 'string',
      columnName: 'side'
    },
    is_partially_fulfilled: {
      type: 'boolean',
      columnName: 'is_partially_fulfilled',
      defaultsTo: false
    },
    fix_quantity: {
      type: 'number',
      columnName: 'fix_quantity'
    },
    symbol: {
      type: 'string',
      columnName: 'symbol'
    },
    maker_fee: {
      type: 'number',
      columnName: 'maker_fee'
    },
    taker_fee: {
      type: 'number',
      columnName: 'taker_fee'
    },
    activity_id: {
      type: 'number',
      columnName: "activity_id"
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
    values.updated_at = new Date();

    next();
  },
  beforeUpdate: (values, next) => {
    values.updated_at = new Date();
    next();
  }
};
