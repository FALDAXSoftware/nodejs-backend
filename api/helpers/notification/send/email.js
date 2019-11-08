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
    // console.log("Email Template Value >>>>>>>>>>", template);

    var object = {};
    object.recipientName = user.first_name;
    if (user.coinName && user.coinName != undefined && user.coinName != null)
      object.coin = user.coinName

    if (user.limitType && user.limitType != undefined && user.limitType != null)
      object.limit = user.limitType

    if (user.amountReceived != "" ){
      object.amountReceived = user.amountReceived
    }     
    
    // if (user.coin_name && user.coin_name != undefined && user.coin_name != null){
    //   object.coin_name = user.coin_name  
    // }
      
    //Sending Email to users for notification
    let emailContent = await sails
      .helpers
      .utilities
      .formatEmail(template.content, {
        object
      });

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
