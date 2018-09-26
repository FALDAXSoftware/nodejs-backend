/**
 * UserController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
var uuidv1 = require('uuid/v1');
var UploadFiles = require('../services/UploadFiles');
var bcrypt = require('bcrypt');

module.exports = {


    //------------------Web APi------------------------------------------------//
    create : async function (req ,res){
        try{
            var user = req.body;
            var referred_id=null;
            if(req.body.referral_code){
               var referredUser = await  Users.findOne({referral_code:req.body.referral_code});
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
                    referral_code: uuidv1(),
                    created_at: new Date(),
                    referred_id: referred_id
                }).fetch();
                if(user_detail){
                    //Send verification email in before create
                    res.json({
                        "status": 200,
                        "message": "Sign up successfully."
                    });
                    return;
                }else{
                    res.json({
                        "status": 400,
                        "message": "not listed",
                        "error" : "Something went wrong",
                    });
                    return;
                }
            }else{
                res.json({
                    "status": 400,
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
    },
    changePassword: async function(req, res) {
        try {
            if(!req.body.email || !req.body.current_password || !req.body.new_password || !req.body.confirm_password){
                return res.status(401).json({err: 'Please provide email, current password, new password, confirm password'});
            }
            if(req.body.new_password !== req.body.confirm_password) {
                return res.status(401).json({err: 'New and confirm password should match'});
            }
            if(req.body.current_password === req.body.new_password) {
                return res.status(401).json({err: 'Current and new password should not be match'});
            }
            
            const user_details = await Users.findOne({ email: req.body.email });
            if (!user_details) {
                return res.status(401).json({err: 'Email address not found'});
            }
            let compareCurrent = await bcrypt.compare( req.body.current_password,user_details.password);
            if(!compareCurrent){
                return res.status(401).json({err: "Current password mismatch"});
            }
            
            var updatedUsers = await Users.update({ email: req.body.email }).set({ email: req.body.email, password: req.body.new_password }).fetch();

            if(updatedUsers) {
                return res.json({
                    "status": "200",
                    "message": "Password changed successfully",
                    "data": updatedUsers
                });
            } else {
                return res.status(401).json({err: 'Something went wrong! Could not able to update the password'});
            }
        } catch(error) {
            res.json({
                "status": "500",
                "message": "error",
                "errors": error
            });
            return;
        }
    },
    getUserReferral: async function(req,res){
        let id = req.user.id;
        let usersData = await Users.find({id:id});

        if(usersData){
            return res.json({
                "status": "200",
                "message": "Users Data",
                "data": usersData
            });
        }
    },
    getReferred : async function(req,res){
        let id = req.user.id;
        let usersData = await Users.find({ select: ['email'], where: { referred_id: id } });

        if(usersData){
            return res.json({
                "status": "200",
                "message": "User referred Data",
                "data": usersData
            });
        }
    },

    //------------------CMS APi------------------------------------------------//


    getUserPaginate: async function(req,res){
        let {page,limit}= req.allParams();
        let usersData = await Users.find().paginate({page, limit});

        if(usersData){
            return res.json({
                "status": "200",
                "message": "Users list",
                "data": usersData
            });
        }
    },
    userActivate: async function(req,res){
        let {user_id,activate}= req.body;
        let usersData = await Users.update({id:user_id}).set({is_active:activate});

        if(usersData){
            return res.json({
                "status": "200",
                "message": "User Status Updated"
            });
        }
    }


};
  