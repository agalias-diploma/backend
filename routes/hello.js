const express = require('express');
const { hello } = require('../controllers/hello.controller');

const router = express.Router();

router.get('/hello/', hello);

module.exports = router;
