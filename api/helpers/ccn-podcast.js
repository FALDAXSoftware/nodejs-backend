var request = require('request');
var xmlParser = require('xml2json');
var moment = require('moment');

module.exports = {
    friendlyName: 'Coin Telegraph',
    description: 'Listing of Coin Telegraph RSS Feed - News',
    inputs: {
    },

    fn: async function (inputs, exits) {
        request('https://ccnpodcast.com/rss', async function (error, response, body) {
            var json = xmlParser.toJson(body);
            let res = JSON.parse(json);
            let items = res.rss.channel.item;

            for (let index = 0; index < items.length; index++) {
                const element = items[index];
                let records = await News.find({ title: element.title });
                //console.log('element', element)

                if (records.length == 0) {
                    await News.create({
                        title: element.title,
                        search_keywords: element.title.toLowerCase(),
                        link: element.link,
                        owner: "ccnpodcast",
                        description: element.description,
                        //cover_image: ,
                        posted_at: moment(element.pubDate).format("YYYY-MM-DD hh:mm:ss")
                    });
                }
            }

            return exits.success("Done");
        })
    }
}
