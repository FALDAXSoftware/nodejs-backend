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
                if (req.body.steps == 3) {
                    req.body['status'] = false;
                }
                let updated_kyc = await KYC.update({ id: kyc_details.id }).set(req.body).fetch();
                if (updated_kyc) {
                    // KYC API start
                    // if (updated_kyc[0].steps == 3) {
                    //     var greeting = await sails.helpers.kycpicUpload(updated_kyc[0]);
                    //     console.log('greeting', greeting);
                    //     return res.json({ 'status': 200, 'message': sails.__('Update KYC') })
                    // }
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
            console.log('ins??????ide', e)
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

    callbackKYC: async function (req, res) {
        let data = req.body;
        if (data) {
            try {
                if (data.ednaScoreCard) {
                    if (data.ednaScoreCard.er) {
                        if (data.ednaScoreCard.er.reportedRule) {
                            let updated = await KYC.update({ mtid: data.mtid }).set({
                                kycDoc_details: data.ednaScoreCard.er.reportedRule.details ?
                                    data.ednaScoreCard.er.reportedRule.details : '',
                                webhook_response: data.ednaScoreCard.er.reportedRule.resultCode
                            }).fetch();
                        }
                    }
                }
            } catch (err) {
                if (data.mtid) {
                    let updated = await KYC.update({ mtid: data.mtid }).set({
                        kycDoc_details: 'Something went wrong',
                        webhook_response: 'MANUAL_REVIEW'
                    }).fetch();
                }
            }
        }
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
    },

    getAllKYCData: async function (req, res) {
        let { page, limit, data } = req.allParams();
        if (data) {
            let KYCData = await KYC.find({
                where: {
                    deleted_at: null,
                    direct_response: { '!': ['ACCEPT', ''] },
                    or: [{
                        first_name: { contains: data }
                    },
                    { last_name: { contains: data } },
                    { direct_response: { contains: data } },
                    ]
                }
            }).sort("id ASC").paginate(page - 1, parseInt(limit));

            for (let index = 0; index < KYCData.length; index++) {
                if (KYCData[index].user_id) {
                    let user = await Users.findOne({ id: KYCData[index].user_id })
                    KYCData[index].email = user.email;
                }
            }

            let KYCCount = await KYC.count({
                where: {
                    deleted_at: null,
                    or: [{
                        first_name: { contains: data }
                    },
                    { last_name: { contains: data } },
                    { direct_response: { contains: data } }
                    ]
                }
            });
            if (KYCData) {
                return res.json({
                    "status": 200,
                    "message": sails.__("KYC list"),
                    "data": KYCData, KYCCount
                });
            }
        } else {
            // KYC.query("select * from kyc where steps=3 AND status='true' AND ((direct_response != 'ACCEPT' AND webhook_response != 'ACCEPT') OR (id_type = '4' AND direct_response != 'ACCEPT'))", [], function (err, rawResult) {
            //     console.log(rawResult);

            // });
            var rawResult = await sails.sendNativeQuery("SELECT * FROM public.kyc WHERE steps=3 AND status='true' AND ((direct_response != 'ACCEPT' AND webhook_response != 'ACCEPT') OR (id_type = '4' AND direct_response != 'ACCEPT') OR direct_response = 'MANUAL_REVIEW' OR direct_response = 'DENY' OR webhook_response = 'MANUAL_REVIEW' OR webhook_response = 'DENY') ORDER BY updated_at LIMIT $1 OFFSET $2", [limit, limit * (page - 1)]);
            console.log(rawResult);
            let KYCData = rawResult.rows;
            let KYCCount = rawResult.rowCount

            for (let index = 0; index < KYCData.length; index++) {
                if (KYCData[index].user_id) {
                    let user = await Users.findOne({ id: KYCData[index].user_id })
                    KYCData[index].email = user.email;
                }
            }
            if (KYCData) {
                return res.json({
                    "status": 200,
                    "message": sails.__("KYC list"),
                    "data": KYCData, KYCCount
                });
            }
        }
    },

    approveDisapproveKYC: async function (req, res) {
        try {
            let { id, isApprove } = req.body;
            let kyc_details = await KYC.findOne({ id });

            if (kyc_details) {
                if (isApprove == true) {
                    let updated_kyc = await KYC.update({ id: kyc_details.id }).set({
                        direct_response: 'ACCEPT',
                        webhook_response: 'ACCEPT',
                        isApprove: true,
                        updated_at: new Date()
                    }).fetch();
                    if (updated_kyc) {
                        return res.json({ 'status': 200, 'message': 'KYC application approved' })
                    }
                } else {
                    let updated_kyc = await KYC.update({ id: kyc_details.id }).set({
                        isApprove: false,
                        steps: 2,
                        direct_response: null,
                        webhook_response: null,
                        mtid: null,
                        kycDoc_details: null,
                        updated_at: new Date()
                    }).fetch();
                    if (updated_kyc) {
                        return res.json({ 'status': 200, 'message': 'KYC application rejected' })
                    }
                }
            } else {
                return res.status(500).json({
                    status: 500,
                    "err": "Details Not Found"
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
