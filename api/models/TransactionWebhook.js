/**
 * TransactionWebhook.js
 *
 * @description :: Represents a database table transaction_webhook.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
    tableName: 'transaction_webhook',
    attributes: {
        receive_json: {
            type: 'ref',
            columnType: 'json',
            columnName: 'receive_json'
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