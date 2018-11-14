/**
 * Jobs.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
    tableName: 'Jobs',
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
        job_desc: {
            type: 'string',
            columnName: 'job_desc'
        },
        location: {
            type: 'string',
            columnName: 'location'
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
