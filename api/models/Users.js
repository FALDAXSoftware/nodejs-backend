/**
 * User.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

// We don't want to store password with out encryption
var bcrypt = require('bcrypt');
//  email, password, phone_number, full_name, firstname, lastname, 
//        country, street_address, city_town, postal_code, profile_pic, 
//        dob, updated_at, deleted_at, zip

module.exports = {
  tableName: 'users',
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
    phone_number: {
      type: 'number',
      columnName: 'phone_number',
    },
    full_name: {
      type: 'string',
      columnName: 'full_name',
    },
    first_name: {
      type: 'string',
      columnName: 'first_name',
    },
    last_name: {
      type: 'string',
      columnName: 'last_name',
    },
    country: {
      type: 'string',
      columnName: 'country',
    },
    street_address: {
      type: 'string',
      columnName: 'street_address',
    },
    city_town: {
      type: 'string',
      columnName: 'city_town',
    },
    postal_code: {
      type: 'number',
      columnName: 'postal_code',
    },
    profile_pic: {
      type: 'string',
      columnName: 'profile_pic',
    },
    dob: {
      type: 'string',
      columnName: 'dob',
    },
    zip: {
      type: 'number',
      columnName: 'zip',
    },
    updated_at : {
      type: 'string',
      columnName: 'updated_at',
    },
    deleted_at: {
      type: 'string',
      columnName: 'deleted_at',
    }
  },
  beforeCreate: (values, next) => {
    Users.findOne({'email': values.email})
    .exec(function (err, found){
      if(!found){
        bcrypt.genSalt(10, function (err, salt) {
          if(err) return next(err);
          bcrypt.hash(values.password, salt, function (err, hash) {
            if(err) return next(err);
            values.password = hash;
            next();
          })
        });     
      } else{
        next({ error: 'Email address already exist' });
      }
    });
  },
  comparePassword : function (password, user, cb) {
    bcrypt.compare(password, user.password, function (err, match) {
      if(err) cb(err);
      if(match) {
        cb(null, true);
      } else {
        cb(err);
      }
    })
  }

};
