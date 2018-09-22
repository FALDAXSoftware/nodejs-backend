/**
 * AuthController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
    index: function (req, res) {
      var email = req.param('email');
      var password = req.param('password');
      console.log(req.body, email, password);
      
      if (!email || !password) {
        console.log('wrong');
        return res.status(401).json({err: 'email and password required'});
      }
  
      Users.findOne({email: email}, function (err, user) {
        if (!user) {
          return res.status(401).json({err: 'invalid email or password'});
        }
        console.log('FOUND : ' + user);



        // comparePassword : function (password, user, cb) {
        //     bcrypt.compare(password, user.encryptedPassword, function (err, match) {
        //       if(err) cb(err);
        //       if(match) {
        //         cb(null, true);
        //       } else {
        //         cb(err);
        //       }
        //     })
        //   }

        Users.comparePassword(password, user, function (err, valid) {
          if (err) {
            return res.status(403).json({err: 'forbidden'});
          }
          console.log(valid);
  
          if (!valid) {
            return res.status(401).json({err: 'invalid email or password'});
          } else {
            res.status(200).json({
              user: user,
            });
          }
        });
      })
    },
    login : async function (req ,res){
        console.log("InLogin");
        // console.log(req.body);

        try{
            if(req.body.email && req.body.password){

                let query = {
                    email : req.body.email,
                    password : req.body.password
                }

                var user_detail = await Users.findOne({ email: query.email });
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
    }
  };

