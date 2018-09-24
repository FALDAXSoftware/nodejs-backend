// var gm = require('gm').subClass({imageMagick: true}); //Server
var gm = require('gm'); //Local
var request = require('request');
var fs = require('fs');
var async = require('async');
var AWS = require('aws-sdk');
var s3 = new AWS.S3();
AWS
  .config
  .loadFromPath('json/aws_config.json');
var s3 = new AWS.S3({signatureVersion: 'v4'});
var mime = require('mime');

function UploadFiles() {

  return {upload: _upload};

  function _upload(filePath, name, uploadFileName) {
    return new Promise((resolve, reject) => {
      var success_count = 0;
      var failure_count = 0;
      console.log(filePath)

      gm(filePath).noProfile().stream(function (err, stdout, stderr) {
        var buf = new Buffer('');
        
        stdout.on('data', function (data) {
          buf = Buffer.concat([buf, data]);
        });
       
        stdout.on('end', function (data) {
          // console.log("buf",buf);
          var profile = {
            Bucket: 'varshalteamprivatebucket',
            Key: name + '/profile/' + uploadFileName,
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
