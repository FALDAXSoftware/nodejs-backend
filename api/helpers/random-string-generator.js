module.exports = {
    friendlyName: 'Random string generator',
    description: '',
    inputs: {
        value: {
            type: 'number',
            description: 'value',
            required: true
        }
    },
    exits: {

    },
    fn: async function (inputs, exits) {
        var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        var result = '';
        for (var i = inputs.value; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
        return exits.success(result);
    }
};
