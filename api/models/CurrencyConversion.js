/**
 * CurrencyConversion.js
 *
 * @description :: Represents a database table currency_conversion.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  tableName: 'currency_conversion',
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
    coin_name: {
      type: 'string',
      columnName: 'coin_name',
      required: true
    },
    original_value: {
      type: 'ref',
      columnType: 'json',
      columnName: 'original_value'
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
