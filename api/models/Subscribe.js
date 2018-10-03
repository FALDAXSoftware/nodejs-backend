/**
 * Subscribe.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    email : {
      type: 'string', 
      columnName: 'email'
    },
    is_news_feed : {
      type: 'string', 
      columnName: 'is_news_feed',
      required: true
    },
    created_at : {
      type: 'ref', 
      columnType: 'datetime',
      columnName: 'created_at'
    },
    updated_at : {
      type: 'ref', 
      columnType: 'datetime',
      columnName: 'updated_at'
    },
    deleted_at: {
      type: 'ref', 
      columnType: 'datetime',
      columnName: 'deleted_at'
    },
  },

};

