/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes tell Sails what to do each time it receives a request.
 *
 * For more information on configuring custom routes, check out:
 * https://sailsjs.com/anatomy/config/routes-js
 */

module.exports.routes = {


  '/': {
    view: 'pages/homepage'
  },
  // Admin Routes

  //Admin Login
  'post /admin/login':"AdminController.login",
  'post /admin/create': "AdminController.create",
  'put /admin/update': "AdminController.update",





  // User Routes
  'post /login':"AuthController.login",
  'post /users/create': "UsersController.create",
  'put /users/update': "UsersController.update",
  'post /dashboard':"DashboardController.get"

};
