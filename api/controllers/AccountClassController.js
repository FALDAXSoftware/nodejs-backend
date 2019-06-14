/**
 * AccountClassController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
var speakeasy = require('speakeasy');

module.exports = {
    /**
      * API for getting activity data
      * Renders this api when user activity data needs to be fecthed
      *
      * @param <>
      *
      * @return <User acticity data>
     */
    // CMS all class api
    getAllAccountClasses: async function(req, res) {
        try {
            let allClasses = await AccountClass.find({ deleted_at: null }).sort('id ASC');

            return res.json({
                "status": 200,
                "message": sails.__("Account Class Data"),
                allClasses
            });
        } catch (e) {
            return res
                .status(500)
                .json({
                    status: 500,
                    "err": sails.__("Something Wrong")
                });
        }
    },

    addAccountClass: async function(req, res) {
        let params = req.body.class_name;
        try {
            let accountClass = await AccountClass
                .create({ class_name: params })
                .fetch();
            if (!accountClass) {
                return res
                    .status(500)
                    .json({
                        status: 500,
                        err: sails.__("Something Wrong")
                    });
            }
            return res.json({
                status: 200,
                message: sails.__("Class added success")
            })
        } catch (error) {
            return res
                .status(500)
                .json({
                    status: 500,
                    err: sails.__("Something Wrong")
                })
        }
    },

    updateAccountClass: async function(req, res) {
        let { id, class_name } = req.body;
        try {
            let accountClass = await AccountClass.findOne({ id, deleted_at: null });
            if (accountClass) {
                var updatedClass = await AccountClass
                    .update({ id })
                    .set({ class_name })
                    .fetch();
                return res.json({
                    status: 200,
                    message: sails.__("Class Update Success")
                })
            } else {
                return res
                    .status(500)
                    .json({
                        status: 500,
                        err: sails.__("Something Wrong")
                    });
            }
        } catch (error) {
            return res
                .status(500)
                .json({
                    status: 500,
                    err: sails.__("Something Wrong")
                })
        }
    },

    deleteAccountClass: async function(req, res) {
        try {
            let { class_id, otp, admin_id } = req.allParams();

            let user = await Admin.findOne({ id: admin_id, is_active: true, deleted_at: null });
            if (!user) {
                return res
                    .status(401)
                    .json({
                        "status": 401,
                        "message": sails.__("user inactive")
                    });
            }

            let verified = speakeasy
                .totp
                .verify({ secret: user.twofactor_secret, encoding: "base32", token: otp });
            if (verified) {
                if (!class_id) {
                    return res
                        .status(500)
                        .json({
                            "status": 500,
                            "message": sails.__("Class id is not sent")
                        });
                }
                let classData = await AccountClass
                    .update({ id: class_id })
                    .set({ deleted_at: new Date() })
                    .fetch();
                if (classData) {
                    return res
                        .status(200)
                        .json({
                            "status": 200,
                            "message": sails.__("Class deleted success")
                        });
                }
            } else {
                return res
                    .status(500)
                    .json({
                        "status": 500,
                        "message": "OTP is wrong!!"
                    });
            }
        } catch (err) {
            return res
                .status(500)
                .json({
                    status: 500,
                    err: sails.__("Something Wrong")
                })
        }
    }
};
