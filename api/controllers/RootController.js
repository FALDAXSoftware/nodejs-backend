/**
 * RootController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
var request = require('request');
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
            let q = {
                deleted_at: null
            }
            q['or'] = [
                { first_name: { contains: data } },
                { last_name: { contains: data } },
                { email: { contains: data } },
            ]

            let inquiryData = await Inquiry.find({ ...q }).sort('created_at DESC').paginate(page - 1, parseInt(limit));
            let inquiryCount = await Inquiry.count({ ...q });
            if (inquiryData) {
                return res.json({
                    "status": 200,
                    "message": "Inquiries retrived successfully",
                    "data": inquiryData, inquiryCount
                });
            }
        } else {
            let q = {
                deleted_at: null
            }

            let inquiryData = await Inquiry.find({ ...q }).sort('created_at DESC').paginate(page - 1, parseInt(limit));
            let inquiryCount = await Inquiry.count({ ...q });
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
        // var greeting = await sails.helpers.kycpicUpload();
        // console.log('greeting', greeting);
        // res.end();
        var greeting = await sails.helpers.tradding.marketSell();
        res.json();
    },

    csvToJson: function (req, res) {
        request('https://restcountries.eu/rest/v2/all', function (error, response, body) {
            jsonObj = JSON.parse(body);
            var countryArray = {};
            jsonObj.forEach(row => {
                countryArray[row['name']] = row['alpha2Code']
            });
            res.json(countryArray)
        });
    }

};
