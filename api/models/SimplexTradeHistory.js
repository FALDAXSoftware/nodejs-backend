/**
 * TradeHistory.js
 *
 * @description :: Represents a database table trade_history.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  tableName: 'simplex_trade_history',
  attributes: {
    fill_price: {
      type: 'number',
      columnName: 'fill_price'
    },
    price: {
      type: 'number',
      columnName: 'price'
    },
    quantity: {
      type: 'number',
      columnName: 'quantity'
    },
    currency: {
      type: 'string',
      columnName: 'currency'
    },
    settle_currency: {
      type: 'string',
      columnName: 'settle_currency'
    },
    side: {
      type: 'string',
      columnName: 'side'
    },
    payment_id: {
      type: 'string',
      columnName: 'payment_id'
    },
    quote_id: {
      type: 'string',
      columnName: 'quote_id'
    },
    address: {
      type: 'string',
      columnName: 'address'
    },
    order_type: {
      type: 'string',
      columnName: 'order_type'
    },
    order_status: {
      type: 'string',
      columnName: 'order_status'
    },
    symbol: {
      type: 'string',
      columnName: 'symbol'
    },
    is_processed: {
      type: 'boolean',
      columnName: 'is_processed',
      defaultsTo: false
    },
    user_id: {
      type: 'number',
      columnName: 'user_id',
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
    },
    trade_type: {
      type: 'number',
      columnName: 'trade_type',
      defaultsTo: 1
    },
    simplex_payment_status: {
      type: 'number',
      columnName: 'simplex_payment_status',
      defaultsTo: 1
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
