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
                    return res.json({ 'status': '200', 'message': sails.__('KYC Updated') })
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

                let updated_kyc = await KYC.update({ id: kyc_details.id }).set(req.body).fetch();

                if (updated_kyc) {
                    return res.json({ 'status': '200', 'message': sails.__('Update KYC') })
                } else {
                    return res.status(400).json({ 'status': '400', 'message': sails.__('Update KYC') })
                }

            } else {
                let kyc_created = await KYC.create(req.body).fetch();
                if (kyc_created) {
                    return res.json({ 'status': '200', 'message': sails.__('Create KYC') })
                } else {
                    return res.status(400).json({ 'status': '400', 'message': sails.__('Create KYC') })
                }
            }
        } catch (e) {
            return res.status(500).json({
                "message": "Error",
                "error": e
            });
        }
    },

    uploadKYCDoc: async function (req, res) {
        req.file('image').upload(function (err, file) {
            if (err) {
                return res.status(500).json({ 'status': '500', 'message': 'Something went wrong!!' })
            } else {
                if (file.length <= 0) {
                    return res.status(500).json({ 'status': '500', 'message': 'Something went wrong!!' })
                }
                return res.json({
                    'status': '200',
                    'message': sails.__('KYC Doc Upload'),
                    data: file[0].fd
                })
            }
        });
    }
};
