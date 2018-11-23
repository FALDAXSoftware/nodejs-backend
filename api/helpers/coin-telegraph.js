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
        request(options, function (error, response, body) {
            console.log('element???', error, response, body)
            var json = xmlParser.toJson(body);

            let res = JSON.parse(json);
            //let items = res.rss.channel.item;
            //console.log('eledgdfgdfgdfgdfgdfgment', body)

            // for (let index = 0; index < items.length; index++) {
            //     const element = items[index];
            //     let records = await News.find({ title: element.title });
            //     //console.log('element', element['media:content'].url)

            //     if (records.length == 0) {
            //         // await News.create({
            //         //     title: element.title,
            //         //     search_keywords: element.title.toLowerCase(),
            //         //     link: element.link,
            //         //     owner: "bitcoin",
            //         //     description: element.description,
            //         //     cover_image: htmlDoc.getElementsByClassName("wp-post-image")[0].getAttribute('src'),
            //         //     posted_at: moment(element.pubDate).format("YYYY-MM-DD hh:mm:ss")
            //         // });
            //     }
            // }

            return exits.success("Done");
        })
    }
}
