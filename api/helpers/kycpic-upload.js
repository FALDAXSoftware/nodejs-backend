var request = require('request');
const image2base64 = require('image-to-base64');
var kycDocType = '';
const countryData = require('../../json/country')

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
        let kyc_details = await KYC.findOne({ id: 56 });
        console.log('finded kyc_details', kyc_details)
        countryData.forEach(function (item) {
            Object.keys(item).forEach(function (key) {
                if (kyc_details.country == key) {
                    kyc_details.docCountry = item[key];
                    kyc_details.bco = item[key];
                }
            });
        });
        await image2base64('https://s3.ap-south-1.amazonaws.com/varshalteamprivatebucket/' + kyc_details.front_doc)
            .then((response) => {
                kyc_details.scanData = response;
            }).catch(
                (error) => {
                    console.log('error', error);
                })

        await image2base64('https://s3.ap-south-1.amazonaws.com/varshalteamprivatebucket/' + kyc_details.back_doc)
            .then((response) => {
                kyc_details.backsideImageData = response;
            }).catch(
                (error) => {
                    console.log('error', error);
                })

        if (kyc_details.id_type == 1) {
            kycDocType = 'PP';
        } else if (kyc_details.id_type == 2) {
            kycDocType = 'DL';
        } else if (kyc_details.id_type == 3) {
            kycDocType = 'ID';
        } else {
            kyc_details.ssn = kyc_details.ssn;
        }
        kyc_details.man = kyc_details.first_name + ' ' + kyc_details.last_name;
        kyc_details.docType = kycDocType;
        kyc_details.man = kyc_details.first_name + ' ' + kyc_details.last_name;

        console.log('kyc_details>>', kyc_details)

        request.post({
            headers: {
                'Authorization': 'Basic ZmFsZGF4OjcxN2MzNGQ5NmRkNzA2N2JkYTAwMDFlMjlmZDk2MTlkYTMzYTk5ODM='
            },
            url: 'https://staging.identitymind.com/im/account/consumer',
            json: kyc_details
        }, async function (error, response, body) {
            try {
                //console.log('error', error);
                kyc_details.direct_response = response.body.res;
                kyc_details.webhook_response = null;
                console.log('response', response.body);
                await KYC.update({ id: kyc_details.id }).set({
                    direct_response: response.body.res,
                    webhook_response: null,
                    mtid: response.body.mtid,
                    comments: response.body.frd
                });
            } catch (error) {
                console.log('error', error);
            }

        });
    }
}
