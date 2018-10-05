/**
 * Role.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  tableName: 'roles',
  attributes: {
    name: {
      type: "string"
    },
    user: {
      type: "boolean",
      defaultsTo: false,
      columnName: 'user',
    },
    coin: {
      type: "boolean",
      defaultsTo: false,
      columnName: 'coin',
    },
    emailTemplate: {
      type: "boolean",
      defaultsTo: false,
      columnName: 'emailTemplate',
    },
    staticPage: {
      type: "boolean",
      defaultsTo: false,
      columnName: 'staticPage',
    },
    role: {
      type: "boolean",
      defaultsTo: false,
      columnName: 'role',
    },
    is_active: {
      type: 'boolean',
      columnName: 'is_active',
      defaultsTo: true,
      allowNull: true,
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
  beforeUpadte: (values, next) => {
    values.updated_at = new Date();
    next();
  },
};

