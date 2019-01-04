/**
 * Jobs.js
 *
 * @description :: A model definition.  Represents a database of jobs.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
    tableName: 'jobs',
    attributes: {
        position: {
            type: 'string',
            columnName: 'position',
            allowNull: true
        },
        short_desc: {
            type: 'string',
            columnName: 'short_desc'
        },
        category_id: {
            model: 'jobCategory',
            columnName: 'category_id'
        },
        job_desc: {
            type: 'string',
            columnName: 'job_desc'
        },
        location: {
            type: 'string',
            columnName: 'location'
        },
        is_active: {
            type: 'boolean',
            columnName: 'is_active',
            defaultsTo: true
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
