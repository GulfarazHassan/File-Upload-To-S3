const AWS = require('aws-sdk');
const fs = require('fs');
const secrets = require('./config');

function createS3Instance() {
  const s3 = new AWS.S3({
    credentials: {
      accessKeyId: secrets.awsCreds.accessKey,
      secretAccessKey: secrets.awsCreds.secretKey,
    },
    region: 'ap-south-1',
  });
  return s3;
}

async function uploadFileToS3(fileObj, bucketName) {
  const s3 = createS3Instance();
  const fileStream = fs.createReadStream(fileObj.filepath);
  const params = {
    Body: fileStream,
    Bucket: bucketName,
    Key: fileObj.originalFilename,
  };
  const uploadData = await s3.upload(params).promise();
  return uploadData;
}

async function getBucketListFromS3(bucketName) {
  const s3 = createS3Instance();
  const params = {
    Bucket: bucketName,
    MaxKeys: 10,
  };

  const bucketData = s3.listObjects(params).promise();
  return bucketData || {};
}

async function getPresignedURL(bucketName, key) {
  const s3 = createS3Instance();
  const params = {
    Bucket: bucketName,
    Key: key,
    Expires: 60,
  };

  const preSignedURL = await s3.getSignedUrl('getObject', params);
  return preSignedURL;
}

module.exports = {
  uploadFileToS3,
  getBucketListFromS3,
  getPresignedURL,
};
