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
    var authToken = sails.config.local.TWILLIO_ACCOUNT_AUTH_TOKEN; // Your Auth Token from www.twilio.com/console
    var user_id = inputs.user.id;

    //Template for sending Email
    var bodyValue = await SmsTemplate.findOne({
      deleted_at: null,
      slug: inputs.slug
    })

    console.log(bodyValue)

    //Twilio Integration
    var client = new twilio(accountSid, authToken);

    console.log(inputs.user.phone_number)
    //Sending SMS to users 
    client.messages.create({
        body: bodyValue.content,
        to: inputs.user.phone_number, // Text this number
        from: sails.config.local.TWILLIO_ACCOUNT_FROM_NUMBER // From a valid Twilio number
      }).then((message) => {
        return exits.success();
      })
      .catch((err) => {
        console.log("ERROR >>>>>>>>>>>", err)
      })
  }
};
