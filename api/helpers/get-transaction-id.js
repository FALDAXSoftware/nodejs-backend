var request = require('request');

module.exports = {

    friendlyName: 'KYC Upload',
    description: 'KYc Documents Upload API',
    inputs: {
        email: {
            type: 'string',
            required: true,
            example: "abc@gmail.com",
            description: "Email Of User"
        }
    },

    exits: {

        success: {
            outputFriendlyName: 'Get Transaction ID',
        },

    },

    fn: async function (inputs, exits) {
        var transaction_id;
        console.log("inputs.email", inputs.email)
        var idm_key = await sails.helpers.getDecryptData(sails.config.local.IDM_TOKEN);
        console.log("idm_key", idm_key)
        var details = {
            "man": inputs.email
        }

        request.post({
            headers: {
                'Authorization': 'Basic ' + idm_key
            },
            url: sails.config.local.IDM_URL,
            json: details
        }, async function (error, response, body) {
            try {
                console.log("body.tid", body.tid)
                return exits.success(body.tid)
            } catch (error) {
                console.log('error', error);
            }
        });
    }
}