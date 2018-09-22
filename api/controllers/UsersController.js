/**
 * UserController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
    create : async function (req ,res){
        try{
            if(req.body.email && req.body.password){
                let query = {
                    id: 2,
                    email : req.body.email,
                    password : req.body.password
                };
                var user_detail = await Users.create(query).fetch();
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
            const user_details = await Users.findOne({ email: req.body.email, id: req.body.id });
            if (!user_details) {
                return res.status(401).json({err: 'invalid email'});
            }

            var updatedUsers = await Users.update({ id : req.body.id, email: req.body.email }).set(req.body).fetch();
            sails.log(updatedUsers);

            res.json({
                "status": "200",
                "message": "worked",
                "data": req.body
            });
            return;          
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
  