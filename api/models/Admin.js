/**
 * Admin.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */
var bcrypt = require('bcrypt');
module.exports = {
  tableName: 'admin',
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
      columnName: 'name'
    }
  },
  beforeCreate: (values, next) => {
    // console.log(values.email);
    Admin
      .findOne({'email': values.email})
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
          next({error: 'Email address already exist'});
        }
      });
  },
  comparePassword: function (password, user, cb) {
    bcrypt
      .compare(password, user.password, function (err, match) {
        if (err) 
          cb(err);
        if (match) {
          cb(null, true);
        } else {
          cb(err);
        }
      })
  }

};
