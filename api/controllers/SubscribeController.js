/**
 * SubscribeController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
    senEmailSubscribtion: async function (req, res) {
        try {
            let obj = {
                email: req.body.email,
                is_news_feed: true,
                created_at: new Date()
            }
            let getData = await Subscribe.find({ email: req.body.email });
            if (getData.length > 0) {
                throw ("You have subscribed to news feeds already.")
            }
            let add = await Subscribe.create(obj).fetch();

            sails.hooks.email.send(
                "subscribe",
                {
                    homelink: sails.config.urlconf.APP_URL,
                    recipientName: req.body.email,
                    senderName: "Faldax"
                },
                {
                    to: req.body.email,
                    subject: "Subscription"
                },
                function (err) {
                    if (!err) {
                        return res.json({
                            "status": "200",
                            "message": "Verification link sent to email successfully"
                        });
                    }
                    throw (err)
                }
            )
        } catch (e) {
            return res.status(500).json({
                "status": "500",
                "message": "Error in adding subscription",
                "error": e
            });
        }
    }
};
