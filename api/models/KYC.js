/**
 * Admin.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
    tableName: 'kyc',
    attributes: {
        first_name: {
            type: 'string',
            columnName: 'first_name',
            allowNull: true
        },
        last_name: {
            type: 'string',
            columnName: 'last_name',
            allowNull: true
        },
        country: {
            type: 'string',
            columnName: 'country',
            allowNull: true
        },
        dob: {
            type: 'string',
            columnName: 'dob',
            allowNull: true
        },
        address: {
            type: 'string',
            columnName: 'address',
            allowNull: true
        },
        address_2: {
            type: 'string',
            columnName: 'address_2',
            allowNull: true
        },
        city: {
            type: 'string',
            columnName: 'city',
            allowNull: true
        },
        zip: {
            type: 'string',
            columnName: 'zip',
            allowNull: true
        },
        id_type: {
            type: 'number',
            columnName: 'id_type',
        },
        front_doc: {
            type: 'string',
            columnName: 'front_doc',
        },
        back_doc: {
            type: 'string',
            columnName: 'back_doc',
        },
        ssn: {
            type: 'string',
            columnName: 'ssn',
        },
        status: {
            type: 'boolean',
            columnName: 'status',
            defaultsTo: false,
        },
        result: {
            type: 'string',
            columnName: 'result',
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
        },
        user_id: {
            columnName: 'user_id',
            model: 'users'
        },
        steps: {
            columnName: 'steps',
            defaultsTo: 1,
            type: 'number'
        }
    },
};
