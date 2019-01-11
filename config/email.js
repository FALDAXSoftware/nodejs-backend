module.exports.email = {
    transporter: {
        host: "email-smtp.us-east-1.amazonaws.com",
        port: 465,
        secure: true,
        auth: {
            user: 'AKIAIQQCO77B36AL25DQ',
            pass: 'At1hx84V7GoKhDlqElWUghrlIG30kM6QejfUjgxdoQzf'
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
    from: 'donotreply@faldax.com',
    templateDir: "views/emailTemplates",
    testMode: false
};