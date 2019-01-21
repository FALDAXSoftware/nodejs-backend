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

function UploadFiles() {
  return { upload: _upload };

  function _upload(filePath, uploadFileName) {
    return new Promise((resolve, reject) => {

      gm(filePath).noProfile().stream(function (err, stdout, stderr) {
        var buf = new Buffer('');

        stdout.on('data', function (data) {
          buf = Buffer.concat([buf, data]);
        });

        stdout.on('end', function (data) {
          var profile = {
            Bucket: S3BucketName,
            Key: uploadFileName,
            ACL: 'public-read',
            Body: buf,
            ContentType: mime.lookup(uploadFileName)
          };
          s3.putObject(profile, function (err, rese) {
            if (err) {
              reject(err);
            } else {
              resolve(rese)
            }
          });
        });
      });
    })
  }
}

module.exports = UploadFiles();
