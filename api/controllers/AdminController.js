/**
 * AdminController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
    create : async function (req ,res){
        try{
            if(req.body.email && req.body.password){
                let query = {
                    email : req.body.email,
                    password : req.body.password
                };

                var admin_details = await Admin.create(query).fetch();
                var token = await sails.helpers.jwtIssue(admin_details.id);
                if(admin_details){
                    res.json({
                        "status": "200",
                        "message": "listed",
                        "data": admin_details,
                        token
                    });
                    return;
                }else{
                    res.json({
                        "status": "400",
                        "message": "not listed",
                        "error" : "Something went wrong",
                    });
                    return;
                }
            }else{
                res.json({
                    "status": "400",
                    "message": "not listed",
                    "error" : "email or password is not sent",
                });
                return;
            }
        }catch(error){
            
            res.status(500).json({
                "status": "500",
                "message": "error",
                "errors": error
            });
            return;
        }
    },
    login : async function (req ,res){
        try{
            if(req.body.email && req.body.password){

                let query = {
                    email : req.body.email,
                    password : req.body.password
                }

                var user_detail = await Admin.findOne({ email: query.email });
                if(user_detail){
                    Admin.comparePassword(query.password, user_detail, async function (err, valid) {
                        if (err) {
                          return res.json(403, {err: 'forbidden'});
                        }

                        if (!valid) {
                          return res.json(401, {err: 'invalid email or password'});
                        } else {
                          delete user_detail.password;
                          var token = await sails.helpers.jwtIssue(user_detail.id);
                          res.json({
                            user: user_detail,
                            token
                          });
                        }
                    });
                }else{
                    res.json({
                        "status": "400",
                        "message": "not listed",
                        "error" : "invalid email or password",
                    });
                    return;
                }
            }else{
                res.json({
                    "status": "400",
                    "message": "not listed",
                    "error" : "email or password is not sent",
                });
                return;
            }
        }catch(error){
          console.log(error);
            res.json({
                "status": "500",
                "message": "error",
                "errors": error
            });
            return;
        }
    },
    update: async function(req, res){
        try {
            const admin_details = await Admin.findOne({ email: req.body.email, id: req.body.id });
            if (!admin_details) {
                return res.status(401).json({err: 'invalid email'});
            }
            var admin =req.body;            
            var updatedAdmin = await Admin.update({email: req.body.email }).set(user).fetch();
            delete updatedAdmin.password
            sails.log(updatedAdmin);

            return res.json({
                "status": "200",
                "message": "worked",
                "data": req.body
            });
                      
        } catch(error) {
            res.json({
                "status": "500",
                "message": "error",
                "errors": error
            });
            return;
        }
    }
};


