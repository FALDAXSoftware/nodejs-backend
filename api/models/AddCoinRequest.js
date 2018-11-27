/**
 * AddCoinRequest.js
 *
 * @description :: Represents a database table add_coin_requests.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
    tableName: 'add_coin_requests',
    attributes: {
        coin_name: {
            type: 'string',
            columnName: 'coin_name',
            required: true
        },
        message: {
            type: 'string',
            columnName: 'message',
            allowNull: true
        },
        url: {
            type: 'string',
            columnName: 'url',
            allowNull: true
        },
        email: {
            type: 'string',
            columnName: 'email',
            allowNull: true
        },
        target_date: {
            columnType: 'datetime',
            columnName: 'target_date',
            type: 'ref',
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
    beforeUpadte: (values, next) => {
        values.updated_at = new Date();
        next();
    },

};

