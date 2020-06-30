var twilio = require('twilio');

module.exports = {
  friendlyName: 'Text',

  description: 'Text send.',

  inputs: {
    slug: {
      type: 'string',
      example: 'kyc',
      description: 'SMS Template',
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
    var account_sid = await sails.helpers.getDecryptData(sails.config.local.TWILLIO_ACCOUNT_SID);
    var accountSid = account_sid; // Your Account SID from www.twilio.com/console
    console.log("accountSid", accountSid)
    var authToken = await sails.helpers.getDecryptData(sails.config.local.TWILLIO_ACCOUNT_AUTH_TOKEN); // Your Auth Token from www.twilio.com/console
    console.log("authToken", authToken)
    // var accountNumber = await sails.helpers.getDecryptData(sails.config.local.TWILLIO_ACCOUNT_FROM_NUMBER);
    var accountNumber = sails.config.local.TWILLIO_ACCOUNT_FROM_NUMBER
    var user_id = inputs.user.id;

    //Template for sending Email
    var bodyValue = await SmsTemplate.findOne({
      deleted_at: null,
      slug: inputs.slug
    })

    var user = inputs.user;
    var value = bodyValue.content;
    var object = {};

    object.recipientName = inputs.user.first_name;
    if (user.amountReceived && user.amountReceived != undefined && user.amountReceived != "") {
      object.amountReceived = user.amountReceived
    }

    if (user.coinName && user.coinName != undefined && user.coinName != null)
      object.coin = user.coinName

    if (user.reason && user.reason != undefined && user.reason != null) {
      object.reason = user.reason
    }

    if (user.limitType && user.limitType != undefined && user.limitType != null)
      object.limit = user.limitType

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

    //Sending Email to users for notification
    let emailContent = await sails
      .helpers
      .utilities
      .formatEmail(value, {
        object
      });

    // console.log("emailContent", emailContent)

    //Twilio Integration
    var client = new twilio(accountSid, authToken);
    //Sending SMS to users 
    client.messages.create({
      body: emailContent,
      to: inputs.user.phone_number, // Text this number
      from: accountNumber // From a valid Twilio number
    }).then((message) => {
      return exits.success();
    })
      .catch((err) => {
        console.log("ERROR >>>>>>>>>>>", err)
      })
  }
};
