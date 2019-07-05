/**
 * SmsTemplate.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  tableName: 'sms_template',
  attributes: {
    slug: {
      type: 'string',
      columnName: 'slug',
      required: true
    },
    user_id: {
      columnName: "user_id",
      model: "users"
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
