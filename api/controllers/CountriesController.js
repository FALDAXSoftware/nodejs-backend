/**
 * CountriesController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
var fetch = require('node-fetch')
module.exports = {
    getCountries: async function(req, res) {
        let {page,limit,data}= req.allParams();
        console.log(page,limit);
        
        console.log(data)
        if(data){
            let countryData = await Countries.find({or:[{
                name: { contains: data }},
                {country_code: { contains: data } }
              ]}).sort('id ASC').paginate(page,limit);
            let CountriesCount = await Countries.count({or:[{
                name: { contains: data }},
                {country_code: { contains: data } }
              ]});
            if(countryData){
                return res.json({
                    "status": "200",
                    "message": "Country list",
                    "data": countryData,CountryCount:CountriesCount
            });
            }
        }else{
            let countryData = await Countries.find().sort('id ASC')
            .paginate({page, limit});
            let CountriesCount = await Countries.count();
            if(countryData){
                return res.json({
                    "status": "200",
                    "message": "Country list",
                    "data": countryData,CountryCount:CountriesCount
                });
            }
        }
    },
    countryActivate: async function(req,res){
        try{
        let {id, is_active}= req.body;
       
        let countriesData = await Countries.update({id:id}).set({ is_active:is_active}).fetch();

        if(countriesData && typeof countriesData==='object' && countriesData.length>0){
            return res.json({
                "status": "200",
                "message": "User Status Updated"
            });
        } else {
            throw "Country(id) not found."
        }
    }catch(e){
       return  res.json({
            "status": "500",
            "message": "error",
            "errors": e
        });
    }
    },



};

