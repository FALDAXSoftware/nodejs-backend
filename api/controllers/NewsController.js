/**
 * NewsController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
    // Get All News Pagination
    getAllNews: async function (req, res) {
        try {
            let { page, limit, search, filterVal, start_date, end_date } = req.allParams();
            let q = { deleted_at: null }
            if (filterVal) {
                q["owner"] = filterVal
            }
            if (start_date && end_date) {
                q['posted_at'] = {
                    '>=': start_date,
                    '<=': end_date
                };
            }
            if (search && search != "") {
                q = {
                    ...q,
                    search_keywords: {
                        'contains': search.toLowerCase()
                    }
                }
            }

            let news = await News.find({ ...q })
                .sort('id ASC')
                .paginate(parseInt(page) - 1, parseInt(limit));
            let newsCount = await News.count({ ...q });
            return res.json({
                "status": 200,
                "message": "News retrived successfully",
                "data": news,
                newsCount
            });
        } catch (error) {
            console.log('>>>>>>', error)
            return res
                .status(500)
                .json({
                    status: 500,
                    "err": sails.__("Something Wrong")
                });
        }
    },
    // Change News Status
    changeNewsStatus: async function (req, res) {
        try {
            let { id, is_active } = req.body;
            await News.update({ id: id }).set({ is_active });
            return res.json({ "status": 200, "message": "News Status Updated" });
        } catch (error) {
            console.log('error', error)
            return res
                .status(500)
                .json({
                    status: 500,
                    "err": sails.__("Something Wrong")
                });
        }
    },

    // get news details
    getNewsDetails: async function (req, res) {
        try {
            let { news_id } = req.allParams();
            let newsDetails = await News.findOne({ id: news_id });
            if (newsDetails) {
                return res.json({ "status": 200, "message": "News data Updated", data: newsDetails });
            } else {
                return res.json({ "status": 400, "message": "No news found" });
            }
        } catch (error) {
            console.log('error', error)
            return res
                .status(500)
                .json({
                    status: 500,
                    "err": sails.__("Something Wrong")
                });
        }
    }

};

