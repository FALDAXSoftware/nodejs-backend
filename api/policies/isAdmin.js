/**
 * isAdmin
 *
 * @module      :: Policy
 * @description :: policy to check login is admin only.
 * @help        :: http://sailsjs.org/#!/documentation/concepts/Policies
 */
module.exports = function (req, res, next) {

  // TODO
  let urlArray = req.url.split("/");
  let urlPrefix = urlArray[1];
  if (urlPrefix.toLowerCase() == "admin") {
    if (req.user.isAdmin) {
      console.log("ADMIN DATA >>>>>>>>>", req.user)
      return next();
    } else {
      return res.status(403).json({
        status: 403,
        err: 'Unauthorized access'
      });
    }
  }

  return next();

};
