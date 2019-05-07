/**
 * AddCoinRequest.js
 *
 * @description :: Represents a database table add_coin_requests.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  tableName: 'add_coin_requests',
  attributes: {
    coin_name: {
      type: 'string',
      columnName: 'coin_name',
      required: true
    },
    coin_symbol: {
      type: 'string',
      columnName: 'coin_symbol',
      allowNull: true
    },
    message: {
      type: 'string',
      columnName: 'message',
      allowNull: true
    },
    elevator_pitch: {
      type: 'string',
      columnName: 'elevator_pitch',
      allowNull: true
    },
    url: {
      type: 'string',
      columnName: 'url',
      allowNull: true
    },
    email: {
      type: 'string',
      columnName: 'email',
      allowNull: true
    },
    is_secure: {
      type: 'boolean',
      columnName: 'is_secure'
    },
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
    title: {
      type: 'string',
      columnName: 'title',
      allowNull: true
    },
    country: {
      type: 'string',
      columnName: 'country',
      allowNull: true
    },
    skype: {
      type: 'string',
      columnName: 'skype',
      allowNull: true
    },
    phone: {
      type: 'string',
      columnName: 'phone',
      allowNull: true
    },
    ref_site: {
      type: 'string',
      columnName: 'ref_site',
      allowNull: true
    },
    other_site: {
      type: 'string',
      columnName: 'other_site',
      allowNull: true
    },
    target_date: {
      columnType: 'datetime',
      columnName: 'target_date',
      type: 'ref'
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
