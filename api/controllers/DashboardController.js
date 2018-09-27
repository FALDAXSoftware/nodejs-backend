/**
 * DashboardController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
    get: async function (req, res) {
      try{
        let userCount =await  Users.count({is_active:true});
        let coinCount = await Coins.count({is_active:true});
        return res.json({
            "status": "200",
            "message": "Dashboard Data",
             coinCount,userCount
        });
      }catch(e){
        console.log(e);
        return res.status(500).json({
          "message": "Error",
          "error":e
      });
      }
    }
  };

