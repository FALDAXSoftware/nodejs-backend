/**
 * PermissionController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
var logger = require("../controllers/logger")

module.exports = {
    /**
     * API for getting activity data
     * Renders this api when permissions activity data needs to be fecthed
     *
     * @param <>
     *
     * @return <Permission acticity data>
     */
    // CMS all permission api
    getAllPermissions: async function (req, res) {
        try {
            let allClasses = await Permissions.find({
                deleted_at: null
            });

            return res.json({
                "status": 200,
                "message": "All permissions listed",
                allClasses
            });
        } catch (error) {
            // await logger.error(error.message)
            return res
                .status(500)
                .json({
                    status: 500,
                    "err": sails.__("Something Wrong"),
                    error_at:error.stack
                });
        }
    }
};
