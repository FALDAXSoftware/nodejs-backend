var request = require('request');
var xmlParser = require('xml2json');
var moment = require('moment');

module.exports = {
    friendlyName: 'Bitcoin News',
    description: 'Listing of Bitcoin RSS Feed - News',
    inputs: {

    },

    fn: async function (inputs, exits) {
        request('https://news.bitcoin.com/feed/', async function (error, response, body) {

            var json = xmlParser.toJson(body);
            var res = JSON.parse(json);
            let items = res.rss.channel;

            console.log('>>>>>', items);
            return exits.success("Done");
        })
    }
}
