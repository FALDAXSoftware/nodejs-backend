/**
 * User.js
 *
 * @description :: Represents a database table users.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

// We don't want to store password with out encryption
var bcrypt = require('bcrypt');
//  email, password, phone_number, full_name, firstname, lastname,  country,
// street_address, city_town, postal_code, profile_pic,  dob, updated_at,
// deleted_at, zip

module.exports = {
  tableName: 'users',
  attributes: {
    email: {
      type: 'string',
      columnName: 'email',
      isEmail: true,
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
    hubspot_id: {
      type: 'string',
      columnName: 'hubspot_id',
      allowNull: true
    },
    country: {
      type: 'string',
      columnName: 'country',
      allowNull: true
    },
    state: {
      type: 'string',
      columnName: 'state',
      allowNull: true
    },
    street_address: {
      type: 'string',
      columnName: 'street_address',
      allowNull: true
    },
    street_address_2: {
      type: 'string',
      columnName: 'street_address_2',
      allowNull: true
    },
    city_town: {
      type: 'string',
      columnName: 'city_town',
      allowNull: true
    },
    postal_code: {
      type: 'string',
      columnName: 'postal_code',
      allowNull: true
    },
    profile_pic: {
      type: 'string',
      columnName: 'profile_pic',
      allowNull: true,
      defaultsTo: ''
    },
    dob: {
      type: 'string',
      columnName: 'dob',
      allowNull: true
    },
    country_id: {
      type: 'string',
      columnName: 'country_id',
      allowNull: true
    },
    state_id: {
      type: 'string',
      columnName: 'state_id',
      allowNull: true
    },
    zip: {
      type: 'number',
      columnName: 'zip',
      allowNull: true
    },
    referred_id: {
      type: 'number',
      columnName: 'referred_id',
      allowNull: true
    },
    referral_code: {
      type: 'string',
      columnName: 'referral_code',
      allowNull: true
    },
    email_verify_token: {
      type: 'string',
      columnName: 'email_verify_token',
      allowNull: true
    },
    reset_token: {
      type: 'string',
      columnName: 'reset_token',
      allowNull: true
    },
    reset_token_expire: {
      type: 'string',
      columnName: 'reset_token_expire',
      allowNull: true
    },
    is_active: {
      type: 'boolean',
      columnName: 'is_active',
      defaultsTo: true,
      allowNull: true
    },
    is_verified: {
      type: 'boolean',
      columnName: 'is_verified',
      defaultsTo: false,
      allowNull: true
    },
    is_twofactor: {
      type: 'boolean',
      columnName: "is_twofactor",
      defaultsTo: false
    },
    twofactor_secret: {
      type: "string",
      columnName: "twofactor_secret",
      allowNull: true
    },
    auth_code: {
      type: "string",
      columnName: "auth_code",
      allowNull: true
    },
    fiat: {
      type: 'string',
      columnName: 'fiat',
      allowNull: true,
      defaultsTo: "USD"
    },
    diffrence_fiat: {
      type: 'number',
      columnName: 'diffrence_fiat'
    },
    total_value: {
      type: 'number',
      columnName: 'total_value'
    },
    percent_wallet: {
      type: 'number',
      columnName: 'percent_wallet'
    },
    date_format: {
      type: 'string',
      columnName: 'date_format'
    },
    new_ip_verification_token: {
      type: 'string',
      allowNull: true,
      columnName: 'new_ip_verification_token'
    },
    new_ip: {
      type: 'string',
      allowNull: true,
      columnName: 'new_ip'
    },
    requested_email: {
      type: 'string',
      allowNull: true,
      columnName: 'requested_email'
    },
    new_email_token: {
      type: 'string',
      allowNull: true,
      columnName: 'new_email_token'
    },
    is_new_email_verified: {
      type: 'boolean',
      columnName: "is_new_email_verified",
      defaultsTo: true
    },
    referal_percentage: {
      type: 'number',
      columnName: 'referal_percentage'
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
    history: {
      collection: 'loginHistory',
      via: 'user'
    }
  },
  beforeCreate: (values, next) => {
    Users
      .findOne({ 'email': values.email, 'deleted_at': null })
      .exec(function (err, found) {
        values.created_at = new Date()
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
    values.updated_at = new Date()
    if (values.password) {
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
      // delete values.email;
      next();
    }
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
  },

  customToJSON: function () {
    if (!this.profile_pic || this.profile_pic == "" || this.profile_pic == null) {
      this.profile_pic = "profile/def_profile.jpg"
    }
    return this;
  }

};
