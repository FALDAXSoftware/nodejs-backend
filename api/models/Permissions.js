/**
* permissions.js
*
* @description :: A model definition. Represents a database of permissions.
* @docs :: https://sailsjs.com/docs/concepts/models-and-orm/models
*/

module.exports = {
    tableName: 'permissions',
    attributes: {
        name: {
            type: 'string',
            columnName: 'name',
            allowNull: true
        },
        display_name: {
            type: 'string',
            columnName: 'display_name',
            allowNull: true
        },
        description: {
            type: 'string',
            columnName: 'description',
            allowNull: true
        },
        module: {
            type: 'string',
            columnName: 'module',
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
    beforeCreate: function (val, next) {
        val.created_at = new Date();
        next();
    },
    beforeUpdate: function (val, next) {
        val.updated_at = new Date();
        next();
    }
};