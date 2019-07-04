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
    },

    exits: {
        success: {
            description: 'All done.',
        },
    },

    fn: async function (inputs, exits) {
        let user = await Users.findOne({ id: inputs.user_id, is_active: true, deleted_at: null, is_verified: true });
        if (user) {
            await sails.helpers.notification.send.email('test')
            return exits.success();
        }
        // Email Notification
    }
};
