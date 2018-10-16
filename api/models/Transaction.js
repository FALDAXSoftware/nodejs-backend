/**
 * Transaction.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
    tableName: 'wallet_history',
    attributes: {
        user_id: {
            type: 'string',
            columnName: 'user_id',
            required: true,
        },
        source_address: {
            type: 'string',
            columnName: 'source_address',
            required: true
        },
        destination_address: {
            type: 'string',
            columnName: 'destination_address',
            required: true
        },
        amount: {
            type: 'number',
            columnName: 'amount',
            required: true
        },
        transactionType: {
            type: 'string',
            columnName: 'transactionType',
            required: true
        },
        transactionId: {
            type: 'string',
            columnName: 'transactionId',
            required: true
        },
        coin_id: {
            type: 'string',
            columnName: 'coin_id',
            required: true,
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
