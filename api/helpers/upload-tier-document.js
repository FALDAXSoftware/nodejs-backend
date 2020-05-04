var request = require('request');
var fs = require('fs')
const image2base64 = require('image-to-base64');
var kycDocType = '';
const countryData = require('../../json/country');
var moment = require('moment');
var AWS = require('aws-sdk');
var s3 = new AWS.S3();
AWS
    .config
    .loadFromPath('json/aws_config.json');
var s3 = new AWS.S3({
    signatureVersion: 'v4'
});
var S3BucketName = "production-static-asset";
var FormData = require('form-data');

module.exports = {
    friendlyName: 'KYC Upload',
    description: 'KYc Documents Upload API',
    inputs: {
        params: {
            type: 'json',
            required: true
        }
    },

    fn: async function (inputs, exits) {
        try {
            var data = inputs.params;
            console.log(data)

            var userData = await Users.findOne({
                where: {
                    id: data.user_id,
                    deleted_at: null,
                    is_active: true
                }
            });

            console.log("userData.email", userData.email)

            var userKYCDetails = await KYC.findOne({
                where: {
                    deleted_at: null,
                    user_id: data.user_id
                }
            });

            var appId = userKYCDetails.mtid

            console.log("userKYCDetails", userKYCDetails)

            var idm_key = await sails.helpers.getDecryptData(sails.config.local.IDM_TOKEN);

            if (data.type == 1 && data.tier_step == 4) {
                var tierDetails = await TierRequest.findOne({
                    where: {
                        deleted_at: null,
                        request_id: data.request_id,
                        type: 1,
                        tier_step: data.tier_step
                    }
                })
            }

            console.log("tierDetails", tierDetails)

            if (data.tier == 4 && data.type == 1 && tierDetails == undefined) {
                var getTierDetails = await sails.helpers.getTransactionId(userData.email);
                await KYC
                    .update({
                        deleted_at: null,
                        user_id: data.user_id
                    })
                    .set({
                        "mtid": getTierDetails
                    })
                appId = getTierDetails;
            }

            var options = {}
            // console.log(data);
            console.log("data.type", data.type)
            // if (data.type ==  3) {
            //     var value = {
            //         ssn: data.ssn,
            //         description: data.description
            //     }
            //     options = {
            //         'method': 'POST',
            //         'url': sails.config.local.IDM_URL + '/' + transaction_id + "/files",
            //         'headers': {
            //             'Authorization': 'Basic ' + idm_key,
            //             'Content-Type': 'application/json;'
            //         },
            //         formData: {
            //             'appId': userKYCDetails.mtid,
            //             'description': value
            //         }
            //     };
            // } else {

            console.log("data.file", data.file)
            options = {
                'method': 'POST',
                'url': sails.config.local.IDM_URL + '/' + userKYCDetails.mtid + "/files",
                'headers': {
                    'Authorization': 'Basic ' + idm_key,
                    'Content-Type': 'multipart/form-data;'
                },
                formData: {
                    'appId': userKYCDetails.mtid,
                    'description': data.description,
                    'file': {
                        'value': fs.createReadStream(data.file.fd),
                        'options': {
                            'filename': data.file.filename,
                            'contentType': null
                        }
                    }
                }
            };
            // }

            console.log("options", options)

            var responseValue = new Promise(async (resolve, reject) => {
                await request(options, async function (error, response) {
                    if (error) throw new Error(error);
                    console.log(response.body)
                    var value = JSON.parse(response.body)
                    if (value.success == "file saved") {

                        var dataValue = await TierRequest.create({
                            unique_key: data.description,
                            request_id: data.request_id,
                            tier_step: (data.tier) ? (data.tier) : (parseInt(userData.account_tier) + 1),
                            created_at: new Date(),
                            type: data.type
                        }).fetch();
                        console.log(dataValue)
                        // }
                        var object = {
                            "status": 200,
                            "data": "Your file has been uploaded successfully."
                        }
                        console.log("object", object)
                        resolve(object)
                    }
                });
            })

            return exits.success(responseValue)

        } catch (error) {
            console.log(error);
        }
    }
}