/**
 * Role.js
 *
 * @description :: Represents a database table roles.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  tableName: 'roles',
  primaryKey: 'id',
  attributes: {
    name: {
      type: "string",
      columnName: "name"
    },
    dashboard: {
      type: "boolean",
      defaultsTo: true,
      columnName: 'dashboard',
    },
    users: {
      type: "boolean",
      defaultsTo: false,
      columnName: 'users',
    },
    countries: {
      type: "boolean",
      defaultsTo: false,
      columnName: 'countries',
    },
    assets: {
      type: "boolean",
      defaultsTo: false,
      columnName: 'assets',
    },
    pairs: {
      type: "boolean",
      columnName: 'pairs',
      defaultsTo: false,
    },
    roles: {
      type: "boolean",
      columnName: 'roles',
      defaultsTo: false,
    },
    employee: {
      type: "boolean",
      columnName: 'employee',
      defaultsTo: false,
    },
    jobs: {
      type: "boolean",
      columnName: 'jobs',
      defaultsTo: false,
    },
    limit_management: {
      type: "boolean",
      columnName: 'limit_management',
      defaultsTo: false,
    },
    transaction_history: {
      type: "boolean",
      columnName: 'transaction_history',
      defaultsTo: false,
    },
    trade_history: {
      type: "boolean",
      columnName: 'trade_history',
      defaultsTo: false,
    },
    withdraw_requests: {
      type: "boolean",
      columnName: 'withdraw_requests',
      defaultsTo: false,
    },
    kyc: {
      type: "boolean",
      columnName: 'kyc',
      defaultsTo: false,
    },
    fees: {
      type: "boolean",
      columnName: 'fees',
      defaultsTo: false,
    },
    panic_button: {
      type: "boolean",
      columnName: 'panic_button',
      defaultsTo: false,
    },
    news: {
      type: "boolean",
      columnName: 'news',
      defaultsTo: false,
    },
    add_user: {
      type: "boolean",
      columnName: 'add_user',
      defaultsTo: false,
    },
    is_referral: {
      type: "boolean",
      columnName: 'is_referral',
      defaultsTo: false,
    },
    account_class: {
      type: "boolean",
      columnName: 'account_class',
      defaultsTo: false,
    },
    is_active: {
      type: 'boolean',
      columnName: 'is_active',
      defaultsTo: true,
      allowNull: true,
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
    role_id: {
      collection: 'admin',
      via: 'role_id'
    }
  },
  beforeCreate: (values, next) => {
    values.created_at = new Date();
    next();
  },
  beforeUpdate: (values, next) => {
    values.updated_at = new Date();
    next();
  },
};

