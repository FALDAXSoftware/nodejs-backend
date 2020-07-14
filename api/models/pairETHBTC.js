/**
 * PairETHBTC.js
 *
 * @description :: Represents a database table pairs.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
    tableName: 'pair_eth_btc',
    attributes: {
        open: {
            type: 'ref',
            columnType: 'double precision[]',
            columnName: 'open'
        },
        high: {
            type: 'ref',
            columnType: 'double precision[]',
            columnName: 'high'
        },
        close: {
            type: 'ref',
            columnType: 'double precision[]',
            columnName: 'close'
        },
        low: {
            type: 'ref',
            columnType: 'double precision[]',
            columnName: 'low'
            // required: true
        },
        volume: {
            type: 'ref',
            columnType: 'double precision[]',
            columnName: 'volume'
            // required: true
        },
        resolution: {
            type: 'string',
            columnName: 'resolution'
        },
        timestamps: {
            type: 'ref',
            columnType: 'double precision[]',
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
