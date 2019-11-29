module.exports = {
  friendlyName: 'Check Security',
  description: '',
  inputs: {    
    user_id:{
      type: 'string',
      example: '1',
      description: 'UserId',
      required: true
    },
    otp:{
      type: 'string',
      example: '1',
      description: 'UserId',
      required: false
    },
    confirm_for_wait:{
      type: 'string',
      example: '1',
      description: 'confirm_for_wait',
      required: false
    },

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
    function formatTime( datetime = '' ){
      var m = moment();
      if( datetime != '' ){
        m = moment(datetime).utcOffset(0);
      }      
      m.set({hour:0,minute:0,second:0,millisecond:0})
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
    var response={};
    response.status=200;
    if (userData.is_twofactor && userData.twofactor_secret && (!inputs.confirm_for_wait)) {
      if (!inputs.otp) {
        response.status = 202;
        response.message = sails.__("Please enter OTP to continue");
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
        response.message = sails.__("invalid otp")
        return exits.success(response)    
      }
    }
    
    console.log("userData.security_feature",userData.security_feature);
    if (userData.security_feature) {
      var today = moment().utc().format();
      // console.log("today",today);
      // console.log("userData.security_feature_expired_time",userData.security_feature_expired_time);
      // console.log(userData.security_feature_expired_time.isAfter(today));
      // console.log(moment("2019-11-29T04:50:19.268").diff("2019-11-29T04:51:51Z"));
      // console.log("Diff",formatTime(userData.security_feature_expired_time));
      //2019-11-29T04:50:19.268 // security
      //2019-11-29T04:51:51Z // today
      // if (!moment(userData.security_feature_expired_time).isAfter(today)) {
      if (moment(userData.security_feature_expired_time).diff(today) > 0) {    
        var existing = moment(userData.security_feature_expired_time);
        console.log("Till",existing.tz(tz));
        var tz = moment.tz.guess();
        response.status = 203;
        response.message = sails.__("Wait for 24 hours") + " till ";
        response.datetime =  existing.tz(tz).format()
        return exits.success(response)  
      }
    } 
    return exits.success(response)     
  }
};
