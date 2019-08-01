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
    // console.log('RWEQ LOG??????????????????????????', req);
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
            id : userData.id,
            user_type : 2
          };
          var check_whitelist_exists = await IPWhitelist.checkUserHasWhitelist( opts );
          console.log("userData.is_whitelist_ip",userData.is_whitelist_ip);
          console.log("check_whitelist_exists",check_whitelist_exists);
          if( userData.is_whitelist_ip == true && check_whitelist_exists  ){
            opts.ip = ip;
            var checkexist = await IPWhitelist.checkWhitelistValid(opts);
            if(checkexist == 2 ){
              next();
            }else if(checkexist == 1){
              return res
              .status(401)
              .json({
                "status": 401,
                "err": sails.__("Time for whitelist has been expired.")
              });
            }else{
              next();
            }
          }else{
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
