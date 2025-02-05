const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_S3_BUCKET_REGION,
});

const BUCKET_NAME = process.env.AWS_BUCKET_NAME;

// Function to create a folder (prefix) in S3
const createUserFolder = async (email) => {
  const folderName = email.split('@')[0]; // Extract username from email

  const params = {
    Bucket: BUCKET_NAME,
    Key: `${folderName}/`, // Ending slash ensures it's treated as a folder
  };

  try {
    await s3.putObject(params).promise();
    console.log(`Folder created: ${folderName}`);
  } catch (error) {
    console.error('Error creating folder:', error);
  }
};

module.exports = { createUserFolder };
