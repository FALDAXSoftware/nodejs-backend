/**
 * EmailTemplatesController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {

    //---------------------------Web Api------------------------------
    
    
    
    
    
    
    
    
    
        //-------------------------------CMS Api--------------------------
        getEmailTemplate: async function(req, res) {
          let {page,limit}= req.allParams();
          let emailTemplateData = await EmailTemplates.find({is_active:true}).paginate({page, limit});
      
          if(emailTemplateData){
              return res.json({
                  "status": "200",
                  "message": "Coin list",
                  "data": emailTemplateData
              });
          }
        },
        create: async function(req, res) {
          try{        
              if(req.body.title && req.body.name && req.body.content){
                  var email_template_details = await EmailTemplates.create({ 
                      name : req.body.name,
                      slug:req.body.name.split(' ').join('_'),
                      content: req.body.content,
                      title: req.body.title,
                      created_at: new Date()
                  }).fetch();
                  if(email_template_details){
                      //Send verification email in before create
                      res.json({
                          "status": 200,
                          "message": "Email template created successfully."
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
                      "error" : "Email templateId  is not sent",
                  });
                  return;
              }
          }catch(error){
              console.log("err",error)
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
                  const email_template_details = await EmailTemplates.findOne({ id: req.body.static_id });
                  if (!email_template_details) {
                      return res.status(401).json({err: 'invalid Static Id'});
                  }
                  var updateStatic = await EmailTemplates.update({ id : req.body.static_id }).set(req.body).fetch();
                  if(!updateStatic) {
                      return res.json({
                          "status": "200",
                          "message": "Something went wrong! could not able to update static page details"
                      });
                  }
                  
                  return res.json({
                      "status": "200",
                      "message": "Email template details updated successfully"
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
                  "message": "email template id is not sent"
              });
              return;
          }
          let emailTemplateData = await EmailTemplates.update({id: id}).set({is_active: false}).fetch();
          if(emailTemplateData){
              return res.status(200).json({
                  "status": 200,
                  "message": "Email template deleted successfully"
              });
          }
        } 
        
      
      };

