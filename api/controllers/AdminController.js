/**
 * AdminController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
var randomize = require('randomatic');
var bcrypt = require('bcrypt');

module.exports = {
    login: async function (req, res) {
        try {
            if (req.body.email && req.body.password) {
                let query = {
                    email: req.body.email,
                    password: req.body.password
                }
                var admin_details = await Admin.findOne({ email: query.email, deleted_at: null });

                if (admin_details) {
                    if (admin_details.is_active) {
                        let role = await Role.findOne({ id: admin_details.role_id })
                        admin_details.roles = role;

                        Admin.comparePassword(query.password, admin_details, async function (err, valid) {
                            if (err) {
                                return res.status(403).json({ "status": 403, "err": 'Forbidden' });
                            }

                            if (!valid) {
                                return res.status(401).json({ "status": 401, "err": 'Invalid email or password' });
                            } else {
                                delete admin_details.password;
                                var token = await sails.helpers.jwtIssue(admin_details.id);
                                res.json({
                                    user: admin_details,
                                    token
                                });
                            }
                        });
                    } else {
                        res.status(400).json({
                            "status": 400,
                            "err": sails.__("Contact Admin")
                        });
                        return;
                    }

                } else {
                    res.status(400).json({
                        "status": 400,
                        "err": "Invalid email or password",
                    });
                    return;
                }
            } else {
                res.status(400).json({
                    "status": 400,
                    "err": "Email or password is not sent",
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

    create: async function (req, res) {
        try {
            if (req.body.email && req.body.password) {
                var user_detail = await Admin.create({
                    email: req.body.email,
                    password: req.body.password

                }).fetch();
                var token = await sails.helpers.jwtIssue(user_detail.id);
                if (user_detail) {
                    res.json({
                        "status": 200,
                        "message": "listed",
                        "data": user_detail,
                        token
                    });
                    return;
                } else {
                    res.status(400).json({
                        "status": 400,
                        "err": "Something went wrong",
                    });
                    return;
                }
            } else {
                res.status(400).json({
                    "status": 400,
                    "err": "Email or password is not sent",
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

    changePassword: async function (req, res) {
        try {
            if (!req.body.email || !req.body.current_password || !req.body.new_password || !req.body.confirm_password) {
                return res.status(401).json({ err: 'Please provide email, current password, new password, confirm password' });
            }

            if (req.body.new_password !== req.body.confirm_password) {
                return res.status(401).json({ "status": 401, err: 'New and confirm password should match' });
            }

            if (req.body.current_password === req.body.new_password) {
                return res.status(401).json({ "status": 401, err: 'Current and new password should not be match' });
            }

            const user_details = await Admin.findOne({ email: req.body.email });
            if (!user_details) {
                return res.status(401).json({ "status": 401, err: 'Email address not found' });
            }

            let compareCurrent = await bcrypt.compare(req.body.current_password, user_details.password);
            if (!compareCurrent) {
                return res.status(401).json({ "status": 401, err: "Current password mismatch" });
            }

            var adminUpdates = await Admin.update({ email: req.body.email }).set({ email: req.body.email, password: req.body.new_password }).fetch();

            if (adminUpdates) {
                return res.json({
                    "status": 200,
                    "message": "Password changed successfully",
                    "data": adminUpdates
                });
            } else {
                return res.status(401).json({ err: 'Something went wrong! Could not able to update the password' });
            }
        } catch (error) {
            res.status(500).json({
                status: 500,
                "err": sails.__("Something Wrong")
            });
            return;
        }
    },

    update: async function (req, res) {
        try {
            const admin_details = await Admin.findOne({ email: req.body.email });
            if (!admin_details) {
                return res.status(401).json({ status: '401', err: 'Invalid email' });
            }
            var updatedAdmin = await Admin.update({ email: req.body.email }).set({ ...req.body }).fetch();
            delete updatedAdmin.password

            return res.json({
                "status": 200,
                "message": "User details updated successfully",
                data: updatedAdmin
            });

        } catch (error) {
            res.status(500).json({
                status: 500,
                "err": sails.__("Something Wrong")
            });
            return;
        }
    },

    resetPassword: async function (req, res) {
        try {
            var reset_token = req.body.reset_token;

            let admin_details = await Admin.findOne({ reset_token });
            if (admin_details) {
                let updateAdmin = await Admin.update({ email: admin_details.email }).set({ email: admin_details.email, password: req.body.password, reset_token: null }).fetch();
                if (updateAdmin) {
                    return res.json({
                        "status": 200,
                        "message": "Password updated Successfully"
                    });
                } else {
                    throw "Update password Error"
                }
            } else {
                res.status(500).json({
                    status: 500,
                    "err": sails.__("Something Wrong")
                });
            }
        } catch (e) {
            res.status(500).json({
                status: 500,
                "err": sails.__("Something Wrong")
            });
        }
    },

    forgotPassword: async function (req, res) {
        try {
            const admin_details = await Admin.findOne({ email: req.body.email });
            if (!admin_details) {
                return res.status(401).json({ err: 'This email id is not registered with us.' });
            }
            let reset_token = randomize('Aa0', 10);
            let new_admin = {
                email: req.body.email,
                reset_token: reset_token
            }
            var updatedAdmin = await Admin.update({ email: req.body.email }).set(new_admin).fetch();

            sails.hooks.email.send(
                "forgotPassword",
                {
                    homelink: sails.config.urlconf.CMS_URL,
                    recipientName: admin_details.name,
                    token: sails.config.urlconf.CMS_URL + '/reset-password/' + reset_token,
                    senderName: "Faldax"
                },
                {
                    to: admin_details.email,
                    subject: "Forgot Password"
                },
                function (err) {
                    if (!err) {
                        return res.json({
                            "status": 200,
                            "message": "Reset password link sent to your email successfully."
                        });
                    }
                }
            )
            sails.log(updatedAdmin);
        } catch (error) {
            res.status(500).json({
                status: 500,
                "err": sails.__("Something Wrong")
            });
            return;
        }
    },

    //get all employees function
    getAllEmployee: async function (req, res) {
        try {
            let employees = await Admin.find({
                where: {
                    deleted_at: null,
                }
            }).sort('id ASC');
            for (let index = 0; index < employees.length; index++) {
                if (employees[index].role_id) {
                    let role = await Role.findOne({ id: employees[index].role_id })
                    employees[index].role = role.name
                }
            }
            let employeeCount = await Admin.count({
                where: {
                    deleted_at: null
                }
            });

            if (employees) {
                res.json({
                    status: 200,
                    'message': sails.__("Employee list"),
                    'data': employees,
                    employeeCount
                })
            }
        } catch (error) {
            return res.status(500).json({
                status: 500,
                "err": sails.__("Something Wrong")
            });
        }
    },

    //add employee controller function
    addEmployee: async function (req, res) {
        try {
            if (req.body.email && req.body.roles) {

                var employee_detail = await Admin.create({
                    name: req.body.name,
                    email: req.body.email,
                    role_id: req.body.roles,
                    password: req.body.password ? req.body.password : 'faldax123',
                    created_at: new Date(),
                    deleted_at: null
                }).fetch();

                if (employee_detail) {
                    res.json({
                        'message': sails.__('Add Employee'),
                        'status': 200,
                        'data': employee_detail
                    })
                }
            } else {
                res.status(400).json({
                    'message': 'Email & roles is required.',
                    'status': 400,
                })
            }
        }
        catch (error) {
            return res.status(500).json({
                status: 500,
                "err": sails.__("Something Wrong")
            });
        }
    },

    deleteEmployee: async function (req, res) {
        try {
            if (req.body.id) {
                let employee = await Admin.findOne({ id: req.body.id }).meta({ fetch: true });
                if (employee) {
                    let updatedEmp = await Admin.update({ id: req.body.id }).set({ email: employee.email, deleted_at: new Date() }).fetch();
                    if (updatedEmp) {
                        res.json({ 'status': 200, 'message': sails.__('Delete Employee') })
                    }
                } else {
                    res.status(400).json({ status: 400, 'err': 'Employee not found' })
                }
            } else {
                res.status(400).json({ status: 400, 'err': 'Employee id is not sent.' })
            }
        } catch (error) {
            return res.status(500).json({
                status: 500,
                "err": sails.__("Something Wrong")
            });
        }
    },

    updateEmployee: async function (req, res) {
        try {
            if (req.body.id) {
                let employee = await Admin.findOne({ id: req.body.id }).meta({ fetch: true });
                if (employee) {
                    let updatedEmp = await Admin.update({
                        id: req.body.id
                    }).set({
                        name: req.body.name,
                        email: employee.email,
                        role_id: req.body.role_id,
                        is_active: req.body.is_active
                    }).fetch();
                    if (updatedEmp) {
                        res.status(200).json({ status: 200, 'message': sails.__('Update Employee') })
                    }
                } else {
                    res.status(400).json({ 'status': '400', 'err': 'Employee not found.' })
                }
            } else {
                res.status(400).json({ 'status': '400', 'err': 'Employee id is not sent.' })
            }
        } catch (error) {
            return res.status(500).json({
                status: 500,
                "err": sails.__("Something Wrong")
            });
        }
    }
};
