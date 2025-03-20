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

    const lastKnownModified = req.user.lastModified || new Date(0);
    
    if (lastModified > lastKnownModified) {
      // Save the new last modified timestamp for the user
      req.user.lastModified = lastModified;
      
      return res.json({ hasNewFiles: true, lastModified });
    }

    return res.json({ hasNewFiles: false });

  } catch (error) {
    console.error('Error checking for new files in S3:', error);
    res.status(500).json({ error: 'Failed to check for new files' });
  }
};

const getUserFileContent = async (req, res) => {
  try {
    const { fileKey } = req.query;

    if (!fileKey) {
      console.error("Missing fileKey in request");
      return res.status(400).json({ error: "File key is required" });
    }

    const userFolder = req.user.email.split("@")[0] + "/";
    if (!fileKey.startsWith(userFolder)) {
      console.error("Unauthorized file access attempt:", fileKey);
      return res.status(403).json({ error: "Access denied: Unauthorized file access" });
    }

    // Fetch file from S3
    const params = {
      Bucket: BUCKET_NAME,
      Key: fileKey,
    };
    const fileData = await s3.getObject(params).promise();

    const fileContent = fileData.Body.toString("utf-8");

    res.setHeader("Content-Type", "application/json");
    res.send(fileContent);
  } catch (error) {
    console.error("Error fetching file content:", error);
    res.status(500).json({ error: "Failed to fetch file content" });
  }
};

const saveUserFileContent = async (req, res) => {
  try {
    if (!req.user || !req.user.email) {
      return res.status(400).json({ error: "User email not found" });
    }

    const email = req.user.email;
    const folderName = email.split("@")[0];
    const { filename, content } = req.body;

    if (!filename || !content) {
      return res.status(400).json({ error: "Filename and content are required" });
    }

    const fileKey = `${folderName}/${filename}.js`;

    // Check if file already exists
    const paramsCheck = { Bucket: BUCKET_NAME, Key: fileKey };
    try {
      await s3.headObject(paramsCheck).promise();
      return res.status(409).json({ error: "File already exists" });
    } catch (err) {
      if (err.code !== "NotFound") {
        console.error("Error checking file existence:", err);
        return res.status(500).json({ error: "Failed to check file existence" });
      }
    }

    // It's better to get rid of it in future and save files in json format instead of js
    const fileContent = `const obj = \`${JSON.stringify(content, null, 2)}\`;\nexport default obj;`;

    const paramsUpload = {
      Bucket: BUCKET_NAME,
      Key: fileKey,
      Body: fileContent,
      ContentType: "application/javascript",
    };

    await s3.putObject(paramsUpload).promise();

    return res.status(201).json({ message: "File saved successfully" });
  } catch (error) {
    console.error("Error saving file to S3:", error);
    res.status(500).json({ error: "Failed to save file to S3" });
  }
};

const deleteUserFile = async (req, res) => {
  try {
    const { fileKey } = req.query;

    if (!fileKey) {
      console.error("Missing fileKey in request");
      return res.status(400).json({ error: "File key is required" });
    }

    const userFolder = req.user.email.split("@")[0] + "/";
    if (!fileKey.startsWith(userFolder)) {
      console.error("Unauthorized file access attempt:", fileKey);
      return res.status(403).json({ error: "Access denied: Unauthorized file access" });
    }

    const params = {
      Bucket: BUCKET_NAME,
      Key: fileKey,
    };
    await s3.deleteObject(params).promise();

    console.log("File deleted successfully:", fileKey); // remove this later
    res.status(200).json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Error deleting file:", error);
    res.status(500).json({ error: "Failed to delete the file" });
  }
};


module.exports = { getUserTemplates, checkForNewFiles, getUserFileContent, saveUserFileContent, deleteUserFile };
