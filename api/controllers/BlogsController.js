/**
 * BlogsController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 * @routes      ::
 * get /admin/all-blogs
 * post /admin/create-blog
 * put /admin/edit-blog
 * delete /admin/delete-blog
 * post /admin/set-featured-blog
 * get /users/get-all-blogs
 * post /users/get-blog-detail
 * post /get-comments
 * post /add-comments
 * post /get-related-blog
 * post /users/get-all-news
 * post /create-comments
 */
var UploadFiles = require('../services/UploadFiles');
var request = require('request');
var h2p = require('html2plaintext')
module.exports = {
  //---------------------------Web Api------------------------------

  CreateComment: async function (req, res) {
    var https = require('https');
    let {
      comment,
      contentId,
      collectionId,
      contentAuthorEmail,
      contentAuthorName,
      contentPermalink,
      contentTitle,
      userEmail,
      userName,
      portalId
    } = req.allParams();
    var responseData = '';

    var form = {
      comment,
      contentId,
      collectionId,
      contentAuthorEmail,
      contentAuthorName,
      contentPermalink,
      contentTitle,
      userEmail,
      portalId,
      userName
    }

    var apiConfig = {
      path: 'http://api.hubapi.com/comments/v3/comments?hapikey=e2032f87-8de8-4e18-8f16-f4210' +
          'e714245&portalid=4933498',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    };

    request.post({
      url: 'http://api.hubapi.com/comments/v3/comments?hapikey=e2032f87-8de8-4e18-8f16-f4210' +
          'e714245',
      form: form
    }, function (err, httpResponse, body) {
      console.log("----err----->", err);
      // console.log("---------http-response---->",httpResponse);
    })

    // request.post(apiConfig, { form: JSON.stringify(form) }, function (err,
    // httpResponse, body) {     console.log("----err----->", err);     //
    // console.log("---------http-response---->",httpResponse);
    // console.log("---------body--->", body); }) https.request(apiConfig, { form },
    // function (response) {     var responseData = '';
    // response.setEncoding('utf8');     response.on('data', function (chunk) {
    //    responseData += chunk;     });     response.once('error', function (err) {
    //         // Some error handling here, e.g.:         res.serverError(err);
    // });     response.on('end', function () {         try {
    // console.log('SUCCESSss', responseData)             // response available as
    // `responseData` in `yourview`             return res.json({
    // "status": 200,                 "message": sails.__("Blog list"),
    //    "data": JSON.parse(responseData)             });         } catch (e) {
    //         sails.log.warn('Could not parse response from options.hostname: ' +
    // e);         }         res.view('yourview');     }); }).end()
  },

  getAllBlogList: async function (req, res) {
    var https = require('https');
    let {page, limit, data} = req.allParams();

    https.request('https://api.hubapi.com/content/api/v2/blog-posts?hapikey=e2032f87-8de8-4e18-8f16' +
        '-f4210e714245&offset=' + page * 9 + '&limit=9', function (response) {
      var responseData = '';
      response.setEncoding('utf8');

      response.on('data', function (chunk) {
        responseData += chunk;
      });

      response.once('error', function (err) {
        // Some error handling here, e.g.:
        res.serverError(err);
      });

      response.on('end', function () {
        try {
          let data = JSON.parse(responseData);
          for (let index = 0; index < data.objects.length; index++) {
            const element = data.objects[index];
            let blog_desc = h2p(element.post_body);
            data.objects[index]["short_desc"] = blog_desc.substring(0, 279) + "...";
          }
          return res.json({
            "status": 200,
            "message": sails.__("Blog list"),
            "data": data
          });
        } catch (e) {
          sails
            .log
            .warn('Could not parse response from options.hostname: ' + e);
        }

        res.view('yourview');
      });
    }).end()

    // req.setLocale('en') let { page, limit, data } = req.allParams(); if (data) {
    //    data = data.toLowerCase();     let blogData = await Blogs.find({
    // where: {             deleted_at: null,             or: [{
    // search_keywords: { contains: data }             }]         }     }).sort("id
    // ASC").paginate(page - 1, parseInt(limit));     let BlogCount = await
    // Blogs.count({         where: {             deleted_at: null,             or:
    // [{                 search_keywords: { contains: data }             }]
    // }     });     let featuredBlog = {}; let featuredBlogArray = await
    // Blogs.find({ is_featured: true, deleted_at: null }); if (page == 1 &&
    // featuredBlogArray.length > 0) {     featuredBlog = featuredBlogArray[0];
    // let admin = await Admin.findOne({ id: featuredBlog.admin_id });
    // featuredBlog.admin_name = admin.name }     if (blogData) {         return
    // res.json({             "status": 200,             "message": sails.__("Blog
    // list"),             "data": blogData, BlogCount, featuredBlog         });
    // } } else {     let blogData = await Blogs.find({         deleted_at: null
    // }).sort("id ASC").paginate(page - 1, parseInt(limit));     for (let index =
    // 0; index < blogData.length; index++) {         if (blogData[index].admin_id)
    // {             let admin = await Admin.findOne({ id: blogData[index].admin_id
    // })             blogData[index].admin_name = admin.name         }         let
    // BlogCommentCount = await BlogComment.count({             where: {
    //     deleted_at: null,                 blog: blogData[index].id             }
    //        });         blogData[index].comment_count = BlogCommentCount;     }
    //  let BlogCount = await Blogs.count({         where: {             deleted_at:
    // null,         }     });     let featuredBlog = {};     let featuredBlogArray
    // = await Blogs.find({ is_featured: true, deleted_at: null });     if (page ==
    // 1 && featuredBlogArray.length > 0) {         featuredBlog =
    // featuredBlogArray[0];         let admin = await Admin.findOne({ id:
    // featuredBlog.admin_id });         featuredBlog.admin_name = admin.name     }
    //    if (blogData) {         return res.json({             "status": 200,
    //       "message": sails.__("Blog list"),             "data": blogData,
    // BlogCount, featuredBlog         });     } }
  },

  getBlogDetails: async function (req, res) {
    var request = require('request');
    // let blog = await Blogs.findOne({ id: req.body.id, deleted_at: null }); if
    // (blog) {     let adminData = await Admin.findOne({ id: blog.admin_id });
    // blog.admin_name = adminData.name;     let BlogCommentCount = await
    // BlogComment.count({         where: {             deleted_at: null,
    //  blog: blog.id         }     });     blog.comment_count = BlogCommentCount;
    //   return res.json({         "status": 200, "message": sails.__('Blog
    // Details'), data: blog     }) } else {     return res.status(400).json({
    //   "status": 400,         "err": "Blog not found",     }); }
    request('https://api.hubapi.com/content/api/v2/blog-posts/' + req.body.id + '?hapikey=e2032f87-8de8-4e18-8f16-f4210e714245', function (error, response, body) {
      if (response) {
        return res.json({
          "status": 200,
          "message": sails.__('Blog Details'),
          data: response
        })
      } else {
        return res
          .status(400)
          .json({"status": 400, "err": "Blog not found"});
      }
    });
  },

  addComment: async function (req, res) {
    try {
      let user_id = req.user.id;
      let {blog_id, comment} = req.body;
      let addedComment = await BlogComment
        .create({user: user_id, blog: blog_id, comment: comment})
        .fetch();
      res.json({
        "status": 200,
        "message": sails.__('Create Comment')
      });
    } catch (error) {
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  },

  getComment: async function (req, res) {
    try {
      let {blog_id} = req.body;
      let {page, limit} = req.allParams();
      let comments = await BlogComment
        .find({blog: blog_id, deleted_at: null})
        .sort('created_at DESC')
        .paginate(page - 1, parseInt(limit));

      for (let index = 0; index < comments.length; index++) {
        let element = comments[index];
        let blahuser = await Users.findOne({
          select: [
            'first_name', 'last_name', 'profile_pic'
          ],
          where: {
            id: element.user
          }
        });
        element["userDetails"] = blahuser;
        comments[index] = element;
      }

      let BlogCommentCount = await BlogComment.count({
        where: {
          deleted_at: null,
          blog: blog_id
        }
      });
      if (comments) {
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
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  },

  getRelatedPost: async function (req, res) {
    try {
      let {blog_id} = req.body;
      let blog = await Blogs.findOne({id: blog_id, deleted_at: null});
      if (!blog) {
        return res
          .status(400)
          .json({"status": 400, "err": "Blog not found"});
      }
      let tags = blog.tags != undefined
        ? blog
          .tags
          .split(",")
        : '';
      let conditionArray = [];
      for (let index = 0; index < tags.length; index++) {
        let temp = {};
        temp = {
          tags: {
            contains: tags[index]
          }
        }
        conditionArray.push(temp)
      }

      let relatedPosts = await Blogs.find({
        id: {
          '!=': blog_id
        },
          deleted_at: null,
          or: conditionArray
        })
        .sort('created_at DESC')
        .limit(3);
      for (let index = 0; index < relatedPosts.length; index++) {
        if (relatedPosts[index].admin_id) {
          let admin = await Admin.findOne({id: relatedPosts[index].admin_id})
          relatedPosts[index].admin_name = admin.name
        }
      }
      if (relatedPosts) {
        return res.json({
          "status": 200,
          "message": sails.__("Blog list"),
          "data": {
            blogs: relatedPosts
          }
        });
      }
    } catch (error) {
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  },
  //-------------------------------CMS Api--------------------------
  getAllBlogs: async function (req, res) {
    // req.setLocale('en')
    let {page, limit, data} = req.allParams();
    if (data) {
      data = data.toLowerCase();
      let blogData = await Blogs
        .find({
        where: {
          deleted_at: null,
          or: [
            {
              search_keywords: {
                contains: data
              }
            }
          ]
        }
      })
        .sort("id ASC")
        .paginate(page - 1, parseInt(limit));

      let BlogCount = await Blogs.count({
        where: {
          deleted_at: null,
          or: [
            {
              search_keywords: {
                contains: data
              }
            }
          ]
        }
      });
      if (blogData) {
        return res.json({
          "status": 200,
          "message": sails.__("Blog list"),
          "data": blogData,
          BlogCount
        });
      }
    } else {
      let allAdmins = await Admin.find({is_active: true, deleted_at: null});

      let blogData = await Blogs
        .find({deleted_at: null})
        .sort("id ASC")
        .paginate(page - 1, parseInt(limit));

      for (let index = 0; index < blogData.length; index++) {
        if (blogData[index].admin_id) {
          let admin = await Admin.findOne({id: blogData[index].admin_id})
          blogData[index].admin_name = admin.name
        }
      }

      let BlogCount = await Blogs.count({
        where: {
          deleted_at: null
        }
      });
      if (blogData) {
        return res.json({
          "status": 200,
          "message": sails.__("Blog list"),
          "data": blogData,
          BlogCount,
          allAdmins
        });
      }
    }
  },

  createBlog: async function (req, res) {
    req
      .file('cover_image')
      .upload(async function (err, uploadedFiles) {
        try {
          if (uploadedFiles.length > 0) {
            let filename = uploadedFiles[0].filename;
            var name = filename.substring(filename.indexOf("."));
            let timestamp = new Date()
              .getTime()
              .toString();
            var uploadFileName = timestamp + name;
            var uploadCover = await UploadFiles.upload(uploadedFiles[0].fd, 'blog/' + uploadFileName);

            if (req.body.title && req.body.description && uploadCover) {
              var blog_detail = await Blogs.create({
                title: req.body.title,
                admin_id: req.body.author,
                tags: req
                  .body
                  .tags
                  .toLowerCase(),
                description: req.body.description,
                created_at: new Date(),
                search_keywords: req
                  .body
                  .title
                  .toLowerCase(),
                cover_image: 'blog/' + uploadFileName
              }).fetch();

              if (blog_detail) {
                res.json({
                  "status": 200,
                  "message": sails.__('Create Blog')
                });
                return;
              } else {
                res
                  .status(400)
                  .json({"status": 400, "error": "Something went wrong"});
                return;
              }
            } else {
              res
                .status(400)
                .json({"status": 400, "err": "blog title or description or image is not sent"});
              return;
            }
          } else {
            res
              .status(400)
              .json({"status": 400, "err": "blog title or description or image is not sent"});
            return;
          }
        } catch (e) {
          return res
            .status(500)
            .json({
              status: 500,
              "err": sails.__("Something Wrong")
            });
        }
      });
  },

  updateBlog: async function (req, res) {
    try {
      if (req.body.id) {
        const blog_details = await Blogs.findOne({id: req.body.id});
        if (!blog_details) {
          return res
            .status(401)
            .json({err: 'Invalid blog'});
        }
        if (req.body.tags) {
          req.body.tags = req
            .body
            .tags
            .toLowerCase();
        }
        req
          .file('cover_image')
          .upload(async function (err, uploadedFiles) {
            try {
              if (uploadedFiles.length > 0) {
                let filename = uploadedFiles[0].filename;
                var name = filename.substring(filename.indexOf("."));
                let timestamp = new Date()
                  .getTime()
                  .toString();
                var uploadFileName = timestamp + name;
                var uploadCover = await UploadFiles.upload(uploadedFiles[0].fd, 'blog/' + uploadFileName);
                if (uploadCover) {
                  delete req.body.cover_image;
                  req.body.cover_image = 'blog/' + uploadFileName;

                  var updatedBlog = await Blogs
                    .update({id: req.body.id})
                    .set(req.body)
                    .fetch();
                  return res.json({
                    "status": 200,
                    "message": sails.__("Update Blog")
                  });
                }
              } else {
                // if (blog_details.cover_image == 'true') {     delete
                // blog_details.cover_image;     await Blogs.update({ id: req.body.id
                // }).set(req.body).fetch(); }
                var updatedBlog = await Blogs
                  .update({id: req.body.id})
                  .set(req.body)
                  .fetch();

                return res.json({
                  "status": 200,
                  "message": sails.__("Update Blog")
                });
              }
            } catch (e) {
              return res
                .status(500)
                .json({
                  status: 500,
                  "err": sails.__("Something Wrong")
                });
            }
          });
      } else {
        return res
          .status(400)
          .json({'status': 400, 'message': 'blog id is not sent.'})
      }
    } catch (error) {
      res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
      return;
    }
  },

  deleteBlog: async function (req, res) {
    let {id} = req.allParams();
    if (!id) {
      res
        .status(500)
        .json({"status": 500, "err": "Blog id is not sent"});
      return;
    }
    let blogData = await Blogs
      .update({id: id})
      .set({deleted_at: new Date()})
      .fetch();
    if (blogData) {
      return res
        .status(200)
        .json({
          "status": 200,
          "message": sails.__('Delete Blog')
        });
    }
  },

  getAllNews: async function (req, res) {
    // req.setLocale('en')
    let {page, limit, data} = req.allParams();
    if (data && data.trim() != "") {
      let newsData = await News
        .find({
        where: {
          deleted_at: null,
          is_active: true,
          or: [
            {
              search_keywords: {
                contains: data
              }
            }
          ]
        }
      })
        .sort("posted_at DESC")
        .paginate(page - 1, parseInt(limit));

      let NewsCount = await News.count({
        where: {
          deleted_at: null,
          is_active: true,
          or: [
            {
              search_keywords: {
                contains: data
              }
            }
          ]
        }
      });
      if (newsData) {
        return res.json({
          "status": 200,
          "message": sails.__("News list"),
          "data": newsData,
          NewsCount
        });
      }
    } else {
      let newsData = await News
        .find({deleted_at: null, is_active: true})
        .sort("posted_at DESC")
        .paginate(page - 1, parseInt(limit));

      let NewsCount = await News.count({
        where: {
          deleted_at: null,
          is_active: true
        }
      });
      return res.json({
        "status": 200,
        "message": sails.__("News list"),
        "data": newsData,
        NewsCount
      });
    }
  },
  setFeaturedBlog: async function (req, res) {
    try {
      await Blogs
        .update({is_featured: true})
        .set({is_featured: false});
      await Blogs
        .update({id: req.body.blog_id})
        .set({is_featured: true});
      return res.json({
        "status": 200,
        "message": sails.__("Featured Blog Changed")
      });
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
