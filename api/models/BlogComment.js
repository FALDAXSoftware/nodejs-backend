/**
 * BlogComment.js
 *
 * @description :: Represents a database table blog_comments.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  tableName: 'blog_comments',
  attributes: {
    user: {
      model: 'users',
      columnName: 'user_id',
    },
    blog: {
      model: 'blogs',
      columnName: 'blog_id'
    },
    comment: {
      type: 'string',
      columnName: 'comment',
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

