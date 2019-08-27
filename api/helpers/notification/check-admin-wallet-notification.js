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

    var data = JSON.parse(adminNotifyData.value)
    var phoneValue = data.phone.split(",");
    var emailValue = data.email.split(",")

    var slug = "wallet_balance_low";

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
};
