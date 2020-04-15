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
  'get /check-panic-status': 'RootController.testPanicStatus',

  // 'admin/*': { policy: 'isAdmin' }, Test Routes
  'get /users/get-conversion-data': 'WalletController.getConversionData',
  'post /recieve-webhook-bitgo': 'RootController.webhookOnReciveBitgo',
  'get /query-test': 'RootController.queryTest',
  'get /get/coin-warm-wallet-balance': 'CoinsController.getWarmWalletBalance',
  'get /query-test-thresold': 'RootController.queryTestThresold',
  'get /create-all-wallet': 'RootController.createAllWallet',
  'get /create-wallet': 'RootController.createWallet',
  'post /toggle-panic-status': 'RootController.panicBtn',
  'get /get-panic-status': 'RootController.getPanicStatus',
  'get /test-bitgo': 'RootController.bitgoTest',
  'get /get-transaction-id': "RootController.getTransactionID",
  // 'get /testemail': 'RootController.testemail',
  'get /update-thresold-notification': 'ThresoldController.addThresoldValue',
  'get /admin-wallet-fees-details': 'AdminController.getAdminWalletDetails',
  'get /admin/get-coin-fees-coin': 'AdminController.getCoinFees',
  'get /admin/get-slug-value/:slug': 'AdminController.getEachCoinFee',
  'put /admin/update-fees-value': 'AdminController.updateCoinFee',
  'get /metabase-details': 'RootController.testMetabaseIntegrate',
  'get /admin-business-wallet-details': 'AdminController.getAdminBusinessWalletDetails',

  // Webhook  routes
  'get /set-address-webhook': 'WebhookController.setAddressWebhook',
  'get /set-receive-webhook': 'WebhookController.setReceiveWebhook',
  'post /webhook-on-address': 'WebhookController.webhookOnAddress',
  'post /webhook-on-send-address': 'WebhookController.webhookOnSendAddress',
  'post /webhook-on-receive': 'WebhookController.webhookOnReceive',
  'post /webhook-on-send': 'WebhookController.webhookOnSend',
  'post /webhook-on-warm-send': 'WebhookController.webhookOnWarmSend',

  // CMS Routes/////////////////////////////////////////// Admin
  'post /admin/login': 'Admin.login',
  'post /admin/forgot-password': 'Admin.forgotPassword',
  'post /admin/create': 'Admin.create',
  'put /admin/update': 'Admin.update',
  'put /admin/reset-password': 'Admin.resetPassword',
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
  'post /admin/whitelist-ip-status-change': 'Admin.changeWhitelistIPStatus',
  'post /admin/user-whitelist-ip-status-change': 'Admin.changeUserWhitelistIPStatus',
  'post /admin/add-employee': 'Admin.addEmployee',
  'get /admin/get-employees': 'Admin.getAllEmployee',
  'delete /admin/delete-employee': 'Admin.deleteEmployee',
  'delete /admin/delete-user': 'Admin.deleteUser',
  'put /admin/update-employee': 'Admin.updateEmployee',
  'get /admin/get-employee-details': 'Admin.getEmployeeDetails',

  // Role
  'post /admin/role/create': 'RoleController.create',
  'get /admin/role/get': 'RoleController.getRoles',
  'put /admin/role/update': 'RoleController.update',
  'delete /admin/role/delete': 'RoleController.delete',

  //users
  'post /admin/change-password': 'Admin.changePassword',
  'post /admin/employee-change-password': 'Admin.updateEmployeePassword',
  'get /admin/get-users': 'Users.getUserPaginate',
  'get /admin/get-inactive-users': 'Users.getInactiveUserPaginate',
  'get /admin/get-deleted-users': 'Users.getDeletedUserPaginate',
  'get /admin/referred-users': 'Users.getUserReferredAdmin',
  'post /admin/update-user-referal': 'Users.updateUserDetails',
  'post /admin/user-activate': 'Users.userActivate',
  'post /admin/get-user-login-history': 'Users.getUserloginHistoryAdmin',
  'get /admin/get-user-details': 'Users.getAllUserDetails',
  'get /admin/get-referred-amount-details': 'ReferralController.getUserReferredAmounts',
  'post /admin/update-send-coin-fee': 'Users.updateSendCoinFee',
  'post /admin/update-faldax-fee': "Users.updateFaldaxFee",
  'post /admin/add-user': 'Users.addUser',
  'post /admin/update-user': 'Admin.updateUser',
  'post /admin/get-user-tickets': 'Users.getTicketsAdmin',
  'get /admin/get-user-wallet-addresses': 'Users.getUserWalletAddresses',
  //coins
  'get /admin/get-coins': 'Coins.getCoins',
  'post /admin/coins/create': 'Coins.create',
  'put /admin/coins/update': 'Coins.update',
  'delete /admin/coins/delete': 'Coins.delete',
  'get /admin/coin/get-coin-details': 'Coins.getCoinDetails',


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
  'post /admin/all-pending-orders': 'TradeController.getAllPendingOrders',
  'post /admin/all-cancelled-orders': 'TradeController.getAllCancelledOrders',

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
  'get /admin/get-referal-details': 'ReferralController.getReferalDetails',
  'post /admin/forgot-user-password': 'AdminController.userForgotPassword',

  // Web Routes///////////////////////////////////////////
  'post /login': "AuthController.login",
  'post /users/create': "UsersController.create",
  'put /users/update': "UsersController.update",
  'put /users/terms-status-update': "UsersController.updateTermsStatus",
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
  'post /users/forgot-twofactors': "AuthController.forgotTwofactors",
  'post /users/regenerate-backupcode': 'Users.regenerateBackupcode',

  //all forms
  'get /get-open-ticket-form': "RootController.sendOpenTicketForm",
  'get /get-subscriber-form': "RootController.sendSubscriberForm",
  'get /get-list-token-form': "RootController.sendListTokenForm",
  'get /get-token-coming-soon-form': "RootController.sendTokenComingSoonForm",

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
  'get /get-order-book-data': 'KrakenController.getOrderBookData',
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

  // Create One address for admin
  'get /admin/create-wallet/:coin_code/:user_id': 'WalletController.createAdminReceiveAddressCoin',
  'get /admin/create-admin-wallet/:coin_code/:user_id': 'WalletController.createAdminReceiveAddressCoinForAdmin',

  //API for approving and disappoving withdraw request
  'post /admin/approve-disapprove-withdraw-request': 'WithdrawReqController.approveDisapproveRequest',

  //Referral Collection
  'get /collect-referral': 'ReferralController.collectReferral',

  //Job Category API
  'post /admin/add-job-category': 'CareerController.addJobCategory',
  'put /admin/update-job-category': 'CareerController.updateJobCategory',

  // Security Feature Enable/Disable
  'post /users/security-feature-status-change': 'UsersController.changeSFStatus',

  // Whitelist ip Enable/Disable
  'post /users/whitelist-ip-status-change': 'UsersController.changeWhitelistIPStatus',
  'get /users/get-security-status': 'UsersController.getSecurityStatus',

  // Two factor requests
  'post /admin/get-twofactors-requests': 'AdminController.getTwoFactorsRequests',
  'post /admin/approve-twofactors-request-status': 'AdminController.approveUserTwofactorRequest',
  'post /admin/reject-twofactors-request-status': 'AdminController.rejectUserTwofactorRequest',

  //User Favourites routes
  'get /users/get-favourite-list': 'UserFavouritesController.getFavourites',

  //user Threshold
  'post /users/add-thresholds-limits': 'UsersController.addOrUpdateUserThresholds',
  'get /users/get-user-thresholds': 'UsersController.getUserThresholds',

  //admin threshold
  'get /admin/get-admin-thresholds': 'AdminController.adminThresholdLists',
  'post /admin/add-admin-thresholds': 'AdminController.addOrUpdateAdminThresholds',
  'get /admin/get-admin-thresholds-contacts': 'AdminController.adminThresholdContactList',
  'post /admin/add-admin-thresholds-contacts': 'AdminController.addThresholdContacts',

  // Notification API
  'get /get-notification-list': 'NotificationsController.getNotificationList',
  'post /update-notification-list': 'NotificationsController.updateOrAddUserNotification',

  // Update User Wallet balance
  // 'post /update-user-balance': 'WalletController.updateWalletBalance',
  // 'post /add-user-balance': 'WalletController.addWalletBalance',

  // Admin Send API
  'post /send-coin-admin': 'WalletController.sendCoinAdmin',

  // Batch and Balance Settlements
  'post /admin/batches/create': 'AdminController.createBatch',
  'post /admin/batches/list': 'AdminController.getBatchListing',

  // Tier Wise API
  'post /upload-tier-document': 'TierController.tierDocumentUpload',
  'get /get-tier-details': 'TierController.getUserTierList',
  'post /users/get-user-tier-details': 'TierController.getUserTierData',
  'post /users/upload-tier3-documents': 'TierController.uploadTier3Document',
  // 'post /users/upload-reject-document': 'TierController.uploadRejectedDocument',
  'get /admin/get-tier-details': 'TierController.getTierList',
  'post /admin/update-tier-list': 'TierController.updateTierList',
  'get /admin/get-tier-data': 'TierController.getTierData',
  'get /admin/upgrade-user-tier': 'TierController.upgradeUserTier',
  'get /admin/user-tier-request': 'TierController.getUserTierRequest',
  'get /admin/update-tier-request': 'TierController.updateUserTierRequest',
  'post /admin/upload-user-documents': "KYCController.adminUploadUserDocument",


  'put /admin/batches/update': 'AdminController.updateBatch',
  'get /admin/get-batch-value': 'AdminController.GetBatchValue',
  'post /admin/batches/download': 'AdminController.downloadBatchFile',
  'get /admin/get-each-transaction-value': 'AdminController.getTransactionBatchValue',
  'get /admin/get-batch-detail': 'AdminController.getBatchDetails',
  'post /admin/batches/upload': 'AdminController.uploadBatchFile',

  // Get JST Price
  'post /get-jst-price': 'UsersController.getJSTPrice',

  // Wallet Balance related API
  'get /coin-info': 'WalletController.checkWalletBalance',

  // Referral Admin API
  'get /admin/get-referal-list': 'UsersController.getReferralList',
  'get /admin/get-referred-id-data': 'UsersController.getReferredData',
  'get /admin/get-referred-user-data': 'UsersController.getUserReferData',
  'get /admin/get-referred-id-assets': 'UsersController.getReferredAssets',

  'post /get-encrypt-data': 'RootController.getEncryptKey',

  // Simplex API
  'post /get-qoute-details': 'SimplexController.getUserQouteDetails',
  'post /get-simplex-qoute-details': 'SimplexController.getQouteDetails',
  'post /get-partner-data-info': 'SimplexController.getPartnerData',
  'get /get-event-data': 'SimplexController.checkPaymentStatus',
  'get /get-token-value': 'SimplexController.getSimplexTokenValue',
  'put /update-token-value': 'SimplexController.updateSimplexTokenValue',
  'get /get-simplex-coin-list': 'SimplexController.getSimplexCoinList',
  'get /get-simplex-list': 'SimplexController.getSimplexList',
  'get /delete-simplex-event': 'SimplexController.deleteEvent',

  // JST Conversion
  'post /converion/jst-create-order': 'JSTController.createOrder',
  'post /conversion/get-jst-price-value': 'JSTController.getJSTPriceValue',
  'post /conversion/jst-price-value': 'JSTController.getJSTPriceValueAuth',
  'get /conversion/get-jst-pair': 'JSTController.getJSTPairList',
  'get /conversion/jst-pair': 'JSTController.getPairList',
  'post /conversion/apply-offer-code': 'JSTController.checkCampaignOfferStatus',

  // Delete account checking value
  'get /user/deleteAccountCheck': 'UsersController.userAccountDetailSummary',
  'get /admin/deleteAccountCheck': 'UsersController.userAccountDetailSummaryAdmin',

  // Compaigns CMS
  'post /admin/campaigns/create': 'CompaignsController.create',
  'post /admin/campaigns/list': 'CompaignsController.list',
  'get /admin/campaigns/get': 'CompaignsController.get',
  'put /admin/campaigns/change-status': 'CompaignsController.changeStatus',
  'put /admin/campaigns/update': 'CompaignsController.update',
  'get /admin/users/list': 'AdminController.userList',
  'get /admin/campaigns/verify-offercode': 'CompaignsController.verifyOfferCode',
  'post /admin/campaigns/offercode-used': 'CompaignsController.getOffercodeUsed',


  'post /admin/campaigns-offers/create': 'CompaignsOffersController.create',
  'post /admin/campaigns-offers/list': 'CompaignsOffersController.list',
  'get /admin/campaigns-offers/get': 'CompaignsOffersController.get',

  'get /admin/get-withdrawl-faldax-fee': 'WalletController.getWithdrawlFee',

  //simplexAPICall
  'get /call-simplex': 'SimplexController.simplexAPICall',
  // 'delete /delete-all-events': 'SimplexController.deleteAllEvents',

  // Get Users Wallet Data
  'post /get-user-wallet-history': 'WalletController.getMonthlyDailyValue',

  // Role Data
  'get /admin/get-role-permission': 'AdminController.getRoutePermission',
  'post /admin/update-role-permission': 'AdminController.updateRolePermission',

  // Socket for Conversion
  'get /socket/get-conversionDetail': 'JSTController.getSocketJSTValue',

  // Metabase Routes
  'get /admin/get-account-report': 'MetabaseController.getAccountClassReport',
  'get /admin/get-account-tier-report': 'MetabaseController.getAccountTierReport',
  'get /admin/get-referral-report': 'MetabaseController.getReferralReport',
  'get /admin/get-assets-report': 'MetabaseController.getAssetsReport',
  'get /admin/get-batch-report': 'MetabaseController.getBatchBalanceReport',
  "get /admin/get-career-report": 'MetabaseController.getCareerReport',
  "get /admin/get-country-report": 'MetabaseController.getCountryReport',
  "get /admin/get-employee-report": 'MetabaseController.getEmployeeReport',
  "get /admin/get-fees-report": 'MetabaseController.getFeesReport',
  "get /admin/get-history-report": "MetabaseController.getHistoryReport",
  "get /admin/get-dashboard-report": "MetabaseController.getDashboardReport",
  "get /admin/get-kyc-report": "MetabaseController.getKYCReport",
  "get /admin/get-news-report": "MetabaseController.getNewsReport",
  "get /admin/get-offers-report": "MetabaseController.getOffersReport",
  "get /admin/get-pairs-report": "MetabaseController.getPairsReport",
  "get /admin/get-roles-report": "MetabaseController.getRolesReport",
  "get /admin/get-transaction-history-report": "MetabaseController.getTransactionHistoryReport",
  "get /admin/get-two-factor-request-report": "MetabaseController.getTwoFactorRequestReport",
  "get /admin/get-users-report": "MetabaseController.getUsersReport",
  "get /admin/get-withdraw-request-report": "MetabaseController.getWithdrawRequestReport",

  // Wallet Dashboard
  "get /admin/get-wallet-dashboard": "WalletController.getWalletCoinTransaction",
  "get /admin/get-warm-wallet-data": "WalletController.getWarmWalletInfo",
  "get /admin/get-warm-wallet-transaction": "WalletController.getWarmWalletTransaction",
  "get /admin/get-cold-wallet-data": "WalletController.getColdWalletInfo",
  "get /admin/get-cold-wallet-transaction": "WalletController.getColdWalletTransaction",
  "get /admin/get-hotsend-wallet-data": "WalletController.getHotSendWalletInfo",
  "get /admin/get-hotsend-wallet-transaction": "WalletController.getHotSendWalletTransaction",
  "get /admin/get-hotreceive-wallet-data": "WalletController.getHotReceiveWalletInfo",
  "get /admin/get-hotreceive-wallet-transaction": "WalletController.getHotReceiveWalletTransaction",
  "get /admin/get-bussiness-wallet-data": "WalletController.getBusinessWalletCoinTransaction",
  // Temp
  "get /admin/get-market-snapshot": "AdminController.getTempMarketsnapshot",
  "get /admin/get-static-page-links": "AdminController.getStaticLinks",
  "post /admin/update-static-page-pdf": "AdminController.updateStaticLinks",

  // network Fee
  "post /wallet/get-network-fee": "WalletController.getNetworkFeeData",
  "post /admin/wallet/get-network-fee": "WalletController.getAdminNetworkFeeData",

  "get /health-check": "RootController.checkSystemHealth",
  "post /test-logs": "KrakenController.testLogs",
  "put /admin/update-asset-fees-limits": "AdminController.updateAssetFeesLimits",
  "get /admin/list-asset-fees-limits": "AdminController.listAssetFeesLimits",

  "get /admin/get-residual-lists": "ResidualTransactionController.list",
  'post /users/check-forgot-password-token': "AuthController.checkForgotPasswordToken", //2

  'get /users/get-available-balance': 'WalletController.getWalletAvailableBalance',
  'get /admin/get-admin-available-balance': 'WalletController.getAdminWalletAvailableBalance',
  'get /admin/get-warm-available-balance': 'WalletController.getWarmAvailableBalance',
  'post /admin/send-warm-balance': 'WalletController.getAdminWarmSend',

  'get /users/get-user-trade-status': 'UsersController.getUserTradeStatus',

  // 'get /users/tempupdate': 'CountriesController.tempupdate',
  // 'get /users/tempcustomeridupdate': 'UsersController.tempCustomerIdUpdate',

  // Get Panic History
  'get /admin/get-panic-history': 'RootController.getPanicHistory',

  // Get All Pair Value
  'get /users/get-all-pair': "PairsController.getAllPairData",

  // Layout API
  'get /users/get-users-layout': "LayoutController.getUserLayout",
  'post /users/update-users-layout': "LayoutController.updateUserLayout",

  // Upload UserDocuments
  'post /users/upload-user-documents': "KYCController.userDocumentUpload",

  // Custom Dashboard Shareable Layout
  'post /users/add-sharebale-code': "ShareableLayoutController.addCodeLayoutData",
  "post /users/get-shareable-code": "ShareableLayoutController.getCodeLayout",

  // Tier Static PDF
  "get /admin/get-tier-pdf": "AdminController.getTierStaticLink",
  "post /admin/upload-tier-pdf": "AdminController.uploadTierStaticPdf"
};
