/**
 * AdminSetting.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  tableName: 'admin_settings',
  attributes: {
    name: {
      type: 'string',
      columnName: 'name',
      allowNull: true
    },
    slug: {
      type: 'string',
      columnName: 'slug',
      allowNull: true
    },
    value: {
      type: 'string',
      columnName: 'value',
      allowNull: true
    },
    type: {
      type: 'string',
      columnName: 'type',
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

