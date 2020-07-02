/**
 * Cities.js
 *
 * @description :: Represents a database table cities.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
    tableName: 'cities',
    attributes: {
        name: {
            type: 'string',
            columnName: 'name'
        },
        state_id: {
            model: 'State',
            columnName: 'state_id'
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
    beforeCreate: function (values, next) {
        values.created_at = new Date();
        next();
    },
    beforeUpdate: function (values, next) {
        values.updated_at = new Date();
        next();
    }
};
