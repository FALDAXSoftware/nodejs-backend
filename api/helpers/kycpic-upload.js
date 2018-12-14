var request = require('request');
const image2base64 = require('image-to-base64');
var kycDocType = '';
const countryData = require('../../json/country');
var moment = require('moment');

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
        let kyc_details = await KYC.findOne({ id: inputs.params.id });
        let kycUploadDetails = {};

        countryData.forEach(function (item) {
            Object.keys(item).forEach(function (key) {
                if (kyc_details.country == key && !kyc_details.ssn) {
                    kycUploadDetails.docCountry = item[key];
                    kycUploadDetails.bco = item[key];
                }
            });
        });

        if (!kyc_details.ssn) {
            kycUploadDetails.docType = kycDocType;
            await image2base64('https://s3.ap-south-1.amazonaws.com/varshalteamprivatebucket/' + kyc_details.front_doc)
                .then((response) => {
                    kycUploadDetails.scanData = response;
                }).catch(
                    (error) => {
                        console.log('error', error);
                    })

            await image2base64('https://s3.ap-south-1.amazonaws.com/varshalteamprivatebucket/' + kyc_details.back_doc)
                .then((response) => {
                    kycUploadDetails.backsideImageData = response;
                }).catch(
                    (error) => {
                        console.log('error', error);
                    })
        }

        if (kyc_details.id_type == 1) {
            kycDocType = 'PP';
        } else if (kyc_details.id_type == 2) {
            kycDocType = 'DL';
        } else if (kyc_details.id_type == 3) {
            kycDocType = 'ID';
        } else {
            kycUploadDetails.ssn = kyc_details.ssn;
        }
        kycUploadDetails.man = kyc_details.first_name + ' ' + kyc_details.last_name;
        kycUploadDetails.bfn = kyc_details.first_name;
        kycUploadDetails.bln = kyc_details.last_name;
        kycUploadDetails.bln = kyc_details.last_name;
        kycUploadDetails.bsn = kyc_details.address + ' ' + kyc_details.address_2 !== null ? kyc_details.address_2 : '';
        kycUploadDetails.bc = kyc_details.city;
        kycUploadDetails.bz = kyc_details.zip;
        kycUploadDetails.dob = moment(kyc_details.dob, 'DD-MM-YYYY').format('YYYY-MM-DD');

        request.post({
            headers: {
                'Authorization': 'Basic ZmFsZGF4OjcxN2MzNGQ5NmRkNzA2N2JkYTAwMDFlMjlmZDk2MTlkYTMzYTk5ODM='
            },
            url: 'https://staging.identitymind.com/im/account/consumer',
            json: kycUploadDetails
        }, async function (error, response, body) {
            try {
                console.log('kyc_details', kyc_details);
                kyc_details.direct_response = response.body.res;
                kyc_details.webhook_response = null;
                await KYC.update({ id: kyc_details.id }).set({
                    direct_response: response.body.res,
                    webhook_response: null,
                    mtid: response.body.mtid,
                    comments: response.body.frd,
                    status: true,
                });
            } catch (error) {
                console.log('error', error);
                await KYC.update({ id: kyc_details.id }).set({
                    direct_response: "MANUAL_REVIEW",
                    webhook_response: "MANUAL_REVIEW",
                    comments: "Could Not Verify",
                    status: true,
                });
            }
        });
    }
}
