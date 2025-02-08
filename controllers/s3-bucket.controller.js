const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_S3_BUCKET_REGION,
});

const BUCKET_NAME = process.env.AWS_BUCKET_NAME;

// Get all user templates from S3
const getUserTemplates = async (req, res) => {
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
const selectUserTemplate = async (req, res) => {
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

// Function to check if new files have been added to the user's folder in S3
const checkForNewFiles = async (req, res) => {
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

    // Get the last modified time for the most recent file
    const lastModified = data.Contents.reduce((latest, file) => {
      return file.LastModified > latest ? file.LastModified : latest;
    }, new Date(0));

    // Check if the last modified time is different from the previously saved value (you would store it in DB or session)
    // For now, you can return the last modified timestamp as a signal of new files.
    const lastKnownModified = req.user.lastModified || new Date(0); // Placeholder for actual logic to get last known timestamp
    
    if (lastModified > lastKnownModified) {
      // Save the new last modified timestamp for the user (could store in DB or session)
      req.user.lastModified = lastModified;
      
      return res.json({ hasNewFiles: true, lastModified });
    }

    return res.json({ hasNewFiles: false });

  } catch (error) {
    console.error('Error checking for new files in S3:', error);
    res.status(500).json({ error: 'Failed to check for new files' });
  }
};
  
module.exports = {
    getUserTemplates,
    selectUserTemplate,
    checkForNewFiles,
};