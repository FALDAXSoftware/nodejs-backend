/**
 * News.js
 *
 * @description :: Represents a database table blogs.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
    tableName: 'news',
    attributes: {
        title: {
            type: 'string',
            columnName: 'title',
        },
        search_keywords: {
            type: 'string',
            columnName: 'search_keywords',
        },
        description: {
            type: 'string',
            columnName: 'description',
        },
        cover_image: {
            type: 'string',
            columnName: 'cover_image',
        },
        owner: {
            type: 'string',
            columnName: 'owner',
        },
        link: {
            type: 'string',
            columnName: 'link',
        },
        posted_at: {
            type: 'ref',
            columnType: 'datetime',
            columnName: 'posted_at'
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

    customToJSON: function () {
        if (!this.cover_image || this.cover_image == "" || this.cover_image == null) {
            this.cover_image = sails.config.urlconf.CMS_URL + "faldax/blog/default_blog.png"
        }
        return this;
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
