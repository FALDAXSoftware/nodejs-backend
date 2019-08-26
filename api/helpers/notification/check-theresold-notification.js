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

    // let coinValue = await Coins.find({
    //   where: {
    //     deleted_at: null,
    //     is_active: true
    //   }
    // })

    // let coinArray = [];
    // for (let index = 0; index < coins.length; index++) {
    //   const element = coins[index];
    //   coinArray.push(element.coin)
    // }

    let priceValue = await ThresoldPrices.find({
      where: {
        deleted_at: null
      }
    }).sort('id DESC').limit(7)

    console.log(user.length);

    for (let index = 0; index < user.length; index++) {
      // console.log("INSIDE FOR LOOP >>>>>>>>>>>", user[index])
      const element = user[index];

      console.log(element.asset)
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
