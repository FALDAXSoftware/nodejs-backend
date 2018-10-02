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
  // CMS Routes///////////////////////////////////////////

  //Admin 
  'post /admin/login':"Admin.login",
  'post /admin/forgotPassword':"Admin.forgotPassword",
  'post /admin/create': "Admin.create",
  'put /admin/update': "Admin.update",
  'put /admin/resetPassword':"Admin.resetPassword",
  //users 
  'post /admin/changePassword': "Admin.changePassword",
  'get /admin/getUsers': 'Users.getUserPaginate',
  'get /admin/referredUsers':'Users.getUserReferredAdmin',
  'post /admin/userActivate': 'Users.userActivate',
  'post /admin/getUserloginHistory':'Users.getUserloginHistoryAdmin',

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
  //email template

  
  'get /admin/email-template/getEmailTemplate': 'EmailTemplatesController.getEmailTemplate',
  'post /admin/email-template/create': 'EmailTemplatesController.create',
  'put /admin/email-template/update': 'EmailTemplatesController.update',
  'delete /admin/email-template/delete': 'EmailTemplatesController.delete',
  'post /admin/email-send':'EmailTemplatesController.sendemail',
  

  //DashBoard
  'get /admin/dashboard/getData': 'Dashboard.get',
  // 'put /admin/changePassword': "Admin.changePassword",

  //countries
  'get /admin/getCountriesData':'Countries.getCountries',
  'put /admin/countryActivate': 'Countries.countryActivate',



  // Web Routes///////////////////////////////////////////
  'post /login':"AuthController.login",
  'post /users/create': "UsersController.create",
  'put /users/update': "UsersController.update",
  'post /users/forgotPassword':"AuthController.forgotPassword",
  'put /users/resetPassword':"AuthController.resetPassword",
  'post /users/changePassword': "UsersController.changePassword",
  'get /users/getUserDetails' : "Users.getUserReferral",
  'get /users/referredUsers':'Users.getReferred',
  'get /user/countries': 'Users.getCountriesData',
  'get /users/login-history':'Users.getLoginHistory',


  //dashboard
  'post /dashboard':"DashboardController.get"
  


};
