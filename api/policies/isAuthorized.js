/**
 * isAuthorized
 *
 * @description :: Policy to check if user is authorized with JSON web token
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Policies
 */

var requestIp = require('request-ip');

module.exports = async function (req, res, next) {

  var token;

  try {
    if (req.isSocket) {
      if (req.headers && req.headers.authorization) {
        var parts = req
          .headers
          .authorization
          .split(' ');
        if (parts.length == 2) {
          var scheme = parts[0],
            credentials = parts[1];
          if (credentials != "undefined" && /^Bearer$/i.test(scheme)) {
            token = credentials;
            var verifyData = await sails
              .helpers
              .jwtVerify(token);
            if (verifyData) {
              req.user = verifyData;          
            }        
          }
                    
        }
        
      }
      // Logger for Socket
      var generate_unique_string = Math.random().toString(36).substring(2, 16) + "-" + Math.random().toString(36).substring(2, 16).toUpperCase() + "-" + Math.random().toString(36).substring(2, 16).toUpperCase() + "-" + Math.random().toString(36).substring(2, 16).toUpperCase();
      req.headers['Logid'] = generate_unique_string;
      var logger = require('../controllers/logger')
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
      logger.info(object, "Socket Request success");

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
        var message = 'Response message';
        // console.log("body",body);
        if( (body != "_sailsIoJSConnect();" && body != '') && JSON.parse(body).status ){
          if( JSON.parse(body).message ){
            message = JSON.parse(body).message  
          }
          if( JSON.parse(body).err ){
            message = JSON.parse(body).err  
          }
        }
        var response = body;
        var object = {
          module: "Response",
          url: req.url,
          type: "Error",
          statusCode: res.statusCode,
          // responseData:JSON.stringify(response),
          log_id: req.headers['Logid']
        };
        
        if( res.statusCode != 200 && res.statusCode >= 201 ){
          object.responseData = (body);
        }
        if (req.user && req.user.id) {
          object.user_id = "user_" + req.user.id;
        }
        if (res.statusCode == 200) {
          object.type = 'Success';
          if (req.url == '/login') {
            object.user_id = "user_" + JSON.parse(body).user.id;
          }
          logger.info(object, message);
        }else{
          logger.error(object, message);
        }
        
      };
      // Logger ends
    }
    if (req.headers && req.headers.authorization) {
      var parts = req
        .headers
        .authorization
        .split(' ');
      if (parts.length == 2) {
        var scheme = parts[0],
          credentials = parts[1];

        if (/^Bearer$/i.test(scheme)) {
          token = credentials;
        }
      } else {
        return res
          .status(403)
          .json({
            status: 403,
            err: 'Invalid Authorization token'
          });
      }
    } else if (req.param('token')) {
      token = req.param('token');
      // We delete the token from param to not mess with blueprints
      delete req.query.token;
    } else if (req.isSocket) {      
      if (req.socket.handshake.headers.authorization) {
        var parts = req
          .socket
          .handshake
          .headers
          .authorization
          .split(' ');
        if (parts.length == 2) {
          var scheme = parts[0],
            credentials = parts[1];

          if (/^Bearer$/i.test(scheme)) {
            token = credentials;
          }
        } else {
          return res
            .status(403)
            .json({
              status: 403,
              err: 'Invalid Authorization token'
            });
        }
      } else {
        return res
          .status(401)
          .json({
            status: 401,
            err: 'No Authorization header was found'
          });
      }
    } else {
      return res
        .status(401)
        .json({
          status: 401,
          err: 'No Authorization header was found'
        });
    }

    var verifyData = await sails
      .helpers
      .jwtVerify(token);
    if (verifyData) {
      req.user = verifyData;
      var userData = await Users.findOne({
        id: req.user.id
      });
      if (userData != undefined && userData.isAdmin != true) {

        if (userData.deleted_at == null) {
          next();
        } else if (userData.deleted_at != null) {
          return res
            .status(403)
            .json({
              status: 403,
              err: 'Your User has been deleted.'
            });
        } else {
          var ip = requestIp.getClientIp(req); // on localhost > 127.0.0.1
          // var ip = clientIp;
          // if (req.headers['x-forwarded-for']) {
          //   ip = req
          //     .headers['x-forwarded-for']
          //     .split(",")[0];
          // } else if (req.connection && req.connection.remoteAddress) {
          //   ip = req.connection.remoteAddress;
          // } else {
          //   ip = req.ip;
          // }
          // Check if IP's session is not timeout
          var opts = {
            id: userData.id,
            user_type: 2
          };
          var check_whitelist_exists = await IPWhitelist.checkUserHasWhitelist(opts);
          if (userData.is_whitelist_ip == true && check_whitelist_exists) {
            opts.ip = ip;
            var checkexist = await IPWhitelist.checkWhitelistValid(opts);
            if (checkexist == 2) {
              next();
            } else if (checkexist == 1) {
              return res
                .status(401)
                .json({
                  "status": 401,
                  "err": sails.__("Time for whitelist has been expired.")
                });
            } else {
              next();
            }
          } else {
            next();
          }


          // if (userData.whitelist_ip.indexOf(ip) > -1) {
          //   next();
          // } else {
          //   return res
          //     .status(403)
          //     .json({
          //       status: 403,
          //       err: 'Your IP has not been whitelisted. Please whitelist your IP to continue.'
          //     });
          // }
        }
      } else {
        next();
      }
    }
  } catch (error) {
    console.log(error)
    return res
      .status(403)
      .json({
        status: 403,
        err: 'Your session has been expired. Please Login again to continue.'
      });
  }
};
