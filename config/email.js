module.exports.email = {
    service: 'Gmail',
    auth: { user: 'developers.openxcell@gmail.com', pass: 'dev123!@#' }, //Local Cred
    //auth: { user: 'donotreply@faldax.com', pass: '!cuQ$$7APY9f2a2A6pFhpc@0m!Z$@FS*x' }, // Live Cred
    templateDir: "views/emailTemplates",
    testMode: false,
};