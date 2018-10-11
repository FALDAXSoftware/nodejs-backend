/**
 * Blogs.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
    tableName: 'blogs',
    attributes: {
        title: {
            type: 'string',
            columnName: 'title',
            required: true
        },
        description: {
            type: 'string',
            columnName: 'description',
            required: true
        },
        cover_image: {
            type: 'string',
            columnName: 'cover_image',
            allowNull: true,
        },
        tags: {
            type: 'string',
            columnName: 'tags',
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
        },
        admin_id: {
            model: 'admin',
            columnName: 'admin_id'
        }
    }
};
