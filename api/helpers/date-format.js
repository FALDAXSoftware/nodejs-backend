const moment = require("moment");

module.exports = {

    friendlyName: 'Date Format Function',

    description: '',

    inputs: {
        date: {
            type: 'string',
            description: 'date',
            required: true
        }
    },

    exits: {

    },

    fn: async function (inputs, exits) {
        var resultedDate = moment(inputs.date).startOf('d').format("YYYY-MM-DD");
        return exits.success(resultedDate);
    }
};
