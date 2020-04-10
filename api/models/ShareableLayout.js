/**
 * ShareableLayout.js
 *
 * @description :: Represents a database table currency_conversion.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
    tableName: 'shareable_layout',
    attributes: {
        layout_data: {
            type: 'ref',
            columnType: 'json',
            columnName: 'layout_data'
        },
        code: {
            type: 'string',
            columnName: 'code'
        },
        user_id: {
            columnName: "user_id",
            model: "users"
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
