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

    }
};

