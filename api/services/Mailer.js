module.exports.sendmail = async function (obj, req, res) {

    sails.hooks.email.send(
        obj.layout, obj,
        {
            to: obj.email,
            subject: "test email"
        },
        async function (err) {
            if (err) {
                res.json({
                    "status": sails.config.constants.error_status,
                    "message": sails.config.constants.unsuccess_listing,
                    "error": err,
                });
                return;
            } else {
                try {
                    if (obj.mail_name == "signup") {
                        res.json({
                            "status": sails.config.constants.success_status,
                            "message": sails.__("user created succesfully").message,
                            data: obj.user_detail,
                        });
                        return;
                    } else {
                        let sql_query = `UPDATE admin SET reset_token = '${obj.save_token}' WHERE email = '${obj.email}' `;

                        let user = await sails.sendNativeQuery(sql_query);

                        if (user) {
                            res.json({
                                "status": sails.config.constants.success_status,
                                "message": sails.__("email successfully sent to registered email id").message,
                            });
                            return;
                        } else {
                            res.json({
                                "status": sails.config.constants.error_status,
                                "message": sails.__("admin email id is wrong").message,
                            });
                            return;
                        }
                    }
                } catch (err) {
                    res.json({
                        "status": sails.config.constants.catch_error,
                        "error": err,
                    });
                    return;
                }
            }
        }
    )
}
