/**
 * Fees.js
 *
 * @description :: Represents a database table fees.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
    tableName: 'fees',
    primaryKey: 'id',
    attributes: {
        trade_volume: {
            type: "string",
            columnName: "trade_volume"
        },
        maker_fee: {
            type: "number",
            columnName: "maker_fee",
        },
        taker_fee: {
            type: "number",
            columnName: "taker_fee",
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

