var request = require('request');

module.exports = {
    friendlyName: 'Bitcoinist news Update',
    description: 'Listing of Bitcoinist news Update RSS Feed - News',
    inputs: {
    },

    fn: async function (inputs, exits) {
        // console.log(sails.config.local.SUSUCOIN_URL + "get-currency-converted-value")
        await request({
            url: sails.config.local.SUSUCOIN_URL + "get-currency-converted-value",
            method: "GET",
            headers: {
                'x-token': 'faldax-susucoin-node',
                'Content-Type': 'application/json'
            }
        }, function (err, httpResponse, body) {
            // console.log(body)
            if (err) {
                return exits.error(err);
            }
            if (body.error) {
                return exits.error(body);
            }
            return exits.success(body);
            // return body;
        });
    }
}
