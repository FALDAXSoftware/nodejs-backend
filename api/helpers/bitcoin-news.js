var request = require('request');
var xmlParser = require('xml2json');
var moment = require('moment');
var DomParser = require('dom-parser');

module.exports = {
    friendlyName: 'Bitcoin News',
    description: 'Listing of Bitcoin RSS Feed - News',
    inputs: {
    },

    fn: async function (inputs, exits) {
        request('https://news.bitcoin.com/feed/', async function (error, response, body) {

            var json = xmlParser.toJson(body);
            let res = JSON.parse(json);
            let items = res.rss.channel.item;

            for (let index = 0; index < items.length; index++) {
                const element = items[index];
                let records = await News.find({ title: element.title });
                let parser = new DomParser();
                htmlDoc = parser.parseFromString(element.description, "text/xml");

                if (records.length == 0) {
                    await News.create({
                        title: element.title,
                        search_keywords: element.title.toLowerCase(),
                        link: element.link,
                        owner: "bitcoin",
                        description: element.description,
                        cover_image: htmlDoc.getElementsByClassName("wp-post-image")[0].getAttribute('src'),
                        posted_at: moment(element.pubDate).format("YYYY-MM-DD hh:mm:ss")
                    });
                }
            }

            return exits.success("Done");
        })
    }
}
