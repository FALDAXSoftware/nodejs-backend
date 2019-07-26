/**
 * IPWhitelist.js
 *
 * @description :: Represents a database table fees.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  tableName: 'ip_whitelist',
  primaryKey: 'id',
  attributes: {
    ip: {
      type: 'string',
      columnName: 'ip'
    },
    expire_time: {
      type: 'ref',
      columnType: 'string',
      columnName: 'expire_time'
    },
    user_id: {
      columnName: 'user_id',
      model: 'users'
    },
    user_type: {
      type: 'number',
      columnName: 'user_type'
    },
    days: {
      type: 'number',
      columnName: 'days',
      // defaultsTo:0
    },
    is_permanent: {
      type: 'boolean',
      columnName: 'is_permanent'
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
    next();
  },
  beforeUpdate: (values, next) => {
    values.updated_at = new Date();
    next();
  },
  checkUserHasWhitelist: checkUserHasWhitelist,
  checkWhitelistValid: checkWhitelistValid,
  addWhitelist: addWhitelist,
  getWhiteListData: getWhiteListData,
  deleteWhiteListData: deleteWhiteListData
};

async function checkUserHasWhitelist(opts) {
  var object = {
    user_id: opts.id,
    user_type: opts.user_type,
    deleted_at: null
  };
  var get_data = await IPWhitelist.find(object);
  if (get_data.length > 0) {
    return 1;
  } else {
    return 0;
  }
}

async function checkWhitelistValid(opts) {
  var moment = require('moment');
  var object = {
    user_id: opts.id,
    user_type: opts.user_type,
    ip: opts.ip,
    deleted_at: null
  };
  var get_data = await IPWhitelist.findOne(object);
  if (get_data != undefined) {
    if (get_data.days == 0) {
      return 0;
    }
    var current_datetime = moment().valueOf();
    if (current_datetime > get_data.expire_time) {
      return 1;
    } else {
      return 0;
    }
  } else {
    return 2;
  }
}

async function addWhitelist(opts) {
  var object = {
    user_id: opts.id,
    user_type: opts.user_type,
    ip: opts.ip,
    deleted_at: null
  };
  var check_exist = await IPWhitelist.findOne(object);
  if (check_exist != undefined) {
    return 1;
  } else {
    var addIPData = await IPWhitelist.create(opts);
    return 0;
  }
}

async function getWhiteListData(select, params, limit, page) {
  var moment = require('moment');
  var data = await IPWhitelist.find({
    where: params
  })
    .sort('created_at DESC')
    .paginate(parseInt(page) - 1, parseInt(limit));

  let IPCount = await IPWhitelist.count({
    where: params
  });
  var all_data = {};

  all_data.total = IPCount;
  if (data.length > 0) {
    all_data.data = data;
    data.filter(function (value) {
      if (value.expire_time == null || value.expire_time == "") {
        value.expire_time = "";
      } else {
        let new_date = parseInt(value.expire_time);
        value.expire_time = moment(new_date).format();
      }

    })
    return all_data;
  } else {
    all_data.data = [];
    return all_data;
  }
}

async function deleteWhiteListData(id, params) {
  var moment = require('moment');
  var deleteData = await IPWhitelist.find({
    where: params
  });
  if (deleteData.length > 0 && deleteData != undefined && deleteData != null) {
    var deletedData = await IPWhitelist
      .update({
        id: id,
        deleted_at: null
      })
      .set({
        deleted_at: moment().format()
      });

    return 1;
  } else {
    return 0;
  }
}
