/**
 * Notifications.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  tableName: 'notifications',
  attributes: {
    slug: {
      type: 'string',
      allowNull: true,
      columnName: 'slug'
    },
    is_necessary: {
      type: 'boolean',
      columnName: 'is_necessary',
      defaultsTo: false
    },
    title: {
      type: 'string',
      columnName: "title"
    },
    title_ja: {
      type: 'string',
      columnName: "title_ja"
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
