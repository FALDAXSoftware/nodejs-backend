/**
 * WithdrawRequest.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
    tableName: 'withdraw_request',
    attributes: {
        source_address: {
            type: 'string',
            columnName: 'source_address',
        },
        destination_address: {
            type: 'string',
            columnName: 'destination_address',
        },
        amount: {
            type: 'string',
            columnName: 'amount',
        },
        user_id: {
            type: 'string',
            columnName: 'user_id',
            required: true,
        },
        is_approve: {
            type: 'boolean',
            columnName: 'is_approve',
            defaultsTo: false
        },
        transaction_type: {
            type: 'string',
            columnName: 'transaction_type'
        },
        coin_id: {
            type: 'number',
            columnName: 'coin_id'
        },
        fees: {
            type: 'number',
            columnName: 'fees'
        },
        is_executed: {
            type: 'boolean',
            columnName: 'is_executed'
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
    }
};
