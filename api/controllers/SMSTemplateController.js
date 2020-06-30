/**
 * SMSTemplate
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
    //--------------- Get SMS Template List -----------------/
    getsmsTemplates: async function (req, res) {
        try {
            var getSmsTemplates = await SmsTemplate.find({
                where: {
                    deleted_at: null
                }
            }).sort("id DESC")

            return res
                .status(200)
                .json({
                    "status": 200,
                    "message": sails.__("sms template retrieve success").message,
                    "data": getSmsTemplates
                })
        } catch (error) {
            return res.json({
                status: 500,
                "err": sails.__("Something Wrong").message,
                error_at: error.stack
            });
        }
    },

    getSMSTemplateByID: async function (req, res) {
        try {
            let {
                id
            } = req.allParams();
            var template = await SmsTemplate.findOne({
                where: {
                    deleted_at: null,
                    id: id
                }
            })

            return res
                .status(200)
                .json({
                    "status": 200,
                    "message": sails.__("sms template retrieve success").message,
                    "data": template
                })
        } catch (error) {
            return res.json({
                status: 500,
                "err": sails.__("Something Wrong").message,
                error_at: error.stack
            });
        }
    },

    updateSMSTemplate: async function (req, res) {
        try {
            let {
                id,
                content,
                name
            } = req.allParams();

            await SmsTemplate.update({
                id
            }).set({
                content,
                name
            });
            return res.json({
                status: 200,
                message: sails.__("SMS template update success").message,
            });
        } catch (error) {
            return res.json({
                status: 500,
                "err": sails.__("Something Wrong").message,
                error_at: error.stack
            });
        }
    }
}