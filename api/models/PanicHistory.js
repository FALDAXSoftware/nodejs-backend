/**
 * PanicHistory.js
 *
 * @description :: Represents a database table panic_history.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
    tableName: "panic_history",

    attributes: {
        ip: {
            type: "string",
            columnName: "ip"
        },
        panic_status: {
            type: "boolean",
            columnName: "panic_status",
            defaultsTo: false
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
