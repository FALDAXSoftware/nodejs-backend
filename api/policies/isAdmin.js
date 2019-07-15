/**
 * isAdmin
 *
 * @module      :: Policy
 * @description :: policy to check login is admin only.
 * @help        :: http://sailsjs.org/#!/documentation/concepts/Policies
 */
module.exports = async function (req, res, next) {
  try {
    // TODO
    let urlArray = req.url.split("/");
    let urlPrefix = urlArray[1];
    if (urlPrefix.toLowerCase() == "admin") {
      if (req.user.isAdmin) {
        var userData = await Admin.findOne({
          id: req.user.id
        });

        if (userData != undefined) {
          if (userData.deleted_at == null) {
            return next()
          } else if (userData.deleted_at != null) {
            return res
              .status(403)
              .json({
                status: 403,
                err: 'Your User has been deleted.'
              });
          } else {
            var ip;
            if (req.headers['x-forwarded-for']) {
              ip = req
                .headers['x-forwarded-for']
                .split(",")[0];
            } else if (req.connection && req.connection.remoteAddress) {
              ip = req.connection.remoteAddress;
            } else {
              ip = req.ip;
            }


            // Check if IP's session is not timeout
            var opts = {
              id: userData.id,
              user_type: 1
            };
            var check_whitelist_exists = await IPWhitelist.checkUserHasWhitelist(opts);
            if (check_whitelist_exists) {
              var opts = {
                id: userData.id,
                user_type: 1,
                ip: ip
              };
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
