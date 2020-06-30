/**
 * Tiers.js
 *
 * @description :: Represents a database table currency_conversion.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  tableName: 'tier_request',
  attributes: {
    tier_step: {
      type: 'number',
      columnName: 'tier_step'
    },
    unique_key: {
      type: "string",
      columnName: "unique_key"
    },
    type: {
      type: "string",
      columnName: "type"
    },
    public_note: {
      type: "string",
      columnName: "public_note"
    },
    private_note: {
      type: "string",
      columnName: "private_note"
    },
    updated_by: {
      type: "string",
      columnName: "updated_by"
    },
    ssn: {
      type: "string",
      columnName: "ssn"
    },
    request_id: {
      type: "number",
      columnName: "request_id"
    },
    is_approved: {
      type: 'boolean',
      columnName: 'is_approved',
      allowNull: true
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
  },
};
