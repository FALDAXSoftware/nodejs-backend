/**
 * AccountClassController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
module.exports = {
    /**
      * API for getting activity data
      * Renders this api when user activity data needs to be fecthed
      *
      * @param <>
      *
      * @return <User acticity data>
     */
    // CMS all class api
    getAllAccountClasses: async function (req, res) {
        try {
            let allClasses = await AccountClass.find();
            console.log('>>>>allClasses', allClasses)

            return res.json({
                "status": 200,
                "message": sails.__("Account Class Data"),
                allClasses
            });
        } catch (e) {
            console.log('>>>>>>>>e', e)
            return res
                .status(500)
                .json({
                    status: 500,
                    "err": sails.__("Something Wrong")
                });
        }
    },

    addAccountClass: async function (req, res) {
        let params = req.body.class_name;
        console.log('params', params)
        try {
            let accountClass = await AccountClass
                .create(params)
                .fetch();
            if (!accountClass) {
                return res
                    .status(500)
                    .json({
                        status: 500,
                        err: sails.__("Something Wrong")
                    });
            }
            return res.json({
                status: 200,
                message: sails.__("Class added success")
            })
        } catch (error) {
            console.log('error', error)
            return res
                .status(500)
                .json({
                    status: 500,
                    err: sails.__("Something Wrong")
                })
        }
    },

    updateAccountClass: async function (req, res) {
        let { id, class_name } = req.body;
        console.log('params update', id)
        try {
            let accountClass = await AccountClass.findOne({ id }).fetch();
            console.log('accountClass', accountClass)
            if (accountClass) {
                var updatedClass = await AccountClass
                    .update({ id })
                    .set(class_name)
                    .fetch();
                console.log('updatedClass if', updatedClass)
                return res.json({
                    status: 200,
                    message: sails.__("Class Update Success")
                })
            } else {
                return res
                    .status(500)
                    .json({
                        status: 500,
                        err: sails.__("Something Wrong")
                    });
            }
        } catch (error) {
            console.log('error', error)
            return res
                .status(500)
                .json({
                    status: 500,
                    err: sails.__("Something Wrong")
                })
        }
    },
};
