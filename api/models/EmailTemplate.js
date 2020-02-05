/**
 * EmailTemplate.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  tableName: 'email_template',
  attributes: {
    slug: {
      type: 'string',
      columnName: 'slug',
      required: true
    },
    name: {
      type: 'string',
      columnName: 'name',
      required: true
    },
    content: {
      type: 'string',
      columnName: 'content',
      required: true
    },
    note: {
      type: 'string',
      columnName: 'note',
      required: true
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
    all_content: {
      type: 'ref',
      columnType: 'json',
      columnName: 'all_content',
      defaultsTo: {}
    }
  },
  beforeCreate: (values, next) => {
    values.created_at = new Date();
    next();
  },
  beforeUpdate: (values, next) => {
    values.updated_at = new Date();
    next();
  },

};

