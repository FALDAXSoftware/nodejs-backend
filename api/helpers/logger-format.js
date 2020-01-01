module.exports = {
    friendlyName: 'Logger format',
    description: '',
    inputs: {
        module: {
            type: 'string',
            description: 'Module',
            required: true
        },
        user_id: {
            type: 'string',
            description: 'Userid',
            required: true
        },
        url: {
            type: 'string',
            description: 'URL',
            required: true
        },
        type: {
            type: 'string',
            description: 'Type; 1:Request, 2.Success, 3:Error',
            required: true
        },
        message: {
            type: 'string',
            description: 'Message',
            required: false
        },
    },
    exits: {
    },

    fn: async function (inputs, exits) {
        var temp = await sails.helpers.getDecryptData("77b4af3044d472f5e07456112f32a5ffa2c8fd27d353f112e315e4e53c7600c0a2e9d2479fcfd18446c348e060119d9d8ec78fb8fc8823a7ef67f575b6fa002fd4f298");
        console.log(temp);
        var logger = require("../controllers/logger")
        // var generate_unique_string = Math.random().toString(36).substring(2, 16) + "-" + Math.random().toString(36).substring(2, 16).toUpperCase() + "-" + Math.random().toString(36).substring(2, 16).toUpperCase() + "-" + Math.random().toString(36).substring(2, 16).toUpperCase()+"-"+(new Date().valueOf());
        // req.headers['Logid'] = generate_unique_string;
        await logger.info({
            "module": inputs.module,
            "user_id": "user_" + (inputs.user_id),
            "url": inputs.url,
            "type": inputs.type
        }, inputs.message)
        return exits.success(1);
    }
};
