/**
 * Statics.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  tableName: 'statics',
  attributes: {
    name: {
      type: 'string',
      columnName: 'name',
      required: true
    },
    title: {
      type: 'string',
      columnName: 'title',
      required: true
    },
    content: {
      type: 'string',
      columnName: 'content',
      required: true
    },
    is_active: {
      type: 'boolean',
      columnName: 'is_active',
      defaultsTo: true,
      allowNull: true,
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
    }
  }

};

