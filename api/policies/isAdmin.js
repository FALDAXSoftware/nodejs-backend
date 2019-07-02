/**
 * isAdmin
 *
 * @module      :: Policy
 * @description :: policy to check login is admin only.
 * @help        :: http://sailsjs.org/#!/documentation/concepts/Policies
 */
module.exports = async function (req, res, next) {

  // TODO
  let urlArray = req.url.split("/");
  let urlPrefix = urlArray[1];
  if (urlPrefix.toLowerCase() == "admin") {
    if (req.user.isAdmin) {
      console.log("ADMIN DATA >>>>>>>>>", req.user.id)
      var userData = await Admin.findOne({
        id: req.user.id
      });

      console.log(userData)
      if (userData != undefined) {
        if (userData.whitelist_ip == null && userData.deleted_at == null) {
          return next()
        } else if (userData.deleted_at != null) {
          return res
            .status(403)
            .json({
              status: 403,
              err: 'Your User has been deleted.'
            });
        } else if (userData.whitelist_ip != null) {
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
          if (userData.whitelist_ip.indexOf(ip) > -1) {
            return next();
          } else {
            return res
              .status(403)
              .json({
                status: 403,
                err: 'Your IP has not been whitelisted. Please whitelist your IP to continue.'
              });
          }
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

};
