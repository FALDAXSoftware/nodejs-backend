/**
 * isAdmin
 *
 * @module      :: Policy
 * @description :: policy to check login is admin only.
 * @help        :: http://sailsjs.org/#!/documentation/concepts/Policies
 */

var requestIp = require('request-ip');

module.exports = async function (req, res, next) {
  try {
    // TODO
    console.log(req.url);
    let urlValue = req.url.trim();
    // let urlArray = req.url.split("/");
    // console.log(urlArray);
    // let urlSplit = req.url.split(":")
    // console.log(urlSplit);
    // urlValue = urlSplit[0];
    // console.log(urlValue)
    // urlValue = urlValue.replace("/", "")
    // urlValue = '/' + urlValue;
    // urlSplit = req.url.split("?");
    // urlValue = urlSplit[0];
    // console.log(urlValue[0]);
    // console.log(urlValue[0] != '/')
    // urlValue = (urlValue[0] != '/') ? (urlValue) : ('/' + urlValue)
    // let urlSplit = req.url.split("?")
    // urlValue = urlSplit[0];
    let urlPrefix = urlArray[1];
    if (urlPrefix.toLowerCase() == "admin") {
      if (req.user.isAdmin) {
        var userData = await Admin.findOne({
          id: req.user.id
        });

        if (userData != undefined) {
          if (userData.deleted_at == null) {
            // var permissionData = await Permissions.findOne({
            //   where: {
            //     route_name: (urlValue).trim(),
            //     deleted_at: null
            //   }
            // })
            // if (permissionData != undefined) {
            //   var role_permission = await AdminPermission.find({
            //     where: {
            //       permission_id: permissionData.id,
            //       role_id: userData.role_id,
            //       deleted_at: null
            //     }
            //   });
            //   if (role_permission != undefined && role_permission.length > 0) {
            return next()
            //   } else {
            //     return res
            //       .status(403)
            //       .json({
            //         status: 403,
            //         err: 'You are not allowed to access this route'
            //       })
            //   }
            // } else {
            //   return res
            //     .status(403)
            //     .json({
            //       status: 403,
            //       err: 'You are not allowed to access this route'
            //     })
            // }

          } else if (userData.deleted_at != null) {
            return res
              .status(403)
              .json({
                status: 403,
                err: 'Your User has been deleted.'
              });
          } else {
            // var ip;
            // if (req.headers['x-forwarded-for']) {
            //     ip = req
            //         .headers['x-forwarded-for']
            //         .split(",")[0];
            // } else if (req.connection && req.connection.remoteAddress) {
            //     ip = req.connection.remoteAddress;
            // } else {
            //     ip = req.ip;
            // }

            var ip = requestIp.getClientIp(req); // on localhost > 127.0.0.1

            // Check if IP's session is not timeout
            var opts = {
              id: userData.id,
              user_type: 1
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
            //   return next();
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
          return next();
        }
      } else {
        return res.status(403).json({
          status: 403,
          err: 'Unauthorized access'
        });
      }
    }

    return next();
  } catch (err) {
    console.log(err);
  }


};
