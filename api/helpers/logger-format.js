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
        req: {
            type: 'json',
            description: '{}',
            required: true
        },
        message: {
            type: 'string',
            description: 'Message',
            required: false
        }
    },
    exits: {
    },

    fn: async function (inputs, exits) {
        var logger = require("../controllers/logger")
        var headers = [];
        if (inputs.type == 1 || inputs.type == "1") {
            var requestIp = require('request-ip');
            var ip = requestIp.getClientIp(inputs.req);
            var generate_unique_string = Math.random().toString(36).substring(2, 16) + "-" + Math.random().toString(36).substring(2, 16).toUpperCase() + "-" + Math.random().toString(36).substring(2, 16).toUpperCase() + "-" + Math.random().toString(36).substring(2, 16).toUpperCase() + "-" + (new Date().valueOf());
            headers['Logid'] = generate_unique_string;
            headers['ip_address'] = ip;
        }
        var type='';
        if( inputs.type == 1){
            type='Request';
        }else if( inputs.type == 2){
            type='Success';
        }else if( inputs.type == 3){
            type='Error';
        }
        if( inputs.type == 3 || inputs.type == "3" ){
            await logger.error({
                module: inputs.module,
                user_id: "user_" + (inputs.user_id),
                url: inputs.url,
                type: inputs.type,
                log_id: headers['Logid'],
                ip_address:headers['ip_address']
            }, inputs.message)
        }else{
            await logger.info({
                module: inputs.module,
                user_id: "user_" + (inputs.user_id),
                url: inputs.url,
                type: inputs.type,
                log_id: headers['Logid'],
                ip_address:headers['ip_address']
            }, inputs.message)
        }

        return exits.success(1);
    }
};
