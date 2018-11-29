/**
 * Fees.js
 *
 * @description :: Represents a database table pairs.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
    tableName: 'pairs',
    attributes: {
        name: {
            type: 'string',
            columnName: 'name',
            required: true
        },
        coin_code1: {
            type: 'string',
            columnName: 'coin_code1',
            required: true
        },
        coin_code2: {
            type: 'string',
            columnName: 'coin_code2',
            required: true
        },
        maker_fee: {
            type: 'string',
            columnName: 'maker_fee',
            required: true
        },
        taker_fee: {
            type: 'string',
            columnName: 'taker_fee',
            required: true
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
