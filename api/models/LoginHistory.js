/**
 * LoginHistory.js
 *
 * @description :: Represents a database table login_history.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  tableName: "login_history",

  attributes: {
    ip: {
      type: "string",
      columnName: "ip"
    },
    is_logged_in: {
      type: "boolean",
      columnName: "is_logged_in",
      defaultsTo: true
    },
    device_type: {
      type: "number",
      columnName: "device_type",
      allowNull: true,
    },
    device_token: {
      type: "string",
      columnName: "device_token",
      allowNull: true
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
    user: {
      model: 'users',
      columnName: 'user_id',
    },
  },
  beforeCreate: (values, next) => {
    values.created_at = new Date();
    next();
  },
  beforeUpadte: (values, next) => {
    values.updated_at = new Date();
    next();
  },
};
