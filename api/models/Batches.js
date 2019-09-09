/**
 * Batches.js
 *
 * @description :: Represents a database table coins.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */
const moment = require('moment');
module.exports = {
  tableName: 'batch_history',
  attributes: {
    batch_number: {
      type: 'number',
      columnName: 'batch_number',
      allowNull: true
    },
    transaction_start: {
      type: 'number',
      columnName: 'transaction_start',
      required: true
    },
    transaction_end: {
      type: 'number',
      columnName: 'transaction_end',
      required: true
    },
    batch_date: {
      type: 'ref',
      columnType: 'datetime',
      columnName: 'batch_date'
    },
    is_purchased: {
      type: 'boolean',
      columnName: 'is_purchased',
      defaultsTo: false
    },
    is_withdrawled: {
      type: 'boolean',
      columnName: 'is_withdrawled',
      defaultsTo: false
    },
    is_manual_withdrawled: {
      type: 'boolean',
      columnName: 'is_manual_withdrawled',
      defaultsTo: false
    },
    net_profit: {
      type: 'number',
      columnType: 'float',
      columnName: 'net_profit',
      defaultsTo: 0
    },
    download_file: {
      type: 'string',
      columnName: 'download_file',
      allowNull:true
    },
    uploaded_file: {
      type: 'string',
      columnName: 'uploaded_file',
      allowNull:true
    },
    is_active: {
      type: 'boolean',
      columnName: 'is_active',
      defaultsTo: true,
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
    values.batch_date = moment.utc();
    next();
  },
  beforeUpdate: (values, next) => {
    values.updated_at = new Date();
    next();
  }
};
