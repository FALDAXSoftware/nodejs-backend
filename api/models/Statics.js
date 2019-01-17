/**
 * Statics.js
 *
 * @description :: Represents a database table statics.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  tableName: 'statics',
  attributes: {
    name: {
      type: 'string',
      columnName: 'name',
      required: true
    },
    title: {
      type: 'string',
      columnName: 'title',
      required: true
    },
    slug: {
      type: 'string',
      columnName: 'slug',
      required: true
    },
    content: {
      type: 'string',
      columnName: 'content',
      required: true
    },
    is_active: {
      type: 'boolean',
      columnName: 'is_active',
      defaultsTo: true,
      allowNull: true,
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
    Statics.findOne({ 'slug': values.slug })
      .exec(function (err, found) {
        console.log(found);
        if (!found) {
          next();
        } else {
          next({ error: 'Page already exists' });
        }
      });
  },
  beforeUpdate: (values, next) => {
    values.updated_at = new Date();
    next();
  },

};

