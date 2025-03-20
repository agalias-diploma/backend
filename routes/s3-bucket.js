const express = require('express');
const passport = require('passport');
const { getUserTemplates, checkForNewFiles, getUserFileContent, saveUserFileContent, deleteUserFile } = require('../controllers/s3-bucket.controller');

const router = express.Router();

// GET user templates
router.get('/s3-files', passport.authenticate('jwt', { session: false }), getUserTemplates);

// GET check for new files
// this route is broken currently, need to fix it. It return `GET /api/s3-check-for-new-files?userId=undefined 401` response currently
router.get('/s3-check-for-new-files', passport.authenticate('jwt', { session: false }), checkForNewFiles);

// GET user file content
router.get("/s3-file-content", passport.authenticate("jwt", { session: false }), getUserFileContent);

// POST user file content on S3 bucket. Handle auto-refresh of the files list when new file is saved, 
// so then we can get rid of s3-check-for-new-files route
router.post("/s3-save-template", passport.authenticate("jwt", { session: false }), saveUserFileContent);

// POST user file content on S3 bucket
router.delete("/s3-delete-file", passport.authenticate("jwt", { session: false }), deleteUserFile);

module.exports = router;
