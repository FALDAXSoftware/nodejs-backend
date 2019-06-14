/**
 * jobCategory.js
 *
 * @description :: A model definition.  Represents a database of job_category.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  tableName: 'job_category',
  attributes: {
    category: {
      type: 'string',
      columnName: 'category'
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
    is_active: {
      type: 'boolean',
      columnName: 'is_active'
    },
    jobs: {
      collection: 'jobs',
      via: 'category_id'
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
