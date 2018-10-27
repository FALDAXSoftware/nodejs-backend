/**
 * BlogsController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
    //---------------------------Web Api------------------------------

    //-------------------------------CMS Api--------------------------
    getAllBlogs: async function (req, res) {
        // req.setLocale('en')
        let { page, limit, data } = req.allParams();
        if (data) {
            let blogData = await Blogs.find({
                where: {
                    deleted_at: null,
                    or: [{
                        title: { contains: data }
                    },
                    { description: { contains: data } }
                    ]
                }
            }).sort("id ASC").paginate(page, parseInt(limit));

            let BlogCount = await Blogs.count({
                where: {
                    deleted_at: null,
                    or: [{
                        title: { contains: data }
                    },
                    { description: { contains: data } }
                    ]
                }
            });
            if (blogData) {
                return res.json({
                    "status": "200",
                    "message": sails.__("Blog list"),
                    "data": blogData, BlogCount
                });
            }
        } else {
            let allAdmins = await Admin.find({
                is_active: true,
                deleted_at: null
            });

            let blogData = await Blogs.find({
                deleted_at: null
            }).sort("id ASC").paginate(page, parseInt(limit));

            for (let index = 0; index < blogData.length; index++) {
                if (blogData[index].admin_id) {
                    let admin = await Admin.findOne({ id: blogData[index].admin_id })
                    blogData[index].admin_name = admin.name
                }
            }

            let BlogCount = await Blogs.count({
                where: {
                    deleted_at: null,
                }
            });
            if (blogData) {
                return res.json({
                    "status": "200",
                    "message": sails.__("Blog list"),
                    "data": blogData, BlogCount, allAdmins
                });
            }
        }
    },

    createBlog: async function (req, res) {
        try {
            if (req.body.title && req.body.description) {
                var blog_detail = await Blogs.create({
                    title: req.body.title,
                    admin_id: req.body.author,
                    tags: req.body.tags,
                    description: req.body.description,
                    created_at: new Date()
                }).fetch();
                if (blog_detail) {
                    res.json({
                        "status": 200,
                        "message": sails.__('Create Blog')
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
                    "error": "blog title & description is not sent",
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

    updateBlog: async function (req, res) {
        try {
            if (req.body.id) {
                const blog_details = await Blogs.findOne({ id: req.body.id });
                if (!blog_details) {
                    return res.status(401).json({ err: 'invalid coin' });
                }
                var updatedBlog = await Blogs.update({ id: req.body.id }).set(req.body).fetch();
                if (!updatedBlog) {
                    return res.json({
                        "status": "200",
                        "message": "Something went wrong!"
                    });
                }
                return res.json({
                    "status": "200",
                    "message": sails.__('Update Blog')
                });
            } else {
                return res.status(400).json({ 'status': '400', 'message': 'blog id is not sent.' })
            }
        } catch (error) {
            res.json({
                "status": "500",
                "message": "error",
                "errors": error
            });
            return;
        }
    },

    deleteBlog: async function (req, res) {
        let { id } = req.allParams();
        if (!id) {
            res.json({
                "status": 500,
                "message": "Blog id is not sent"
            });
            return;
        }
        let blogData = await Blogs.update({ id: id }).set({ deleted_at: new Date() }).fetch();
        if (blogData) {
            return res.status(200).json({
                "status": 200,
                "message": sails.__('Delete Blog')
            });
        }
    },
};
