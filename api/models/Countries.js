/**
 * Countries.js
 *
 * @description :: Represents a database table countries.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  tableName: 'countries',
  attributes: {
    name: {
      type: 'string',
      columnName: 'name',
      required: true
    },
    legality: {
      type: 'number',
      columnName: 'legality',
      defaultsTo: 1,
    },
    color: {
      type: "string",
      columnName: 'color',
    },
    is_active: {
      type: 'boolean',
      columnName: 'is_active',
      defaultsTo: true
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
  beforeCreate: function (values, next) {
    values.created_at = new Date();
    next();
  },

  beforeUpdate: function (values, next) {
    values.updated_at = new Date();
    next();
  }

};

