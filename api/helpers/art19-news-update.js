var request = require('request');
module.exports = {


    friendlyName: 'Art 19 news Update',


    description: 'Update a news in db.',

    inputs: {

    },


    fn: async function (inputs, exits) {
        request('https://bitcoinist.com/feed/', function (error, response, body) {
            console.log('error:', error); // Print the error if one occurred
            console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
            console.log('body:', body); // Print the HTML for the Google homepage.
            return exits.success("Done");
        });
    }
}