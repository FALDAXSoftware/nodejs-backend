module.exports = {
  friendlyName: 'Email',
  description: 'Send Email for Notification',

  inputs: {
    user_id: {
      type: 'string',
      example: 'test@faldax.com',
      description: 'Email Address',
      required: true
    },
    slug: {
      type: 'string',
      example: 'kyc',
      description: 'subject for which notification needs to be send',
      required: true
    }
  },

  exits: {
    success: {
      description: 'All done.',
    },
  },

  fn: async function (inputs, exits) {

    //Getting User Details
    let user = await Users.findOne({
      id: inputs.user_id,
      is_active: true,
      deleted_at: null,
      is_verified: true
    });

    if (user) {
      //Fetching which notification to be send based on the user id and slug provided
      var user_notification = await UserNotification.findOne({
        slug: inputs.slug,
        user_id: inputs.user_id,
        deleted_at: null
      });

      console.log(user_notification);
      //Checking if email notification is enabled or not
      if (user_notification.email == true)
        await sails.helpers.notification.send.email(inputs.slug, user)

      // Checking if sms notification is enabled or not
      if (user_notification.text == true)
        await sails.helpers.notification.send.text(inputs.slug, user)

      return exits.success();
    }
    // Email Notification
  }
};
