var request = require('request');
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

    let kyc_details = await KYC.findOne({
      id: inputs.params.id
    });
    let user = await Users.findOne({
      id: kyc_details.user_id
    });
    let kycUploadDetails = {};

    // countryData.forEach(function (arrayItem) {
    //     //var x = arrayItem.prop1 + 2;
    //     console.log('arrayItem', arrayItem);
    //     Object.keys(arrayItem).forEach(function (key) {
    //         console.log('arrayItem 2', key);
    //         if (kyc_details.country == key && !kyc_details.ssn) {
    //             console.log('inside', item);
    //             kycUploadDetails.docCountry = item[key];
    //             kycUploadDetails.bco = item[key];
    //         }
    //     });
    // });

    // countryData.forEach((item) => {
    //     console.log('TRY', item, kyc_details.country, key, kyc_details.ssn);
    //     Object.keys(item).forEach(function (key) {
    //         if (kyc_details.country == key && !kyc_details.ssn) {
    //             console.log('inside', item);
    //             kycUploadDetails.docCountry = item[key];
    //             kycUploadDetails.bco = item[key];
    //         }
    //     });
    // });

    if (!kyc_details.ssn) {
      kycUploadDetails.docCountry = kyc_details.country_code;
      kycUploadDetails.bco = kyc_details.country_code;
    }

    if (!kyc_details.ssn) {
      await image2base64(sails.config.local.AWS_S3_URL + kyc_details.front_doc)
        .then((response) => {
          kycUploadDetails.scanData = response;
        }).catch(
          (error) => {
            console.log('error', error);
          })

      await image2base64(sails.config.local.AWS_S3_URL + kyc_details.back_doc)
        .then((response) => {
          kycUploadDetails.backsideImageData = response;
        }).catch(
          (error) => {
            console.log('error', error);
          })
    }
    // kycUploadDetails.docType = kycDocType;

    if (kyc_details.id_type == 1) {
      kycUploadDetails.docType = 'PP';
    } else if (kyc_details.id_type == 2) {
      kycUploadDetails.docType = 'DL';
    } else if (kyc_details.id_type == 3) {
      kycUploadDetails.docType = 'ID';
    } else {
      kycUploadDetails.ssn = kyc_details.ssn;
    }
    kycUploadDetails.man = user.email;
    kycUploadDetails.bfn = kyc_details.first_name;
    kycUploadDetails.bln = kyc_details.last_name;
    kycUploadDetails.bln = kyc_details.last_name;
    kycUploadDetails.bsn = kyc_details.address;
    if (kyc_details.address_2 !== null) {
      kycUploadDetails.bsn = kycUploadDetails.bsn + ' ' + kyc_details.address_2;
    }
    kycUploadDetails.bc = kyc_details.city;
    kycUploadDetails.bz = kyc_details.zip;
    //kycUploadDetails.docCountry = 'US';
    // kycUploadDetails.dob = moment(kyc_details.dob, 'DD-MM-YYYY').format('YYYY-MM-DD');
    kycUploadDetails.dob = kyc_details.dob;

    var idm_key = await sails.helpers.getDecryptData(sails.config.local.IDM_TOKEN);
    //production url : https://edna.identitymind.com/merchantedna/
    //user:password base64
    request.post({
      headers: {
        'Authorization': 'Basic ' + idm_key
      },
      url: sails.config.local.IDM_URL,
      json: kycUploadDetails
    }, async function (error, response, body) {
      try {

        kyc_details.direct_response = response.body.res;
        kyc_details.webhook_response = null;
        await KYC.update({
          id: kyc_details.id
        }).set({
          direct_response: response.body.res,
          webhook_response: null,
          mtid: response.body.mtid,
          comments: response.body.frd,
          status: true,
        });

        if (kyc_details.front_doc != null) {
          let profileData = {
            Bucket: S3BucketName,
            Key: kyc_details.front_doc
          }

          s3.deleteObject(profileData, function (err, response) {
            if (err) {
              console.log(err)
            } else {}
          })
        }
        if (kyc_details.back_doc != null) {
          let profileData = {
            Bucket: S3BucketName,
            Key: kyc_details.back_doc
          }

          s3.deleteObject(profileData, function (err, response) {
            if (err) {
              console.log(err)
            } else {}
          })
        }

      } catch (error) {
        console.log('error', error);
        await KYC.update({
          id: kyc_details.id
        }).set({
          direct_response: "MANUAL_REVIEW",
          webhook_response: "MANUAL_REVIEW",
          comments: "Could Not Verify",
          status: true,
        });
      }
    });
  }
}
