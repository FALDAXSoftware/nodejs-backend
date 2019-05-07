/**
 * State.js
 *
 * @description :: Represents a database table states.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  tableName: 'states',
  attributes: {
    name: {
      type: 'string',
      columnName: 'name'
    },
    country_id: {
      model: 'countries',
      columnName: 'country_id'
    },
    legality: {
      type: 'number',
      columnName: 'legality',
      defaultsTo: 1
    },
    color: {
      type: "string",
      columnName: 'color'
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
