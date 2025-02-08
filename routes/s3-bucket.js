const express = require('express');
const passport = require('passport');
const { getUserTemplates, selectUserTemplate } = require('../controllers/s3-bucket.controller');

const router = express.Router();

// GET user templates
router.get('/s3-files', passport.authenticate('jwt', { session: false }), getUserTemplates);

// POST select template
router.post('/s3-select-template', passport.authenticate('jwt', { session: false }), selectUserTemplate);

module.exports = router;
