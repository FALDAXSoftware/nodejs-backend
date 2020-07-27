var gm = require('gm').subClass({ imageMagick: true }); //Server
// var gm = require('gm'); //Local
var AWS = require('aws-sdk');
var s3 = new AWS.S3();
AWS
  .config
  .loadFromPath('json/aws_config.json');
var s3 = new AWS.S3({ signatureVersion: 'v4' });
var mime = require('mime');
var S3BucketName = "production-static-asset";
var fs = require('fs');
var logger = require('../controllers/logger')

function UploadFiles() {
  return { upload: _upload, deleteFile: _deleteFile, newUpload: _newUpload };

  function _upload(filePath, uploadFileName) {

    return new Promise((resolve, reject) => {

      // gm(filePath)
      //   .noProfile()
      //   .stream(function (err, stdout, stderr) {
      console.log("filePath", filePath)
      fs.readFile(filePath, async function (err, data) {
        if (err) {
          console.log("Error to get file", err);
          await logger.error(err, 'Error to get file')
        }
        console.log(err, data)
        var profile = {
          Bucket: S3BucketName,
          Key: uploadFileName,
          ACL: 'public-read',
          Body: data
        };

        console.log("profile", profile)
        s3.putObject(profile, function (err, rese) {
          console.log(err, rese)
          if (err) {
            reject(err);
          } else {
            resolve(rese)
          }
        });
        // });
      });
    })
  }

  // Delete File from S3
  function _deleteFile(key) {
    return new Promise((resolve, reject) => {
      var params = { Bucket: S3BucketName, Key: key };
      s3.deleteObject(params, function (err, rese) {
        if (err) {
          reject(err);
        } else {
          resolve(rese)
        }
      });
    })
  }


  function _newUpload(filePath, uploadFileName) {
    // return new Promise((resolve, reject) => {

    //   gm(filePath)
    //     .noProfile()
    //     .stream(function (err, stdout, stderr) {
    //       var buf = new Buffer('');

    //       stdout.on('data', function (data) {
    //         buf = Buffer.concat([buf, data]);
    //       });

    //       var fs = require('fs');
    //       var fileStream = fs.createReadStream(filePath);
    //       stdout.on('end', function (data) {
    //         var profile = {
    //           Bucket: S3BucketName,
    //           Key: uploadFileName,
    //           ACL: 'public-read',
    //           Body: buf,
    //           ContentType: mime.lookup(uploadFileName)
    //         };
    //         console.log("profile", profile)
    //         s3.putObject(profile, function (err, rese) {
    //           console.log(err, rese)
    //           if (err) {
    //             reject(err);
    //           } else {
    //             resolve(uploadFileName)
    //           }
    //         });
    //       });
    //     });
    // })
    return new Promise((resolve, reject) => {

      // gm(filePath)
      //   .noProfile()
      //   .stream(function (err, stdout, stderr) {
      console.log("filePath", filePath)
      fs.readFile(filePath, async function (err, data) {
        if (err) {
          console.log("Error to get file", err);
          await logger.error(err, 'Error to get file')
        }
        console.log(err, data)
        var profile = {
          Bucket: S3BucketName,
          Key: uploadFileName,
          ACL: 'public-read',
          Body: data
        };

        console.log("profile", profile)
        s3.putObject(profile, function (err, rese) {
          console.log(err, rese)
          if (err) {
            reject(err);
          } else {
            resolve(rese)
          }
        });
        // });
      });
    })
  }
}



module.exports = UploadFiles();
