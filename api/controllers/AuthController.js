/**
 * AuthController
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
          password : req.body.password,
          phone_number : req.body.phone_number
        }
        var user_detail = await Users.findOne({ email: query.email, phone_number: query.phone_number });
        
        
        if(user_detail){
            Users.comparePassword(query.password, user_detail, async function (err, valid) {
                if (err) {
                  return res.json(403, {err: 'forbidden'});
                }

                if (!valid) {
                  return res.json(401, {err: 'invalid email or password'});
                } else {
                  if(req.body.email_verify_token && req.body.email_verify_token === user_detailemail_verify_token){
                    Users.update({ email: query.email, phone_number: query.phone_number }).set({is_verified:true});
                  }
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
  }
};

