/**
 * TempCoinmarketcap.js
 *
 * @description :: Represents a database table withdraw_request.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */
var moment = require("moment");
module.exports = {
  tableName: 'temp_coinmarketcap',
  primaryKey: 'id',
  attributes: {
    coin: {
      type: 'string',
      columnName: 'coin'
    },
    price: {
      type: 'string',
      columnName: 'price'
    },
    // last_updated: {
    //   columnType: 'datetime',
    //   columnName: 'last_updated'
    // },
    market_cap: {
      type: 'string',
      columnName: 'market_cap'
    },
    percent_change_1h: {
      type: 'string',
      columnName: 'percent_change_1h'
    },
    percent_change_24h: {
      type: 'string',
      columnName: 'percent_change_24h'
    },
    percent_change_7d: {
      type: 'string',
      columnName: 'percent_change_7d'
    },
    volume_24h: {
      type: 'string',
      columnName: 'volume_24h'
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
  beforeCreate: function (values, next) {
    values.created_at =moment().utc();
    next();
  },

  beforeUpdate: function (values, next) {
    values.updated_at = new Date();
    next();
  }
};
