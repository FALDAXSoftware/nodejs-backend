/**
 * RootController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {

    getContactInfo: async function (req, res) {
        let contactDetails = await AdminSetting.find({
            type: "contact"
        });
        let contacts = {};
        contactDetails.forEach(element => {
            contacts[element.slug] = element.value;
        });
        return res.json({
            status: 200,
            message: "contact details retrived successfully.",
            data: contacts
        })
    },

    sendInquiry: async function (req, res) {
        let inquiryDetails = await Inquiry.create({
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email,
            message: req.body.message,
            created_at: new Date()
        }).fetch();
        if (inquiryDetails) {
            return res.json({
                status: 200,
                message: "Inquiry sent successfully.",
            })
        } else {
            return res.status(500).json({
                status: 500,
                "err": sails.__("Something Wrong")
            });
        }
    },
};

