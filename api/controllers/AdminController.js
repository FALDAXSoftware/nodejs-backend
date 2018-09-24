/**
 * AdminController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
    login : async function (req ,res) {
        try{
          if(req.body.email && req.body.password){
            let query = {
                email : req.body.email,
                password : req.body.password
               
            }
            var admin_details = await Admin.findOne({ email: query.email });
            if(admin_details){
                Admin.comparePassword(query.password, admin_details, async function (err, valid) {
                    if (err) {
                      return res.json(403, {err: 'forbidden'});
                    }
    
                    if (!valid) {
                      return res.json(401, {err: 'invalid email or password'});
                    } else {
                      delete admin_details.password;
                      var token = await sails.helpers.jwtIssue(admin_details.id);
                      res.json({
                        user: admin_details,
                        token
                      });
                    }
                });
            }else{updated_at
                res.json({
                    "status": "400",
                    "message": "not listed",
                    "error" : "invalid email or phone number or password",
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
          res.json({
              "status": "500",
              "message": "error",
              "errors": error
          });
          return;
        }
    },
    create : async function (req ,res){
        try{
            if(req.body.email && req.body.password){
                var user_detail = await Admin.create({ 
                    email : req.body.email,
                    password: req.body.password
                }).fetch();
                var token = await sails.helpers.jwtIssue(user_detail.id);
                if(user_detail){
                    res.json({
                        "status": "200",
                        "message": "listed",
                        "data": user_detail,
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
    update: async function(req, res){
        try {
            const user_details = await Admin.findOne({ email: req.body.email, id: req.body.id });
            if (!user_details) {
                return res.status(401).json({err: 'invalid email'});
            }
            var user =req.body;
            delete user.profile;
            var updatedUsers = await Admin.update({ email: req.body.email }).set(user).fetch();
            delete updatedUsers.password
            sails.log(updatedUsers);

            return res.json({
                "status": "200",
                "message": "User details updated successfully"
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