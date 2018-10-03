/**
 * SubscribeController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
    senEmailSubscribtion:async  function(req,res){
        console.log(req.body)
        try{
            let obj={
                email:req.body.email,
                is_news_feed:true,
                created_at: new Date()
            }
            let getData= await  Subscribe.find({email:req.body.email});
            if(getData.length>0){
                throw("You have subscribed to news feeds already.")
            }
            let add = await Subscribe.create(obj).fetch();

            sails.hooks.email.send(
                "subscribe",
                {
                  homelink:"http://18.191.87.133:8089",
                  recipientName: req.body.email,
                  senderName: "Faldax"
                },
                {
                  to: req.body.email,
                  subject: "Subscription"
                },
                function(err) {console.log(err || "It worked!");
                    if(!err){
                        return res.json({
                            "status": "200",
                            "message": "Verification link sent to email successfully"
                        });
                    }
                    throw(err)
                }
              )
        }catch(e){
            return res.status(500).json({
                "status": "500",
                "message": "Error in adding subscription",
                "error":e
            });
        }
        
    }

};

