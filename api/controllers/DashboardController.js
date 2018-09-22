/**
 * DashboardController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
    get: function (req, res) {
      return res.status(200).json({status: 200});
    }
  };

