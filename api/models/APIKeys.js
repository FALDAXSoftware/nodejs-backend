/**
 * APIKeys.js
 *
 * @description :: Represents a database table trade_history.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  tableName: 'api_keys',
  attributes: {
    user_id: {
      type: 'number'
    },
    module: {
      type: 'ref',
      columnType: 'json',
      columnName: 'module',
      defaultsTo: {}
    },
    api_key: {
      type: 'string',
      columnName: 'api_key'
    },
    ip: {
      type: 'string',
      columnName: 'ip'
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
    values.created_at = new Date();
    next();
  },

  beforeUpdate: function (values, next) {
    values.updated_at = new Date();
    next();
  }
};
