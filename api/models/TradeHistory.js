/**
 * TradeHistory.js
 *
 * @description :: Represents a database table trade_history.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  tableName: 'trade_history',
  attributes: {
    maximum_time: {
      type: 'ref',
      columnName: 'maximum_time',
      columnType: 'datetime'
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
    filled: {
      type: 'number',
      columnName: 'filled'
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
    average_price: {
      type: 'number',
      columnName: 'average_price'
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
    is_stop_limit: {
      type: 'boolean',
      columnName: 'is_stop_limit',
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
    requested_user_id: {
      type: 'number',
      columnName: 'requested_user_id'
    },
    is_partially_filled: {
      type: 'boolean',
      columnName: 'is_partially_filled',
      defaultsTo: false
    },
    is_stop_limit: {
      type: 'boolean',
      columnName: 'is_stop_limit',
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
    user_id: {
      type: 'number',
      columnName: 'user_id',
      required: true
    },
    user_fee: {
      type: 'number',
      columnName: 'user_fee'
    },
    user_coin: {
      type: 'string',
      columnName: 'user_coin'
    },
    requested_fee: {
      type: 'number',
      columnName: 'requested_fee'
    },
    requested_coin: {
      type: 'string',
      columnName: 'requested_coin'
    },
    is_collected: {
      type: 'boolean',
      columnName: 'is_collected'
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
    deleted: {
      type: 'boolean',
      columnName: 'deleted'
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
    },
    order_id: {
      type: 'string',
      columnName: 'order_id',
      defaultsTo: ""
    },
    execution_report: {
      type: 'ref',
      columnType: 'json',
      columnName: 'execution_report',
      defaultsTo: {}
    },
    placed_by: {
      type: 'string',
      columnName: 'placed_by',
      allowNull: true
    },
    fiat_values: {
      type: 'ref',
      columnType: 'json',
      columnName: 'fiat_values',
      defaultsTo: {
        asset1_usd: 0.0,
        asset1_eur: 0.0,
        asset1_inr: 0.0,
        asset2_usd: 0.0,
        asset2_eur: 0.0,
        asset2_inr: 0.0
      }
    }
  },
  beforeCreate: function (values, next) {
    values.created_at = new Date();
    var result = '';
    let length = 32;
    let chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
    var current_date = new Date();
    current_date = current_date.getTime();
    values.transaction_id = ("tx_" + current_date + result).toLocaleLowerCase();
    console.log("values", values);
    next();
  },

  beforeUpdate: function (values, next) {
    values.updated_at = new Date();
    next();
  }
};
