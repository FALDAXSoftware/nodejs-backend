/**
 * AdminController
 *
 * @description :: Admin controller for CMS user actions.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 * @routes      ::
 * post /admin/login
 * post /admin/forgotPassword
 * post /admin/create
 * put /admin/update
 * put /admin/resetPassword
 * post /admin/add-employee
 * get /admin/get-employees
 * delete /admin/delete-employee
 * put /admin/update-employee
 * get /admin/get-employee-details
 * post /admin/setup-two-factor
 * post /admin/verify-two-factor
 * post /admin/disable-two-factor
 * get /admin/get-details
 * post /admin/changePassword
 */
var randomize = require('randomatic');
var bcrypt = require('bcrypt');
var speakeasy = require('speakeasy');
var QRCode = require('qrcode');
const moment = require('moment');
var requestIp = require('request-ip');


module.exports = {
  // CMS Login
  login: async function (req, res) {
    try {
      // Parameter Existence
      if (req.body.email && req.body.password) {
        let query = {
          email: req.body.email,
          password: req.body.password
        }
        var admin_details = await Admin.findOne({
          email: query.email,
          deleted_at: null
        });

        // Admin Existence
        if (admin_details) {

          // Admin Active
          if (admin_details.is_active) {
            // var ip;
            var ip = requestIp.getClientIp(req); // on localhost > 127.0.0.1
            // if (req.headers['x-forwarded-for']) {
            //   ip = req
            //     .headers['x-forwarded-for']
            //     .split(",")[0];
            // } else if (req.connection && req.connection.remoteAddress) {
            //   ip = req.connection.remoteAddress;
            // } else {
            //   ip = req.ip;
            // }

            // if (admin_details.whitelist_ip != null && admin_details.whitelist_ip != "" && admin_details.whitelist_ip.indexOf(ip) <= -1) {
            //   return res
            //     .status(401)
            //     .json({
            //       "status": 401,
            //       "err": sails.__("Unauthorized Access")
            //     });
            // }

            var check_any_whitelistip = {
              user_id: admin_details.id,
              user_type: 1,
              deleted_at: null
            };

            var check_whitelist_data = await IPWhitelist.find(check_any_whitelistip);

            if (admin_details.is_whitelist_ip == true && check_whitelist_data.length > 0) {
              check_any_whitelistip.ip = ip;

              var check_whitelist = await IPWhitelist.findOne(check_any_whitelistip);
              if (check_whitelist != undefined) {
                if (check_whitelist.days != 0) {
                  var current_datetime = moment().valueOf();
                  if (current_datetime > check_whitelist.expire_time) {
                    return res
                      .status(401)
                      .json({
                        "status": 401,
                        "err": sails.__("Time for whitelist has been expired.")
                      });
                  }
                }

              } else {
                return res
                  .status(401)
                  .json({
                    "status": 401,
                    "err": sails.__("Your IP has not been whitelisted. Please whitelist your IP to continue.")
                  });
              }
            }

            let role = await Role.findOne({
              id: admin_details.role_id
            })
            admin_details.roles = role;

            // Role Not Active
            if (!role.is_active) {
              res
                .status(400)
                .json({
                  "status": 400,
                  "err": sails.__("Contact Admin")
                });
              return;
            }

            if (admin_details.is_twofactor) {
              if (!req.body.otp) {
                return res
                  .status(201)
                  .json({
                    "status": 201,
                    "err": sails.__("Please enter OTP to continue")
                  });
              }
              let verified = speakeasy
                .totp
                .verify({
                  secret: admin_details.twofactor_secret,
                  encoding: 'base32',
                  token: req.body.otp,
                  window: 2
                });
              if (!verified) {
                return res
                  .status(402)
                  .json({
                    "status": 402,
                    "err": sails.__("invalid otp")
                  });
              }
            }

            // Credentials Check (Password Compare)
            Admin
              .comparePassword(query.password, admin_details, async function (err, valid) {
                if (err) {
                  return res
                    .status(403)
                    .json({
                      "status": 403,
                      "err": sails.__("Forbidden")
                    });
                }

                if (!valid) {
                  return res
                    .status(401)
                    .json({
                      "status": 401,
                      "err": sails.__("Invalid email or password")
                    });
                } else {
                  if (admin_details.is_twofactor) {}

                  delete admin_details.password;
                  // Token Issue
                  var token = await sails
                    .helpers
                    .jwtIssue(admin_details.id, true, true);
                  res.json({
                    user: admin_details,
                    token
                  });
                }
              });
          } else {
            return res
              .status(400)
              .json({
                "status": 400,
                "err": sails.__("Contact Admin")
              });
          }
        } else {
          return res
            .status(400)
            .json({
              "status": 400,
              "err": sails.__("Invalid email or password")
            });
        }
      } else {
        return res
          .status(400)
          .json({
            "status": 400,
            "err": sails.__("Email or password is not sent")
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

  // Create Admin
  create: async function (req, res) {
    try {
      // Parameter Existence
      if (req.body.email && req.body.password) {
        // Create Admin
        var user_detail = await Admin
          .create({
            email: req.body.email,
            password: req.body.password
          })
          .fetch();

        // Token Issue
        var token = await sails
          .helpers
          .jwtIssue(user_detail.id);
        if (user_detail) {
          return res.json({
            "status": 200,
            "message": sails.__("listed"),
            "data": user_detail,
            token
          });
        } else {
          return res
            .status(400)
            .json({
              "status": 400,
              "err": sails.__("Something Wrong")
            });
        }
      } else {
        return res
          .status(400)
          .json({
            "status": 400,
            "err": sails.__("Email or password is not sent")
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

  // Change Password Admin
  changePassword: async function (req, res) {
    let {
      email,
      current_password,
      new_password,
      confirm_password
    } = req.body;
    try {
      if (!email || !current_password || !new_password || !confirm_password) {
        return res
          .status(401)
          .json({
            err: sails.__("Please provide email, new password, confirm password")
          });
      }

      if (new_password !== confirm_password) {
        return res
          .status(401)
          .json({
            "status": 401,
            err: sails.__("password must match")
          });
      }

      // check new passowrd for same as current password
      if (current_password === new_password) {
        return res
          .status(401)
          .json({
            "status": 401,
            err: sails.__("current new must not be same")
          });
      }

      const user_details = await Admin.findOne({
        email
      });
      if (!user_details) {
        return res
          .status(401)
          .json({
            "status": 401,
            err: sails.__("Email address not found")
          });
      }

      // check current password
      let compareCurrent = await bcrypt.compare(current_password, user_details.password);
      if (!compareCurrent) {
        return res
          .status(401)
          .json({
            "status": 401,
            err: sails.__("Current password mismatch")
          });
      }

      // Update New Password
      var adminUpdates = await Admin
        .update({
          email
        })
        .set({
          email,
          password: new_password
        })
        .fetch();

      if (adminUpdates) {
        // Send email notification
        let slug = 'profile_change_password';
        let template = await EmailTemplate.findOne({
          slug
        });
        let emailContent = await sails
          .helpers
          .utilities
          .formatEmail(template.content, {
            recipientName: user_details.first_name
          })

        sails
          .hooks
          .email
          .send("general-email", {
            content: emailContent
          }, {
            to: (user_details.email).trim(),
            subject: template.name
          }, function (err) {
            if (!err) {
              return res.json({
                "status": 200,
                "message": sails.__("password change success"),
                "data": adminUpdates
              });
            }
          })

      } else {
        return res
          .status(401)
          .json({
            err: sails.__("Something went wrong! Could not able to update the password")
          });
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

  updateEmployeePassword: async function (req, res) {
    let {
      email,
      new_password,
      confirm_password
    } = req.body;
    try {
      if (!email || !new_password || !confirm_password) {
        return res
          .status(401)
          .json({
            err: sails.__("Please provide email, new password, confirm password")
          });
      }

      if (new_password !== confirm_password) {
        return res
          .status(401)
          .json({
            "status": 401,
            err: sails.__("password must match")
          });
      }

      const user_details = await Admin.findOne({
        email
      });
      if (!user_details) {
        return res
          .status(401)
          .json({
            "status": 401,
            err: sails.__("Email address not found")
          });
      }

      // Update New Password
      var adminUpdates = await Admin
        .update({
          email
        })
        .set({
          email,
          password: new_password
        })
        .fetch();

      var ip = requestIp.getClientIp(req); // on localhost > 127.0.0.1
      // var ip;
      // if (req.headers['x-forwarded-for']) {
      //   ip = req
      //     .headers['x-forwarded-for']
      //     .split(",")[0];
      // } else if (req.connection && req.connection.remoteAddress) {
      //   ip = req.connection.remoteAddress;
      // } else {
      //   ip = req.ip;
      // }

      let today = new Date();
      let dd = String(today.getDate()).padStart(2, '0');
      let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
      let time = String(today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds())

      let slug = "change_password_subadmin"
      let template = await EmailTemplate.findOne({
        select: ['content'],
        where: {
          slug
        }
      });
      let emailContent = await sails.helpers.utilities.formatEmail(template.content, {
        recipientName: adminUpdates[0].first_name,
        datetime: dd + '-' + mm + '-' + today.getFullYear() + ' ' + time,
        browser: req.headers['user-agent'],
        ip
      })

      sails
        .hooks
        .email
        .send("general-email", {
          content: emailContent
        }, {
          to: adminUpdates[0]["email"],
          subject: "Password Change"
        }, function (err) {
          if (!err) {

          } else {
            return res
              .status(500)
              .json({
                "status": 500,
                "err": sails.__("Something Wrong")
              });
          }
        });

      if (adminUpdates) {
        return res.json({
          "status": 200,
          "message": sails.__("password change success"),
          "data": adminUpdates
        });
      } else {
        return res
          .status(401)
          .json({
            err: sails.__("Something went wrong! Could not able to update the password")
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

  // Update Profile Details Admin
  update: async function (req, res) {
    try {
      const admin_details = await Admin.findOne({
        email: req.body.email
      });
      if (!admin_details) {
        return res
          .status(401)
          .json({
            status: '401',
            err: sails.__("Invalid email")
          });
      }
      var updatedAdmin = await Admin
        .update({
          email: req.body.email
        })
        .set({
          ...req.body
        })
        .fetch();
      delete updatedAdmin.password

      return res.json({
        "status": 200,
        "message": sails.__("User Update"),
        data: updatedAdmin
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

  // Reset Passsword
  resetPassword: async function (req, res) {
    try {
      var reset_token = req.body.reset_token;

      let admin_details = await Admin.findOne({
        reset_token
      });
      if (admin_details) {
        let updateAdmin = await Admin
          .update({
            email: admin_details.email
          })
          .set({
            email: admin_details.email,
            password: req.body.password,
            reset_token: null
          })
          .fetch();
        if (updateAdmin) {
          // Send email notification
          let slug = 'profile_change_password';
          let template = await EmailTemplate.findOne({
            slug
          });
          let emailContent = await sails
            .helpers
            .utilities
            .formatEmail(template.content, {
              recipientName: admin_details.first_name
            })

          sails
            .hooks
            .email
            .send("general-email", {
              content: emailContent
            }, {
              to: (admin_details.email).trim(),
              subject: template.name
            }, function (err) {
              if (!err) {
                return res.json({
                  "status": 200,
                  "message": sails.__("password change success")
                });
              }
            })
        } else {
          return res.json({
            "status": 400,
            "message": sails.__("Update password Error")
          });
        }
      } else {
        return res
          .status(400)
          .json({
            status: 400,
            "message": sails.__("Reset Password link has been expired.")
          });
      }
    } catch (e) {
      res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
      return;
    }
  },

  // Forgot Password request Admin
  forgotPassword: async function (req, res) {
    try {
      const admin_details = await Admin.findOne({
        email: req.body.email,
        deleted_at: null
      });

      if (admin_details) {
        let reset_token = randomize('Aa0', 10);
        let new_admin = {
          email: req.body.email,
          reset_token: reset_token
        }
        var updatedAdmin = await Admin
          .update({
            email: req.body.email
          })
          .set(new_admin)
          .fetch();

        let slug = "forgot_password"
        let template = await EmailTemplate.findOne({
          slug
        });
        let emailContent = await sails.helpers.utilities.formatEmail(template.content, {
          recipientName: admin_details.first_name,
          token: sails.config.urlconf.CMS_URL + '/reset-password/' + reset_token,
        })
        sails
          .hooks
          .email.send("general-email", {
            content: emailContent
          }, {
            to: admin_details.email,
            subject: "Forgot Password"
          }, function (err) {
            if (!err) {
              return res.json({
                "status": 200,
                "message": sails.__("Reset password link sent to your email successfully.")
              });
            }
          })
      } else {
        return res
          .status(401)
          .json({
            err: sails.__("This email id is not registered with us.")
          });
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

  //get all employees function
  getAllEmployee: async function (req, res) {
    try {
      let {
        sortCol,
        sortOrder,
        data,
        page,
        limit
      } = req.allParams();
      let query = " from admin LEFT JOIN roles ON admin.role_id=roles.id WHERE admin.deleted_at IS NULL ";

      if ((data && data != "")) {
        if (data && data != "" && data != null) {
          query = query + " AND (LOWER(admin.first_name) LIKE '%" + data.toLowerCase() + "%'OR LOWER(admin.last_name) LIKE '%" + data.toLowerCase() + "%'OR LOWER(admin.email) LIKE '%" + data.toLowerCase() + "%')";
        }
      }
      countQuery = query;

      if (sortCol && sortOrder) {
        let sortVal = (sortOrder == 'descend' ?
          'DESC' :
          'ASC');
        query += " ORDER BY admin." + sortCol + " " + sortVal;
      } else {
        query += " ORDER BY admin.id DESC";
      }

      query += " limit " + limit + " offset " + (parseInt(limit) * (parseInt(page) - 1));

      let allEmployees = await sails.sendNativeQuery("Select admin.*, roles.name as role " + query, [])

      allEmployees = allEmployees.rows;

      let employeeCount = await sails.sendNativeQuery("Select COUNT(admin.id)" + countQuery, [])
      employeeCount = employeeCount.rows[0].count;

      if (allEmployees) {
        return res.json({
          status: 200,
          'message': sails.__("Employee list"),
          'data': {
            employees: allEmployees,
            employeeCount
          }
        })
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

  //add employee controller function
  addEmployee: async function (req, res) {
    try {
      if (req.body.email && req.body.roles) {

        let existedEmployee = await Admin.findOne({
          email: req.body.email,
        });

        if (existedEmployee) {
          return res
            .status(401)
            .json({
              status: 401,
              "message": sails.__("email exits")
            });
        }

        var employee_detail = await Admin.create({
          first_name: req.body.first_name,
          last_name: req.body.last_name,
          address: req.body.address,
          phone_number: req.body.phone_number,
          email: req.body.email,
          role_id: req.body.roles,
          password: req.body.password ?
            req.body.password : 'faldax123',
          created_at: new Date(),
          deleted_at: null
        }).fetch();

        if (employee_detail) {
          return res.json({
            'message': sails.__('Add Employee'),
            'status': 200,
            'data': employee_detail
          })
        }
      } else {
        return res
          .status(400)
          .json({
            'message': sails.__("Email & roles is required."),
            'status': 400
          })
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

  // Delete Employee
  deleteEmployee: async function (req, res) {
    try {
      if (req.body.id) {
        let employee = await Admin
          .findOne({
            id: req.body.id
          })
          .meta({
            fetch: true
          });
        if (employee) {
          let updatedEmp = await Admin
            .update({
              id: req.body.id
            })
            .set({
              email: employee.email,
              deleted_at: new Date()
            })
            .fetch();
          if (updatedEmp) {
            return res.json({
              'status': 200,
              'message': sails.__('Delete Employee')
            })
          }
        } else {
          return res
            .status(400)
            .json({
              status: 400,
              'err': sails._("Employee not found")
            })
        }
      } else {
        return res
          .status(400)
          .json({
            status: 400,
            'err': sails.__("Employee id is not sent.")
          })
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

  // Update Employee Details
  updateEmployee: async function (req, res) {
    try {
      if (req.body.id) {
        let employee = await Admin
          .findOne({
            id: req.body.id
          })
          .meta({
            fetch: true
          });
        if (employee) {
          let updatedEmp = await Admin
            .update({
              id: req.body.id
            })
            .set({
              first_name: req.body.first_name,
              last_name: req.body.last_name,
              address: req.body.address,
              phone_number: req.body.phone_number,
              email: employee.email,
              role_id: req.body.role_id,
              is_active: req.body.is_active
            })
            .fetch();
          if (updatedEmp) {
            return res
              .status(200)
              .json({
                status: 200,
                'message': sails.__('Update Employee')
              })
          }
        } else {
          return res
            .status(400)
            .json({
              'status': '400',
              'err': sails.__("Employee not found")
            })
        }
      } else {
        return res
          .status(400)
          .json({
            'status': '400',
            'err': sails.__("Employee id is not sent.")
          })
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

  getEmployeeDetails: async function (req, res) {
    let {
      emp_id
    } = req.allParams()
    try {
      if (emp_id) {
        let employee = await Admin.findOne({
          id: emp_id
        })

        let role = await Role.findOne({
          select: ['name'],
          where: {
            id: employee.role_id
          }
        })
        employee['role_name'] = role.name;

        return res.json({
          "status": 200,
          "message": sails.__("Employee Details"),
          "data": employee
        });
      } else {
        return res.json({
          "status": 400,
          "message": sails.__("Employee id is required")
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

  //Setup Two Factor
  setupTwoFactor: async function (req, res) {
    try {
      let {
        admin_id
      } = req.body;
      let user = await Admin.findOne({
        id: admin_id,
        is_active: true,
        deleted_at: null
      });
      if (!user) {
        return res
          .status(401)
          .json({
            "status": 401,
            "err": sails.__("Admin not found or it's not active")
          });
      }
      const secret = speakeasy.generateSecret({
        length: 10
      });
      await Admin
        .update({
          id: user.id
        })
        .set({
          "email": user.email,
          "twofactor_secret": secret.base32
        });
      let url = speakeasy.otpauthURL({
        secret: secret.ascii,
        label: 'FALDAX( ' + user.email + ')'
      });
      QRCode.toDataURL(url, function (err, data_url) {
        return res.json({
          status: 200,
          message: sails.__("Qr code sent"),
          tempSecret: secret.base32,
          dataURL: data_url,
          otpauthURL: secret.otpauth_url
        })
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

  //Verify 2 factor
  verifyTwoFactor: async function (req, res) {
    try {
      let {
        admin_id,
        otp
      } = req.body;
      let user = await Admin.findOne({
        id: admin_id,
        is_active: true,
        deleted_at: null
      });
      if (!user) {
        return res
          .status(401)
          .json({
            "status": 401,
            "err": sails.__("user inactive")
          });
      }
      if (user.is_twofactor == true) {
        return res
          .status(401)
          .json({
            "status": 401,
            "err": sails.__("2 factor already enabled")
          });
      }

      let verified = speakeasy
        .totp
        .verify({
          secret: user.twofactor_secret,
          encoding: "base32",
          token: otp,
          window: 2
        });
      if (verified) {
        await Admin
          .update({
            id: user.id
          })
          .set({
            email: user.email,
            is_twofactor: true
          });
        return res.json({
          status: 200,
          message: sails.__("2 factor enabled")
        });
      }
      return res
        .status(401)
        .json({
          status: 401,
          err: sails.__("invalid otp")
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

  //Disable 2 factor
  disableTwoFactor: async function (req, res) {
    try {
      let {
        admin_id
      } = req.body;
      let user = await Admin.findOne({
        id: admin_id,
        is_active: true,
        deleted_at: null
      });
      if (!user) {
        return res
          .status(401)
          .json({
            "status": 401,
            "err": sails.__("user inactive")
          });
      }
      if (user.is_twofactor == false) {
        return res
          .status(401)
          .json({
            "status": 401,
            "err": sails.__("2 factor already disabled")
          });
      }
      await Admin
        .update({
          id: user.id,
          deleted_at: null
        })
        .set({
          email: user.email,
          is_twofactor: false,
          twofactor_secret: null
        });
      return res.json({
        status: 200,
        message: sails.__("2 factor disabled")
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

  getAdminDetails: async function (req, res) {
    try {
      const {
        admin_id
      } = req.allParams();
      let adminDetails = await Admin.findOne({
        is_active: true,
        id: admin_id,
        deleted_at: null
      })

      return res.json({
        status: 200,
        message: sails.__("Admin Details"),
        data: adminDetails
      });
    } catch (err) {
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  },

  addAdminIPs: async function (req, res) {
    try {
      // const {
      //   admin_id
      // } = req.allParams();
      var user_id = req.user.id;
      var requestData = req.body;
      var adminData = await Admin.findOne({
        id: user_id,
        deleted_at: null,
      });

      if (adminData != undefined) {
        var updateAdminData = await Admin.update({
          id: user_id,
          deleted_at: null,
        }).set({
          email: adminData.email
        });

        var addValue = {}
        var expire_time;

        addValue.ip = requestData.ip;
        addValue.user_id = user_id;
        addValue.user_type = 1;
        addValue.days = requestData.days;
        addValue.is_permanent = (requestData.is_permanent != "" && requestData.is_permanent == true ? true : false);
        if (requestData.days != '' && requestData.days != null) {
          if (requestData.days > 0) {
            expire_time = moment().add(requestData.days, 'days').valueOf();
            addValue.expire_time = expire_time;
          } else {
            return res.status(500).json({
              status: 500,
              "message": sails.__("Days greater 0")
            })
          }
        } else {
          addValue.days = 0;
          addValue.expire_time = null;
        }

        var add_data = await IPWhitelist.addWhitelist(addValue);
        if (add_data) {
          return res.status(401).json({
            status: 500,
            "message": sails.__("IP in whitelist exists")
          })
        } else {
          // Send email notification
          let slug = 'new_ip_whitelist';
          let template = await EmailTemplate.findOne({
            slug
          });
          let emailContent = await sails
            .helpers
            .utilities
            .formatEmail(template.content, {
              recipientName: adminData.first_name,
              newIPAddress: requestData.ip
            })

          sails
            .hooks
            .email
            .send("general-email", {
              content: emailContent
            }, {
              to: (adminData.email).trim(),
              subject: template.name
            }, function (err) {
              if (!err) {
                return res.status(200).json({
                  "status": 200,
                  "message": sails.__("WhiteList IP Add Success"),
                  "data": updateAdminData
                });
              }
            })
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

  addUserIpWhitelist: async function (req, res) {
    try {
      if (!req.user.isAdmin) {
        return res.status(403).json({
          status: 403,
          err: 'Unauthorized access'
        });
      }
      var requestData = req.body;
      var addValue = {}
      var expire_time;

      addValue.ip = requestData.ip;
      addValue.user_id = requestData.user_id;
      addValue.user_type = 1;
      addValue.days = requestData.days;
      addValue.is_permanent = (requestData.is_permanent != "" && requestData.is_permanent == true ? true : false);

      if (requestData.days != '' && requestData.days != null) {
        if (requestData.days > 0) {
          expire_time = moment().add(requestData.days, 'days').valueOf();
          addValue.expire_time = expire_time;
        } else {
          return res.status(500).json({
            status: 500,
            "message": sails.__("Days greater 0")
          })
        }
      } else {
        addValue.days = 0;
        addValue.expire_time = null;
      }

      var add_data = await IPWhitelist.addWhitelist(addValue);
      if (add_data) {
        return res.status(401).json({
          status: 500,
          "message": sails.__("IP in whitelist exists")
        })
      } else {
        // Send email notification
        var user_data = await Admin.findOne({
          id: requestData.user_id
        });
        let slug = 'new_ip_whitelist';
        let template = await EmailTemplate.findOne({
          slug
        });
        let emailContent = await sails
          .helpers
          .utilities
          .formatEmail(template.content, {
            recipientName: user_data.first_name,
            newIPAddress: requestData.ip
          })

        sails
          .hooks
          .email
          .send("general-email", {
            content: emailContent
          }, {
            to: (user_data.email).trim(),
            subject: template.name
          }, function (err) {
            if (!err) {
              return res.status(200).json({
                "status": 200,
                "message": sails.__("WhiteList IP Add Success"),
                "data": []
              });
            }
          })
      }

    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  },

  getAdminWhiteListIP: async function (req, res) {
    try {
      const {
        admin_id
      } = req.allParams();

      var user_id = req.user.id;
      var now = moment().valueOf();
      let {
        page,
        limit
      } = req.allParams();
      let params = {
        deleted_at: null,
        user_id: user_id,
        user_type: 1,
        or: [{
          expire_time: {
            '>=': now
          }
        }, {
          expire_time: null
        }]
      };
      let get_data = await IPWhitelist.getWhiteListData("", params, limit, page);

      if (get_data.data != undefined && get_data.data.length > 0) {
        return res.status(200).json({
          "status": 200,
          "message": sails.__("WhiteList IP info Success"),
          "data": get_data.data,
          "total": get_data.total
        })
      } else {
        return res.status(200).json({
          "status": 200,
          "message": sails.__("WhiteList IP info Success Not Found"),
          "data": []
        })
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

  getUserWhiteListIP: async function (req, res) {
    try {
      const {
        user_id
      } = req.allParams();
      if (!req.user.isAdmin) {
        return res.status(403).json({
          status: 403,
          err: 'Unauthorized access'
        });
      }
      var now = moment().valueOf();
      let {
        page,
        limit
      } = req.allParams();
      let params = {
        deleted_at: null,
        user_id: user_id,
        or: [{
          expire_time: {
            '>=': now
          }
        }, {
          expire_time: null
        }]
      };
      let get_data = await IPWhitelist.getWhiteListData("", params, limit, page);

      if (get_data.data != undefined && get_data.data.length > 0) {
        return res.status(200).json({
          "status": 200,
          "message": sails.__("WhiteList IP info Success"),
          "data": get_data.data,
          "total": get_data.total
        })
      } else {
        return res.status(200).json({
          "status": 200,
          "message": sails.__("WhiteList IP info Success Not Found"),
          "data": []
        })
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

  deleteWhitelistIP: async function (req, res) {
    try {
      var user_id = req.user.id;
      let {
        id
      } = req.allParams();
      var data = {
        deleted_at: null,
        id: id,
        user_id: user_id
      };
      var delete_data = await IPWhitelist.deleteWhiteListData(id, data);
      if (delete_data) {
        return res.status(200)
          .json({
            status: 200,
            "message": sails.__("WhiteList IP has been deleted successfully")
          })
      } else {
        return res.status(200).json({
          "status": 204,
          "message": sails.__("WhiteList IP info Success Not Found"),
        })
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

  deleteUserWhitelistIP: async function (req, res) {
    try {
      if (!req.user.isAdmin) {
        return res.status(403).json({
          status: 403,
          err: 'Unauthorized access'
        });
      }
      let {
        id
      } = req.allParams();
      var data = {
        deleted_at: null,
        id: id
      };
      var delete_data = await IPWhitelist.deleteWhiteListData(id, data);
      if (delete_data) {
        return res.status(200)
          .json({
            status: 200,
            "message": sails.__("WhiteList IP has been deleted successfully")
          })
      } else {
        return res.status(200).json({
          "status": 204,
          "message": sails.__("WhiteList IP info Success Not Found"),
        })
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

  deleteUser: async function (req, res) {
    try {
      let {
        user_id
      } = req.allParams();

      var userDetail = await Users.findOne({
        where: {
          deleted_at: null,
          id: user_id
        }
      })

      if (userDetail != undefined) {
        var deleteUSerDetail = await Users
          .update({
            deleted_at: null,
            id: user_id
          })
          .set({
            email: userDetail.email,
            deleted_by: 2, //deleted by admin
            deleted_at: new Date()
          })

        res.json({
          status: 200,
          message: sails.__("user_delete_success")
        });
      } else {
        return res
          .status(500)
          .json({
            status: 500,
            "err": sails.__("User Detail Not Found")
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
  // Update user data
  updateUser: async function (req, res) {
    try {
      var req_data = req.body;
      var user_id = req_data.user_id;
      delete req_data.user_id;
      var update_data = await Users.updateData(user_id, req_data);
      if (update_data) {
        return res.json({
          "status": 200,
          "message": sails.__("User Update"),
          data: update_data
        });
      } else {
        return res
          .status(500)
          .json({
            status: 500,
            "err": sails.__("Something Wrong")
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

  // Change Whitelist IP status
  changeWhitelistIPStatus: async function (req, res) {
    try {
      let user_id = req.user.id;
      let {
        status
      } = req.body;
      let adminData = await Admin.findOne({
        id: user_id,
        deleted_at: null
      });

      if (!adminData) {
        res
          .status(401)
          .json({
            "status": 401,
            "err": sails.__("Employee not found")
          });
      }
      var admin_details = await Admin
        .update({
          id: adminData.id,
          deleted_at: null
        })
        .set({
          is_whitelist_ip: status,
          email: adminData.email
        })
        .fetch();

      // Send email notification
      var slug = 'own_whitelist_enable_disable';
      var template = await EmailTemplate.findOne({
        slug
      });
      var emailContent = await sails
        .helpers
        .utilities
        .formatEmail(template.content, {
          recipientName: admin_details[0].first_name,
          status: (status == true || status == "true" ? "Enabled" : "Disabled")
        })

      await sails
        .hooks
        .email
        .send("general-email", {
          content: emailContent
        }, {
          to: (admin_details[0].email).trim(),
          subject: "IP Whitelist status changed"
        }, function (err) {
          if (!err) {
            if (status == true || status == "true") {
              res.json({
                status: 200,
                message: sails.__("Whitelist ip enabled")
              });
            } else {
              res.json({
                status: 200,
                message: sails.__("Whitelist ip disabled")
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
        })

    } catch (err) {
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  },

  // Change Whitelist IP status for User
  changeUserWhitelistIPStatus: async function (req, res) {
    try {
      let {
        status,
        user_id
      } = req.body;
      let user = await Admin.findOne({
        id: user_id,
        deleted_at: null
      });

      if (!user) {
        res
          .status(401)
          .json({
            "status": 401,
            "err": sails.__("User not found")
          });
      }

      var admin_details = await Admin
        .update({
          id: user.id
        })
        .set({
          is_whitelist_ip: status,
          email: user.email
        })
        .fetch();

      // Send email notification
      var slug = 'admin_whitelist_enable_disable';
      var template = await EmailTemplate.findOne({
        slug
      });
      var emailContent = await sails
        .helpers
        .utilities
        .formatEmail(template.content, {
          recipientName: admin_details[0].first_name,
          status: (status == true || status == "true" ? "Enabled" : "Disabled")
        })

      await sails
        .hooks
        .email
        .send("general-email", {
          content: emailContent
        }, {
          to: (admin_details[0].email).trim(),
          subject: "IP Whitelist status changed"
        }, function (err) {
          if (!err) {
            if (status == true || status == "true") {
              res.json({
                status: 200,
                message: sails.__("Whitelist ip enabled")
              });
            } else {
              res.json({
                status: 200,
                message: sails.__("Whitelist ip disabled")
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
        })
    } catch (err) {
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  },
  // Get Twofactors requests
  getTwoFactorsRequests: async function (req, res) {
    try {

      let user_id = req.user.id;
      let adminData = await Admin.findOne({
        id: user_id,
        deleted_at: null
      });

      if (!adminData) {
        res
          .status(401)
          .json({
            "status": 401,
            "err": sails.__("Employee not found")
          });
      }
      if (adminData.role_id != 1) {
        res
          .status(403)
          .json({
            "status": 403,
            "err": sails.__("Unauthorized Access")
          });
      }

      // var get_data = await UserForgotTwofactors.getOpenRequests();
      // if (get_data.rowCount > 0) {
      //   return res.json({
      //     "status": 200,
      //     "message": sails.__("Twofactors lists"),
      //     "data": get_data.rows
      //   });
      // } else {
      //   return res.json({
      //     "status": 200,
      //     "message": sails.__("No record found"),
      //     "data": []
      //   });
      // }

      let {
        page,
        limit,
        data,
        r_type,
        sort_col,
        sort_order
      } = req.allParams();

      let query = " from users_forgot_twofactors uft LEFT JOIN users u ON uft.user_id = u.id";
      let whereAppended = false;

      if ((data && data != "")) {
        if (data && data != "" && data != null) {
          query += " WHERE"
          whereAppended = true;
          query += " (LOWER(u.email) LIKE '%" + data.toLowerCase() + "%' OR LOWER(uft.status) LIKE '%" + data.toLowerCase() + "%' OR LOWER(u.full_name) LIKE '%" + data.toLowerCase() + "%'";
          query += ")"
        }
      }

      if (r_type && r_type.trim() != "") {
        if (whereAppended) {
          query += " AND "
        } else {
          query += " WHERE "
        }
        whereAppended = true;
        query += "  uft.status='" + r_type + "'";
      }
      countQuery = query;

      if (sort_col && sort_order) {
        let sortVal = (sort_order == 'descend' ?
          'DESC' :
          'ASC');
        query += " ORDER BY " + sort_col + " " + sortVal;
      } else {
        query += " ORDER BY uft.id DESC";
      }
      query += " limit " + limit + " offset " + (parseInt(limit) * (parseInt(page) - 1))

      let request_data = await sails.sendNativeQuery("Select uft.*, u.full_name, u.email " + query, [])
      request_data = request_data.rows;

      let requests_counts = await sails.sendNativeQuery("Select COUNT(uft.id)" + countQuery, [])
      requests_counts = requests_counts.rows[0].count;


      if (request_data) {
        return res.json({
          "status": 200,
          "message": sails.__("Twofactors lists"),
          "data": request_data,
          requests_counts
        });
      }
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  },

  // Approve User's Twofactor request status
  approveUserTwofactorRequest: async function (req, res) {
    try {
      let user_id = req.user.id;
      let adminData = await Admin.findOne({
        id: user_id,
        deleted_at: null
      });

      if (!adminData) {
        res
          .status(401)
          .json({
            "status": 401,
            "err": sails.__("Employee not found")
          });
      }
      if (adminData.role_id != 1) {
        res
          .status(403)
          .json({
            "status": 403,
            "err": sails.__("Unauthorized Access")
          });
      }
      let {
        id
      } = req.body;
      var get_data = await UserForgotTwofactors.findOne({
        id: id
      });
      if (!get_data) {
        return res
          .status(500)
          .json({
            "status": 500,
            "err": sails.__("No record found")
          });
      }

      if (get_data.status == "closed") {
        return res
          .status(500)
          .json({
            "status": 500,
            "err": sails.__("Twofactor request closed")
          });
      }
      // Disable user's 2fa
      var user_data = user = await Users.findOne({
        id: get_data.user_id
      });
      var disable_withdrawls = {
        is_twofactor: false,
        twofactor_secret: ""
      }
      if (user_data.security_feature == true || user_data.security_feature == "true") {
        disable_withdrawls.security_feature_expired_time = moment().utc().add(process.env.WITHDRAWLS_DURATION, 'minutes');
      }

      var user = await Users
        .update({
          id: get_data.user_id
        })
        .set(disable_withdrawls)
        .fetch();

      if (get_data.uploaded_file) {
        await UploadFiles.deleteFile(get_data.uploaded_file); // delete the file
      }

      await UserForgotTwofactors
        .update({
          id: get_data.id
        })
        .set({
          status: "closed"
        });

      var slug = "twofactor_request_email_approved";
      if (user[0].security_feature == true) {
        slug = "twofactor_request_email_approved_sf";
      }
      let template = await EmailTemplate.findOne({
        slug
      });

      let emailContent = await sails
        .helpers
        .utilities
        .formatEmail(template.content, {
          recipientName: user[0].first_name
        });
      sails
        .hooks
        .email
        .send("general-email", {
          content: emailContent
        }, {
          to: user[0].email,
          subject: template.name
        }, function (err) {
          if (!err) {
            return res.json({
              "status": 200,
              "message": sails.__("Twofactor Request approved")
            });
          }
        })
    } catch (err) {
      console.log('err', err)
      return res.json({
        "status": 500,
        "message": sails.__("Something Wrong")
      });
    }
  },

  // Reject User's Twofactor request status
  rejectUserTwofactorRequest: async function (req, res) {
    try {
      let user_id = req.user.id;
      let adminData = await Admin.findOne({
        id: user_id,
        deleted_at: null
      });

      if (!adminData) {
        res
          .status(401)
          .json({
            "status": 401,
            "err": sails.__("Employee not found")
          });
      }
      if (adminData.role_id != 1) {
        res
          .status(403)
          .json({
            "status": 403,
            "err": sails.__("Unauthorized Access")
          });
      }
      let {
        id,
        reason
      } = req.body;
      var get_data = await UserForgotTwofactors.findOne({
        id: id
      });
      if (!get_data) {
        return res
          .status(500)
          .json({
            "status": 500,
            "err": sails.__("No record found")
          });
      }

      if (get_data.status == "closed") {
        return res
          .status(500)
          .json({
            "status": 500,
            "err": sails.__("Twofactor request closed")
          });
      }

      await UserForgotTwofactors
        .update({
          id: get_data.id
        })
        .set({
          status: "rejected",
          reason: reason
        });

      if (get_data.uploaded_file) {
        await UploadFiles.deleteFile(get_data.uploaded_file); // delete the file
      }

      var user = await Users
        .findOne({
          id: get_data.user_id
        })
      let slug = "twofactor_request_email_rejected";
      let template = await EmailTemplate.findOne({
        slug
      });

      let emailContent = await sails
        .helpers
        .utilities
        .formatEmail(template.content, {
          recipientName: user.first_name,
          reason: reason
        });
      sails
        .hooks
        .email
        .send("general-email", {
          content: emailContent
        }, {
          to: user.email,
          subject: template.name
        }, function (err) {
          if (!err) {
            return res.json({
              "status": 200,
              "message": sails.__("Twofactor Request rejected")
            });
          }
        })
    } catch (err) {
      console.log("err", err);
      return res.json({
        "status": 500,
        "message": sails.__("Something Wrong")
      });
    }
  },
  // Admin Thresholds lists
  adminThresholdLists: async function (req, res) {
    try {
      if (!req.user.isAdmin) {
        return res.status(403).json({
          status: 403,
          err: 'Unauthorized access'
        });
      }
      var get_coins = await sails.sendNativeQuery("SELECT id as coin_id, coin FROM coins WHERE is_active=true and deleted_at IS NULL");
      let admin_thresholds = await AdminSetting.findOne({
        where: {
          slug: 'admin_threshold_notification',
          deleted_at: null
        }
      });
      var all_coins = get_coins.rows;
      var check_all;
      var newarray = [];
      if (admin_thresholds != undefined && (admin_thresholds.value != null || admin_thresholds.value != "") && (JSON.parse(admin_thresholds.value)).length > 0) {
        var assets = JSON.parse(admin_thresholds.value);
        all_coins.map(obj => {
          var singledata = {};
          let exisiting = assets.find(each_value => each_value['coin_id'] === obj.coin_id);
          //console.log(exisiting);
          singledata.coin = obj.coin;
          singledata.coin_id = obj.coin_id;
          if (exisiting != undefined) {
            singledata.fist_limit = exisiting.fist_limit;
            singledata.second_limit = exisiting.second_limit;
            singledata.third_limit = exisiting.third_limit;
            singledata.is_sms_notification = exisiting.is_sms_notification;
            singledata.is_email_notification = exisiting.is_email_notification;
          } else {
            singledata.fist_limit = 0;
            singledata.second_limit = 0;
            singledata.third_limit = 0;
            singledata.is_sms_notification = false;
            singledata.is_email_notification = false;
          }
          newarray.push(singledata);
        })
      } else {

        all_coins.map(obj => {
          var singledata = {};
          singledata.coin_id = obj.coin_id;
          singledata.coin = obj.coin;
          singledata.fist_limit = 0;
          singledata.second_limit = 0;
          singledata.third_limit = 0;
          singledata.is_sms_notification = false;
          singledata.is_email_notification = false;
          newarray.push(singledata);
        })
      }
      return res.status(200).json({
        "status": 200,
        "message": sails.__("Threshold listed"),
        "data": newarray
      });
    } catch (err) {
      console.log("err", err);
      return res.json({
        "status": 500,
        "message": sails.__("Something Wrong")
      });
    }

  },
  // Add or Update Admin Thresholds
  addOrUpdateAdminThresholds: async function (req, res) {
    try {
      if (!req.user.isAdmin) {
        return res.status(403).json({
          status: 403,
          err: 'Unauthorized access'
        });
      }
      var assets = req.body;

      let admin_thresholds = await AdminSetting.findOne({
        where: {
          slug: 'admin_threshold_notification',
          deleted_at: null
        }
      });

      if (admin_thresholds != undefined) {
        await AdminSetting
          .update({
            id: admin_thresholds.id
          })
          .set({
            value: JSON.stringify(assets)
          })
      }
      return res.status(200).json({
        "status": 200,
        "message": sails.__("Threshold updated"),
        "data": assets
      });
    } catch (err) {
      console.log("err", err);
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  },
  // Add or Update Admin Thresholds Contacts list
  addThresholdContacts: async function (req, res) {
    try {
      if (!req.user.isAdmin) {
        return res.status(403).json({
          status: 403,
          err: 'Unauthorized access'
        });
      }
      var contacts = req.body;

      let admin_thresholds = await AdminSetting.findOne({
        where: {
          slug: 'admin_threshold_notification_contacts',
          deleted_at: null
        }
      });

      if (admin_thresholds != undefined) {
        await AdminSetting
          .update({
            id: admin_thresholds.id
          })
          .set({
            value: JSON.stringify(contacts)
          })
      }
      return res.status(200).json({
        "status": 200,
        "message": sails.__("Threshold Contacts updated"),
        "data": admin_thresholds
      });
    } catch (err) {
      console.log("err", err);
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  },

  // Admin Thresholds Contact lists
  adminThresholdContactList: async function (req, res) {
    try {
      if (!req.user.isAdmin) {
        return res.status(403).json({
          status: 403,
          err: 'Unauthorized access'
        });
      }

      let admin_thresholds_contacts = await AdminSetting.findOne({
        where: {
          slug: 'admin_threshold_notification_contacts',
          deleted_at: null
        }
      });
      if (admin_thresholds_contacts != undefined) {
        admin_thresholds_contacts.value = JSON.parse(admin_thresholds_contacts.value);
        return res.status(200).json({
          "status": 200,
          "message": sails.__("Threshold Contacts listed"),
          "data": admin_thresholds_contacts
        });
      } else {
        return res.status(200).json({
          "status": 200,
          "message": sails.__("No record found"),
          "data": newarray
        });
      }
    } catch (err) {
      console.log("err", err);
      return res.json({
        "status": 500,
        "message": sails.__("Something Wrong")
      });
    }
  },

  getAdminWalletDetails: async function (req, res) {
    try {
      var walletQuery;
      let {
        search
      } = req.allParams();

      walletQuery = `Select c.coin_code,c.coin,w.balance,w.send_address, w.receive_address,
      (sum(th.user_fee)+sum(th.requested_fee)) as Fee
      from coins c
      LEFT JOIN trade_history th
      ON c.coin=th.user_coin
      LEFT JOIN wallets w
      ON c.id=w.coin_id
      WHERE w.is_admin=TRUE AND c.is_active=TRUE
      ${(search && search != "" && search != null) ? `AND LOWER(c.coin) LIKE '%${search.toLowerCase()}%'` : ''}
      GROUP BY c.coin, c.coin_code, w.send_address, w.receive_address, w.balance`;

      let FeeData = await sails.sendNativeQuery(walletQuery, []);
      FeeData = FeeData.rows;

      return res.status(200).json({
        "status": 200,
        "message": sails.__("Wallet Details"),
        "data": FeeData
      });
    } catch (error) {
      return res.json({
        "status": 500,
        "message": sails.__("Something Wrong")
      });
    }
  },
  // Create Batch
  createBatch: async function (req, res) {
    try {
      if (!req.user.isAdmin) {
        return res.status(403).json({
          status: 403,
          err: 'Unauthorized access'
        });
      }
      // Parameter Existence
      if (req.body.last_transaction_id) {
        // Check if Batch is already created
        var check_exist_transaction = await Batches
          .count({
            transaction_start: {
              '<=': req.body.last_transaction_id
            },
            transaction_end: {
              '>=': req.body.last_transaction_id
            }
          });

        if (check_exist_transaction > 0) {
          return res
            .status(500)
            .json({
              status: 500,
              "err": sails.__("Batch is already generated with this transaction")
            });
        }
        // Get Previous data upto last tranasction
        var get_data = await Batches
          .find({
            deleted_at: null
          })
          .sort('created_at DESC')
          .limit(1);

        let last_transaction_id = req.body.last_transaction_id;
        var previous_trasaction_id = 1;
        var batch_number = 1;
        if (get_data.length > 0) {
          previous_trasaction_id = (get_data[0].transaction_end) + 1;
          batch_number = (get_data[0].batch_number) + 1;
        }
        var query = `Select *,
          (sum(user_fee)+sum(requested_fee)) as netprofit
          from trade_history
          WHERE id>='${previous_trasaction_id}' AND id<='${last_transaction_id}'
          GROUP BY id`;

        let get_transactions = await sails.sendNativeQuery(query, []);

        var totalNetProfit = 0;
        if (get_transactions.rowCount > 0) {
          (get_transactions.rows).map(function (each) {
            totalNetProfit += each.netprofit;
          })
        }
        var data = {
          batch_number: batch_number,
          transaction_start: previous_trasaction_id,
          transaction_end: last_transaction_id,
          net_profit: totalNetProfit
        };

        // Create Batch
        var create_data = await Batches
          .create(data)
          .fetch();


        if (create_data) {
          return res.json({
            "status": 200,
            "message": sails.__("Batch added"),
            "data": []
          });
        } else {
          return res
            .status(400)
            .json({
              "status": 400,
              "err": sails.__("Something Wrong")
            });
        }
      } else {
        return res
          .status(400)
          .json({
            "status": 400,
            "err": sails.__("Enter last transaction id")
          });
      }
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  },

  // Add or Update Admin Thresholds
  updateBatch: async function (req, res) {
    try {
      if (!req.user.isAdmin) {
        return res.status(403).json({
          status: 403,
          err: 'Unauthorized access'
        });
      }
      var req_body = req.body;
      var update_data = {
        is_purchased: req_body.is_purchased,
        is_withdrawled: req_body.is_withdrawled,
        is_manual_withdrawled: req_body.is_manual_withdrawled
      };
      var get_data = await Batches
        .update({
          id: req_body.batch_id
        })
        .set(update_data)
        .fetch();

      return res.status(200).json({
        "status": 200,
        "message": sails.__("Batch updated"),
        "data": get_data[0]
      });
    } catch (err) {
      console.log("err", err);
      return res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
    }
  },

  // Batch lists
  getBatchListing: async function (req, res) {
    try {
      if (!req.user.isAdmin) {
        return res.status(403).json({
          status: 403,
          err: 'Unauthorized access'
        });
      }
      let {
        sortCol,
        sortOrder,
        data,
        page,
        limit
      } = req.allParams();
      let query = " from batch_history WHERE deleted_at IS NULL ";

      if ((data && data != "")) {
        if (data && data != "" && data != null) {
          query = query + " AND (batch_number LIKE '%" + data.toLowerCase() + "%')";
        }
      }
      countQuery = query;

      if (sortCol && sortOrder) {
        let sortVal = (sortOrder == 'descend' ?
          'DESC' :
          'ASC');
        query += " ORDER BY " + sortCol + " " + sortVal;
      } else {
        query += " ORDER BY batch_date DESC";
      }

      query += " limit " + limit + " offset " + (parseInt(limit) * (parseInt(page) - 1));

      let get_batches = await sails.sendNativeQuery("Select *" + query, [])
      console.log('>>>>>>>>>>get_batches', get_batches.rows)
      let batch_count = await sails.sendNativeQuery("Select COUNT(id)" + countQuery, [])
      batch_count = batch_count.rows[0].count;
      // var get_batchs = await Batches.find().sort("batch_date DESC")
      // console.log("get_batchs",get_batchs);
      if (get_batches.rowCount > 0) {
        return res.status(200).json({
          "status": 200,
          "message": sails.__("Batch listed"),
          "data": {
            batches: get_batches.rows,
            batch_count
          }
        });
      } else {
        return res
          .status(500)
          .json({
            "status": 500,
            "err": sails.__("No record found")
          });
      }

    } catch (err) {
      console.log("err", err);
      return res.json({
        "status": 500,
        "message": sails.__("Something Wrong")
      });
    }

  },

  // Get Transaction Value for batch
  GetBatchValue: async function (req, res) {
    try {

      // if (!req.user.isAdmin) {
      //   return res.status(403).json({
      //     status: 403,
      //     err: 'Unauthorized access'
      //   });
      // }

      var {
        transaction_start,
        transaction_end
      } = req.allParams();

      var coinDetail = await Coins.find({
        where: {
          deleted_at: null,
          is_active: true
        }
      });

      var newArray = []
      if (coinDetail != undefined) {
        var buyTxTotal = 0
        var sellTxTotal = 0;
        var feesTotal = 0;
        // coinDetail.map(async obj => {
        for (var i = 0; i < coinDetail.length; i++) {
          var details = coinDetail[i];
          var singledata = {}
          var buyDetails = await TradeHistory
            .sum('quantity')
            .where({
              deleted_at: null,
              id: {
                '<=': transaction_end,
                '>=': transaction_start
              },
              or: [{
                  currency: details.coin,
                  side: 'Buy',
                },
                {
                  settle_currency: details.coin,
                  side: 'Sell',
                }
              ],
              trade_type: 1
            });

          var buyDetailsTx = await TradeHistory
            .count('id')
            .where({
              deleted_at: null,
              id: {
                '<=': transaction_end,
                '>=': transaction_start
              },
              or: [{
                  currency: details.coin,
                  side: 'Buy',
                },
                {
                  settle_currency: details.coin,
                  side: 'Sell',
                }
              ],
              trade_type: 1
            });

          var sellDetails = await TradeHistory
            .sum('quantity')
            .where({
              deleted_at: null,
              id: {
                '<=': transaction_end,
                '>=': transaction_start
              },
              or: [{
                  currency: details.coin,
                  side: 'Sell',
                },
                {
                  settle_currency: details.coin,
                  side: 'Buy',
                }
              ],
              trade_type: 1
            });

          var sellDetailsTx = await TradeHistory
            .count('id')
            .where({
              deleted_at: null,
              id: {
                '<=': transaction_end,
                '>=': transaction_start
              },
              or: [{
                  currency: details.coin,
                  side: 'Sell',
                },
                {
                  settle_currency: details.coin,
                  side: 'Buy',
                }
              ],
              trade_type: 1
            });

          var coinUserFees = await TradeHistory
            .sum('user_fee')
            .where({
              deleted_at: null,
              id: {
                '<=': transaction_end,
                '>=': transaction_start
              },
              user_coin: details.coin,
              trade_type: 1
            })

          var coinRequestedFees = await TradeHistory
            .sum('requested_fee')
            .where({
              deleted_at: null,
              id: {
                '<=': transaction_end,
                '>=': transaction_start
              },
              requested_coin: details.coin,
              trade_type: 1
            })

          buyTxTotal = buyTxTotal + buyDetailsTx;
          sellTxTotal = sellTxTotal + sellDetailsTx;

          var coinFees = coinUserFees + coinRequestedFees
          var usdValue = await sails.helpers.fixapi.getPrice(details.coin)
          if (usdValue.length > 0)
            feesTotal = feesTotal + (coinFees * (usdValue[0].bid_price > 0 ? usdValue[0].bid_price : usdValue[0].ask_price));

          singledata.coin = details.coin;
          singledata.buy_detail = buyDetails;
          singledata.sell_detail = sellDetails;
          singledata.asset_net = (buyDetails - sellDetails)
          singledata.buy_tx = buyDetailsTx;
          singledata.sell_tx = sellDetailsTx;
          singledata.faldax_fees = coinFees;
          singledata.faldax_usd_fees = 'USD ' + feesTotal;
          newArray.push(singledata);
        }

        return res.status(200).json({
          "status": 200,
          "message": sails.__("batch data retrieved"),
          "data": newArray,
          buyTxTotal,
          sellTxTotal,
          feesTotal
        })
      }

    } catch (err) {
      console.log(err)
      return res
        .status(500)
        .json({
          "status": 500,
          "message": sails.__("Something Wrong")
        });
    }
  },

  // Get Each Transaction Value for batch
  getTransactionBatchValue: async function (req, res) {

    try {

      var {
        transaction_start,
        transaction_end
      } = req.allParams();

      var diffrence = transaction_end - transaction_start;

      var newarray = [];
      var idValue;
      for (var i = 0; i < diffrence; i++) {
        var singledata = {};
        idValue = i + parseInt(transaction_start);
        var tradeData = await TradeHistory.findOne({
          deleted_at: null,
          id: idValue
        });

        if (tradeData != undefined) {
          var asset_1_usd_value = await sails.helpers.fixapi.getPrice(tradeData.currency);
          var asset_2_usd_value = await sails.helpers.fixapi.getPrice(tradeData.settle_currency);
          var dateValue = tradeData.created_at
          singledata.transaction_id = tradeData.id;
          singledata.transaction_time = moment(dateValue).format('MM/DD/YYYY HH:mm:ss');
          singledata.pair = tradeData.symbol;
          singledata.user_id = tradeData.user_id;
          singledata.asset_1_amount = tradeData.quantity;
          singledata.asset_1_value = ((asset_1_usd_value[0].bid_price > 0 ? asset_1_usd_value[0].bid_price : asset_1_usd_value[0].ask_price) * tradeData.quantity)
          singledata.asset_2_amount = tradeData.filled;
          singledata.asset_2_value = (tradeData.filled * (asset_2_usd_value[0].bid_price > 0 ? asset_2_usd_value[0].bid_price : asset_2_usd_value[0].ask_price));
          singledata.transaction_value = tradeData.quantity * singledata.asset_1_value
          singledata.faldax_fee = (tradeData.user_fee);
          singledata.faldax_fee_usd_value = (singledata.faldax_fee * (asset_1_usd_value[0].bid_price > 0 ? asset_1_usd_value[0].bid_price : asset_1_usd_value[0].ask_price));

          newarray.push(singledata);
        }
      }

      return res.status(200).json({
        "status": 200,
        "message": sails.__("each batch data retrieved"),
        "data": newarray
      })

    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json({
          "status": 500,
          "message": sails.__("Something Wrong")
        });
    }

  },

  // Download file
  downloadBatchFile: async function (req, res) {
    try {
      var batch_id = req.body.batch_id;
      var options = req.body.options;
      if( batch_id == "" || options == "" ){
        return res
          .status(400)
          .json({
            "status": 400,
            "message": sails.__("Missing Parameters")
          });
      }
      var batchDetail = await Batches.findOne({
        where: {
          deleted_at: null,
          id: batch_id
        }
      });
      if( batchDetail == undefined ){
        return res
          .status(500)
          .json({
            "status": 500,
            "message": sails.__("Batch not found")
          });
      }
      var {
        transaction_start,
        transaction_end
      } = batchDetail;

      var diffrence = transaction_end - transaction_start;
      var newarray = {};
      var purchases=[];
      var summary={};
      var idValue;
      if( options == 0 || options == 2 ){ // Purchases
        for (var i = 0; i < diffrence; i++) {
          
          
            var singledata = {};
            idValue = i + parseInt(transaction_start);
            var tradeData = await TradeHistory.findOne({
              deleted_at: null,
              id: idValue,
              trade_type:2
            });
            if (tradeData != undefined && tradeData.currency != "USD") {
              var asset_1_usd_value = await sails.helpers.fixapi.getPrice(tradeData.currency, tradeData.side);
              var asset_2_usd_value = await sails.helpers.fixapi.getPrice(tradeData.settle_currency, tradeData.side);
    
              var dateValue = tradeData.created_at
              singledata.transaction_id = tradeData.id;
              singledata.transaction_time = moment(dateValue).format('MM/DD/YYYY HH:mm:ss');
              singledata.pair = tradeData.symbol;
              singledata.user_id = tradeData.user_id;
              singledata.asset_1_amount = tradeData.quantity;
              singledata.asset_1_value = ((asset_1_usd_value[0].bid_price > 0 ? asset_1_usd_value[0].bid_price : asset_1_usd_value[0].ask_price) * tradeData.quantity)
              singledata.asset_2_amount = tradeData.filled;
              singledata.asset_2_value = (tradeData.filled * (asset_2_usd_value[0].bid_price > 0 ? asset_2_usd_value[0].bid_price : asset_2_usd_value[0].ask_price));
              singledata.transaction_value = tradeData.quantity * singledata.asset_1_value
              singledata.network_fee = 0;
              singledata.network_fee_usd_value = 0;
              singledata.faldax_fee = (tradeData.user_fee);
              singledata.faldax_fee_usd_value = (singledata.faldax_fee * (asset_1_usd_value[0].bid_price > 0 ? asset_1_usd_value[0].bid_price : asset_1_usd_value[0].ask_price));
    
              purchases.push(singledata);
            }
          }
      }

      if( options == 0 || options == 1 ){ // Summary
         
        var coinDetail = await Coins.find({
          where: {
            deleted_at: null,
            is_active: true
          }
        });
  
        var newArray2 = [];
        if (coinDetail != undefined) {
          var buyTxTotal = 0
          var sellTxTotal = 0;
          var feesTotalBuy = 0;
          var feesTotalSell = 0;
          // coinDetail.map(async obj => {
          for (var i = 0; i < coinDetail.length; i++) {
            var details = coinDetail[i];
            var summary_data = {}
            var buyDetails = await TradeHistory
              .sum('quantity')
              .where({
                deleted_at: null,
                id: {
                  '<=': transaction_end,
                  '>=': transaction_start
                },
                or: [{
                    currency: details.coin,
                    side: 'Buy',
                  },
                  {
                    settle_currency: details.coin,
                    side: 'Sell',
                  }
                ],
                trade_type: 1
              });

          
            var buyDetailsTx = await TradeHistory
              .count('id')
              .where({
                deleted_at: null,
                id: {
                  '<=': transaction_end,
                  '>=': transaction_start
                },
                or: [{
                    currency: details.coin,
                    side: 'Buy',
                  },
                  {
                    settle_currency: details.coin,
                    side: 'Sell',
                  }
                ],
                trade_type: 1
              });
  
            var sellDetails = await TradeHistory
              .sum('quantity')
              .where({
                deleted_at: null,
                id: {
                  '<=': transaction_end,
                  '>=': transaction_start
                },
                or: [{
                    currency: details.coin,
                    side: 'Sell',
                  },
                  {
                    settle_currency: details.coin,
                    side: 'Buy',
                  }
                ],
                trade_type: 1
              });
  
            var sellDetailsTx = await TradeHistory
              .count('id')
              .where({
                deleted_at: null,
                id: {
                  '<=': transaction_end,
                  '>=': transaction_start
                },
                or: [{
                    currency: details.coin,
                    side: 'Sell',
                  },
                  {
                    settle_currency: details.coin,
                    side: 'Buy',
                  }
                ],
                trade_type: 1
              });
  
            var coinUserFeesBuy = await TradeHistory
              .sum('user_fee')
              .where({
                deleted_at: null,
                id: {
                  '<=': transaction_end,
                  '>=': transaction_start
                },
                user_coin: details.coin,
                side:"Buy",
                trade_type: 1
              })

            var coinUserFeesSell = await TradeHistory
              .sum('user_fee')
              .where({
                deleted_at: null,
                id: {
                  '<=': transaction_end,
                  '>=': transaction_start
                },
                user_coin: details.coin,
                side:"Sell",
                trade_type: 1
              })  
  
            var coinRequestedFeesBuy = await TradeHistory
              .sum('requested_fee')
              .where({
                deleted_at: null,
                id: {
                  '<=': transaction_end,
                  '>=': transaction_start
                },
                requested_coin: details.coin,
                side:"Buy",
                trade_type: 1
              })
            
            var coinRequestedFeesSell = await TradeHistory
              .sum('requested_fee')
              .where({
                deleted_at: null,
                id: {
                  '<=': transaction_end,
                  '>=': transaction_start
                },
                requested_coin: details.coin,
                side:"Sell",
                trade_type: 1
              })
  
            buyTxTotal = buyTxTotal + buyDetailsTx;
            sellTxTotal = sellTxTotal + sellDetailsTx;
  
            var coinFeesBuy = coinUserFeesBuy + coinRequestedFeesBuy;
            var coinFeesSell = coinUserFeesSell + coinRequestedFeesSell;
            coinFees = coinFeesBuy+coinFeesSell;
            var usdValueBuy = await sails.helpers.fixapi.getPrice(details.coin, "Buy");
            var usdValueSell = await sails.helpers.fixapi.getPrice(details.coin, "Sell");
            if (usdValueBuy.length > 0){
              feesTotalBuy = feesTotalBuy + (coinFeesBuy * usdValueBuy[0].ask_price);
            } 

            if (usdValueSell.length > 0){
              feesTotalSell = feesTotalSell + (coinFeesSell * usdValueSell[0].bid_price);
            } 
            var feesTotal = feesTotalBuy+feesTotalSell;
              
  
            summary_data.coin = details.coin;
            summary_data.buy_detail = buyDetails;
            summary_data.sell_detail = sellDetails;
            summary_data.asset_net = (buyDetails - sellDetails)
            summary_data.buy_tx = buyDetailsTx;
            summary_data.sell_tx = sellDetailsTx;
            summary_data.faldax_fees = coinFees;
            summary_data.faldax_usd_fees = 'USD ' + (feesTotal).toFixed(process.env.TOTAL_PRECISION);
            newArray2.push(summary_data);
          }
  
          summary.data = newArray2;
          summary.totalBuyTransaction = buyTxTotal;
          summary.totalSellTransaction = sellTxTotal;
          summary.totalNetworkFees = (feesTotal).toFixed(process.env.TOTAL_PRECISION);
        }
      } // Summary ends
      newarray.purchases = purchases;
      newarray.summary = summary;

      return res.status(200).json({
        "status": 200,
        "message": sails.__("each batch data retrieved"),
        "data": newarray
      })

    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json({
          "status": 500,
          "message": sails.__("Something Wrong")
        });
    }

  },

  // Get Batch Details
  getBatchDetails: async function (req, res) {
    try {

      if (!req.user.isAdmin) {
        return res.status(403).json({
          status: 403,
          err: 'Unauthorized access'
        });
      }

      var {
        id
      } = req.allParams();

      var batchDetail = await Batches.findOne({
        where: {
          deleted_at: null,
          id: id
        }
      });

      if (batchDetail) {
        return res
          .status(200)
          .json({
            "status": 200,
            "message": sails.__("batch detail retrieve success"),
            "data": batchDetail
          })
      } else {
        return res
          .status(201)
          .json({
            "status": 201,
            "message": sails.__("no batch detail found")
          })
      }
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json({
          "status": 500,
          "message": sails.__("Something Wrong")
        });
    }
  },
  // Upload file
  uploadBatchFile: async function (req, res) {
    try {
      if (!req.user.isAdmin) {
        return res.status(403).json({
          status: 403,
          err: 'Unauthorized access'
        });
      }

      var req_body = req.body;
      if (req_body.batch_id == "")  {
        return res.status(500).json({
          "status": 500,
          "message": sails.__("Missing Parameters")
        });
      }

      var batch_id = req_body.batch_id;
      if (req.file('batch_upload')) {
        req
          .file('batch_upload')
          .upload(async function (err, uploadedDoc) {
            try {
              if (uploadedDoc.length > 0) {
                let filename = uploadedDoc[0].filename;
                var name = filename.substring(filename.indexOf("."));
                let timestamp = new Date()
                  .getTime()
                  .toString();
                uploadFileName = timestamp + name;
                var stored_filename = 'batches_uploaded/' + uploadFileName;
                var uploadResume = await UploadFiles.upload(uploadedDoc[0].fd, stored_filename);
                if (uploadResume) {
                  await Batches
                    .update({
                      id: batch_id
                    })
                    .set({
                      uploaded_file: stored_filename
                    });
                  return res.json({
                    status: 200,
                    message: sails.__("BatchFile uploaded")
                  })
                } else {
                  return res
                    .status(500)
                    .json({
                      status: 500,
                      "err": sails.__("Something Wrong")
                    });
                }
              }else{

                return res
                  .status(500)
                  .json({
                    status: 500,
                    "err": sails.__("File size should be greater than 0")
                  });
              }
            } catch (e) {
              console.log('>>>>>>>>thrown', e)
              throw e;
            }
          })
      }

    } catch (err) {
      console.log("err", err);
      return res
        .status(500)
        .json({
          "status": 500,
          "message": sails.__("Something Wrong")
        });
    }

  },
};
