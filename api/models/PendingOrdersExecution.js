/**
 * PendingOrdersExection.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  tableName: 'pending_orders_execution',
  attributes: {
    user_id: {
      type: 'string',
      columnName: 'user_id',
      required: true
    },
    side: {
      type: 'string',
      columnName: 'side'
    },
    order_type: {
      type: 'string',
      columnName: 'order_type'
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
    limit_price: {
      type: 'number',
      columnName: 'limit_price',
      defaultsTo: 0
    },
    quantity: {
      type: 'number',
      columnName: 'quantity'
    },
    currency: {
      type: 'string',
      columnName: 'currency'
    },
    settle_currency: {
      type: 'string',
      columnName: 'settle_currency'
    },
    placed_by: {
      type: 'string',
      columnName: 'placed_by',
      allowNull: true
    },
    is_executed: {
      type: 'boolean',
      columnName: 'is_executed',
      defaultsTo: false
    },
    is_under_execution: {
      type: 'boolean',
      columnName: 'is_under_execution',
      defaultsTo: false
    },
    symbol: {
      type: 'string',
      columnName: 'symbol'
    },
    is_cancel: {
      type: 'boolean',
      columnName: 'is_cancel',
      defaultsTo: false
    }
    // reason: {
    //   type: 'string',
    //   columnName: 'reason'
    // }
  },
  beforeCreate: (values, next) => {
    values.created_at = new Date();
    values.updated_at = new Date();

    next();
  },
  beforeUpdate: (values, next) => {
    values.updated_at = new Date();
    next();
  }
};
