/**
 * UserFavourites.js
 *
 * @description :: Represents a database table user_limit.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  tableName: 'user_favourites',
  attributes: {
    user_id: {
      type: 'number',
      columnName: 'user_id'
    },
    priority: {
      type: 'number',
      columnName: 'priority'
    },
    pair_from: {
      type: 'string',
      columnName: 'pair_from'
    },
    pair_to: {
      type: 'string',
      columnName: 'pair_to'
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
