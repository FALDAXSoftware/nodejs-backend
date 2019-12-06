/**
 * permissions.js
 *
 * @description :: A model definition. Represents a database of permissions.
 * @docs :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  tableName: 'role_permissions',
  primaryKey: 'id',
  attributes: {
    display_name: {
      type: 'string',
      columnName: 'display_name'
    },
    module_name: {
      type: 'string',
      columnName: 'module_name'
    },
    main_module: {
      type: 'string',
      columnName: 'main_module'
    },
    sub_module_name: {
      type: 'string',
      columnName: 'sub_module_name'
    },
    route_name: {
      type: 'string',
      columnName: 'route_name'
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
