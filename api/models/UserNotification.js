/**
 * UserNotification.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  tableName: 'user_notifications',
  attributes: {
    slug: {
      type: 'string',
      allowNull: true,
      columnName: 'slug'
    },
    title: {
      type: 'string',
      columnName: 'title'
    },
    user_id: {
      columnName: "user_id",
      model: "users"
    },
    text: {
      type: 'boolean',
      columnName: "text",
      defaultsTo: false
    },
    email: {
      type: 'boolean',
      columnName: "email",
      defaultsTo: false
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
