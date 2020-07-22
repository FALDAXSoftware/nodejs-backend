module.exports = {
  friendlyName: 'Email',
  description: 'Send Email for Notification',

  inputs: {
    slug: {
      type: 'string',
      example: 'email_template',
      description: 'Email Template',
      required: true
    },
    user: {
      type: 'json',
      example: '{}',
      description: 'User details',
      required: true
    }
  },

  exits: {
    success: {
      description: 'All done.',
    },
  },

  fn: async function (inputs, exits) {
    //Email Notification

    // Temporary Email template is here, change to actual email template
    let slug = inputs.slug;
    let user = inputs.user;

    //According to the slug find the email template
    let template = await EmailTemplate.findOne({
      slug: slug
    });
    let user_language = (user.default_language ? user.default_language : 'en');
    let language_content = template.all_content[user_language].content;
    let language_subject = template.all_content[user_language].subject;
    // console.log("Email Template Value >>>>>>>>>>", template);
    var object = {};
    object.recipientName = user.first_name;

    if (user.reason && user.reason != undefined && user.reason != null) {
      object.reason = user.reason
    }

    if (user.limitType && user.limitType != undefined && user.limitType != null)
      object.limit = user.limitType

    if (user.amountReceived && user.amountReceived != undefined && user.amountReceived != "") {
      object.amountReceived = user.amountReceived
    }

    if (user.firstCoin && user.firstCoin != undefined && user.firstCoin != "") {
      object.firstCoin = user.firstCoin
    }

    if (user.secondCoin && user.secondCoin != undefined && user.secondCoin != "") {
      object.secondCoin = user.secondCoin
    }

    if (user.firstAmount && user.firstAmount != undefined && user.firstAmount != "") {
      object.firstAmount = user.firstAmount
    }

    if (user.secondAmount && user.secondAmount != undefined && user.secondAmount != "") {
      object.secondAmount = user.secondAmount
    }

    if (user.coinName && user.coinName != undefined && user.coinName != null) {
      object.coin = user.coinName
    }

    //Sending Email to users for notification
    let emailContent = await sails
      .helpers
      .utilities
      .formatEmail(language_content, {
        object
      });

    console.log("emailContent", emailContent)
    console.log("user.email", user.email)
    sails
      .hooks
      .email
      .send("general-email", {
        content: emailContent
      }, {
        to: user.email,
        subject: language_subject
      }, function (err) {
        console.log("err", err);
        if (!err) {
          exits.success(template.name)
        } else {
          console.log("Error >>>>>>>>>>>>>", err);
          exits.success(template.name)
        }
      })
  }
};
