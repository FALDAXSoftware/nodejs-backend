/**
 * State.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
    tableName: 'inquiries',
    attributes: {
        first_name: {
            type: 'string',
            columnName: 'first_name',
        },
        last_name: {
            type: 'string',
            columnName: 'last_name'
        },
        email: {
            type: 'string',
            columnName: 'email',
            allowNull: true
        },
        message: {
            type: 'string',
            columnName: 'message',
            allowNull: true
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
};
