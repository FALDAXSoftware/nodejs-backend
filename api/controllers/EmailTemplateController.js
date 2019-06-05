/**
 * EmailTemplateController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {

    get: async function (req, res) {
        try {
            let templates = await EmailTemplate.find();
            return res.json({
                status: 200,
                message: sails.__("Email template retrive success"),
                templates
            });
        } catch (error) {
            return res
                .status(500)
                .json({
                    "status": 500,
                    "err": sails.__("Something Wrong")
                });
        }
    },
    update: async function (req, res) {
        try {
            let { id, content } = req.allParams();
            await EmailTemplate.update({
                id
            }).set({
                content
            });
            return res.json({
                status: 200,
                message: sails.__("Email template update success"),
            });
        } catch (error) {
            return res
                .status(500)
                .json({
                    "status": 500,
                    "err": sails.__("Something Wrong")
                });
        }
    },

    getById: async function (req, res) {
        try {
            let { id } = req.allParams();
            let template = await EmailTemplate.findOne({ id });
            return res.json({
                status: 200,
                message: sails.__("Email template retrive success"),
                template
            });
        } catch (error) {
            return res
                .status(500)
                .json({
                    "status": 500,
                    "err": sails.__("Something Wrong")
                });
        }
    }

};

