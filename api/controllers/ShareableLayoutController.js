/**
 * ShareableLayoutController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

var randomize = require('randomatic');

module.exports = {

    getCodeLayout: async function (req, res) {
        try {
            var code = req.body.code;

            console.log(code)

            var sqlQuey = `SELECT * FROM shareable_layout WHERE deleted_at IS NULL AND code LIKE '%${code}%'`
            console.log(sqlQuey)
            codeData = await sails.sendNativeQuery(sqlQuey, [])

            console.log(codeData)

            codeData = codeData.rows;

            console.log("codeData", codeData)

            return res
                .status(200)
                .json({
                    "status": 200,
                    "message": sails.__("Code Data has retrieved success").message,
                    "data": codeData
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
    },

    addCodeLayoutData: async function (req, res) {
        try {

            var data = req.body;
            var user_id = req.user.id;

            var addData = await ShareableLayout.create({
                code: randomize('Aa0', 10),
                user_id: user_id,
                layout_data: data.layout_data,
                created_at: new Date()
            }).fetch();

            console.log("addData", addData)

            if (addData) {
                return res
                    .status(200)
                    .json({
                        "status": 200,
                        "message": sails.__("Layout data has been added successfully").message,
                        "data": addData.code
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
    }

}