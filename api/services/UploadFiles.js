
var AWS = require('aws-sdk');
var s3 = new AWS.S3();
AWS
  .config
  .loadFromPath('../../json/aws_config.json');
var s3bucket = new AWS.S3({
  params: {
    Bucket: 'varshalteamprivatebucket'
  }
});

function s3Upload(files, path) {
  return new Promise((resolve, reject) => {
    try {

      var data = {
        Bucket: "varshalteamprivatebucket",
        Key: path,
        Body: files,
        ACL: 'public-read'
      };

      s3bucket.upload(data, function (err, rese) {
        if (err) {
          throw err
        }
        console.log(rese);
        resolve(rese.location);
      });
    }
    catch(e) {
      reject({message:"Could not upload image",err:e});
    }
  });
}

module.exports = s3Upload;
