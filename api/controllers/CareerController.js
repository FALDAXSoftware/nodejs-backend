/**
 * CareerController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
var UploadFiles = require('../services/UploadFiles');

module.exports = {
  applyJob: async function (req, res) {

    let jobDetail = await Jobs.findOne({ id: req.body.job_id });
    if (jobDetail) {
      req
        .file('resume')
        .upload(async function (err, uploadedDoc) {
          try {
            if (uploadedDoc.length > 0) {
              let filename = uploadedDoc[0].filename;
              var name = filename.substring(filename.indexOf("."));
              let timestamp = new Date()
                .getTime()
                .toString();
              var uploadFileName = timestamp + name;
              var uploadResume = await UploadFiles.upload(uploadedDoc[0].fd, 'career/' + uploadFileName);

              if (uploadResume) {
                req
                  .file('cover_letter')
                  .upload(async function (err, uploadedLetter) {
                    try {
                      var cover_letter = null;
                      if (uploadedLetter && uploadedLetter.length > 0) {
                        let cover_file = uploadedLetter[0].filename;
                        var name = cover_file.substring(cover_file.indexOf("."));
                        let timestamp = new Date()
                          .getTime()
                          .toString();
                        var uploadCoverName = timestamp + name;
                        cover_letter = await UploadFiles.upload(uploadedLetter[0].fd, 'career/' + uploadCoverName);
                      }

                      var uploadLetter = cover_letter;

                      let jobDetails = await Career.create({
                        first_name: req.body.first_name,
                        last_name: req.body.last_name,
                        email: req.body.email,
                        position: req.body.position,
                        phone_number: req.body.phone_number,
                        website_url: req.body.website_url,
                        linkedin_profile: req.body.linkedin_profile,
                        resume: 'career/' + uploadFileName,
                        job_id: jobDetail.id,
                        cover_letter: (uploadLetter !== null
                          ? ('career/' + uploadLetter)
                          : null),
                        created_at: new Date()
                      }).fetch();
                      if (jobDetails) {
                        return res.json({
                          status: 200,
                          message: sails.__("job applied success")
                        })
                      } else {
                        return res
                          .status(500)
                          .json({
                            status: 500,
                            "err": sails.__("Something Wrong")
                          });
                      }
                    } catch (e) {
                      throw e;
                    }
                  })
              }
            } else {
              return res.json({
                "status": 400,
                "message": sails.__("Resume is not present.")
              });
            }
          } catch (e) {
            throw e;
          }
        });
    } else {
      return res.json({
        "status": 400,
        "message": sails.__("Job id is not valid.")
      });
    }
  },

  getAllJobs: async function (req, res) {
    let allJobCategories = await JobCategory
      .find({ deleted_at: null })
      .populate('jobs', {
        where: {
          is_active: true,
          deleted_at: null
        }
      });
    let careerDesc = await Statics.findOne({ slug: 'career' });
    if (allJobCategories) {
      return res.json({
        "status": 200,
        "message": sails.__("All jobs retrived success"),
        "data": allJobCategories,
        careerDesc
      });
    } else {
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  },

  getAllJobCategories: async function (req, res) {
    let allJobCategories = await JobCategory.find({ deleted_at: null }).sort('id ASC');
    if (allJobCategories) {
      return res.json({
        "status": 200,
        "message": sails.__("All job categories retrived success"),
        "data": allJobCategories
      });
    } else {
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  },

  getAllJobsCMS: async function (req, res) {
    try {
      let { page, limit, data, sortCol, sortOrder } = req.allParams();
      let query = " from jobs LEFT JOIN job_category ON jobs.category_id = job_category.id WHERE jobs.deleted_at IS NULL ";
      if ((data && data != "")) {
        if (data && data != "" && data != null) {
          query = query + " AND (LOWER(position) LIKE '%" + data.toLowerCase() + "%' OR LOWER(location) LIKE '%" + data.toLowerCase() + "%')";
        }
      }
      countQuery = query;
      if (sortCol && sortOrder) {
        let sortVal = (sortOrder == 'descend'
          ? 'DESC'
          : 'ASC');
        query += " ORDER BY " + sortCol + " " + sortVal;
      } else {
        query += " ORDER BY jobs.id ASC";
      }
      query += " limit " + limit + " offset " + (parseInt(limit) * (parseInt(page) - 1));
      let allJobs = await sails.sendNativeQuery("Select *" + query, [])

      allJobs = allJobs.rows;

      let allJobsCount = await sails.sendNativeQuery("Select COUNT(jobs.id)" + countQuery, [])
      allJobsCount = allJobsCount.rows[0].count;
      if (allJobs) {
        return res.json({
          "status": 200,
          "message": sails.__("All jobs retrived success"),
          "data": allJobs,
          allJobsCount
        });
      }
    } catch (err) {
      console.log('err', err)
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  },

  getJobDetail: async function (req, res) {
    try {
      let { id } = req.allParams();
      let jobDetail = await Jobs.findOne({ id });
      if (jobDetail) {
        return res.json({
          "status": 200,
          "message": sails.__("Job details retrived success"),
          "data": jobDetail
        });
      } else {
        return res
          .status(400)
          .json({
            status: 400,
            "err": sails.__("Job does not exists")
          });
      }
    } catch (err) {
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  },

  addJob: async function (req, res) {
    let addedJob = await Jobs
      .create({ position: req.body.position, short_desc: req.body.short_desc, job_desc: req.body.job_desc, location: req.body.location, category: req.body.category })
      .fetch();
    if (addedJob) {
      return res.json({
        "status": 200,
        "message": sails.__("Job added success")
      });
    } else {
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  },

  editJob: async function (req, res) {
    let job = await Jobs.findOne({ id: req.body.job_id })
    if (job) {
      let updatedJob = await Jobs
        .update({ id: req.body.job_id })
        .set(req.body)
        .fetch();
      if (updatedJob) {
        return res.json({
          "status": 200,
          "message": sails.__("Job updated success")
        });
      } else {
        return res
          .status(500)
          .json({
            status: 500,
            "err": sails.__("Something Wrong")
          });
      }
    } else {
      return res
        .status(400)
        .json({
          status: 400,
          "err": sails.__("Job not found")
        });
    }
  },

  deleteJob: async function (req, res) {
    try {
      let { job_id } = req.allParams();
      if (!job_id) {
        return res
          .status(500)
          .json({
            "status": 500,
            "err": sails.__("Job id is not sent")
          });
      }
      let deletedJob = await Jobs
        .update({ id: job_id })
        .set({ deleted_at: new Date() })
        .fetch();
      if (deletedJob) {
        return res.json({
          "status": 200,
          "message": sails.__("Job removed success")
        });
      } else {
        return res
          .status(500)
          .json({
            status: 500,
            "err": sails.__("Something Wrong")
          });
      }
    } catch (err) {
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  },

  getJobApplications: async function (req, res) {
    try {
      let {
        page,
        limit,
        data,
        sort_col,
        sort_order,
        job_id
      } = req.allParams();
      let query = " from job_applications WHERE deleted_at IS NULL AND job_id=" + job_id;
      if ((data && data != "")) {
        if (data && data != "" && data != null) {
          query = query + " AND LOWER(first_name) LIKE '%" + data.toLowerCase() + "%' OR LOWER(last_name) LIKE '%" + data.toLowerCase() + "%' OR LOWER(email) LIKE '%" + data.toLowerCase() + "%' OR LOWER(location) LIKE '%" + data.toLowerCase() + "%' OR LOWER(linkedin_profile) LIKE '%" + data.toLowerCase() + "%' OR LOWER(website_url) LIKE '%" + data.toLowerCase() + "%'";
          if (!isNaN(data)) {
            query = query + " OR phone_number=" + data;
          }
        }
      }
      countQuery = query;
      if (sort_col && sort_order) {
        let sortVal = (sort_order == 'descend'
          ? 'DESC'
          : 'ASC');
        query += " ORDER BY " + sort_col + " " + sortVal;
      }
      query += " limit " + limit + " offset " + (parseInt(limit) * (parseInt(page) - 1));

      let applications = await sails.sendNativeQuery("Select *" + query, [])

      applications = applications.rows;

      let applicationCount = await sails.sendNativeQuery("Select COUNT(id)" + countQuery, [])
      applicationCount = applicationCount.rows[0].count;
      if (applications) {
        return res.json({
          "status": 200,
          "message": sails.__("All jobs retrived success"),
          "data": applications,
          applicationCount
        });
      }
    } catch (err) {
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  },

  addJobCategory: async function (req, res) {
    try {

      if (req.body) {
        req.body.is_active = true;
        var addCategoryData = await JobCategory
          .create(req.body)
          .fetch();

        if (addCategoryData) {
          return res.json({
            "status": 200,
            "message": sails.__("Job Category added success"),
            "data": addCategoryData
          });
        } else {
          return res
            .status(500)
            .json({
              status: 500,
              "err": sails.__("Something Wrong")
            });
        }
      } else {
        return res
          .status(500)
          .json({
            status: 500,
            "err": sails.__("Something Wrong")
          });
      }
    } catch (err) {
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  },

  updateJobCategory: async function (req, res) {
    try {
      var { id, is_active, category } = req.body;

      var updatedJobData = await JobCategory
        .update({ id })
        .set({ is_active, category })
        .fetch();

      if (updatedJobData) {
        return res.json({
          "status": 200,
          "message": sails.__("Job Category updated success"),
          "data": updatedJobData
        });
      } else {
        return res
          .status(500)
          .json({
            status: 500,
            "err": sails.__("Something Wrong")
          });
      }
    } catch (err) {
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  }
};
