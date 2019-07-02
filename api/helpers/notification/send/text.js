var twilio = require('twilio');

module.exports = {
  friendlyName: 'Text',

  description: 'Text send.',

  inputs: {
    to: {
      type: 'string',
      example: '+12354878',
      description: 'destination number',
      required: true
    },
    body: {
      type: 'string',
      example: 'lorem ipsum',
      description: 'body of message',
      required: true
    }
  },

  exits: {
    success: {
      description: 'All done.',
    },
  },

  fn: async function (inputs, exits) {
    var accountSid = sails.config.local.TWILLIO_ACCOUNT_SID; // Your Account SID from www.twilio.com/console
    var authToken = sails.config.local.TWILLIO_ACCOUNT_AUTH_TOKEN;   // Your Auth Token from www.twilio.com/console

    var client = new twilio(accountSid, authToken);

    client.messages.create({
      body: inputs.body,
      to: inputs.to,  // Text this number
      from: sails.config.local.TWILLIO_ACCOUNT_FROM_NUMBER // From a valid Twilio number
    }).then((message) => {
      return exits.success();
    }
    )
  }
};

