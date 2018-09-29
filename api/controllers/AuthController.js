/**
 * AuthController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
var randomize = require('randomatic');

module.exports = {
  login : async function (req ,res) {
    try{
      if(req.body.email && req.body.password){
        let query = {
          email : req.body.email,
          password : req.body.password
        }
        if(req.body.email_verify_token && req.body.email_verify_token === user_detailemail_verify_token){
           await  Users.update({ email: query.email}).set({is_verified:true});
          }
        var user_detail = await Users.findOne({ email: query.email });
          if(!user_detail.is_active){
            return res.json({
                "status": "400",
                "message": "not listed",
                "error" : "Activatie your account for logging in.",
            });
          }
        
        if(user_detail){
            Users.comparePassword(query.password, user_detail, async function (err, valid) {
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
            homelink:"http://192.168.0.85:3000",
            recipientName: user_details.name,
            token:'http://192.168.0.85:3000/reset-password?reset_token='+reset_token,
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

