// console.log(process.env.APP_URL);

module.exports.urlconf = {
  CMS_URL: process.env.CMS_URL,
  APP_URL: process.env.APP_URL,
  BUCKET_URL: "https://s3.us-east-2.amazonaws.com/production-static-asset/",
  BUCKET_NAME: "production-static-asset",
  SITE_HOME_PAGE: "https://www.faldax.com"
};