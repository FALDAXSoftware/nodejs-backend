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


    var coinData = await Coins.find({
      where: {
        deleted_at: null,
        is_active: true
      }
    })

    if (admin_thresholds != undefined && (admin_thresholds.value != null || admin_thresholds.value != "") && (JSON.parse(admin_thresholds.value)).length > 0) {
      var assets = JSON.parse(admin_thresholds.value);
      // all_coins.map(async obj => {
      var flag = 1;
      for (var i = 0; i < coinData.length; i++) {
        let exisiting = assets.find(each_value => each_value['coin_id'] === coinData[i].id);
        //console.log("COIN ID>>>>>>>>>>>>>>>", coinData[i].id)
        // if (exisiting != undefined) {

        let warmWallet = await sails.helpers.bitgo.getWallet(coinData[i].coin_code, coinData[i].warm_wallet_address);
        // let custodialWallet = await sails.helpers.bitgo.getWallet(obj.coin_code, obj.custody_wallet_address);

        //console.log("WaRM WLALLET ?????????/", warmWallet.balance)
        //console.log("existing value????????????", exisiting.first_limit);
        //console.log(warmWallet.balance <= exisiting.first_limit)
        var slug;

        if (warmWallet.balance != undefined) {
          if (warmWallet.balance <= exisiting.first_limit) {
            slug = "first_limit_low";
          } else if (warmWallet.balance <= exisiting.first_limit && warmWallet.balance <= exisiting.second_limit) {
            slug = "second_limit_low";
          } else if (warmWallet.balance <= exisiting.first_limit && warmWallet.balance <= exisiting.second_limit && warmWallet.balance <= exisiting.third_limit) {
            slug = "third_limit_low"
          }
        }

        //console.log("SLUG VALUE >>>>>>>>>>>>>>", slug)

        if (slug != undefined) {
          var data = JSON.parse(adminNotifyData.value)
          var phoneValue = data.phone.split(",");
          var emailValue = data.email.split(",")

          //console.log(phoneValue);          
          // if (exisiting.is_sms_notification == "true" || exisiting.is_sms_notification == true) {
          //   if (phoneValue != undefined && phoneValue.length > 0) {
          //     for (var i = 0; i < phoneValue.length; i++) {

          //       //console.log(phoneValue[i]);
          //       var accountSid = sails.config.local.TWILLIO_ACCOUNT_SID; // Your Account SID from www.twilio.com/console
          //       var authToken = sails.config.local.TWILLIO_ACCOUNT_AUTH_TOKEN; // Your Auth Token from www.twilio.com/console

          //       //Template for sending Email
          //       var bodyValue = await SmsTemplate.findOne({
          //         deleted_at: null,
          //         slug: slug
          //       })
          //       //Twilio Integration
          //       var client = new twilio(accountSid, authToken);

          //       //Sending SMS to users 
          //       client.messages.create({
          //           body: bodyValue.content,
          //           to: phoneValue[i], // Text this number
          //           from: sails.config.local.TWILLIO_ACCOUNT_FROM_NUMBER // From a valid Twilio number
          //         }).then((message) => {

          //           return exits.success();
          //         })
          //         .catch((err) => {
          //           console.log("ERROR >>>>>>>>>>>", err)

          //         })
          //     }
          //   }
          // }

          if (exisiting.is_email_notification == "true" || exisiting.is_email_notification == true) {
            // if (emailValue != undefined && emailValue.length > 0) {
            //   for (var i = 0; i < emailValue.length; i++) {
            //     console.log();
            //     let template = await EmailTemplate.findOne({
            //       slug: slug
            //     });
            //     //Sending Email to users for notification
            //     let emailContent = await sails
            //       .helpers
            //       .utilities
            //       .formatEmail(template.content, {
            //         recipientName: emailValue[i]
            //       });

            //     sails
            //       .hooks
            //       .email
            //       .send("general-email", {
            //         content: emailContent
            //       }, {
            //         to: emailValue[i],
            //         subject: template.name
            //       }, function (err) {
            //         if (!err) {
            //           exits.success(template.name)
            //         } else {
            //           console.log("Error >>>>>>>>>>>>>", err);
            //         }
            //       })
            //   }
            // }
            let template = await EmailTemplate.findOne({
              slug: slug
            });
            //Sending Email to users for notification
            let emailContent = await sails
              .helpers
              .utilities
              .formatEmail(template.content, {
                recipientName: data.email
              });

            sails
              .hooks
              .email
              .send("general-email", {
                content: emailContent
              }, {
                to: data.email,
                subject: template.name
              }, function (err) {
                if (!err) {
                  exits.success(template.name)
                } else {
                  console.log("Error >>>>>>>>>>>>>", err);
                }
                flag++;
              })
          } else {
            flag++;
          }
        }

      }
      // }
      // })
    }
  }
};
