/**
 * ETHBTC1min.js
 *
 * @description :: Represents a database table pairs.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
    tableName: 'eth_btc_240_min',
    attributes: {
        open: {
            type: 'number',
            columnName: 'open'
        },
        high: {
            type: 'number',
            columnName: 'high'
        },
        close: {
            type: 'number',
            columnName: 'close'
        },
        low: {
            type: 'number',
            columnName: 'low'
            // required: true
        },
        volume: {
            type: 'number',
            columnName: 'volume'
            // required: true
        },
        timestamps: {
            type: 'number',
            columnName: 'timestamps',
            // required: true
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
