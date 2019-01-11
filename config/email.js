module.exports.email = {
    transporter: {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'developers.openxcell@gmail.com',
            pass: 'dev123!@#'
        }
    },
    // service: 'Gmail',
    // // auth: { user: 'kalpit.akhawat@openxcell.info', pass:
    // // 'HeyGoogle,ThisIsDjKalpit1712' }, //Local Cred
    // auth: {
    //     user: 'developers.openxcell@gmail.com',
    //     pass: 'dev123!@#'
    // },
    // auth: { user: 'donotreply@faldax.com', pass:
    // '!cuQ$$7APY9f2a2A6pFhpc@0m!Z$@FS*x' }, // Live Cred
    templateDir: "views/emailTemplates",
    testMode: false
};