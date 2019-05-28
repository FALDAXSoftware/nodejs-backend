/**
 * News.js
 *
 * @description :: Represents a database table news.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
    tableName: 'news',
    attributes: {
      source_name: {
        type: 'string',
        columnName: 'source_name'
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
      is_active: {
        type: 'boolean',
        columnName: 'is_active',
        defaultsTo: true
      }
    },
  
    customToJSON: function () {
      if (!this.cover_image || this.cover_image == "" || this.cover_image == null) {
        this.cover_image = sails.config.urlconf.CMS_URL + "blog/default_blog.png"
      }
      return this;
    },
    beforeCreate: (values, next) => {
      values.created_at = new Date();
      next();
    },
    beforeUpdate: (values, next) => {
      values.updated_at = new Date();
      next();
    }
  };
  