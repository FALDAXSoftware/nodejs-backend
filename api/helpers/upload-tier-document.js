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
                    'file': {
                        'value': fs.createReadStream(data.fd),
                        'options': {
                            'filename': data.filename,
                            'contentType': null
                        }
                    }
                }
            };

            var responseValue = new Promise(async (resolve, reject) => {
                await request(options, function (error, response) {
                    if (error) throw new Error(error);
                    console.log(response.body);
                    var value = JSON.parse(response.body)
                    console.log("value", value)
                    console.log(value.success)
                    if (value.success == "file saved") {
                        var object = {
                            "status": 200,
                            "data": "Your file has been uploaded successfully."
                        }
                        resolve(object)
                    }
                });
            })

            console.log(await responseValue)

            return exits.success(responseValue)

        } catch (error) {
            console.log(error);
        }
    }
}