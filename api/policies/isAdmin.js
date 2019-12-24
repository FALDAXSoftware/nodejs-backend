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
    let urlValue = req.url.trim();
    let urlArray = req.route.path.split("/");
    let urlSplit = req.route.path.split(":")
    urlValue = urlSplit[0];
    urlSplit = urlValue.split("?");
    urlValue = urlSplit[0];
    urlValue = urlValue.replace(/^\/|\/$/g, '')
    var routeArray = [
      "admin/login",
      "admin/reset-password",
      "admin/forgot-password",
      "admin/setup-two-factor",
      "admin/update",
      "admin/verify-two-factor",
      "admin/disable-two-factor",
      "admin/get-details",
      "admin/change-password",
      "admin/get-user-whitelist-ip",
      "admin/add-whitelist-ip",
      "admin/get-all-whitelist-ip",
      "admin/user-whitelist-ip-status-change",
      "admin/delete-whitelist-ip",
      "admin/add-user-ip-whitelist",
      "admin/whitelist-ip-status-change",
      "admin/campaigns/verify-offercode",
      "admin/get-admin-wallet-history",
      "admin/get-all-news",
      "admin/get-market-snapshot",
      "admin/get-referred-user-data",
      "admin/users/list"
    ]

    let urlPrefix = urlArray[1];
    if (urlPrefix.toLowerCase() == "admin") {
      if (req.user.isAdmin) {
        var userData = await Admin.findOne({
          id: req.user.id
        });

        if (userData != undefined) {
          if (userData.deleted_at == null) {
            if (routeArray.indexOf(urlValue) > -1) {
              return next();
            } else {
              var permissionData = await Permissions.findOne({
                where: {
                  route_name: (urlValue).trim(),
                  deleted_at: null
                }
              })
              if (permissionData != undefined) {
                var role_permission = await AdminPermission.find({
                  where: {
                    permission_id: permissionData.id,
                    role_id: userData.role_id,
                    deleted_at: null
                  }
                });
                if (role_permission != undefined && role_permission.length > 0) {
                  return next()
                } else {
                  return res
                    .status(403)
                    .json({
                      status: 403,
                      err: 'You are not allowed to access this route'
                    })
                }
              } else {
                return res
                  .status(403)
                  .json({
                    status: 403,
                    err: 'You are not allowed to access this route'
                  })
              }
            }

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
        console.log("dsdsd");
        return res.status(403).json({
          status: 403,
          err: 'Unauthorized access'
        });
      }
    }

    return next();
  } catch (err) {
    console.log("DSDSDSDDSDSDD");
    console.log(err);
  }


};
