var request = require('request');
var xmlParser = require('xml2json');
var moment = require('moment');

module.exports = {
    friendlyName: 'Coin Telegraph',
    description: 'Listing of Coin Telegraph RSS Feed - News',
    inputs: {
    },

    fn: async function (inputs, exits) {
        var options = {
            url: 'http://cointelegraph.com/rss',
            headers: {
                'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.110 Safari/537.36'
            }
        };
        request(options, async function (error, response, body) {
            var json = xmlParser.toJson(body);

            let res = JSON.parse(json);
            let items = res.rss.channel.item;
            for (let index = 0; index < items.length; index++) {
                const element = items[index];
                let records = await News.find({ title: element.title });

                if (records.length == 0) {
                    await News.create({
                        title: element.title,
                        search_keywords: element.title.toLowerCase(),
                        link: element.link,
                        owner: "cointelegraph",
                        description: element.description,
                        cover_image: element['media:content'].url,
                        posted_at: moment(element.pubDate).format("YYYY-MM-DD hh:mm:ss")
                    });
                }
            }

            return exits.success("Done");
        })
    }
}
