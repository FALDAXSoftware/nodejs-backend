/**
 * Transaction.js
 *
 * @description :: Represents a database table wallet_history.
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
        transaction_type: {
            type: 'string',
            columnName: 'transaction_type',
            required: true
        },
        transaction_id: {
            type: 'string',
            columnName: 'transaction_id',
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
    },
    beforeCreate: function (values, next) {
        values.created_at = new Date();
        next();
    },

    beforeUpdate: function (values, next) {
        values.updated_at = new Date();
        next();
    }
};
