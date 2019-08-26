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

    //Getting User Notification Details
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
                await sails.helpers.notification.notify(element.user_id, "thresold_notification");
              }
            }
            if (assetValue[j].lower_limit != undefined && assetValue[j].lower_limit != null) {
              if (priceValue[k].quote.USD.price <= assetValue[j].lower_limit) {
                await sails.helpers.notification.notify(element.user_id, "thresold_notification");
              }
            }
          }
        }
      }

    }

  }
};
