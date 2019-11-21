const request = require('request');
var http = require("http");
// var rp = require('request-promise');
module.exports = {
  friendlyName: 'Simplex Backend Call',
  description: '',
  inputs: {
    value_object: {
      type: 'json',
      example: '{}',
      description: 'JSON object for which the value needs to be obtained'
    },
  },


  exits: {

    success: {
      outputFriendlyName: 'Simplex API Call from Backend',
    },

  },


  fn: async function (inputs, exits) {

    try {
      var req_body = inputs.value_object;
      await request({
        // url: sails.config.local.SIMPLEX_BACKEND_URL+"/users/get/"+req_body.id,
        url: sails.config.local.SIMPLEX_BACKEND_URL+"/test",
        method: "get",
        // headers: {
        //   // 'cache-control': 'no-cache',
        //   // Authorization: `Bearer ${sails.config.local.BITGO_ACCESS_TOKEN}`,
        //   // 'Content-Type': 'application/json'
        // },
        // body: {
        //   symbol: inputs.symbol
        // },
        // json: true
      },function (err, httpResponse, body) {
        
        if (err) {
          return exits.error(err);
        }
        if (body.error) {
          return exits.error(body);
        }
        console.log("body",body);
        return exits.success(body);
        // return body;
      });
      // var ss = await request.get(sails.config.local.SIMPLEX_BACKEND_URL+"/users/get/"+req_body.id);
      // var promise1 = new Promise(async function(resolve, reject) {
      //   resolve( await request.get(sails.config.local.SIMPLEX_BACKEND_URL+"/users/get/"+req_body.id), {
      //         'Content-Type': 'application/json'
      //       } );
      // });
      // console.log("promise1",promise1);
      
      // promise1.then( function(body){
      //   // if (err) {
      //   //   return exits.error(err);
      //   // }
      //   // console.log("body.error",body.error);
      //   if (body.error) {
      //     return exits.error(body);
      //   }
      //   // console.log("body",body);
      //   return exits.success(body);
      // }).catch( function(err){
      //   console.log("err",err);
      // })
    //   var options = {
    //     uri: 'https://api.github.com/user/repos',
    //     qs: {
    //         access_token: 'xxxxx xxxxx' // -> uri + '?access_token=xxxxx%20xxxxx'
    //     },
    //     headers: {
    //         'User-Agent': 'Request-Promise'
    //     },
    //     json: true // Automatically parses the JSON string in the response
    // };
          
      // rp((sails.config.local.SIMPLEX_BACKEND_URL+"/users/get/"+req_body.id))
      //   .then(function (htmlString) {
      //       // Process html...
      //       console.log("htmlString",htmlString);
      //       // var res = req_body.res;
      //       // return res
      //       //   // .status(200)
      //       //   .json( JSON.parse(htmlString))
      //       return (JSON.parse(htmlString));
      //   })
      //   .catch(function (err) {
      //       // Crawling failed...
      //       console.log("err",err);
      //   });

      // var options = {
      //     host : 'localhost',
      //     port:3000,
      //     path : '/api/v1'+"/users/get/"+req_body.id,
      //     method : 'GET'
      // }
      // var maybe = '';
      // console.log('till here')
      // var req = await http.request(options, function(res){
      //     var body = "";
      //     res.on('data', function(data) {
      //         console.log('data came');
      //         body += data;
      //     });
      //     res.on('end', function() {
      //         console.log('ended too');
      //         maybe = JSON.parse(body);
      //         console.log(maybe.city);
      //         // response.send(maybe);
      //         return exits.success(maybe);
      //     });
      // });
      // console.log('here too man');
      // req.on('error', function(e) {
      //     console.log('Problem with request: ' + e.message);
      // });
    } catch (error) {
      console.log("error", error);
      await logger.error(error.message);
      return exits.error(error)
    }
  }


};
