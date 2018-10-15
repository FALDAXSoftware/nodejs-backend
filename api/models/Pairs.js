/**
 * Fees.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
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
    }
};
