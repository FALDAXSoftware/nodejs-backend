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
    let template = await EmailTemplate.findOne({
      slug: slug
    });
    console.log("Email Template Value >>>>>>>>>>", template);
    let emailContent = await sails
      .helpers
      .utilities
      .formatEmail(template.content, {
        recipientName: user.first_name
      });

    console.log("Email Content >>>>>>>>>>", emailContent);

    sails
      .hooks
      .email
      .send("general-email", {
        content: emailContent
      }, {
        to: user.email,
        subject: template.name
      }, function (err) {
        if (!err) {
          exits.success(template.name)
        } else {
          console.log("Error >>>>>>>>>>>>>", err);
        }
      })
  }
};
