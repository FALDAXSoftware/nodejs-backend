module.exports = {
  friendlyName: 'Check Security',
  description: '',
  inputs: {
    user_id: {
      type: 'string',
      example: '1',
      description: 'UserId',
      required: true
    },
    otp: {
      type: 'string',
      example: '1',
      description: 'UserId',
      required: false
    }
  },
  exits: {
    success: {
      outputFriendlyName: 'CheckSecurity',
    },
    error: {
      description: 'Something Error'
    }
  },

  fn: async function (inputs, exits) {

    // To make in UTC with 0
    function formatTime(datetime = '') {
      var m = moment();
      if (datetime != '') {
        m = moment(datetime).utcOffset(0);
      }
      m.set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
      // m.toISOString()
      m.format()
      return m;
    }
    var moment = require('moment');
    var speakeasy = require('speakeasy');
    var user_id = inputs.user_id;
    var userData = await Users.findOne({
      deleted_at: null,
      id: user_id,
      is_active: true
    });
    var response = {};
    response.status = 200;
    if (userData.is_twofactor && userData.twofactor_secret) {
      if (!inputs.otp) {
        response.status = 202;
        response.message = sails.__("Please enter OTP to continue").message;
        return exits.success(response)
      }

      let verified = speakeasy
        .totp
        .verify({
          secret: userData.twofactor_secret,
          encoding: 'base32',
          token: inputs.otp,
          window: 2
        });

      if (!verified) {
        response.status = 402;
        response.message = sails.__("invalid otp").message
        return exits.success(response)
      }
    }

    if (userData.security_feature) {
      var today = moment().utc().format("YYYY-MM-DD hh:mm");
      var expired_date = new Date(userData.security_feature_expired_time);
      var timeformat = moment(userData.security_feature_expired_time).format("hh:mm");
      var dateformat = moment(userData.security_feature_expired_time).format("YYYY-MM-DD");
      var newdatetime = moment(dateformat + " " + timeformat);

      if (newdatetime.isAfter(today)) {
        var existing = moment(userData.security_feature_expired_time);
        var tz = moment.tz.guess();
        response.status = 203;
        response.datetime = existing.tz(tz).format()
        var dateTime = moment(response.datetime).local().format(userData.date_format + " HH:mm");
        var localTime = moment.utc(dateTime).toDate();
        localTime = moment(localTime).format(userData.date_format + " HH:mm")
        response.message = sails.__("Wait for 24 hours").message + " till " + localTime;
        return exits.success(response)
      }
    }
    return exits.success(response)
  }
};
