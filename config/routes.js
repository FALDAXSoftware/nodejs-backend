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

  // Test Routes
  'get /newstest': 'RootController.testnews',
  'post /csv-to-json': 'RootController.csvToJson',

  // CMS Routes///////////////////////////////////////////

  //Admin 
  'post /admin/login': "Admin.login",
  'post /admin/forgotPassword': "Admin.forgotPassword",
  'post /admin/create': "Admin.create",
  'put /admin/update': "Admin.update",
  'put /admin/resetPassword': "Admin.resetPassword",
  'post /admin/add-employee': "Admin.addEmployee",
  'get /admin/get-employees': "Admin.getAllEmployee",
  'delete /admin/delete-employee': "Admin.deleteEmployee",
  'put /admin/update-employee': "Admin.updateEmployee",

  // Role
  'post /admin/role/create': 'RoleController.create',
  'get /admin/role/get': 'RoleController.get',
  'put /admin/role/update': 'RoleController.update',
  'delete /admin/role/delete': 'RoleController.delete',

  //users 
  'post /admin/changePassword': "Admin.changePassword",
  'get /admin/getUsers': 'Users.getUserPaginate',
  'get /admin/referredUsers': 'Users.getUserReferredAdmin',
  'post /admin/userActivate': 'Users.userActivate',
  'post /admin/getUserloginHistory': 'Users.getUserloginHistoryAdmin',

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

  //Announcement
  'get /admin/announcement/getAnnouncementTemplate': 'AnnouncementController.getAnnouncementTemplate',
  'post /admin/announcement/create': 'AnnouncementController.create',
  'put /admin/announcement/update': 'AnnouncementController.update',
  'delete /admin/announcement/delete': 'AnnouncementController.delete',
  'post /admin/email-send': 'AnnouncementController.sendemail',

  //Coin Requests
  'get /admin/coin-requests': 'AddCoinReqController.getCoinRequests',

  //DashBoard
  'get /admin/dashboard/getData': 'Dashboard.get',
  // 'put /admin/changePassword': "Admin.changePassword",

  //countries
  'get /admin/getCountriesData': 'Countries.getCountries',
  'put /admin/countryActivate': 'Countries.countryActivate',
  'put /admin/countryUpdate': 'Countries.countryUpdate',
  'get /admin/getStateData': 'Countries.getStates',
  'put /admin/stateActivate': 'Countries.stateActivate',
  'put /admin/stateUpdate': 'Countries.stateUpdate',

  // 'post /admin/insertCountries': 'Countries.insertCountries',
  // 'post /admin/insertState': 'Countries.insertState',

  //Blogs routes
  'get /admin/all-blogs': 'BlogsController.getAllBlogs',
  'post /admin/create-blog': 'BlogsController.createBlog',
  'put /admin/edit-blog': 'BlogsController.updateBlog',
  'delete /admin/delete-blog': 'BlogsController.deleteBlog',
  'post /admin/set-featured-blog': 'BlogsController.setFeaturedBlog',

  //Fees routes
  'get /admin/all-pairs': 'PairsController.getAllPairs',
  'post /admin/add-pair': 'PairsController.createPair',
  'put /admin/edit-pair': 'PairsController.updatePair',

  //Limit routes
  'get /admin/all-limits': 'LimitController.getAllLimit',
  'put /admin/edit-limit': 'LimitController.updateLimit',

  //Transaction routes
  'get /admin/all-transactions': 'TransactionController.getAllTransactions',

  //Trade routes
  'get /admin/all-trades': 'TradeController.getAllTrades',

  //Withdrawal Requests routes
  'get /admin/all-withdraw-requests': 'WithdrawReqController.getAllWithdrawReq',

  //Order routes
  'post /admin/all-sell-orders': 'SellController.getAllSellOrders',
  'post /admin/all-buy-orders': 'BuyController.getAllBuyOrders',

  //Send Inquiry routes
  'get /admin/get-all-inquiry': 'RootController.getAllInquiries',

  //Subscriber routes
  'get /admin/get-all-subscribers': 'Subscribe.getAllSubscribers',

  //Add Job route
  'get /admin/all-jobs': 'CareerController.getAllJobsCMS',
  'post /admin/add-job': 'CareerController.addJob',
  'put /admin/edit-job': 'CareerController.editJob',
  'delete /admin/delete-job': 'CareerController.deleteJob',
  'get /job-applicants': 'CareerController.getJobApplications',

  // Contact Routes
  'post /edit-contact-details': 'RootController.updateContactInfo',

  // KYC Routes
  'get /admin/get-all-kyc-data': 'KYCController.getAllKYCData',
  'post /admin/update-kyc-status': 'KYCController.approveDisapproveKYC',

  // Web Routes///////////////////////////////////////////
  'post /login': "AuthController.login",
  'post /users/create': "UsersController.create",
  'put /users/update': "UsersController.update",
  'post /users/verify-user': "AuthController.verifyUser",
  'post /users/send-verification-email': "AuthController.sendVerificationCodeEmail",
  'post /users/forgotPassword': "AuthController.forgotPassword",
  'put /users/resetPassword': "AuthController.resetPassword",
  'post /users/changePassword': "Users.changePassword",
  'get /users/getUserDetails': "Users.getUserDetails",
  'get /users/referredUsers': 'Users.getReferred',
  'get /users/countries': 'Users.getCountriesData',
  'get /users/getMapCountries': 'Users.getCountries',
  'get /users/login-history': 'Users.getLoginHistory',
  'post /users/setup-two-factor': 'Users.setupTwoFactor',
  'post /users/verify-two-factor': 'Users.verifyTwoFactor',
  'post /users/disable-two-factor': 'Users.disableTwoFactor',
  'post /users/send-otp-email': 'Auth.sendOtpEmail',
  'post /users/email-subscription': 'Subscribe.senEmailSubscribtion',
  'delete /users/deleteAccount': 'Users.deleteUser',
  'post /logout': "AuthController.logOut",

  // Blogs
  'get /users/get-all-blogs': 'BlogsController.getAllBlogList',
  'post /users/get-blog-detail': 'BlogsController.getBlogDetails',
  'post /get-comments': 'BlogsController.getComment',
  'post /add-comments': 'BlogsController.addComment',
  'post /get-related-blog': 'BlogsController.getRelatedPost',
  'post /users/get-all-news': 'BlogsController.getAllNews',

  //dashboard
  'post /dashboard': "DashboardController.get",

  //KYC routes
  'post /users/add-kyc-details': "KYCController.updateKYCInfo",
  'post /users/add-kyc-docs': "KYCController.uploadKYCDoc",
  'get /users/get-kyc-detail': 'KYCController.getKYCDetails',
  'post /callback-kyc': 'KYCController.callbackKYC',

  //Static Page routes
  'get /users/static-page/:page': 'Statics.getStaticPage',
  'get /users/static-page-json/:page': 'Statics.getStaticPageJson',

  // Contact Routes
  'get /get-contact-details': 'RootController.getContactInfo',

  //Coin Request routes
  'post /users/add-coin-request': 'AddCoinReqController.addCoinRequest',

  //Send Inquiry routes
  'post /send-inquiry': 'RootController.sendInquiry',

  //career routes
  'get /all-jobs': 'CareerController.getAllJobs',
  'get /jobs/get-job-detail': 'CareerController.getJobDetail',
  'post /apply-job': 'CareerController.applyJob',


  // Tradding Routes
  // Market Trade Routes 
  'post /market/sell': 'TradeController.marketSell',
  'post /market/buy': 'TradeController.marketBuy'
};
