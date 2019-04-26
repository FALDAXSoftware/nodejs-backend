/**
 * isAdmin
 *
 * @module      :: Policy
 * @description :: policy to check login is admin only.
 * @help        :: http://sailsjs.org/#!/documentation/concepts/Policies
 */
module.exports = function (req, res, next) {

  // TODO

  console.log("------------------------------Admin Policy", req.url);
  let urlArray = req.url.split("/");
  // console.log("-------------------Admin Policy", urlArray);
  let urlPrefix = urlArray[1];
  // console.log("-------------------Admin Policy", urlPrefix);
  if (urlPrefix.toLowerCase() == "admin") {
    if (req.user.isAdmin) {
      return next();
    } else {
      return res.status(403).json({ status: 403, err: 'Unauthorized access' });
    }
  }

  // return next();

};
