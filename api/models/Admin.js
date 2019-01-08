/**
 * Admin.js
 *
 * @description :: Represents a database table admin.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */
var bcrypt = require('bcrypt');

module.exports = {
  tableName: 'admin',
  primaryKey: 'id',
  attributes: {
    email: {
      type: 'string',
      columnName: 'email',
      unique: true,
      required: true
    },
    password: {
      type: 'string',
      columnName: 'password',
      required: true
    },
    name: {
      type: 'string',
      columnName: 'name',
      allowNull: true
    },
    reset_token: {
      type: 'string',
      columnName: 'reset_token',
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
    is_active: {
      type: 'boolean',
      columnName: 'is_active',
      defaultsTo: true,
    },
    role_id: {
      columnName: 'role_id',
      model: 'role',
    }
  },
  beforeCreate: (values, next) => {
    // console.log(values.email);
    Admin
      .findOne({ 'email': values.email })
      .exec(function (err, found) {
        if (!found) {
          bcrypt
            .genSalt(10, function (err, salt) {
              if (err)
                return next(err);
              bcrypt
                .hash(values.password, salt, function (err, hash) {
                  if (err)
                    return next(err);
                  values.password = hash;
                  next();
                })
            });
        } else {
          next({ error: 'Email address already exists' });
        }
      });
  },
  beforeUpdate: (values, next) => {

    Admin.findOne({ 'email': values.email })
      .exec(async function (err, found) {
        if (err) {
          console.log("SDf", err)
          next(err);
        }
        if (found) {
          if (values.password) {
            bcrypt.genSalt(10, function (err, salt) {
              if (err) return next(err);
              bcrypt.hash(values.password, salt, function (err, hash) {
                if (err) return next(err);
                values.password = hash;
                next();
              })
            });
          } else {
            next();
          }
        } else {
          next({ error: "Email address doesn't exists" });
        }
      });
  },
  comparePassword: function (password, user, cb) {
    bcrypt.compare(password, user.password, function (err, match) {
      if (err) cb(err);
      if (match) {
        cb(null, true);
      } else {
        cb(err);
      }
    })
  }

};
