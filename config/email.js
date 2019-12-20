module.exports.email = {
    transporter: {
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    },
    from: process.env.DEFAULT_SENDING_EMAIL,
    templateDir: "views/emailTemplates",
    testMode: true
};