/**
 * Admin.js
 *
 * @description :: Represents a database table kyc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  tableName: 'kyc',
  attributes: {
    first_name: {
      type: 'string',
      columnName: 'first_name',
      allowNull: true
    },
    last_name: {
      type: 'string',
      columnName: 'last_name',
      allowNull: true
    },
    phone_number: {
      type: 'string',
      columnName: 'phone_number'
    },
    country: {
      type: 'string',
      columnName: 'country',
      allowNull: true
    },
    state: {
      type: 'string',
      columnName: 'state',
      allowNull: true
    },
    dob: {
      type: 'string',
      columnName: 'dob',
      allowNull: true
    },
    address: {
      type: 'string',
      columnName: 'address',
      allowNull: true
    },
    address_2: {
      type: 'string',
      columnName: 'address_2',
      allowNull: true
    },
    city: {
      type: 'string',
      columnName: 'city',
      allowNull: true
    },
    zip: {
      type: 'string',
      columnName: 'zip',
      allowNull: true
    },
    id_type: {
      type: 'number',
      columnName: 'id_type',
      allowNull: true
    },
    front_doc: {
      type: 'string',
      columnName: 'front_doc'
    },
    back_doc: {
      type: 'string',
      columnName: 'back_doc'
    },
    ssn: {
      type: 'string',
      columnName: 'ssn'
    },
    status: {
      type: 'boolean',
      columnName: 'status',
      allowNull: true
    },
    result: {
      type: 'string',
      columnName: 'result'
    },
    direct_response: {
      type: 'string',
      columnName: 'direct_response',
      allowNull: true
    },
    webhook_response: {
      type: 'string',
      columnName: 'webhook_response',
      allowNull: true
    },
    mtid: {
      type: 'string',
      columnName: 'mtid',
      allowNull: true
    },
    comments: {
      type: 'string',
      columnName: 'comments',
      allowNull: true
    },
    kyc_doc_details: {
      type: 'string',
      columnName: 'kyc_doc_details',
      allowNull: true
    },
    country_code: {
      type: 'string',
      columnName: 'country_code',
      allowNull: true
    },
    is_approve: {
      type: 'boolean',
      columnName: 'is_approve',
      defaultsTo: false
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
    user_id: {
      columnName: 'user_id',
      model: 'users'
    },
    steps: {
      columnName: 'steps',
      defaultsTo: 1,
      type: 'number'
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
