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

    updateContactInfo: async function (req, res) {
        try {
            let contactDetails = [];
            Object.keys(req.body)
                .forEach(async function eachKey(key) {
                    contactDetails = await AdminSetting.update({ slug: key }).set({ value: req.body[key] }).fetch();
                });
            if (contactDetails) {
                return res.json({
                    status: 200,
                    message: "Contact details updated successfully.",
                })
            } else {
                return res.status(500).json({
                    status: 500,
                    "err": sails.__("Something Wrong")
                });
            }
        } catch (error) {
            console.log('index', error)
        }
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

    getAllInquiries: async function (req, res) {
        let { page, limit, data } = req.allParams();
        if (data) {
            let inquiryData = await Inquiry.find({ message: { contains: data } }).sort('created_at DESC').paginate(page - 1, parseInt(limit));
            let inquiryCount = await Inquiry.count({ message: { contains: data } });
            if (inquiryData) {
                return res.json({
                    "status": 200,
                    "message": "Inquiries retrived successfully",
                    "data": inquiryData, inquiryCount
                });
            }
        } else {
            let inquiryData = await Inquiry.find().sort('created_at DESC').paginate(page - 1, parseInt(limit));
            let inquiryCount = await Inquiry.count();
            if (inquiryData) {
                return res.json({
                    "status": 200,
                    "message": "Inquiries retrived successfully",
                    "data": inquiryData, inquiryCount
                });
            } else {
                return res.status(500).json({
                    status: 500,
                    "err": sails.__("Something Wrong")
                });
            }
        }
    },

    testnews: async function (req, res) {
        var greeting = await sails.helpers.ccnPodcast();
        console.log('greeting', greeting);
        res.end();
    },

    callbackTest: async function (req, res) {
        console.log(JSON.stringify(req.body));
        res.end();

    }

};
