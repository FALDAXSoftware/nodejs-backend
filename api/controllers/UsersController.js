/**
 * UserController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
var uuidv1 = require('uuid/v1');
var UploadFiles = require('../services/UploadFiles')
module.exports = {
    create : async function (req ,res){
        try{
            var user = req.body;
            var referred_id="";
            if(req.body.referral_code){
               var referredUser = await  User.findOne({referral_id:req.body.referral_code});
               if(!referredUser) {
                return res.status(500).json({
                    success: false,
                    message: 'Invalid refferal code'
                });
               } else {
                referred_id= referredUser.id;
               }
            }
            
            if(req.body.email && req.body.password && req.body.phone_number){
                var user_detail = await Users.create({ 
                    email : req.body.email,
                    password: req.body.password,
                    phone_number: req.body.phone_number,
                    referral_code:uuidv1(),
                    created_at: new Date(),
                    referred_id:referred_id
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
                    "error" : "email or password or phone_number is not sent",
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
            const user_details = await Users.findOne({ email: req.body.email, id: req.body.id });
            if (!user_details) {
                return res.status(401).json({err: 'invalid email'});
            }
            var user =req.body;
            delete user.profile;
            req.file('profile').upload(async function(err, uploadedFiles) {
                let filename = uploadedFiles[0].filename;
                var name = filename.substring(filename.indexOf("."));
                let timestamp = new Date()
                    .getTime()
                    .toString();
                let resourceImageName = timestamp;
                var uploadFileName = timestamp+name;
                var uploadProfile =await  UploadFiles.upload(uploadedFiles[0].fd, 'faldax', uploadFileName);                
                user.profile_pic = 'faldax/profile/' + uploadFileName
                var updatedUsers = await Users.update({ id : req.body.id, email: req.body.email }).set(user).fetch();
                delete updatedUsers.password
                sails.log(updatedUsers);
            
            });
            
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
  