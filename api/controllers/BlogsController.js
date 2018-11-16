/**
 * BlogsController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
    //---------------------------Web Api------------------------------
    getAllBlogList: async function (req, res) {
        // req.setLocale('en')
        let { page, limit, data } = req.allParams();
        if (data) {
            data = data.toLowerCase();
            let blogData = await Blogs.find({
                where: {
                    deleted_at: null,
                    or: [{
                        search_keywords: { contains: data }
                    }]
                }
            }).sort("id ASC").paginate(page - 1, parseInt(limit));

            let BlogCount = await Blogs.count({
                where: {
                    deleted_at: null,
                    or: [{
                        search_keywords: { contains: data }
                    }]
                }
            });
            if (blogData) {
                return res.json({
                    "status": 200,
                    "message": sails.__("Blog list"),
                    "data": blogData, BlogCount
                });
            }
        } else {
            let blogData = await Blogs.find({
                deleted_at: null
            }).sort("id ASC").paginate(page - 1, parseInt(limit));

            for (let index = 0; index < blogData.length; index++) {
                if (blogData[index].admin_id) {
                    let admin = await Admin.findOne({ id: blogData[index].admin_id })
                    blogData[index].admin_name = admin.name
                }
                let BlogCommentCount = await BlogComment.count({
                    where: {
                        deleted_at: null,
                        blog: blogData[index].id
                    }
                });
                blogData[index].comment_count = BlogCommentCount;
            }

            let BlogCount = await Blogs.count({
                where: {
                    deleted_at: null,
                }
            });
            if (blogData) {
                return res.json({
                    "status": 200,
                    "message": sails.__("Blog list"),
                    "data": blogData, BlogCount
                });
            }
        }
    },

    getBlogDetails: async function (req, res) {
        let blog = await Blogs.findOne({ id: req.body.id, deleted_at: null });
        if (blog) {
            let adminData = await Admin.findOne({ id: blog.admin_id });
            blog.admin_name = adminData.name;
            let BlogCommentCount = await BlogComment.count({
                where: {
                    deleted_at: null,
                    blog: blog.id
                }
            });
            blog.comment_count = BlogCommentCount;
            return res.json({
                "status": 200, "message": sails.__('Blog Details'), data: blog
            })
        } else {
            return res.status(400).json({
                "status": 400,
                "err": "Blog not found",
            });
        }
    },
    addComment: async function (req, res) {
        try {
            let user_id = req.user.id;
            let { blog_id, comment } = req.body;
            let addedComment = await BlogComment.create({
                user: user_id,
                blog: blog_id,
                comment: comment
            }).fetch();
            res.json({
                "status": 200,
                "message": sails.__('Create Comment')
            });
        } catch (error) {
            return res.status(500).json({
                status: 500,
                "err": sails.__("Something Wrong")
            });

        }
    },

    getComment: async function (req, res) {
        try {
            let { blog_id, page, limit } = req.body;
            let comments = await BlogComment.find({ blog: blog_id, deleted_at: null }).paginate(page - 1, parseInt(limit));
            let BlogCommentCount = await BlogComment.count({
                where: {
                    deleted_at: null,
                    blog: blog_id
                }
            });
            if (blogData) {
                return res.json({
                    "status": 200,
                    "message": sails.__("Comment list"),
                    "data": {
                        comments: comments,
                        commentCount: BlogCommentCount
                    }
                });
            }
        } catch (error) {
            return res.status(500).json({
                status: 500,
                "err": sails.__("Something Wrong")
            });
        }
    },
    getRelatedPost: async function (req, res) {
        try {
            let { blog_id } = req.body;
            let blog = await Blogs.findOne({ id: blog_id });
            if (!blog) {
                return res.status(400).json({
                    "status": 400,
                    "err": "Blog not found",
                });
            }
            let tags = Blogs.tags.split(",");
            let conditionArray = [];
            for (let index = 0; index < tags.length; index++) {
                let temp = {};
                temp = {
                    tags: { contains: tags[index] }
                }
                conditionArray.push(temp)
            }

            let relatetPosts = await Blogs.find().where({ id: { '!=': blog_id } }).where({ or: conditionArray }).sort('created_at DESC');
            for (let index = 0; index < relatetPosts.length; index++) {
                if (relatetPosts[index].admin_id) {
                    let admin = await Admin.findOne({ id: relatetPosts[index].admin_id })
                    relatetPosts[index].admin_name = admin.name
                }
            }
            if (blogData) {
                return res.json({
                    "status": 200,
                    "message": sails.__("Blog list"),
                    "data": {
                        blogs: relatetPosts
                    }
                });
            }

        } catch (error) {
            return res.status(500).json({
                status: 500,
                "err": sails.__("Something Wrong")
            });
        }
    },
    //-------------------------------CMS Api--------------------------
    getAllBlogs: async function (req, res) {
        // req.setLocale('en')
        let { page, limit, data } = req.allParams();
        if (data) {
            data = data.toLowerCase();
            let blogData = await Blogs.find({
                where: {
                    deleted_at: null,
                    or: [{
                        search_keywords: { contains: data }
                    }]
                }
            }).sort("id ASC").paginate(page - 1, parseInt(limit));

            let BlogCount = await Blogs.count({
                where: {
                    deleted_at: null,
                    or: [{
                        search_keywords: { contains: data }
                    }]
                }
            });
            if (blogData) {
                return res.json({
                    "status": 200,
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
            }).sort("id ASC").paginate(page - 1, parseInt(limit));

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
                    "status": 200,
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
                    tags: req.body.tags.toLowerCase(),
                    description: req.body.description,
                    created_at: new Date(),
                    search_keywords: req.body.title.toLowerCase()
                }).fetch();
                if (blog_detail) {
                    res.json({
                        "status": 200,
                        "message": sails.__('Create Blog')
                    });
                    return;
                } else {
                    res.status(400).json({
                        "status": 400,
                        "error": "Something went wrong",
                    });
                    return;
                }
            } else {
                res.status(400).json({
                    "status": 400,
                    "err": "blog title & description is not sent",
                });
                return;
            }
        } catch (error) {
            res.status(500).json({
                status: 500,
                "err": sails.__("Something Wrong")
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
                        "status": 200,
                        "message": "Something went wrong!"
                    });
                }
                return res.json({
                    "status": 200,
                    "message": sails.__('Update Blog')
                });
            } else {
                return res.status(400).json({ 'status': 400, 'message': 'blog id is not sent.' })
            }
        } catch (error) {
            res.status(500).json({
                status: 500,
                "err": sails.__("Something Wrong")
            });
            return;
        }
    },

    deleteBlog: async function (req, res) {
        let { id } = req.allParams();
        if (!id) {
            res.status(500).json({
                "status": 500,
                "err": "Blog id is not sent"
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
