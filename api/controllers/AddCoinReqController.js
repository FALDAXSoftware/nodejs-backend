/**
 * AddCoinReqController
 *
 * @description :: Manage All Add Coin requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
var moment = require('moment');

module.exports = {
    //---------------------------Web Api------------------------------

    // Add Coin Request 
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

    // Get Coin Request
    getCoinRequests: async function (req, res) {
        let { page, limit, data, start_date, end_date } = req.allParams();

        if (data) {
            let q = {
                deleted_at: null
            }
            q['or'] = [
                { coin_name: { contains: data } },
                { email: { contains: data } }
            ]
            if (start_date && end_date) {
                q['target_date'] = { '>': start_date };
                q['target_date'] = { '<': end_date };
            }
            let coinReqData = await AddCoinRequest.find({ where: { ...q } }).sort('id ASC').paginate(page - 1, parseInt(limit));
            let coinReqCount = await AddCoinRequest.count({
                where: { ...q }
            });
            if (coinReqData) {
                return res.json({
                    "status": 200,
                    "message": "Coin requests retrived successfully",
                    "data": coinReqData, coinReqCount
                });
            }
        } else {
            let q = {
                deleted_at: null
            }
            if (start_date && end_date) {
                q['target_date'] = { '>': start_date };
                q['target_date'] = { '<': end_date };
            }

            let coinReqData = await AddCoinRequest.find({ ...q }).paginate(page - 1, parseInt(limit));
            let coinReqCount = await AddCoinRequest.count({ ...q });
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
        }
    },
};
