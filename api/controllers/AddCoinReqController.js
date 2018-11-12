/**
 * AddCoinReqController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
var moment = require('moment');

module.exports = {
    //---------------------------Web Api------------------------------
    addCoinRequest: async function (req, res) {
        let addReqData = await AddCoinRequest.create({
            message: req.body.message,
            url: req.body.url,
            email: req.body.email,
            coin_name: req.body.coin_name,
            target_date: moment(req.body.target_date, 'DD-MM-YYYY').format(),
            created_at: new Date()
        }).fetch();
        if (addReqData) {
            return res.json({
                "status": 200,
                "message": "Coin requested successfully"
            });
        } else {
            return res.status(500).json({
                status: 500,
                "err": sails.__("Something Wrong")
            });
        }
    },

    //-------------------------------CMS Api--------------------------
    getCoinRequests: async function (req, res) {
        let { page, limit } = req.allParams();
        let coinReqData = await AddCoinRequest.find().paginate(page - 1, parseInt(limit));
        let coinReqCount = await AddCoinRequest.count();
        if (coinReqData) {
            return res.json({
                "status": 200,
                "message": "Coin requests retrived successfully",
                "data": coinReqData, coinReqCount
            });
        } else {
            return res.status(500).json({
                status: 500,
                "err": sails.__("Something Wrong")
            });
        }
    },
};
