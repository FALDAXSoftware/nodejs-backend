/**
 * HTTP Server Settings
 * (sails.config.http)
 *
 * Configuration for the underlying HTTP server in Sails.
 * (for additional recommended settings, see `config/env/production.js`)
 *
 * For more information on configuration, check out:
 * https://sailsjs.com/config/http
 */

module.exports.http = {

  /****************************************************************************
   *                                                                           *
   * Sails/Express middleware to run for every HTTP request.                   *
   * (Only applies to HTTP requests -- not virtual WebSocket requests.)        *
   *                                                                           *
   * https://sailsjs.com/documentation/concepts/middleware                     *
   *                                                                           *
   ****************************************************************************/

  middleware: {

    /***************************************************************************
     *                                                                          *
     * The order in which middleware should be run for HTTP requests.           *
     * (This Sails app's routes are handled by the "router" middleware below.)  *
     *                                                                          *
     ***************************************************************************/

    order: [
      'cookieParser',
      'session',
      'requestLogger',
      'myRequestLogger',      
      'bodyParser',
      'compress',
      'poweredBy',
      'router',
      'www',
      'favicon'
    ],


    /***************************************************************************
     *                                                                          *
     * The body parser that will handle incoming multipart HTTP requests.       *
     *                                                                          *
     * https://sailsjs.com/config/http#?customizing-the-body-parser             *
     *                                                                          *
     ***************************************************************************/

    bodyParser: (function _configureBodyParser() {
      var skipper = require('skipper');
      var middlewareFn = skipper({
        strict: true,
        limit: '50mb',
        maxTimeToBuffer: 3000
      });
      return middlewareFn;
    })(),
    // Logs each request to the console
    requestLogger: function (req, res, next) {
      // console.log("Requested :: ", req.method, req.url);
      if( req.method == 'OPTIONS' ){
        return next();
      }
      
      var logger = require('../api/controllers/logger')
      var object={
        module: "Request",  
        url: req.url,
        type: "Success"
      };
      if( req.user && req.user.id ){
        object.user_id = req.user.id;
      }
      // console.log("object",object);
      logger.info(object, "Request success")
      // sails.log.verbose(req.method, req.url); 
      return next();
    },
    myRequestLogger: function (req, res, next) {
      res.on("finish", function(each){
        // console.log("ResData",res);
        
        sails.log("statusCode",res.statusCode);
        var logger = require('../api/controllers/logger')
        var object={
          module: "Response",  
          url: req.url,
          type: "Error",
          statusCode:res.statusCode
        };        
        if( res.statusCode == 200 ){
          object.type = 'Success';
        }
        if( req.user && req.user.id ){
          object.user_id = req.user.id;
        }
        // console.log("object",object);
        logger.info(object, "Response success");
     });
     return next();
    }    
  },  
}; //, maxTimeToBuffer: 120000,
