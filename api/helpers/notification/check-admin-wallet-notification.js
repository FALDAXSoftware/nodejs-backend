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

    // List of users whom wallet balance need to be checked
    var adminNotifyData = await AdminSetting.findOne({
      where: {
        slug: "admin_threshold_notification_contacts",
        deleted_at: null
      }
    });

    var flag = 0;
    // Limit for checking warm wallet balance
    let admin_thresholds = await AdminSetting.findOne({
      where: {
        slug: 'admin_threshold_notification',
        deleted_at: null
      }
    });


    // Coin List
    var coinData = await Coins.find({
      where: {
        deleted_at: null,
        is_active: true
      }
    })

    // Admin Thresholds checking
    if (admin_thresholds != undefined && (admin_thresholds.value != null || admin_thresholds.value != "") && (JSON.parse(admin_thresholds.value)).length > 0) {
      var assets = JSON.parse(admin_thresholds.value);

      for (var i = 0; i < coinData.length; i++) {
        // Find object on the basis of coin
        let exisiting = assets.find(each_value => each_value['coin_id'] == coinData[i].id);

        // Getting warm wallet balance
        let warmWallet = await sails.helpers.bitgo.getWallet(coinData[i].coin_code, coinData[i].warm_wallet_address);

        let slug = '';

        // Checking whether which limit matched the warm wallet balance lower condition
        if (warmWallet.balance != undefined && warmWallet.balance > 0 && warmWallet.balance != null) {
          if (warmWallet.balance <= exisiting.third_limit && warmWallet.balance < exisiting.second_limit && warmWallet.balance < exisiting.fist_limit) {
            slug = "third_limit_low";
          } else if (warmWallet.balance <= exisiting.second_limit && warmWallet.balance < exisiting.fist_limit) {
            slug = "second_limit_low";
          } else if (warmWallet.balance <= exisiting.fist_limit) {
            slug = "first_limit_low"
          }
        }

        // Sending email and sms to the admins
        if (slug && slug != undefined && slug != null && slug != '') {
          var data = JSON.parse(adminNotifyData.value)
          var phoneValue = data.phone.split(",");
          var emailValue = data.email.split(",")

          if (exisiting.is_email_notification == "true" || exisiting.is_email_notification == true) {
            let template = await EmailTemplate.findOne({
              slug: slug
            });
            let user_language = 'en';
            let language_content = template.all_content[user_language].content;
            let language_subject = template.all_content[user_language].subject;
            //Sending Email to users for notification
            let emailContent = await sails
              .helpers
              .utilities
              .formatEmail(language_content, {
                recipientName: data.email
              });

            sails
              .hooks
              .email
              .send("general-email", {
                content: emailContent
              }, {
                to: data.email,
                subject: language_subject
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
    }
    return exits.success(1);
  }
};
