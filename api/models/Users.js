/**
 * User.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

// We don't want to store password with out encryption
var bcrypt = require('bcrypt');
//  email, password, phone_number, full_name, firstname, lastname, 
//  country, street_address, city_town, postal_code, profile_pic, 
//  dob, updated_at, deleted_at, zip

module.exports = {
  tableName: 'users',
  attributes: {
    email: {
      type: 'string',
      columnName: 'email',
      isEmail: true,
      unique: true,
      required: true
    },
    password: {
      type: 'string',
      columnName: 'password',
      required: true
    },
    phone_number: {
      type: 'string',
      columnName: 'phone_number'
    },
    full_name: {
      type: 'string',
      columnName: 'full_name',
      allowNull: true
    },
    first_name: {
      type: 'string',
      columnName: 'first_name',
      allowNull: true
    },
    last_name: {
      type: 'string',
      columnName: 'last_name',
      allowNull: true
    },
    country: {
      type: 'string',
      columnName: 'country',
      allowNull: true
    },
    street_address: {
      type: 'string',
      columnName: 'street_address',
      allowNull: true
    },
    city_town: {
      type: 'string',
      columnName: 'city_town',
      allowNull: true
    },
    postal_code: {
      type: 'number',
      columnName: 'postal_code',
      allowNull: true
    },
    profile_pic: {
      type: 'string',
      columnName: 'profile_pic',
      allowNull: true
    },
    dob: {
      type: 'ref', 
      columnType: 'datetime',
      columnName: 'dob'
    },
    zip: {
      type: 'number',
      columnName: 'zip',
      allowNull: true
    },
    referred_id: {
      type: 'string',
      columnName: 'referred_id',
      allowNull: true
    },
    referral_code: {
      type: 'string',
      columnName: 'referral_code',
      allowNull: true
    },
    is_active: {
      type: 'boolean',
      columnName: 'is_active',
      defaultsTo: false,
      allowNull: true,
    },
    is_verified: {
      type: 'boolean',
      columnName: 'is_verified',
      defaultsTo: false,
      allowNull: true,
    },
    email_verify_token: {
      type: 'string',
      columnName: 'email_verify_token',
      defaultsTo: ''
    },
    created_at : {
      type: 'ref', 
      columnType: 'datetime',
      columnName: 'created_at'
    },
    updated_at : {
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
    Users.findOne({ or: [ {'email': values.email }, { 'phone_number': values.phone_number}]})
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
        next({ error: 'Email address or Phone number already exist' });
      }
    });
  },
  beforeUpdate: (values, next) => {
    Users.findOne({ 'email': values.email })
    .exec(async function (err, found){
      if(found){
        if(values.password){
          bcrypt.genSalt(10, function (err, salt) {
            if(err) return next(err);
            bcrypt.hash(values.password, salt, function (err, hash) {
              if(err) return next(err);
              values.password = hash;   
              next();
            })
          }); 
        }else{
          delete values.email;
          next();
        }
          
      } else{
        next({ error: "Email address doesn't exist" });
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
