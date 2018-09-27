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

  //Admin 
  'post /admin/login':"Admin.login",
  'post /admin/forgotPassword':"Admin.forgotPassword",
  'post /admin/create': "Admin.create",
  'put /admin/update': "Admin.update",
  'put /admin/resetPassword':"Admin.resetPassword",
  //users 
  'post /admin/changePassword': "Admin.changePassword",
  'get /admin/getUsers': 'Users.getUserPaginate',
  'get/admin/referredUsers':'Users.getUserReferredAdmin',
  'post /admin/userActivate': 'Users.userActivate',

  //coins 
  'get /admin/getCoins': 'Coins.getCoins',
  'post /admin/coins/create': 'Coins.create',
  'put /admin/coins/update': 'Coins.update',
  'delete /admin/coins/delete': 'Coins.delete',


  //static pages
  'get /admin/static/getStaticPage': 'Statics.getStatic',
  'post /admin/static/create': 'Statics.create',
  'put /admin/static/update': 'Statics.update',
  'delete /admin/static/delete': 'Statics.delete',
  

  //DashBoard
  'get /admin/dashboard/getData': 'Dashboard.get',
  // 'put /admin/changePassword': "Admin.changePassword",



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
