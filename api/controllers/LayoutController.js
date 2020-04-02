/**
 * LayoutController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {

    getUserLayout: async function (req, res) {
        try {
            var user_id = req.user.id;

            var userLayoutData = await Layout.findOne({
                where: {
                    deleted_at: null,
                    user_id: user_id
                }
            });

            console.log(userLayoutData)

            if (!userLayoutData && userLayoutData == undefined) {
                return res
                    .status(201)
                    .json({
                        "status": 201,
                        "message": sails.__("No Data").message
                    })
            } else {
                return res
                    .status(200)
                    .json({
                        "status": 200,
                        "message": sails.__("Layout Data Success").message,
                        "data": userLayoutData
                    })
            }
        } catch (error) {
            return res
                .status(500)
                .json({
                    status: 500,
                    "err": sails.__("Something Wrong").message,
                    error_at: error.stack
                });
        }
    },

    updateUserLayout: async function (req, res) {
        try {

            var user_id = req.user.id;
            var data = req.body;
            data.user_id = user_id;
            data.created_at = new Date();

            console.log(data)
            var userData = await Layout.findOne({
                where: {
                    deleted_at: null,
                    user_id: user_id
                }
            })

            var updateData
            if (userData && userData != undefined) {
                delete data.created_at;
                updateData = await Layout
                    .update({
                        deleted_at: null,
                        user_id: user_id
                    })
                    .set({
                        ...data
                    }).fetch();
            } else {
                updateData = await Layout.create({
                    ...data
                }).fetch();
            }
            return res
                .status(200)
                .json({
                    "status": 200,
                    "message": sails.__("Layout updated success").message,
                    "data": updateData
                })

        } catch (error) {
            return res
                .status(500)
                .json({
                    status: 500,
                    "err": sails.__("Something Wrong").message,
                    error_at: error.stack
                });
        }
    }

}