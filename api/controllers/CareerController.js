/**
 * CareerController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
var UploadFiles = require('../services/UploadFiles');

module.exports = {
    applyJob: async function (req, res) {
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
                                let jobDetails = await Career.create({
                                    first_name: req.body.first_name,
                                    last_name: req.body.last_name,
                                    email: req.body.email,
                                    position: req.body.position,
                                    phone_number: req.body.phone_number,
                                    website_url: req.body.website_url,
                                    linkedin_profile: req.body.linkedin_profile,
                                    resume: 'faldax/career/' + uploadFileName,
                                    cover_letter: uploadLetter !== null && 'faldax/career/' + uploadLetter,
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
    },

    getAllJobs: async function (req, res) {
        let { page, limit } = req.allParams();
        let allJobs = await Jobs.find().paginate(page - 1, parseInt(limit));
        if (allJobs) {
            return res.json({
                "status": 200,
                "message": "All jobs retrived successfully",
                "data": allJobs
            });
        } else {
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
            location: req.body.location
        }).fetch();
        console.log('>>>>addedJob', addedJob);
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
};

