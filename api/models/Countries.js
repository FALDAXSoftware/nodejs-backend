/**
 * Countries.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    name: {
      type: 'string',
      columnName: 'name',
      required: true
    },
    country_code:{
      type: 'string',
      columnName: 'country_code',
      required: true
    },
    latlng:{
      type: 'string',
      columnName: 'latlng',
      required: true
    },
    is_active:{
      type: 'boolean',
      columnName: 'is_active',
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
    }

  },

};

