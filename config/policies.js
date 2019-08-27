/**
 * Policy Mappings
 * (sails.config.policies)
 *
 * Policies are simple functions which run **before** your actions.
 *
 * For more information on configuring policies, check out:
 * https://sailsjs.com/docs/concepts/policies
 */

module.exports.policies = {

  /***************************************************************************
   *                                                                          *
   * Default policy for all controllers and actions, unless overridden.       *
   * (`true` allows public access)                                            *
   *                                                                          *
   ***************************************************************************/

  // '*': true,
  '*': [
    'isAuthorized', 'isAdmin'
  ], // Everything resctricted here
  'UsersController': {
    'create': 'checkReCaptcha',
    'getCountries': true,
    'getCountriesData': true,
    'verifyNewEmail': true
    // 'updateSendCoinFee': true, 'updateUserDetails': true We dont need
    // authorization here, allowing public access,
  },
  'AdminController': {
    'create': true,
    "login": true,
    "forgotPassword": true,
    "resetPassword": true, // We dont need authorization here, allowing public access,
    "getAdminWalletDetails": true,
  },
  'CountriesController': {
    '*': true
  },
  'SubscribeController': {
    "*": true
  },

  'AuthController': {
    "login": 'checkReCaptcha',
    "forgotPassword": "checkReCaptcha",
    '*': true // We dont need authorization here, allowing public access
  },
  'BlogsController': {
    'getAllBlogList': true,
    'getBlogDetails': true,
    'getComment': true,
    'getRelatedPost': true,
    'getAllNews': true
  },
  'StaticsController': {
    "getStaticPage": true,
    "getStaticPageJson": true
  },
  'RootController': {
    'getContactInfo': true,
    "webhookOnReciveBitgo": true,
    "sendOpenTicketForm": true,
    "enableWebSocket": true,
    "createAllWallet": true,
    "sendSubscriberForm": true,
    "sendListTokenForm": true,
    "callKrakenAPI": true,
    "bitgoTest": true,
    "testemail": true,
    "queryTest": true,
    "createWallet": true,
    "queryTestThresold": true
    // "setAddressWebhook": true,
    // "webhookOnAddress": true
  },
  // 'WalletController':{
  //   "getCoinBalanceForWallet":true
  // },
  'CareerController': {
    "applyJob": "checkReCaptcha",
    "*": true,
  },
  "KYCController": {
    "callbackKYC": true
  },
  "BuyController": {
    // "getBuyBookDetails": true,
  },
  "SellController": {
    // "getSellBookDetails": true,
    "getData": true
  },
  "CoinsController": {
    "createWallet": true,
    "createAllWallet": true
  },
  "TradeController": {
    "stopLimitExecute": true
  },
  "TradingViewController": {
    "*": true
  },
  "FeesController": {
    "getAllFees": true
  },
  "Type2CoinController": {
    "getCoinInfo": true,
    "getCoinNewAddress": true,
    "getTransactionList": true,
    "sendCoin": true,
    "listAddresses": true,
    "getAddressBalance": true
  },
  "KrakenController": {
    "getOrderBookData": true,
    "addOrder": true,
    "depositAddress": true,
    "getDepositStatus": true,
    "getWithdrawlInformation": true,
    "getWithdrawlFunds": true,
    "getRecentWithdrawlStatus": true,
    "withdrwalCancellationStatus": true,
    "queryTradeInformation": true
  },
  "WebhookController": {
    "*": true
  },
  "ThresoldController": {
    "addThresoldValue": true
  }
};
