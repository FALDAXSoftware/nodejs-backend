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

    // await ThresoldController.addThresoldValue();

    // //Getting User Notification Details
    let user = await UserThresholds.find({
      deleted_at: null
    });

    let priceValue = await ThresoldPrices.find({
      where: {
        deleted_at: null
      }
    }).sort('id DESC').limit(7)

    for (let index = 0; index < user.length; index++) {
      const element = user[index];
      var assetValue = element.asset;

      for (var j = 0; j < assetValue.length; j++) {
        for (var k = 0; k < priceValue.length; k++) {
          if (priceValue[k].coin_id == assetValue[j].coin_id) {
            if (assetValue[j].upper_limit != undefined && assetValue[j].upper_limit != null) {
              if (priceValue[k].quote.USD.price >= assetValue[j].upper_limit) {
                var userData = await Users.findOne({
                  where: {
                    id: element.user_id,
                    is_active: true,
                    deleted_at: null,
                    is_verified: true
                  }
                });
                if (userData) {
                  if (assetValue[j].is_email_notification == true || assetValue[j].is_email_notification == "true") {
                    if (userData.email != undefined) {
                      await sails.helpers.notification.send.email("thresold_notification", userData)
                    }
                  }
                  if (assetValue[j].is_sms_notification == true || assetValue[j].is_sms_notification == "true") {
                    if (userData.phone_number != undefined)
                      await sails.helpers.notification.send.text("thresold_notification", userData)
                  }
                }
              }
            }
            if (assetValue[j].lower_limit != undefined && assetValue[j].lower_limit != null) {
              if (priceValue[k].quote.USD.price <= assetValue[j].lower_limit) {
                var userData = await Users.findOne({
                  where: {
                    id: element.user_id,
                    is_active: true,
                    deleted_at: null,
                    is_verified: true
                  }
                });
                if (userData) {
                  if (assetValue[j].is_email_notification == true || assetValue[j].is_email_notification == "true") {
                    if (userData.email != undefined) {
                      await sails.helpers.notification.send.email("thresold_notification", userData)
                    }
                  }
                  if (assetValue[j].is_sms_notification == true || assetValue[j].is_sms_notification == "true") {
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

  }
};
