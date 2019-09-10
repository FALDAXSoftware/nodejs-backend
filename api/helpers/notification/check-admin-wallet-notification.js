var twilio = require('twilio');

module.exports = {
  friendlyName: 'Email',
  description: 'Send Notification to admin',

  inputs: {},

  exits: {
    success: {
      description: 'All done.',
    },
  },

  fn: async function (inputs, exits) {

    var adminNotifyData = await AdminSetting.findOne({
      where: {
        slug: "admin_threshold_notification_contacts",
        deleted_at: null
      }
    });

    let admin_thresholds = await AdminSetting.findOne({
      where: {
        slug: 'admin_threshold_notification',
        deleted_at: null
      }
    });

    var get_coins = await sails.sendNativeQuery("SELECT id as coin_id, coin FROM coins WHERE is_active=true and deleted_at IS NULL");
    var all_coins = get_coins.rows;

    if (admin_thresholds != undefined && (admin_thresholds.value != null || admin_thresholds.value != "") && (JSON.parse(admin_thresholds.value)).length > 0) {
      var assets = JSON.parse(admin_thresholds.value);
      all_coins.map(async obj => {
        var singledata = {};
        let exisiting = assets.find(each_value => each_value['coin_id'] === obj.coin_id);
        //console.log(exisiting);
        singledata.coin = obj.coin;
        singledata.coin_id = obj.coin_id;
        if (exisiting != undefined) {
          // singledata.fist_limit = exisiting.fist_limit;
          // singledata.second_limit = exisiting.second_limit;
          // singledata.third_limit = exisiting.third_limit;
          // singledata.is_sms_notification = exisiting.is_sms_notification;
          // singledata.is_email_notification = exisiting.is_email_notification;

          var data = JSON.parse(adminNotifyData.value)
          var phoneValue = data.phone.split(",");
          var emailValue = data.email.split(",")

          var slug = "wallet_balance_low";

          if (exisiting.is_sms_notification == "true" || exisiting.is_sms_notification == true) {
            if (phoneValue != undefined && phoneValue.length > 0) {
              for (var i = 0; i < phoneValue.length; i++) {
                // console.log(phoneValue[i]);
                var accountSid = sails.config.local.TWILLIO_ACCOUNT_SID; // Your Account SID from www.twilio.com/console
                var authToken = sails.config.local.TWILLIO_ACCOUNT_AUTH_TOKEN; // Your Auth Token from www.twilio.com/console

                //Template for sending Email
                var bodyValue = await SmsTemplate.findOne({
                  deleted_at: null,
                  slug: slug
                })
                //Twilio Integration
                var client = new twilio(accountSid, authToken);

                //Sending SMS to users 
                client.messages.create({
                    body: bodyValue.content,
                    to: phoneValue[i], // Text this number
                    from: sails.config.local.TWILLIO_ACCOUNT_FROM_NUMBER // From a valid Twilio number
                  }).then((message) => {
                    return exits.success();
                  })
                  .catch((err) => {
                    console.log("ERROR >>>>>>>>>>>", err)
                  })
              }
            }
          }

          if (exisiting.is_email_notification == "true" || exisiting.is_email_notification == true) {
            if (emailValue != undefined && emailValue.length > 0) {
              for (var i = 0; i < emailValue.length; i++) {
                let template = await EmailTemplate.findOne({
                  slug: slug
                });
                //Sending Email to users for notification
                let emailContent = await sails
                  .helpers
                  .utilities
                  .formatEmail(template.content, {
                    recipientName: emailValue[i]
                  });

                sails
                  .hooks
                  .email
                  .send("general-email", {
                    content: emailContent
                  }, {
                    to: emailValue[i],
                    subject: template.name
                  }, function (err) {
                    if (!err) {
                      exits.success(template.name)
                    } else {
                      console.log("Error >>>>>>>>>>>>>", err);
                    }
                  })
              }
            }
          }
        }
      })
    }
  }
};
