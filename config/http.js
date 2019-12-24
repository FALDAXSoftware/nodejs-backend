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
      'bodyParser',
      'requestLogger',
      'responseLogger',
      'compress',
      'poweredBy',
      'router',
      'www',
      'favicon',
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
    // Logs each request to Graylog
    requestLogger: function (req, res, next) {
      if (req.method == 'OPTIONS') {
        return next();
      }
      var generate_unique_string = Math.random().toString(36).substring(2, 16) + "-" + Math.random().toString(36).substring(2, 16).toUpperCase() + "-" + Math.random().toString(36).substring(2, 16).toUpperCase() + "-" + Math.random().toString(36).substring(2, 16).toUpperCase();
      req.headers['Logid'] = generate_unique_string;
      var logger = require('../api/controllers/logger')
      var object = {
        module: "Request",
        url: req.url,
        type: "Success",
        log_id: req.headers['Logid']
      };
      if (req.user && req.user.id) {
        object.user_id = "user_" + req.user.id;
      }
      if (req.body) {
        // object.body = JSON.stringify(req.body);
      }
      if (req.query) {
        object.params = req.query;
      }

      logger.info(object, "Request success");
      return next();
    },
    // Logs each response to Graylog
    responseLogger: function (req, res, next) {
      if (req.method == 'OPTIONS') {
        return next();
      }

      var logger = require('../api/controllers/logger');
      var oldWrite = res.write,
        oldEnd = res.end;
      var chunks = [];
      res.write = function (chunk) {
        chunks.push(chunk);
        oldWrite.apply(res, arguments);
      };
      var body;
      res.end = function (chunk) {
        if (chunk) chunks.push(chunk);
        body = Buffer.concat(chunks).toString('utf8');
        oldEnd.apply(res, arguments);
        var response = JSON.parse(body);
        var object = {
          module: "Response",
          url: req.url,
          type: "Error",
          statusCode: res.statusCode,
          // responseData:JSON.stringify(response),
          log_id: req.headers['Logid']
        };
        if (res.statusCode == 200) {
          object.type = 'Success';
          if (req.url == '/login') {
            object.user_id = "user_" + response.user.id;
          }
        }
        if( res.statusCode != 200 && res.statusCode >= 201 ){
          object.responseData = JSON.stringify(response);
        }
        if (req.user && req.user.id) {
          object.user_id = "user_" + req.user.id;
        }
        logger.info(object, response.message);
      };
      return next();
    }
  },
}; //, maxTimeToBuffer: 120000,
