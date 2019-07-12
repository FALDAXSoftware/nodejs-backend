/**
 * IPWhitelist.js
 *
 * @description :: Represents a database table fees.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  tableName: 'ip_whitelist',
  primaryKey: 'id',
  attributes: {
    ip: {
      type: "string",
      columnName: "ip"
    },
    max_duration: {
      type: 'ref',
      columnType: "datetime",
      columnName: "max_duration"
    },
    user_id: {
      columnName: "user_id",
      model: "users"
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
