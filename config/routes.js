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
  // CMS Routes

  //Admin Login
  'post /admin/login':"AdminController.login",
  'post /admin/create': "AdminController.create",
  'put /admin/update': "AdminController.update",
  'post /admin/changePassword': "AdminController.changePassword",
  'get /admin/getUsers': 'Users.getUserPaginate',
  'post /admin/userActivate': 'Users.userActivate',
  'get /admin/getCoins': 'CoinsController.getCoins',
  'post /admin/coins/create': 'CoinsController.create',
  'put /admin/coins/update': 'CoinsController.update',
  'delete /admin/coins/delete': 'CoinsController.delete',
  'get /admin/static/getStaticPage': 'StaticsController.getStatic',
  'post /admin/static/create': 'StaticsController.create',
  'put /admin/static/update': 'StaticsController.update',
  'delete /admin/static/delete': 'StaticsController.delete',
  
  // 'put /admin/changePassword': "AdminController.changePassword",



  // Web Routes
  'post /login':"AuthController.login",
  'post /users/create': "UsersController.create",
  'put /users/update': "UsersController.update",
  'post /dashboard':"DashboardController.get",
  'post /users/changePassword': "UsersController.changePassword",
  'get /users/getUserDetails' : "Users.getUserReferral",
  'get /users/referredUsers':'Users.getReferred',
  'get /user/countries': 'Users.getCountriesData'


};
