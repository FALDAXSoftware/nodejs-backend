/**
 * UserController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
var uuidv1 = require('uuid/v1');
var UploadFiles = require('../services/UploadFiles');
var bcrypt = require('bcrypt');
var fetch = require('node-fetch');
var randomize = require('randomatic');
var speakeasy = require('speakeasy');
var QRCode = require('qrcode');

module.exports = {

    //------------------Web APi------------------------------------------------//
    create: async function (req, res) {
        try {
            var user = req.body;
            var referred_id = null;
            let email = req.body.email.toLowerCase();
            existedUser = await Users.findOne({ email, deleted_at: null });
            if (existedUser) {
                return res.status(401).json({
                    status: 401,
                    err: 'Email address already exist'
                });
            }
            if (req.body.referral_code) {
                var referredUser = await Users.findOne({ referral_code: req.body.referral_code });
                if (!referredUser) {
                    return res.status(401).json({
                        status: 401,
                        err: 'Invalid refferal code'
                    });
                } else {
                    referred_id = referredUser.id;
                }
            }
            let email_verify_token = randomize('Aa0', 10);
            if (req.body.email && req.body.password) {
                var user_detail = await Users.create({
                    email: email,
                    password: req.body.password,
                    full_name: req.body.firstname + ' ' + req.body.lastname,
                    first_name: req.body.firstname,
                    last_name: req.body.lastname,
                    referral_code: randomize('Aa0', 10),
                    created_at: new Date(),
                    referred_id: referred_id,
                    email_verify_token: email_verify_token
                }).fetch();
                if (user_detail) {
                    sails.hooks.email.send(
                        "signup",
                        {
                            homelink: "http://18.191.87.133:8085",
                            recipientName: user_detail.first_name,
                            token: 'http://18.191.87.133:8085/login?token=' + email_verify_token,
                            senderName: "Faldax"
                        },
                        {
                            to: user_detail.email,
                            subject: "Signup Verification"
                        },
                        function (err) {
                            if (!err) {
                                return res.json({
                                    "status": "200",
                                    "message": "Verification link sent to email successfully"
                                });
                            }
                        }
                    )
                    //Send verification email in before create
                    // res.json({
                    //     "status": 200,
                    //     "message": "Sign up successfully."
                    // });
                    // return;
                } else {
                    res.status(401).json({
                        status: 401,
                        err: "Something went wrong",
                    });
                    return;
                }
            } else {
                res.status(401).json({
                    status: 401,
                    err: "email or password or phone_number is not sent",
                });
                return;
            }
        } catch (error) {
            res.status(500).json({
                status: 500,
                err: error
            });
            return;
        }
    },

    update: async function (req, res) {
        try {
            const user_details = await Users.findOne({ id: req.user.id });
            if (!user_details) {
                return res.status(401).json({ err: 'Invalid email' });
            }
            var user = req.body;
            delete user.profile;
            req.file('profile_pic').upload(async function (err, uploadedFiles) {
                try {
                    if (uploadedFiles.length > 0) {
                        let filename = uploadedFiles[0].filename;
                        var name = filename.substring(filename.indexOf("."));
                        let timestamp = new Date()
                            .getTime()
                            .toString();
                        var uploadFileName = timestamp + name;
                        var uploadProfile = await UploadFiles.upload(uploadedFiles[0].fd, 'faldax', '/profile/' + uploadFileName);
                        if (uploadProfile) {
                            user.profile_pic = 'faldax/profile/' + uploadFileName;

                            var updatedUsers = await Users.update({ email: req.body.email, deleted_at: null }).set(user).fetch();
                            delete updatedUsers.password
                            // sails.log(updatedUsers);
                            return res.json({
                                "status": "200",
                                "message": "User details updated successfully"
                            });
                        }
                    } else {
                        var updatedUsers = await Users.update({ email: req.body.email, deleted_at: null }).set(user);
                        return res.json({
                            "status": "200",
                            "message": "User details updated successfully"
                        });
                    }
                } catch (e) {
                    throw e;
                }
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

    changePassword: async function (req, res) {
        try {
            if (!req.body.current_password || !req.body.new_password || !req.body.confirm_password) {
                return res.status(401).json({
                    status: 401,
                    err: 'Please provide current password, new password, confirm password'
                });
            }
            if (req.body.new_password != req.body.confirm_password) {
                return res.status(401).json({
                    status: 401,
                    err: 'New and confirm password should match'
                });
            }
            if (req.body.current_password == req.body.new_password) {
                return res.status(401).json({
                    status: 401,
                    err: 'Current and new password should not be same.'
                });
            }

            const user_details = await Users.findOne({ id: req.user.id });
            if (!user_details) {
                return res.status(401).json({
                    status: 401,
                    err: 'User not found'
                });
            }
            let compareCurrent = await bcrypt.compare(req.body.current_password, user_details.password);
            if (!compareCurrent) {
                return res.status(401).json({
                    status: 401,
                    err: "Current password mismatch"
                });
            }

            var updatedUsers = await Users.update({ id: req.user.id }).set({ email: user_details.email, password: req.body.new_password }).fetch();

            if (updatedUsers) {
                return res.json({
                    "status": "200",
                    "message": "Password changed successfully",
                });
            } else {
                return res.status(401).json({ err: 'Something went wrong! Could not able to update the password' });
            }
        } catch (error) {
            return res.status(500).json({
                "status": "500",
                "message": "error",
                "err": error
            });
        }
        return;
    },

    getUserReferral: async function (req, res) {
        let id = req.user.id;
        let usersData = await Users.find({ id: id });
        let userKyc = await KYC.findOne({ user_id: id });
        usersData[0].is_kyc_done = false;
        if (userKyc) {
            if (userKyc.steps == 3) {
                usersData[0].is_kyc_done = true;
            }
        }
        if (usersData) {
            return res.json({
                "status": "200",
                "message": "Users Data",
                "data": usersData
            });
        }
    },

    getReferred: async function (req, res) {
        let id = req.user.id;
        let usersData = await Users.find({ select: ['email'], where: { referred_id: id } });

        if (usersData) {
            return res.json({
                "status": "200",
                "message": "User referred Data",
                "data": usersData
            });
        }
    },

    // For Get Login History
    getLoginHistory: async function (req, res) {
        let history = await LoginHistory.find({
            user: req.user.id
        }).sort('created_at DESC').limit(10);
        return res.json({
            "status": "200",
            "message": "Users Login History",
            "data": history,
        });
    },

    setupTwoFactor: async function (req, res) {
        try {
            let user_id = req.user.id;
            let user = await Users.findOne({
                id: user_id,
                is_active: true,
                is_verified: true,
                deleted_at: null
            });
            if (!user) {
                return res.status(401).json({
                    err: "User not found or it's not active"
                });
            }
            const secret = speakeasy.generateSecret({ length: 10 });
            await Users.update({
                id: user.id
            }).set({
                "email": user.email,
                "twofactor_secret": secret.base32
            });
            let url = speakeasy.otpauthURL({ secret: secret.ascii, label: user.email });
            QRCode.toDataURL(url, function (err, data_url) {
                return res.json({
                    status: 200,
                    message: "Qr code sent",
                    tempSecret: secret.base32,
                    dataURL: data_url,
                    otpauthURL: secret.otpauth_url
                })
            });
        } catch (error) {
            return res.json({
                "status": "500",
                "message": "error",
                "errors": error
            });
        }
    },

    verifyTwoFactor: async function (req, res) {
        try {
            let user_id = req.user.id;
            let { otp } = req.allParams();
            let user = await Users.findOne({
                id: user_id,
                is_active: true,
                is_verified: true,
                deleted_at: null
            });
            if (!user) {
                return res.status(401).json({
                    err: "User not found or it's not active"
                });
            }
            if (user.is_twofactor == true) {
                return res.status(401).json({
                    err: "Two factor authentication is already enabled"
                });
            }

            let verified = speakeasy.totp.verify({
                secret: user.twofactor_secret,
                encoding: "base32",
                token: otp,
                window: 2
            });
            if (verified) {
                await Users.update({ id: user.id }).set({
                    email: user.email,
                    is_twofactor: true,
                });
                return res.json({
                    status: "200",
                    message: "Two factor authentication has been enabled"
                });
            }
            return res.status(401).json({ err: "Invalid OTP" });
        } catch (error) {
            return res.json({
                "status": "500",
                "message": "error",
                "errors": error
            });
        }
    },

    disableTwoFactor: async function (req, res) {
        try {
            let user_id = req.user.id;
            let user = await Users.findOne({
                id: user_id,
                is_active: true,
                is_verified: true,
                deleted_at: null
            });
            if (!user) {
                return res.status(401).json({
                    err: "User not found or it's not active"
                });
            }
            if (user.is_twofactor == false) {
                return res.status(401).json({
                    err: "Two factor authentication is already disabled"
                });
            }
            await Users.update({ id: user.id, deleted_at: null }).set({
                email: user.email,
                is_twofactor: false,
                twofactor_secret: null,
            });
            return res.json({
                status: "200",
                message: "Two factor authentication has been disabled"
            });
        } catch (error) {
            return res.json({
                "status": "500",
                "message": "error",
                "errors": error
            });
        }
    },

    deleteUser: async function (req, res) {
        let user_id = req.user.id;
        let userEmail = req.email;

        let user = await Users.findOne({
            id: user_id,
            email: userEmail,
            deleted_at: null
        });

        if (!user) {
            res.status(401).json({
                status: 401,
                err: sails.__("User not found")
            });
        }

        await Users.update({ id: user.id }).set({ email: user.email, deleted_at: new Date() });

        res.json({
            status: 200,
            message: sails.__("user_delete_success")
        });
    },
    //------------------CMS APi------------------------------------------------//


    getUserPaginate: async function (req, res) {
        let { page, limit, data } = req.allParams();
        if (data) {
            let usersData = await Users.find({
                where: {
                    is_verified: true,
                    or: [{
                        email: { contains: data }
                    },
                    { first_name: { contains: data } },
                    { last_name: { contains: data } }
                    ]
                }
            }).sort("id DESC").paginate(page, parseInt(limit));
            let userCount = await Users.count({
                where: {
                    is_verified: true,
                    or: [{
                        email: { contains: data }
                    },
                    { first_name: { contains: data } },
                    { last_name: { contains: data } }
                    ]
                }
            });
            if (usersData) {
                return res.json({
                    "status": "200",
                    "message": "Users list",
                    "data": usersData, userCount
                });
            }
        } else {
            let usersData = await Users.find({
                where: {
                    is_verified: true,
                }
            }).sort("id DESC").paginate(page, parseInt(limit));
            let userCount = await Users.count({
                is_verified: true,
            });
            if (usersData) {
                return res.json({
                    "status": "200",
                    "message": "Users list",
                    "data": usersData, userCount
                });
            }
        }
    },

    userActivate: async function (req, res) {
        let { user_id, email, is_active } = req.body;

        let usersData = await Users.update({ id: user_id }).set({ email: email, is_active: is_active }).fetch();

        if (usersData && typeof usersData === 'object' && usersData.length > 0) {
            return res.json({
                "status": "200",
                "message": "User Status Updated"
            });
        } else {
            return res.json({
                "status": "200",
                "message": "User(id) not found"
            });
        }
    },

    getCountriesData: async function (req, res) {
        fetch(' https://restcountries.eu/rest/v2/all', { method: "GET" })
            .then(resData => resData.json())
            .then(resData => {
                res.json({ status: 200, data: resData })
            })
            .catch(err => {
                res.status(500).json({ message: err })
            })
    },

    getCountries: async function (req, res) {
        let countriesResponse = [];
        let countries = await Countries.find({ is_active: true }).populate('state');
        countries.forEach(country => {
            let temp = {
                name: country.name,
                legality: country.legality,
                color: country.color
            };
            countriesResponse.push(temp);
            country.state.forEach(state => {
                if (state.is_active) {
                    let stateTemp = {
                        name: state.name,
                        region: country.name,
                        legality: state.legality,
                        color: state.color
                    }
                    countriesResponse.push(stateTemp);
                }
            });
        });
        res.json({
            state: 200,
            message: "Countries retirved successfully",
            countries: countriesResponse
        });
    },

    getUserReferredAdmin: async function (req, res) {
        let { page, limit, id } = req.allParams();

        let usersData = await Users.find({ referred_id: id, is_verified: true })
            .sort("id ASC").paginate(page, parseInt(limit));
        let usersDataCount = await Users.count({ referred_id: id, is_verified: true });
        if (usersData) {
            return res.json({
                "status": "200",
                "message": "Users Data",
                "data": usersData, usersDataCount
            });
        }
    },

    getUserloginHistoryAdmin: async function (req, res) {
        let { user_id } = req.allParams();
        let history = await LoginHistory.find({
            user: user_id
        }).sort("created_at DESC").limit(10);
        return res.json({
            "status": "200",
            "message": "Users Login Data",
            "data": history
        });
    }

};
