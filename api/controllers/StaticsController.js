/**
 * StaticsController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
    //---------------------------Web Api------------------------------

    //-------------------------------CMS Api--------------------------
    getStatic: async function (req, res) {
        let { page, limit } = req.allParams();
        let staticData = await Statics.find({ is_active: true });
        let staticCount = await Statics.count({ is_active: true });
        if (staticData) {
            return res.json({
                "status": "200",
                "message": "Static Pages retrived successfully",
                "data": staticData, staticCount
            });
        }
    },

    create: async function (req, res) {
        try {
            if (req.body.title && req.body.name && req.body.content) {
                var static_details = await Statics.create({
                    name: req.body.name,
                    slug: req.body.name.split(' ').join('_'),
                    content: req.body.content,
                    title: req.body.title,
                    created_at: new Date()
                }).fetch();
                if (static_details) {
                    //Send verification email in before create
                    res.json({
                        "status": 200,
                        "message": "Static page created successfully."
                    });
                    return;
                } else {
                    res.json({
                        "status": 400,
                        "message": "not listed",
                        "error": "Something went wrong",
                    });
                    return;
                }
            } else {
                res.json({
                    "status": 400,
                    "message": "not listed",
                    "error": "Something went wrong",
                });
                return;
            }
        } catch (error) {
            res.status(500).json({
                "status": "500",
                "message": "error",
                "errors": error
            });
            return;
        }
    },

    update: async function (req, res) {
        try {
            const static_details = await Statics.findOne({ id: req.body.id });
            if (!static_details) {
                return res.status(401).json({ err: 'Invalid Static page Id' });
            }
            var staticData = { ...req.body };
            delete staticData.id
            var updateStatic = await Statics.update({ id: req.body.id }).set(staticData).fetch();
            if (!updateStatic) {
                return res.json({
                    "status": "200",
                    "message": "Something went wrong! could not able to update static page details"
                });
            }

            return res.json({
                "status": "200",
                "message": "Static page details updated successfully."
            });

        } catch (error) {
            res.json({
                "status": "500",
                "message": "error",
                "errors": error
            });
            return;
        }
    },

    delete: async function (req, res) {
        let { id } = req.allParams();
        if (!id) {
            res.json({
                "status": 500,
                "message": "Static page id is not sent"
            });
            return;
        }
        let staticData = await Statics.update({ id: id }).set({ is_active: false }).fetch();
        if (staticData) {
            return res.status(200).json({
                "status": 200,
                "message": "Static Page deleted successfully."
            });
        }
    }
};
