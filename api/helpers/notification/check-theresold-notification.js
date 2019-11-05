var ThresoldController = require("../../controllers/ThresoldController");
module.exports = {
  friendlyName: 'Email',
  description: 'Send Email for Notification',

  inputs: {},

  exits: {
    success: {
      description: 'All done.',
    },
  },

  fn: async function (inputs, exits) {

    // //Getting User Notification Details
    let user = await UserThresholds.find({
      deleted_at: null
    });

    var data = '/USD'

    let query = " from price_history WHERE (coin LIKE '%" + data + "' AND (ask_price > 0)) GROUP BY coin , id ORDER BY coin, created_at DESC limit 100";
    let allValue = await sails.sendNativeQuery("Select DISTINCT ON (coin) coin, id, ask_price, created_at " + query, [])

    var values = allValue.rows;

    for (let index = 0; index < user.length; index++) {
      const element = user[index];
      var assetValue = element.asset;
      var userData = await Users.findOne({
        where: {
          id: element.user_id,
          is_active: true,
          deleted_at: null,
          is_verified: true
        }
      });

      for (var i = 0; i < assetValue.length; i++) {
        for (var k = 0; k < values.length; k++) {
          var coinValue = assetValue[i].coin + '/USD'
          if (values[k].coin == coinValue) {
            if (assetValue[i].upper_limit != undefined && assetValue[i].upper_limit != null) {
              if (values[k].ask_price >= assetValue[i].upper_limit) {
                if (userData) {
                  if (assetValue[i].is_email_notification == true || assetValue[i].is_email_notification == "true") {
                    if (userData.email != undefined) {
                      await sails.helpers.notification.send.email("thresold_notification", userData)
                    }
                  }
                  if (assetValue[i].is_sms_notification == true || assetValue[i].is_sms_notification == "true") {
                    if (userData.phone_number != undefined)
                      await sails.helpers.notification.send.text("thresold_notification", userData)
                  }
                }
              }
            }

            if (assetValue[i].lower_limit != undefined && assetValue[i].lower_limit != null) {
              if (values[k].ask_price <= assetValue[i].lower_limit) {
                if (userData) {
                  if (assetValue[i].is_email_notification == true || assetValue[i].is_email_notification == "true") {
                    if (userData.email != undefined) {
                      await sails.helpers.notification.send.email("thresold_notification", userData)
                    }
                  }
                  if (assetValue[i].is_sms_notification == true || assetValue[i].is_sms_notification == "true") {
                    if (userData.phone_number != undefined)
                      await sails.helpers.notification.send.text("thresold_notification", userData)
                  }
                }
              }
            }

          }
        }
      }
    }

    return exits.success(1)
  }
};
