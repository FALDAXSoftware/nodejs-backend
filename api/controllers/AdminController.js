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
            var ip;
            if (req.headers['x-forwarded-for']) {
              ip = req
                .headers['x-forwarded-for']
                .split(",")[0];
            } else if (req.connection && req.connection.remoteAddress) {
              ip = req.connection.remoteAddress;
            } else {
              ip = req.ip;
            }

            if (admin_details.whitelist_ip != null && admin_details.whitelist_ip != "" && admin_details.whitelist_ip.indexOf(ip) <= -1) {
              return res
                .status(401)
                .json({
                  "status": 401,
                  "err": sails.__("Unauthorized Access")
                });
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
                  if (admin_details.is_twofactor) { }

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
    try {
      if (!req.body.email || !req.body.new_password || !req.body.confirm_password) {
        return res
          .status(401)
          .json({
            err: sails.__("Please provide email, new password, confirm password")
          });
      }

      if (req.body.new_password !== req.body.confirm_password) {
        return res
          .status(401)
          .json({
            "status": 401,
            err: sails.__("password must match")
          });
      }

      // if (req.body.current_password === req.body.new_password) {
      //   return res
      //     .status(401)
      //     .json({
      //       "status": 401,
      //       err: sails.__("current new must not be same")
      //     });
      // }

      const user_details = await Admin.findOne({
        email: req.body.email
      });
      if (!user_details) {
        return res
          .status(401)
          .json({
            "status": 401,
            err: sails.__("Email address not found")
          });
      }

      // let compareCurrent = await bcrypt.compare(req.body.current_password, user_details.password);
      // if (!compareCurrent) {
      //   return res
      //     .status(401)
      //     .json({
      //       "status": 401,
      //       err: sails.__("Current password mismatch")
      //     });
      // }
      // Update New Password
      var adminUpdates = await Admin
        .update({
          email: req.body.email
        })
        .set({
          email: req.body.email,
          password: req.body.new_password
        })
        .fetch();

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
      res
        .status(500)
        .json({
          status: 500,
          "err": sails.__("Something Wrong")
        });
      return;
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
      console.log('error,', error)
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
          return res.json({
            "status": 200,
            "message": sails.__("Password updated Successfully")
          });
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
          recipientName: admin_details.name,
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
        data
      } = req.allParams();
      let query = " from admin WHERE deleted_at IS NULL ";

      if ((data && data != "")) {
        if (data && data != "" && data != null) {
          query = query + " AND (LOWER(first_name) LIKE '%" + data.toLowerCase() + "%'OR LOWER(last_name) LIKE '%" + data.toLowerCase() + "%'OR LOWER(email) LIKE '%" + data.toLowerCase() + "%')";
        }
      }
      countQuery = query;

      if (sortCol && sortOrder) {
        let sortVal = (sortOrder == 'descend' ?
          'DESC' :
          'ASC');
        query += " ORDER BY " + sortCol + " " + sortVal;
      } else {
        query += " ORDER BY id DESC";
      }
      let allEmployees = await sails.sendNativeQuery("Select *" + query, [])

      allEmployees = allEmployees.rows;

      let employeeCount = await sails.sendNativeQuery("Select COUNT(id)" + countQuery, [])
      employeeCount = employeeCount.rows[0].count;

      for (let index = 0; index < allEmployees.length; index++) {
        if (allEmployees[index].role_id) {
          let role = await Role.findOne({
            id: allEmployees[index].role_id
          })
          allEmployees[index].role = role.name
        }
      }

      if (allEmployees) {
        res.json({
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
          deleted_at: null
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
      console.log(error)
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
        let employee = await Admin.find({
          id: emp_id
        })

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
      const {
        admin_id
      } = req.allParams();
      var requestData = req.body;
      var adminData = await Admin.findOne({
        id: admin_id,
        deleted_at: null,
        is_active: true
      });

      if (adminData != undefined) {
        var updateAdminData = await Admin.update({
          id: admin_id,
          deleted_at: null,
          is_active: true
        }).set({
          email: adminData.email,
          whitelist_ip: requestData.ip
        });

        return res.status(200).json({
          "status": 200,
          "message": sails.__("WhiteLsit IP Add Success"),
          "data": updateAdminData
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

  getAdminWhiteListIP: async function (req, res) {
    try {
      const {
        admin_id
      } = req.allParams();
      var adminData = await Admin.findOne({
        select: [
          'whitelist_ip'
        ],
        where: {
          id: admin_id,
          deleted_at: null,
          is_active: true
        }
      });

      if (adminData != undefined) {
        return res.status(200).json({
          "status": 200,
          "message": sails.__("WhiteLsit IP info Success"),
          "data": adminData
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

  deleteUser: async function (req, res) {
    try {
      let { user_id } = req.allParams();

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
  }
};
