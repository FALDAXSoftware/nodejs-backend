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

            var userKYCDetails = await KYC.findOne({
                where: {
                    deleted_at: null,
                    user_id: data.user_id
                }
            });

            var transaction_id = await sails.helpers.getTransactionId(userData.email);

            var idm_key = await sails.helpers.getDecryptData(sails.config.local.IDM_TOKEN);
            var options = {
                'method': 'POST',
                'url': sails.config.local.IDM_URL + '/' + transaction_id + "/files",
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

            var responseValue = new Promise(async (resolve, reject) => {
                await request(options, async function (error, response) {
                    if (error) throw new Error(error);
                    console.log(response.body)
                    var value = JSON.parse(response.body)
                    if (value.success == "file saved") {
                        var tierData = await TierRequest.findOne({
                            where: {
                                user_id: data.user_id,
                                deleted_at: null,
                                type: data.type,
                                tier_step: parseInt(userData.account_tier) + 1
                            }
                        })

                        console.log("tierData", tierData)
                        if (tierData != undefined) {
                            var dataValue = await TierRequest
                                .update({
                                    user_id: data.user_id,
                                    deleted_at: null,
                                    type: data.type,
                                    tier_step: parseInt(userData.account_tier) + 1
                                })
                                .set({
                                    unique_key: data.description,
                                    is_approved: null
                                })
                        } else {
                            var dataValue = await TierRequest.create({
                                unique_key: data.description,
                                user_id: data.user_id,
                                tier_step: parseInt(userData.account_tier) + 1,
                                created_at: new Date(),
                                type: data.type
                            })
                        }
                        var object = {
                            "status": 200,
                            "data": "Your file has been uploaded successfully."
                        }
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