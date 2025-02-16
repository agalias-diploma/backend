const express = require('express');
const passport = require('passport');
const { getUserTemplates, checkForNewFiles, getUserFileContent } = require('../controllers/s3-bucket.controller');

const router = express.Router();

// GET user templates
router.get('/s3-files', passport.authenticate('jwt', { session: false }), getUserTemplates);

// GET check for new files
router.get('/s3-check-for-new-files', passport.authenticate('jwt', { session: false }), checkForNewFiles);

// GET user file content
router.get("/s3-file-content", passport.authenticate("jwt", { session: false }), getUserFileContent);

module.exports = router;
