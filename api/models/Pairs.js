/**
 * Fees.js
 *
 * @description :: Represents a database table pairs.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  tableName: 'pairs',
  attributes: {
    name: {
      type: 'string',
      columnName: 'name',
      required: true
    },
    coin_code1: {
      type: 'string',
      columnName: 'coin_code1',
      required: true
    },
    coin_code2: {
      type: 'string',
      columnName: 'coin_code2',
      required: true
    },
    maker_fee: {
      type: 'number',
      columnName: 'maker_fee'
    },
    taker_fee: {
      type: 'number',
      columnName: 'taker_fee'
    },
    is_active: {
      type: 'boolean',
      columnName: 'is_active',
      defaultsTo: true,
      allowNull: true
    },
    symbol: {
      type: 'string',
      columnName: 'symbol'
    },
    kraken_pair: {
      type: 'string',
      columnName: 'kraken_pair'
    },
    ask_price: {
      type: 'number',
      columnName: 'ask_price'
    },
    bid_price: {
      type: 'number',
      columnName: 'bid_price'
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
    crypto_minimum: {
      type: 'number',
      columnName: 'crypto_minimum',
      defaultsTo: 0
    },
    crypto_maximum: {
      type: 'number',
      columnName: 'crypto_maximum',
      defaultsTo: 0
    },
    order_maximum: {
      type: 'number',
      columnName: 'order_maximum',
      defaultsTo: 0
    },
    bot_status: {
      type: 'boolean',
      columnName: 'bot_status',
      defaultsTo: false,
      allowNull: true
    },
    price_precision: {
      type: 'number',
      columnName: 'price_precision'
    },
    quantity_precision: {
      type: 'number',
      columnName: 'quantity_precision'
    },
    influx_table_name: {
      type: 'string',
      columnName: 'influx_table_name'
    },
    influx_pair_name: {
      type: 'string',
      columnName: 'influx_pair_name'
    },
    buy_min_total: {
      type: 'number',
      columnName: 'buy_min_total'
    },
    sell_min_total: {
      type: 'number',
      columnName: 'sell_min_total'
    },
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
