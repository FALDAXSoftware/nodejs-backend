/**
 * CareerController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
var UploadFiles = require('../services/UploadFiles');

module.exports = {
    applyJob: async function (req, res) {
        console.log("body", req.body);
        console.log("file", req.file);

        let jobDetail = await Jobs.findOne({ id: req.body.job_id });
        if (jobDetail) {
            req.file('resume').upload(async function (err, uploadedDoc) {
                try {
                    if (uploadedDoc.length > 0) {
                        let filename = uploadedDoc[0].filename;
                        var name = filename.substring(filename.indexOf("."));
                        let timestamp = new Date()
                            .getTime()
                            .toString();
                        var uploadFileName = timestamp + name;
                        var uploadResume = await UploadFiles.upload(uploadedDoc[0].fd, 'faldax', '/career/' + uploadFileName);

                        if (uploadResume) {
                            req.file('cover_letter').upload(async function (err, uploadedLetter) {
                                try {
                                    var cover_letter = null;
                                    if (uploadedLetter && uploadedLetter.length > 0) {
                                        let cover_file = uploadedLetter[0].filename;
                                        var name = cover_file.substring(cover_file.indexOf("."));
                                        let timestamp = new Date()
                                            .getTime()
                                            .toString();
                                        var uploadCoverName = timestamp + name;
                                        cover_letter = await UploadFiles.upload(uploadedLetter[0].fd, 'faldax', '/career/' + uploadCoverName);
                                    }

                                    var uploadLetter = cover_letter;
                                    console.log(uploadLetter);

                                    let jobDetails = await Career.create({
                                        first_name: req.body.first_name,
                                        last_name: req.body.last_name,
                                        email: req.body.email,
                                        position: req.body.position,
                                        phone_number: req.body.phone_number,
                                        website_url: req.body.website_url,
                                        linkedin_profile: req.body.linkedin_profile,
                                        resume: 'faldax/career/' + uploadFileName,
                                        job_id: jobDetail.id,
                                        cover_letter: (uploadLetter !== null ? ('faldax/career/' + uploadLetter) : null),
                                        created_at: new Date()
                                    }).fetch();
                                    if (jobDetails) {
                                        return res.json({
                                            status: 200,
                                            message: "job applied successfully.",
                                        })
                                    } else {
                                        return res.status(500).json({
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
                            "message": "Resume is not present.",
                        });
                    }
                } catch (e) {
                    throw e;
                }
            });
        } else {
            return res.json({
                "status": 400,
                "message": "Job id is not valid.",
            });
        }
    },

    getAllJobs: async function (req, res) {
        let allJobCategories = await JobCategory.find({ deleted_at: null }).populate('jobs', {
            where: {
                is_active: true,
                deleted_at: null
            }
        });
        let careerDesc = await Statics.findOne({ slug: 'career' });
        if (allJobCategories) {
            return res.json({
                "status": 200,
                "message": "All jobs retrived successfully",
                "data": allJobCategories, careerDesc
            });
        } else {
            return res.status(500).json({
                status: 500,
                "err": sails.__("Something Wrong")
            });
        }
    },

    getAllJobCategories: async function (req, res) {
        let allJobCategories = await JobCategory.find({ deleted_at: null });
        if (allJobCategories) {
            return res.json({
                "status": 200,
                "message": "All job categories retrived successfully",
                "data": allJobCategories
            });
        } else {
            return res.status(500).json({
                status: 500,
                "err": sails.__("Something Wrong")
            });
        }
    },

    getAllJobsCMS: async function (req, res) {
        let { page, limit } = req.allParams();
        let allJobs = await Jobs.find({ deleted_at: null }).paginate(page - 1, parseInt(limit));
        let allJobsCount = await Jobs.count({ deleted_at: null });
        let careerDesc = await Statics.findOne({ slug: 'career' });
        if (allJobs) {
            return res.json({
                "status": 200,
                "message": "All jobs retrived successfully",
                "data": allJobs, careerDesc, allJobsCount
            });
        } else {
            return res.status(500).json({
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
                    "message": "Job details retrived successfully",
                    "data": jobDetail
                });
            } else {
                return res.status(400).json({
                    status: 400,
                    "err": "Job does not exists"
                });
            }
        } catch (err) {
            return res.status(500).json({
                status: 500,
                "err": sails.__("Something Wrong")
            });
        }
    },

    addJob: async function (req, res) {
        let addedJob = await Jobs.create({
            position: req.body.position,
            short_desc: req.body.short_desc,
            job_desc: req.body.job_desc,
            location: req.body.location,
            category: req.body.category
        }).fetch();
        if (addedJob) {
            return res.json({
                "status": 200,
                "message": "Job added successfully",
            });
        } else {
            return res.status(500).json({
                status: 500,
                "err": sails.__("Something Wrong")
            });
        }
    },

    editJob: async function (req, res) {
        let job = await Jobs.findOne({ id: req.body.job_id })
        if (job) {
            let updatedJob = await Jobs.update({ id: req.body.job_id }).set(req.body).fetch();
            if (updatedJob) {
                return res.json({
                    "status": 200,
                    "message": "Job updated successfully",
                });
            } else {
                return res.status(500).json({
                    status: 500,
                    "err": sails.__("Something Wrong")
                });
            }
        } else {
            return res.status(400).json({
                status: 400,
                "err": "Job not found"
            });
        }
    },

    deleteJob: async function (req, res) {
        try {
            let { job_id } = req.allParams();
            if (!job_id) {
                res.status(500).json({
                    "status": 500,
                    "err": "Job id is not sent"
                });
                return;
            }
            let deletedJob = await Jobs.update({ id: job_id }).set({ deleted_at: new Date() }).fetch();
            if (deletedJob) {
                return res.json({
                    "status": 200,
                    "message": "Job removed successfully",
                });
            } else {
                return res.status(500).json({
                    status: 500,
                    "err": sails.__("Something Wrong")
                });
            }
        } catch (err) {
            return res.status(500).json({
                status: 500,
                "err": sails.__("Something Wrong")
            });
        }
    },
    getJobApplications: async function (req, res) {
        try {
            let { page, limit, job_id } = req.allParams();
            let applications = await Career.find({ job_id: job_id }).paginate(page - 1, parseInt(limit));
            let applicationCount = await Career.count({ job_id: job_id })
            return res.json({
                "status": 200,
                "message": "All job applications retrived successfully",
                "data": applications, applicationCount
            });

        } catch (error) {
            return res.status(500).json({
                status: 500,
                "err": sails.__("Something Wrong")
            });
        }
    }
};
