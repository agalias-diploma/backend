const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_S3_BUCKET_REGION,
});

const BUCKET_NAME = process.env.AWS_BUCKET_NAME;

// Get all user templates from S3
exports.getUserTemplates = async (req, res) => {
  try {
    if (!req.user || !req.user.email) {
      return res.status(400).json({ error: 'User email not found' });
    }

    const email = req.user.email;
    const folderName = email.split('@')[0];

    const params = {
      Bucket: BUCKET_NAME,
      Prefix: `${folderName}/`,
    };

    const data = await s3.listObjectsV2(params).promise();

    const files = data.Contents.map((file) => ({
      key: file.Key,
      lastModified: file.LastModified,
      size: file.Size,
    }));

    res.json({ files });
  } catch (error) {
    console.error('Error fetching S3 files:', error);
    res.status(500).json({ error: 'Failed to retrieve files from S3' });
  }
};

// User selects a template
exports.selectUserTemplate = async (req, res) => {
    try {
      const { templateKey } = req.body;
  
      if (!templateKey) {
        return res.status(400).json({ error: 'Template key is required' });
      }
  
      req.session.selectedTemplate = templateKey;
      res.json({ selectedTemplate: templateKey });
    } catch (error) {
      console.error('Error selecting template:', error);
      res.status(500).json({ error: 'Failed to select template' });
    }
  };
  
