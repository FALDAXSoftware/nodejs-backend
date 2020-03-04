/**
 * admin_permissions.js
 *
 * @description :: A model definition. Represents a database of admin_permissions.
 * @docs :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  tableName: 'admin_permissions',
  primaryKey: 'id',
  attributes: {
    role_id: {
      type: 'string',
      columnName: 'role_id',
      allowNull: true
    },
    permission_id: {
      type: 'string',
      columnName: 'permission_id',
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
    }
  },
  beforeCreate: function (val, next) {
    val.created_at = new Date();
    next();
  },
  beforeUpdate: function (val, next) {
    val.updated_at = new Date();
    next();
  }
};
