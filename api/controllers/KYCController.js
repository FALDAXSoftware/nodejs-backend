/**
 * KYCController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
var UploadFiles = require('../services/UploadFiles');

module.exports = {
    updateKYCInfo: async function (req, res) {
        try {
            let user_id = req.user.id;
            req.body.user_id = user_id;
            let kyc_details = await KYC.findOne({ user_id });

            if (kyc_details) {
                if (kyc_details.steps == 3) {
                    return res.json({ 'status': 200, 'message': sails.__('KYC Updated') })
                }

                if (req.body.front_doc) {
                    let extension = req.body.front_doc.split('.');
                    let filename = new Date().getTime().toString();
                    filename += '.' + extension[extension.length - 1];
                    await UploadFiles.upload(req.body.front_doc, 'faldax', '/kyc/' + filename)
                    req.body.front_doc = 'faldax/kyc/' + filename;
                }

                if (req.body.back_doc) {
                    let extension = req.body.back_doc.split('.');
                    let filename = new Date().getTime().toString();
                    filename += '.' + extension[extension.length - 1];
                    await UploadFiles.upload(req.body.back_doc, 'faldax', '/kyc/' + filename)
                    req.body.back_doc = 'faldax/kyc/' + filename;
                }

                req.body.created_at = new Date();
                let updated_kyc = await KYC.update({ id: kyc_details.id }).set(req.body).fetch();

                if (updated_kyc) {
                    // KYC API start
                    console.log('inside', updated_kyc)
                    if (updated_kyc[0].steps == 3) {
                        console.log('in if')
                        var greeting = await sails.helpers.kycpicUpload(updated_kyc[0]);
                        console.log('greeting>>>>>', greeting)
                    }
                    // KYC API end
                    return res.json({ 'status': 200, 'message': sails.__('Update KYC') })
                } else {
                    return res.status(400).json({ 'status': 400, 'message': sails.__('Update KYC') })
                }
            } else {
                let kyc_created = await KYC.create(req.body).fetch();
                if (kyc_created) {
                    return res.json({ 'status': 200, 'message': sails.__('Create KYC') })
                } else {
                    return res.status(400).json({ 'status': 400, 'message': sails.__('Create KYC') })
                }
            }
        } catch (e) {
            return res.status(500).json({
                status: 500,
                "err": sails.__("Something Wrong")
            });
        }
    },

    uploadKYCDoc: async function (req, res) {
        req.file('image').upload(function (err, file) {
            if (err) {
                return res.status(500).json({ "status": 500, "err": sails.__("Something Wrong") })
            } else {
                if (file.length <= 0) {
                    return res.status(500).json({ "status": 500, "err": sails.__("Something Wrong") })
                }
                return res.json({
                    'status': 200,
                    'message': sails.__('KYC Doc Upload'),
                    data: file[0].fd
                })
            }
        });
    },

    callbackTest: async function (req, res) {
        console.log('>>>>>', JSON.stringify(req.body), req.body.ednaScoreCard.er);
        res.end();
    },

    getKYCDetails: async function (req, res) {
        try {
            let user_id = req.user.id;
            let KYCData = await KYC.findOne({ user_id });
            if (KYCData) {
                return res.json({
                    "status": 200,
                    "message": "KYC Data",
                    "data": KYCData
                });
            } else {
                return res.status(500).json({
                    status: 500,
                    "err": sails.__("No KYC")
                });
            }
        } catch (e) {
            return res.status(500).json({
                status: 500,
                "err": sails.__("Something Wrong")
            });
        }
    }
};
