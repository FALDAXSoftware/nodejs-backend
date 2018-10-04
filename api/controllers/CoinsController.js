/**
 * CoinsController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
    //---------------------------Web Api------------------------------









    //-------------------------------CMS Api--------------------------
  getCoins: async function(req, res) {
    // req.setLocale('en')
    let {page,limit,data}= req.allParams();
    if(data){
        let coinsData = await Coins.find({or:[{
            coin_name: { contains: data }},
            {coin_code: { contains: data } }
          ]}).sort("id ASC").paginate(page,parseInt(limit));
        let CoinsCount = await Coins.count({or:[{
            coin_name: { contains: data }},
            {coin_code: { contains: data } }
          ]});
          if(coinsData){
            return res.json({
                "status": "200",
                "message": sails.__("Coin list"),
                "data": coinsData,CoinsCount
            });
        }
    }else{
        
            let coinsData = await Coins.find().sort("id ASC").paginate(page, parseInt(limit));
            let CoinsCount = await Coins.count();
            if(coinsData){
            return res.json({
                "status": "200",
                "message": sails.__("Coin list"),
                "data": coinsData,CoinsCount
            });
        }
    }
    
    
  },
  create: async function(req, res) {
    try{        
        if(req.body.coin_name && req.body.coin_code && req.body.limit && req.body.wallet_address){
            var coins_detail = await Coins.create({ 
                coin_name : req.body.coin_name,
                coin_code: req.body.coin_code,
                limit: req.body.limit,
                wallet_address: req.body.wallet_address,
                created_at: new Date()
            }).fetch();
            if(coins_detail){
                //Send verification email in before create
                res.json({
                    "status": 200,
                    "message": "Coin created successfully."
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
                "error" : "coin id is not sent",
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
            const coin_details = await Coins.findOne({ id: req.body.coin_id });
            if (!coin_details) {
                return res.status(401).json({err: 'invalid coin'});
            }
            var coinData={
                id:req.body.coin_id,...req.body
            }
            var updatedCoin = await Coins.update({ id : req.body.coin_id }).set(req.body).fetch();
            if(!updatedCoin) {
                return res.json({
                    "status": "200",
                    "message": "Something went wrong! could not able to update coin details"
                });
            }
            
            return res.json({
                "status": "200",
                "message": "Coin details updated successfully"
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
  delete: async function(req, res) {
    let {id}= req.allParams();
    if(!id) {
        res.json({
            "status": 500,
            "message": "Coin id is not sent"
        });
        return;
    }
    let coinData = await Coins.update({id: id}).set({is_active: false}).fetch();
    if(coinData){
        return res.status(200).json({
            "status": 200,
            "message": "Coin deleted successfully"
        });
    }
  },

};

