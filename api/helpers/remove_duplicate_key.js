module.exports = {
    friendlyName: 'Remove duplicate key',
    description: '',
    inputs: {
        values: {
            type: 'ref',
            description: 'values',
            required: true
        },
        key: {
            type: 'string',
            description: 'values',
            required: true
        }
    },
    exits: {
        success: {
            description: 'All done.'
        }
    },
    fn: async function (inputs, exits) {
        var newArray = [];
        var lookupObject = {};
        var originalArray = inputs.values;
        var key = inputs.key;

        for (var i in originalArray) {
            lookupObject[originalArray[i][key]] = originalArray[i];
        }
        for (i in lookupObject) {
            newArray.push(lookupObject[i]);
        }
        return exits.success(newArray);
    }
};
