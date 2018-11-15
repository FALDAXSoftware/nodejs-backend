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
  '*': ['isAuthorized'], // Everything resctricted here
  'UsersController': {
    'create': true,
    'getCountries': true
    // We dont need authorization here, allowing public access,
  },
  'AdminController': {
    'create': true,
    "login": true,
    "forgotPassword": true,
    "resetPassword": true // We dont need authorization here, allowing public access,
  },
  'CountriesController': {
    '*': true
  },
  'SubscribeController': {
    "*": true
  },

  'AuthController': {
    '*': true // We dont need authorization here, allowing public access
  },
  'BlogsController': {
    'getAllBlogList': true,
    'getBlogDetails': true,
    'getComment': true,
    'getRelatedPost': true,
  },
  'StaticsController': {
    "getStaticPage": true,
    "getStaticPageJson": true
  },
  'RootController': {
    'getContactInfo': true,
    'sendInquiry': true
  },
  'AddCoinReqController': {
    "addCoinRequest": true
  },
  'CareerController': {
    "*": true
  }
};
