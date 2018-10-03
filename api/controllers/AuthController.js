/**
 * AuthController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
var randomize = require('randomatic');
var speakeasy = require('speakeasy');

module.exports = {

// Login User
  login : async function (req ,res) {
    try{
      if(req.body.email && req.body.password){
        let query = {
          email : req.body.email,
          password : req.body.password
        }
        if(req.body.email_verify_token && req.body.email_verify_token === req.body.email_verify_token){
           await  Users.update({ email: query.email}).set({email: query.email,is_verified:true});
          }
        var user_detail = await Users.findOne({ email: query.email });

        
        if(user_detail){
            // console.log(user_detail);
            if(user_detail.is_verified == false){
                return res.json(403,{
                    "status": "403",
                    "err" : "Activatie your account for logging in.",
                });
            }
            if (user_detail.is_active == false) {
                return res.json(403,{
                    "status": "403",
                    "err" : "Contact the admin to activate your account.",
                });
            }
            Users.comparePassword(query.password, user_detail, async function (err, valid) {
                if (err) {
                  return res.json(403, {err: 'Forbidden'});
                }

                if (!valid) {
                  return res.json(401, {err: 'invalid email or password'});
                } else {
                  if (user_detail.is_twofactor && user_detail.twofactor_secret) {
                    if (!req.body.otp) {
                    return res.json(201,{
                        err:'Please enter otp to continue'
                    });
                    }
                    let verified = speakeasy.totp.verify({
                        secret: user_detail.twofactor_secret, 
                        encoding: 'base32',
                        token: req.body.otp
                    });
                    if(!verified){
                        return res.json(401, {err: 'invalid otp'});
                    }
                    
                  }


                  delete user_detail.password;
                    // Login History Save
                  await LoginHistory.create({
                      user:user_detail.id,
                      ip:req.ip,
                      created_at: new Date()
                  });  
                  var token = await sails.helpers.jwtIssue(user_detail.id);
                  return res.json({
                    status:"200",
                    user: user_detail,
                    token,
                    message:"Login successfull."
                  });
                }
            });
        }else{
            res.json(401,{
                "status": "401",
                "err" : "invalid email or password",
            });
            return;
        }
      }else{
        res.json(401,{
            "status": "401",
            "err" : "email or password is not sent",
        });
        return;
      }
    }catch(error){
        console.log("dsfsfsd",error)

      res.json({
          "status": "500",
          "err": error
      });
      return;
    }
  },    
  
//   Send auth code in email
  sendOtpEmail:async function (req,res) {
    let {email} = req.allParams();
    let user =await Users.findOne({email:email});
    if (!user) {
       return res.json(401,{
           err:"Invalid Email Address"
       }); 
    }
    if(!user.is_verified){
        return res.json(403,{
            "err" : "Activatie your account for logging in.",
        });
    }
    if (!user.is_active) {
        return res.json(403,{
            "err" : "Contact the admin to activate your account.",
        });
    }
    user = await Users.update({id:user.id}).set({
        email:user.email,
        authCode:randomize('Aa0', 6)
    }).meta({fetch:true});
    console.log("=>",user.email);
    
    // send code in email
    sails.hooks.email.send(
        "verificationCode",
        {
          homelink:"http://18.191.87.133:8089",
          recipientName: user.first_name,
          code:user.authCode,
          senderName: "Faldax"
        },
        {
          to: user.email,
          subject: "Authentication Code"
        },
        function(err) {
            if(!err){
                return res.json({
                    "status": "200",
                    "message": "Authentication code sent to email successfully"
                });
            }else{
                console.log(err);
                
                return res.status(500).json({
                    "err": err
                });
            }
        }
      )
  },

  resetPassword : async function(req,res){
    try{
        var reset_token = req.body.reset_token;

        let user_details = await Users.findOne({reset_token});
        if(!user_details){
            throw "Wrong Reset token doesnot exist."
        }
        let updateUsers =await Users.update({email:user_details.email}).set({email:user_details.email,password:req.body.password,reset_token:null}).fetch();
        if(updateUsers){
            return res.json({
                "status": "200",
                "message": "Password updated Successfully"
            });
        }else{
            throw "Update password Error"
        }
    }catch(e){
        return  res.json({
            "status": "500",
            "message": "error",
            "errors": e
        });
        
    }
  },
  forgotPassword: async function(req, res){
    try {
      const user_details = await Users.findOne({ email: req.body.email });
      if (!user_details) {
          return res.status(401).json({err: 'invalid email'});
      }
      let reset_token = randomize('Aa0', 10);
      let new_user={
          email: req.body.email,
          reset_token:reset_token
      }
      var updatedUser = await Users.update({ email: req.body.email }).set(new_user).fetch();
    
      sails.hooks.email.send(
          "forgotPassword",
          {
            homelink:"http://18.191.87.133:8085",
            recipientName: user_details.name,
            token:'http://18.191.87.133:8085/reset-password?reset_token='+reset_token,
            senderName: "Faldax"
          },
          {
            to: user_details.email,
            subject: "Forgot Password"
          },
          function(err) {console.log(err || "It worked!");
              if(!err){
                  return res.json({
                      "status": "200",
                      "message": "Reset link sent to email successfully"
                  });
              }
          }
        )
      sails.log(updatedUser);
                
      } catch(error) {
         console.log(error)
        res.json({
            "status": "500",
            "message": "error",
            "errors": error
        });
        return;
      }
    }
};

