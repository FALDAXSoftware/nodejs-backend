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
      columnName: 'maker_fee',
      required: true
    },
    taker_fee: {
      type: 'number',
      columnName: 'taker_fee',
      required: true
    },
    is_active: {
      type: 'boolean',
      columnName: 'is_active',
      defaultsTo: true,
      allowNull: true
    },
    symbol: {
      type: 'string',
      columnName: 'symbol',
      // required: true
    },
    kraken_pair: {
      type: 'string',
      columnName: 'kraken_pair',
      // required: true
    },
    ask_price: {
      type: 'number',
      columnName: 'ask_price',
      // required: true
    },
    bid_price: {
      type: 'number',
      columnName: 'bid_price',
      // required: true
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
    crypto_minimum:{
      type: 'number',
      columnName: 'crypto_minimum',
      defaultsTo: 0
    },
    crypto_maximum:{
      type: 'number',
      columnName: 'crypto_maximum',
      defaultsTo: 0
    },
    bot_status: {
      type: 'boolean',
      columnName: 'bot_status',
      defaultsTo: false,
      allowNull: true
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
