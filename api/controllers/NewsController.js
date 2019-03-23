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
            let { page, limit, search } = req.allParams();
            let q = { deleted_at: null }
            if (search && search != "") {
                q = {
                    ...q,
                    search_keywords: {
                        'contains': search
                    }
                }
            }

            let news = await News.find({ ...q }).paginate(parseInt(page) - 1, parseInt(limit));
            let newsCount = await News.count({ ...q });
            return res.json({
                "status": 200,
                "message": "Inquiries retrived successfully",
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
            let { id, status } = req.allParams();
            await News.update({ id: id }).set({ is_active: status }).fetch();
            return res.json({ "status": 200, "message": "News Status Updated" });
        } catch (error) {
            return res
                .status(500)
                .json({
                    status: 500,
                    "err": sails.__("Something Wrong")
                });
        }
    }

};

