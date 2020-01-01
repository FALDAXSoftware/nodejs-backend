/**
 * BlogsController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 * @routes      ::
 * get /users/get-all-blogs
 * post /users/get-blog-detail
 * post /get-comments
 * post /get-related-blog
 * post /users/get-all-news
 * post /create-comments
 */
var request = require('request');
var h2p = require('html2plaintext')
var logger = require("./logger");
module.exports = {
  //---------------------------Web Api------------------------------

  CreateComment: async function (req, res) {
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
    })
  },

  getAllBlogList: async function (req, res) {
    var https = require('https');
    let {
      page,
      limit,
      data
    } = req.allParams();

    https.request('https://api.hubapi.com/content/api/v2/blog-posts?hapikey=e2032f87-8de8-4e18-8f16' +
      '-f4210e714245&offset=' + page * 9 + '&limit=9',
      function (response) {
        var responseData = '';
        response.setEncoding('utf8');

        response.on('data', function (chunk) {
          responseData += chunk;
        });

        response.once('error', function (err) {
          // Some error handling here, e.g.:
          res.serverError(err);
        });

        response.on('end', async function () {
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
            await logger.error(e.message)
            sails
              .log
              .warn('Could not parse response from options.hostname: ' + e);
          }

          res.view('yourview');
        });
      }).end()
  },

  getBlogDetails: async function (req, res) {
    var request = require('request');
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
          .json({
            "status": 400,
            "err": sails.__("Blog not found")
          });
      }
    });
  },

  getComment: async function (req, res) {
    try {
      let {
        blog_id
      } = req.body;
      let {
        page,
        limit
      } = req.allParams();
      let comments = await BlogComment
        .find({
          blog: blog_id,
          deleted_at: null
        })
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
      // await logger.error(error.message)
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong"),
          error_at:error.stack
        });
    }
  },

  getRelatedPost: async function (req, res) {
    try {
      let {
        blog_id
      } = req.body;
      let blog = await Blogs.findOne({
        id: blog_id,
        deleted_at: null
      });
      if (!blog) {
        return res
          .status(400)
          .json({
            "status": 400,
            "err": sails.__("Blog not found")
          });
      }
      let tags = blog.tags != undefined ?
        blog
        .tags
        .split(",") :
        '';
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
          let admin = await Admin.findOne({
            id: relatedPosts[index].admin_id
          })
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
      // await logger.error(error.message)
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong"),
          error_at:error.stack
        });
    }
  },
  //-------------------------------CMS Api--------------------------
  getAllNews: async function (req, res) {
    // req.setLocale('en')
    let {
      page,
      limit,
      data
    } = req.allParams();

    var newsSources = await NewsSource.find({
      is_active: true
    })
    var allNewsSouceIds = [];
    for (let index = 0; index < newsSources.length; index++) {
      const element = newsSources[index];
      allNewsSouceIds.push(element.id);
    }

    if (data && data.trim() != "") {
      let newsData = await News
        .find({
          where: {
            deleted_at: null,
            is_active: true,
            owner_id: {
              in: allNewsSouceIds
            },
            or: [{
              search_keywords: {
                contains: data
              }
            }]
          }
        })
        .sort("posted_at DESC")
        .paginate(page - 1, parseInt(limit));

      let NewsCount = await News.count({
        where: {
          deleted_at: null,
          is_active: true,
          owner_id: {
            in: allNewsSouceIds
          },
          or: [{
            search_keywords: {
              contains: data
            }
          }]
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
        .find({
          deleted_at: null,
          is_active: true,
          owner_id: {
            in: allNewsSouceIds
          },
        })
        .sort("posted_at DESC")
        .paginate(page - 1, parseInt(limit));

      let NewsCount = await News.count({
        where: {
          deleted_at: null,
          is_active: true,
          owner_id: {
            in: allNewsSouceIds
          },
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
};
