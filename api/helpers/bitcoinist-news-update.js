var request = require('request');
var xmlParser = require('xml2json');
var moment = require('moment');
module.exports = {


    friendlyName: 'Bitcoinist news Update',


    description: 'Update a news in db.',

    inputs: {

    },


    fn: async function (inputs, exits) {
        request('https://bitcoinist.com/feed/', async function (error, response, body) {
            console.log('error:', error); // Print the error if one occurred
            console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
            // console.log('body:', body); // Print the HTML for the Google homepage.
            var json = xmlParser.toJson(body);
            let res = JSON.parse(json);
            let items = res.rss.channel.item;
            // console.log("to json", items[0]);
            for (let index = 0; index < items.length; index++) {
                const element = items[index];
                // console.log(element.pubDate, moment(element.pubDate).format("YYYY-MM-DD hh:mm:ss"));
                let records = await News.find({ title: element.title });
                // console.log(records);

                if (records.length == 0) {
                    await News.create({
                        title: element.title,
                        search_keywords: element.title.toLowerCase(),
                        link: element.link,
                        owner: "bitcoinist",
                        description: element.description,
                        cover_image: element['desciption'].url,
                        posted_at: moment(element.pubDate).format("YYYY-MM-DD hh:mm:ss")
                    });
                }
            }

            return exits.success("Done");
        });
    }
}