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

  'get /send': 'Dashboard.sendSMS',

  // 'admin/*': { policy: 'isAdmin' }, Test Routes
  'get /users/get-conversion-data': 'WalletController.getConversionData',
  'post /recieve-webhook-bitgo': 'RootController.webhookOnReciveBitgo',
  'get /query-test': 'RootController.queryTest',
  'get /create-all-wallet': 'RootController.createAllWallet',
  'post /toggle-panic-status': 'RootController.panicBtn',
  'get /get-panic-status': 'RootController.getPanicStatus',
  'get /test-bitgo': 'RootController.bitgoTest',
  'get /testemail': 'RootController.testemail',


  // Webhook  routes
  'get /set-address-webhook': 'WebhookController.setAddressWebhook',
  'get /set-receive-webhook': 'WebhookController.setReceiveWebhook',
  'post /webhook-on-address': 'WebhookController.webhookOnAddress',
  'post /webhook-on-receive': 'WebhookController.webhookOnReceive',
  'post /webhook-on-send': 'WebhookController.webhookOnSend',

  // CMS Routes/////////////////////////////////////////// Admin
  'post /admin/login': "Admin.login",
  'post /admin/forgot-password': "Admin.forgotPassword",
  'post /admin/create': "Admin.create",
  'put /admin/update': "Admin.update",
  'put /admin/reset-password': "Admin.resetPassword",
  'post /admin/add-employee': "Admin.addEmployee",
  'get /admin/get-employees': "Admin.getAllEmployee",
  'delete /admin/delete-employee': "Admin.deleteEmployee",
  'delete /admin/delete-user': "Admin.deleteUser",
  'put /admin/update-employee': "Admin.updateEmployee",
  'get /admin/get-employee-details': "Admin.getEmployeeDetails",
  'post /admin/setup-two-factor': 'Admin.setupTwoFactor',
  'post /admin/verify-two-factor': 'Admin.verifyTwoFactor',
  'post /admin/disable-two-factor': 'Admin.disableTwoFactor',
  'get /admin/get-details': 'Admin.getAdminDetails',
  'post /admin/add-whitelist-ip': 'Admin.addAdminIPs',
  'get /admin/get-all-whitelist-ip': 'Admin.getAdminWhiteListIP',
  'delete /admin/delete-whitelist-ip': 'Admin.deleteWhitelistIP',
  'get /admin/get-user-whitelist-ip': 'Admin.getUserWhiteListIP',
  'post /admin/add-user-ip-whitelist': 'Admin.addUserIpWhitelist',
  'delete /admin/delete-user-whitelist-ip': 'Admin.deleteUserWhitelistIP',

  // Role
  'post /admin/role/create': 'RoleController.create',
  'get /admin/role/get': 'RoleController.get',
  'put /admin/role/update': 'RoleController.update',
  'delete /admin/role/delete': 'RoleController.delete',

  //users
  'post /admin/change-password': "Admin.changePassword",
  'post /admin/employee-change-password': 'Admin.updateEmployeePassword',
  'get /admin/get-users': 'Users.getUserPaginate',
  'get /admin/referred-users': 'Users.getUserReferredAdmin',
  'post /admin/update-user-referal': 'Users.updateUserDetails',
  'post /admin/user-activate': 'Users.userActivate',
  'post /admin/get-user-login-history': 'Users.getUserloginHistoryAdmin',
  'get /admin/get-user-details': 'Users.getAllUserDetails',
  'get /admin/get-referred-amount-details': 'ReferralController.getUserReferredAmounts',
  'post /admin/update-send-coin-fee': 'Users.updateSendCoinFee',
  'post /admin/add-user': 'Users.addUser',
  'post /admin/update-user': 'Admin.updateUser',
  'post /admin/get-user-tickets': 'Users.getTicketsAdmin',
  //coins
  'get /admin/get-coins': 'Coins.getCoins',
  'post /admin/coins/create': 'Coins.create',
  'put /admin/coins/update': 'Coins.update',
  'delete /admin/coins/delete': 'Coins.delete',
  'get /admin/coin/get-coin-details': "Coins.getCoinDetails",


  // Email Templates
  'get /admin/emailTemplate/get': 'EmailTemplateController.get',
  'get /admin/emailTemplate/get-by-id': 'EmailTemplateController.getById',
  'put /admin/emailTemplate/update': 'EmailTemplateController.update',

  //DashBoard
  'get /admin/dashboard/get-data': 'Dashboard.getAllCounts',
  'get /admin/get-countries-data': 'Countries.getCountries',
  'put /admin/country-activate': 'Countries.countryActivate',
  'put /admin/country-update': 'Countries.countryUpdate',
  'get /admin/get-state-data': 'Countries.getStates',
  'put /admin/state-activate': 'Countries.stateActivate',
  'put /admin/state-update': 'Countries.stateUpdate',

  // 'post /admin/insertCountries': 'Countries.insertCountries', 'post
  // /admin/insertState': 'Countries.insertState', Pairs routes
  'get /admin/all-pairs': 'PairsController.getAllPairs',
  'post /admin/add-pair': 'PairsController.createPair',
  'put /admin/edit-pair': 'PairsController.updatePair',

  //Limit routes
  'get /admin/all-limits': 'LimitController.getAllLimit',
  'put /admin/edit-limit': 'LimitController.updateLimit',

  //User Limit routes
  'get /admin/all-user-limits': 'UserLimitController.getAllUserLimit',
  'put /admin/edit-user-limit': 'UserLimitController.updateUserLimit',

  //News Source routes
  'get /admin/all-new-source': 'NewsSourceController.getAllActiveNewsSource',
  'put /admin/edit-news-source': 'NewsSourceController.updateNewsSourceStatus',

  //Transaction routes
  'get /admin/all-transactions': 'TransactionController.getAllTransactions',
  'get /admin/user-transactions': 'TransactionController.getUserTransactions',

  //Trade routes
  'get /admin/all-trades': 'TradeController.getAllTrades',

  //Withdrawal Requests routes
  'get /admin/all-withdraw-requests': 'WithdrawReqController.getAllWithdrawReq',

  //Order routes
  'post /admin/all-sell-orders': 'SellController.getAllSellOrders',
  'post /admin/all-buy-orders': 'BuyController.getAllBuyOrders',


  //Add Job route
  'get /admin/all-jobs': 'CareerController.getAllJobsCMS',
  'post /admin/add-job': 'CareerController.addJob',
  'put /admin/edit-job': 'CareerController.editJob',
  'delete /admin/delete-job': 'CareerController.deleteJob',
  'get /admin/job-applicants': 'CareerController.getJobApplications',
  'get /admin/job-categories': 'CareerController.getAllJobCategories',

  //Fee route
  'get /get-all-fee': 'FeesController.getAllFees',
  'get /admin/get-all-fee': 'FeesController.getAllFees',
  'put /admin/edit-fee': 'FeesController.editFees',

  // Contact Routes
  'post /edit-contact-details': 'RootController.updateContactInfo',
  'get /admin/get-contact-details': 'RootController.getContactInfo',

  // KYC Routes
  'get /admin/get-all-kyc-data': 'KYCController.getAllKYCData',

  // Wallet
  'get /admin/create-all-wallet': 'Coins.createAllWallet',
  'post /admin/create-wallet': 'Coins.createWallet',

  // News
  'get /admin/get-all-news': 'News.getAllNews',
  'post /admin/change-news-status': 'News.changeNewsStatus',
  'get /admin/get-news-details': 'News.getNewsDetails',

  // Web Routes///////////////////////////////////////////
  'post /login': "AuthController.login",
  'post /users/create': "UsersController.create",
  'put /users/update': "UsersController.update",
  'post /users/verify-user': "AuthController.verifyUser",
  'post /users/verify-new-ip': "AuthController.verifyNewIp",
  'post /users/send-verification-email': "AuthController.sendVerificationCodeEmail",
  'post /users/forgotPassword': "AuthController.forgotPassword", //1
  'put /users/resetPassword': "AuthController.resetPassword", //2
  'post /users/changePassword': "Users.changePassword", //3
  'get /users/getUserDetails': "Users.getUserDetails", //4
  'get /users/referredUsers': 'Users.getReferred', //5
  'get /users/countries': 'Users.getCountriesData',
  'get /users/getMapCountries': 'Users.getCountries', //6
  'get /users/login-history': 'Users.getLoginHistory',
  'post /users/setup-two-factor': 'Users.setupTwoFactor',
  'post /users/verify-two-factor': 'Users.verifyTwoFactor',
  'post /users/disable-two-factor': 'Users.disableTwoFactor',
  'post /users/send-otp-email': 'Auth.sendOtpEmail',
  // 'post /users/email-subscription': 'Subscribe.senEmailSubscribtion',
  'delete /users/deleteAccount': 'Users.deleteUser', //7
  'post /users/update-email': 'Users.updateEmail',
  'post /users/add-whitelist-ip': 'IPWhitelistController.addWhiteListIPUser',
  'get /users/get-whitelist-ip': 'IPWhitelistController.getWhiteListIPUser',
  'delete /users/delete-whitelist-ip': 'IPWhitelistController.deleteUserWhitelistIP',
  'post /users/confirm-new-email': 'Users.confirmNewEmail',
  'post /users/verify-new-email': 'Users.verifyNewEmail',
  'post /logout': "AuthController.logOut",
  'post /users/resend-email': "AuthController.resendVerificationEmail", //Resend Email For Registered users

  //all forms
  'get /get-open-ticket-form': "RootController.sendOpenTicketForm",
  'get /get-subscriber-form': "RootController.sendSubscriberForm",
  'get /get-list-token-form': "RootController.sendListTokenForm",

  // Blogs
  'get /users/get-all-blogs': 'BlogsController.getAllBlogList',
  'post /users/get-blog-detail': 'BlogsController.getBlogDetails',
  'post /get-comments': 'BlogsController.getComment',
  'post /get-related-blog': 'BlogsController.getRelatedPost',
  'post /users/get-all-news': 'BlogsController.getAllNews',
  'post /create-comments': 'BlogsController.CreateComment',

  // dashboard 'post /dashboard': "DashboardController.get",
  'get /dashboard/get-activity': 'DashboardController.getActivity',
  'get /dashboard/get-portfolio': 'DashboardController.getPortfolio',
  'get /get-rising-falling-data': 'DashboardController.getRisingFalling',

  //KYC routes
  'post /users/add-kyc-details': "KYCController.updateKYCInfo",
  'post /users/add-kyc-docs': "KYCController.uploadKYCDoc",
  'get /users/get-kyc-detail': 'KYCController.getKYCDetails',
  'post /callback-kyc': 'KYCController.callbackKYC',
  'get /admin/get-kyc-detail': 'KYCController.getUserKYCDetails',

  //Static Page routes
  'get /users/static-page/:page': 'Statics.getStaticPage',
  'get /users/static-page-json/:page': 'Statics.getStaticPageJson',

  // Contact Routes
  'get /get-contact-details': 'RootController.getContactInfo',

  //career routes
  'get /all-jobs': 'CareerController.getAllJobs',
  'get /jobs/get-job-detail': 'CareerController.getJobDetail',
  'post /apply-job': 'CareerController.applyJob',

  // Tradding Routes 'get /get-buy-book-details':
  // 'BuyController.getBuyBookDetails',
  'get /get-sell-book-details': 'SellController.getSellBookDetails',
  'get /get-data': 'SellController.getData',

  // Market Trade Routes
  'post /market/sell': 'TradeController.marketSell',
  'post /market/buy': 'TradeController.marketBuy',

  //Limit Trade Routes
  'post /limit/sell': 'TradeController.limitSell',
  'post /limit/buy': 'TradeController.limitBuy',

  //Stop limit Trade
  'post /stop/limit/sell': 'TradeController.stopLimitSell',
  'post /stop/limit/buy': 'TradeController.stopLimitBuy',

  // 'post /get-all-history': 'TradeController.getAllTradeHistory', Wallet Routes
  'get /wallet/balance': 'WalletController.getCoinBalanceForWallet',
  'post /wallet-details': 'WalletController.getWalletTransactionHistory',

  //receive coin route
  'get /wallet/get-qr-code/:coin': 'WalletController.getReceiveCoin',

  //send Coin
  'post /wallet/send': 'WalletController.sendCoin',

  //coin routes
  'get /get-all-coins': 'Coins.getAllCoins',
  'get /coin-list': 'Coins.getAllCoinList',
  'get /coin-list-converison': 'Coins.getCoinsForConversion',
  'get /coin-currency-list-conversion': 'Coins.getCurrencyForConversion',

  // Socket Routes
  'get /socket/get-buy-book': 'BuyController.getBuyBookDetails',
  'get /socket/get-sell-book': 'SellController.getSellBookDetails',
  'get /socket/get-trade-history': 'TradeController.getAllTradeHistory',
  'get /socket/get-card-data': 'DashboardController.getCardData',
  'get /socket/get-user-trade-data': 'TradeController.getUserTradeHistory',
  'get /socket/get-depth-chart-data': 'TradeController.getDepthchartData',
  'get /socket/get-pair-details': 'Coins.getPairDetails',

  //Get Instrument
  'get /socket/get-instrument-data': 'PairsController.getInstrumentPair',
  'get /socket/get-user-balance': 'TradeController.getUserWallet',
  'get /stop-limit-execute': 'TradeController.stopLimitExecute',

  //Cancel Pending Order
  'post /cancel-pending-order': 'TradeController.cancelPendingOrder',

  //Get User Trade History
  'get /get-user-history': 'TradeController.getUserHistory',

  //Get All Tickets
  'get /get-all-tickets': 'UsersController.getUserTickets',
  'get /get-ticket': 'TicketController.getAllTicketByID',

  //Socket route server
  'get /enable-web-socket': 'RootController.enableWebSocket',

  // Tradding View Chart
  'get /tradingview/config': 'TradingView.getConfig',
  'get /tradingview/time': 'TradingView.getCurrentTime',
  'get /tradingview/symbols': 'TradingView.getSymbolInfo',
  'get /tradingview/history': 'TradingView.getHistoryData',

  //Type2coins API
  'get /type2coin/getinfo/:coin_code': 'Type2CoinController.getCoinInfo',
  'get /type2coin/getnewaddress/:coin_code': 'Type2CoinController.getCoinNewAddress',
  'get /type2coin/gettransactionlist/:coin_code': 'Type2CoinController.getTransactionList',
  'post /type2coin/sendcoin': 'Type2CoinController.sendCoin',
  'get /type2coin/listaddreses/:coin_code': 'Type2CoinController.listAddresses',
  'post /type2coin/getwalletbalance': 'Type2CoinController.getAddressBalance',
  'get /call-helper': 'RootController.callKrakenAPI',

  //Kraken API
  'get /get-order-book-data/:pair/:pair_value': 'KrakenController.getOrderBookData',
  'post /add-order': 'KrakenController.addOrder',
  'get /deposit-address/:symbol': 'KrakenController.depositAddress',
  'get /recent-deposit-status/:symbol': 'KrakenController.getDepositStatus',
  'get /get-withdrawl-info/:asset/:amount': 'KrakenController.getWithdrawlInformation',
  'get /withdraw-funds/:asset/:amount': 'KrakenController.getWithdrawlFunds',
  'get /recent-withdrawl-status/:asset': 'KrakenController.getRecentWithdrawlStatus',
  'post /get-withdraw-cancel-status': 'KrakenController.withdrwalCancellationStatus',
  'get /query-trade-information/:txid': 'KrakenController.queryTradeInformation',
  'post /perform-conversion': 'KrakenController.performConversion',
  // Class API
  'get /admin/get-all-account-classes': 'AccountClassController.getAllAccountClasses',
  'post /admin/add-account-class': 'AccountClassController.addAccountClass',
  'post /admin/update-account-class': 'AccountClassController.updateAccountClass',
  'post /admin/delete-account-class': 'AccountClassController.deleteAccountClass',

  //Create One Address for user
  'get /users/create-wallet/:coin_code': 'WalletController.createReceiveAddressCoin',

  //API for approving and disappoving withdraw request
  'post /admin/approve-disapprove-withdraw-request': 'WithdrawReqController.approveDisapproveRequest',

  //Referral Collection
  'get /collect-referral': 'ReferralController.collectReferral',

  //Job Category API
  'post /admin/add-job-category': 'CareerController.addJobCategory',
  'put /admin/update-job-category': 'CareerController.updateJobCategory',

  // Security Feature Enable/Disable
  'post /users/security-feature-status-change': 'UsersController.changeSFStatus',
};
