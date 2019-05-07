/**
 * checkReCaptcha
 *
 * @module      :: Policy
 * @description :: TODO: You might write a short summary of how this policy works and what it represents here.
 * @help        :: http://sailsjs.org/#!/documentation/concepts/Policies
 */
const fetch = require('node-fetch');
module.exports = function (req, res, next) {

  if (req.body["g_recaptcha_response"]) {

    var userResponse = req.body['g_recaptcha_response'];

    let url = `https://www.google.com/recaptcha/api/siteverify?secret=${sails.config.local.GOOGLE_SECRET_KEY}&response=${userResponse}`;

    fetch(url)
      .then(resjson => resjson.json())
      .then(verificationResponse => {
        if (verificationResponse.success) {
          return next();
        } else {
          return res.status(500).json({
            status: 500, "err": sails.__("It looks like Robot !")
          });
        }
      });
  } else {
    return next();
  }

};
