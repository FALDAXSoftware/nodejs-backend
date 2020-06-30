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
    console.log(req.headers)
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
      var ip = requestIp.getClientIp(req);
      var generate_unique_string = Math.random().toString(36).substring(2, 16) + "-" + Math.random().toString(36).substring(2, 16).toUpperCase() + "-" + Math.random().toString(36).substring(2, 16).toUpperCase() + "-" + Math.random().toString(36).substring(2, 16).toUpperCase() + "-" + (new Date().valueOf());
      req.headers['Logid'] = generate_unique_string;
      req.headers['ip_address'] = ip;
      var logger = require('../controllers/logger')
      var object = {
        module: "Request",
        url: req.url,
        type: "Success",
        log_id: req.headers['Logid'],
        ip_address: req.headers['ip_address']
      };
      if (req.user && req.user.id) {
        object.user_id = "user_" + req.user.id;
      }
      if (req.body) {
        object.body = JSON.stringify(req.body);
      }
      if (req.query) {
        object.params = req.query;
      }
      await logger.info(object, "Incoming Socket Request");

      var oldWrite = res.write,
        oldEnd = res.end;
      var chunks = [];
      res.write = function (chunk) {
        chunks.push(chunk);
        oldWrite.apply(res, arguments);
      };
      var body;
      res.end = async function (chunk) {
        let all_response_object = {
          "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
          "X-Content-Type-Options": "nosniff",
          "X-Frame-Options": "sameorigin",
          "X-XSS-Protection": "1; mode=block",
          "Referrer-Policy": "same-origin",
          // "Content-Security-Policy":"default-src https://*.cloudflare.com https://*.faldax.com https://s3.us-east-2.amazonaws.com/ https://*.amazonaws.com https://*.faldax.com; base-uri 'self' https://*.faldax.com; form-action 'self' https://checkout.simplexcc.com https://*.hsforms.com; img-src 'self' data: https://*.hubspot.com https://*.amazonaws.com https://*.google-analytics.com ; font-src 'self' https://*.fontawesome.com https://*.bootstrapcdn.com https://*.gstatic.com; style-src 'unsafe-inline' 'self' https://*.fontawesome.com https://*.amazonaws.com https://*.cloudflare.com https://*.googleapis.com https://*.bootstrapcdn.com ; script-src 'unsafe-inline' 'strict-dynamic' 'self' https://*.fontawesome.com https://www.googletagmanager.com https://*.hs-scripts.com https://*.hsforms.net https://*.hsforms.com  https://*.cloudflare.com https://*.faldax.com https://www.google.com https://*.hs-analytics.net https://*.usemessages.com https://*.google-analytics.com wss://*.faldax.com https://*.gstatic.com; object-src 'none' blob: ; connect-src 'self' https://*.s3.amazonaws.com https://*.fontawesome.com https://*.faldax.com/ https://*.hubspot.com wss://*.faldax.com ; frame-src 'self' https://www.google.com https://*.hubspot.com https://*.hsforms.com https://s3.us-east-2.amazonaws.com/"
        }
        res.writeHead(res.statusCode, all_response_object);
        if (chunk) chunks.push(chunk);
        body = Buffer.concat(chunks).toString('utf8');
        oldEnd.apply(res, arguments);
        var message = 'Response message';
        var error_at = '';
        // console.log("body",body);
        if ((body != "_sailsIoJSConnect();" && body != '') && IsValidJSONString(body) && JSON.parse(body).status) {
          if (JSON.parse(body).message) {
            message = JSON.parse(body).message
          }
          if (JSON.parse(body).err) {
            message = JSON.parse(body).err
          }
          if (res.statusCode > 200) {
            error_at = (JSON.parse(body).error_at ? (JSON.parse(body).error_at) : "-");
          }
        }
        var response = body;
        var object = {
          module: "Response",
          url: req.url,
          type: "Error",
          statusCode: res.statusCode,
          // responseData:JSON.stringify(response),
          log_id: req.headers['Logid'],
          ip_address: req.headers['ip_address']
        };
        if (res.statusCode > 200) {
          object.error_at = error_at;
        }
        // console.log("object",object);
        // if( res.statusCode != 200 && res.statusCode >= 201 ){
        object.responseData = (body);
        // }
        if (req.user && req.user.id) {
          object.user_id = "user_" + req.user.id;
        }
        if (res.statusCode == 200) {
          object.type = 'Success';
          if (req.url == '/login') {
            object.user_id = "user_" + JSON.parse(body).user.id;
          }
          await logger.info(object, message);
        } else {
          await logger.error(object, message);
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
        sails.hooks.i18n.setLocale(req.headers["accept-language"]);
        return res
          .status(403)
          .json({
            status: 403,
            err: sails.__('Invalid Authorization token').message
          });
      }
    } else if (req.headers && req.headers["x-api-key"]) {
      // Check for Institutional account, and get API Keys
      if (!req.headers["x-api-key"] || req.headers["x-api-key"] == null || req.headers["x-api-key"] == '') {
        return res
          .status(400)
          .json({
            "status": 400,
            "err": sails.__("Api key is missing").message
          });
      }
      let api_key = req.headers["x-api-key"];
      let get_api_keys = await sails.helpers.getApikeyUser(api_key);
      if (!get_api_keys) {
        return res
          .status(400)
          .json({
            "status": 400,
            "err": sails.__("Api key is invalid").message
          });
      }
      var verifyData = {
        id: get_api_keys.user_id
      };
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
          sails.hooks.i18n.setLocale(req.headers["accept-language"]);
          return res
            .status(403)
            .json({
              status: 403,
              err: sails.__('Invalid Authorization token').message
            });
        }
      } else {
        sails.hooks.i18n.setLocale(req.headers["accept-language"]);
        return res
          .status(401)
          .json({
            status: 401,
            err: sails.__('No Authorization header was found').message
          });
      }
    } else {
      sails.hooks.i18n.setLocale(req.headers["accept-language"]);
      return res
        .status(401)
        .json({
          status: 401,
          err: sails.__('No Authorization header was found').message
        });
    }
    if (token) {
      var verifyData = await sails
        .helpers
        .jwtVerify(token);
    }

    if (verifyData) {
      req.user = verifyData;
      var userData = await Users.findOne({
        id: req.user.id
      });
      if (userData != undefined && userData.isAdmin != true) {
        // console.log("INSIDE TYHIUS")
        sails.hooks.i18n.setLocale(req.headers["accept-language"]);
        if (userData.is_verified == false || userData.is_new_email_verified == false) {
          return res
            .status(403)
            .json({
              "status": 403,
              err: sails.__("account not not verified by admin").message
            });
        } else if (userData.deleted_at == null && userData.is_active == true) {
          // console.log("req.headers", req.headers)
          // console.log("userData.default_language", userData.default_language)
          // console.log(req.headers["accept-language"])
          if (req.headers && req.headers["accept-language"] && req.headers["accept-language"] != "") {
            // console.log("INSIDE IF>>>>>>>")
            sails.hooks.i18n.setLocale(req.headers["accept-language"]);
          } else if (userData != undefined) {
            // console.log("INSIDE ELSE IF>>>>>>>")
            sails.hooks.i18n.setLocale(userData.default_language);
          } else {
            // console.log("ELSE>>>>>>>")
            sails.hooks.i18n.setLocale("en");
          }
          next();
        } else if (userData.deleted_at != null) {
          return res
            .status(403)
            .json({
              status: 403,
              err: sails.__('Your User has been deleted').message
            });
        } else if (userData.is_active == false || userData.is_active == 'false') {
          return res
            .status(403)
            .json({
              status: 403,
              err: sails.__('Your User has been deactivated').message
            });
        }
        else {
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
              // console.log("req.headers", req.headers)
              // console.log("userData.default_language", userData.default_language)
              // console.log(req.headers["accept-language"])
              if (req.headers && req.headers["accept-language"] && req.headers["accept-language"] != "") {
                // console.log("INSIDE IF>>>>>>>")
                sails.hooks.i18n.setLocale(req.headers["accept-language"]);
              } else if (userData != undefined) {
                // console.log("INSIDE ELSE IF>>>>>>>")
                sails.hooks.i18n.setLocale(userData.default_language);
              } else {
                // console.log("ELSE>>>>>>>")
                sails.hooks.i18n.setLocale("en");
              }
              next();
            } else if (checkexist == 1) {
              return res
                .status(401)
                .json({
                  "status": 401,
                  "err": sails.__("Time for whitelist has been expired.").message
                });
            } else {
              // console.log("req.headers", req.headers)
              // console.log("userData.default_language", userData.default_language)
              // console.log(req.headers["accept-language"])
              if (req.headers && req.headers["accept-language"] && req.headers["accept-language"] != "") {
                // console.log("INSIDE IF>>>>>>>")
                sails.hooks.i18n.setLocale(req.headers["accept-language"]);
              } else if (userData != undefined) {
                // console.log("INSIDE ELSE IF>>>>>>>")
                sails.hooks.i18n.setLocale(userData.default_language);
              } else {
                // console.log("ELSE>>>>>>>")
                sails.hooks.i18n.setLocale("en");
              }
              next();
            }
          } else {
            // console.log("req.headers", req.headers)
            // console.log("userData.default_language", userData.default_language)
            // console.log(req.headers["accept-language"])
            if (req.headers && req.headers["accept-language"] && req.headers["accept-language"] != "") {
              // console.log("INSIDE IF>>>>>>>")
              sails.hooks.i18n.setLocale(req.headers["accept-language"]);
            } else if (userData != undefined) {
              // console.log("INSIDE ELSE IF>>>>>>>")
              sails.hooks.i18n.setLocale(userData.default_language);
            } else {
              // console.log("ELSE>>>>>>>")
              sails.hooks.i18n.setLocale("en");
            }
            next();
          }
        }
      } else {
        // console.log("req.headers", req.headers)
        // console.log(req.headers["accept-language"])
        // console.log("userData.default_language", userData.default_language)
        if (req.headers && req.headers["accept-language"] && req.headers["accept-language"] != "") {
          // console.log("INSIDE IF>>>>>>>")
          sails.hooks.i18n.setLocale(req.headers["accept-language"]);
        } else if (userData != undefined) {
          // console.log("INSIDE ELSE IF>>>>>>>")
          sails.hooks.i18n.setLocale(userData.default_language);
        } else {
          // console.log("ELSE>>>>>>>")
          sails.hooks.i18n.setLocale("en");
        }
        next();
      }
    }
  } catch (error) {
    console.log(error)
    sails.hooks.i18n.setLocale(req.headers["accept-language"]);
    return res
      .status(403)
      .json({
        status: 403,
        err: sails.__('Your session has been expired. Please Login again to continue').message
      });
  }
};
