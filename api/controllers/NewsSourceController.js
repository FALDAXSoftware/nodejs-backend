/**
 * UserLimitController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
    // ---------------------------Web Api------------------------------
    // -------------------------------CMS Api--------------------------
    getAllActiveNewsSource: async function (req, res) {
      // req.setLocale('en')
      
      let newsSourceData = await NewsSource.find({deleted_at : null, is_active : true})

      if (newsSourceData.length > 0) {
        return res.json({
          "status": 200,
          "message": sails.__("New Source list success"),
          "data": newsSourceData
        });
      } else {
        return res.json({
          "status": 500,
          "message": sails.__("No News Source List")
        });
      }
    },

    updateNewsSourceStatus : async function(req,res){
        try{

            let {id,status} = req.body;
            
            if(id || id !== null || id !== undefined){
                var newSourceDaa = await NewsSource.findOne({deleted_at: null, id: id});

                if(!newSourceDaa || newSourceDaa === null || newSourceDaa === undefined){
                return res.json({status: 500 , "message":sails.__("No source found")})                    
                }else{
                    var updatedNewSourceData = await NewsSource
                        .update({id:id})
                        .set({is_active : status})
                        .fetch();

                    if(!updatedNewSourceData){
                        return res.json({status: 500 , "message":sails.__("New Source update fail.")})                        
                    }else{
                        return res.status(200).json({status:200,"message":sails.__("News Source update success"),data:updatedNewSourceData})
                    }
                }
            }else{
                return res.json({status: 500 , "message":sails.__("No news source found")})
            }

        }catch(err){
            console.log("err");
            return res.json({
                "status": 500,
                "message": sails.__("Something Wrong")
              });
            
        }
    }
  };
  