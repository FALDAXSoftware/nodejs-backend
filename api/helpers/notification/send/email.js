
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
        // user: {
        //     type: 'string',
        //     example: 'user',
        //     description: 'User',
        //     required: true
        // },
    },

    exits: {
        success: {
            description: 'All done.',
        },
    },

    fn: async function (inputs, exits) {
        //Email Notification

        // Temporary Email template is here, change to actual email template
        let slug = "new_email_verification"
        let template = await EmailTemplate.findOne({ slug });
        let emailContent = await sails
            .helpers
            .utilities
            .formatEmail(template.content, {
                recipientName: user.first_name,
                token: sails.config.urlconf.APP_URL + '/login?emailCode='
            });
        sails
            .hooks
            .email
            .send("general-email", {
                content: emailContent
            }, {
                    to: user.email,
                    subject: "New Email Verification"
                }, function (err) {
                    if (!err) {
                        return res.json({
                            "status": 200,
                            "message": sails.__("verification link")
                        });
                    }
                })
    }
};
