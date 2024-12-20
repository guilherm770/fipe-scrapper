const express = require('express');
const { scrapeHandler } = require('../services/handler');
const { validateQuery } = require('../utils/validation');

const router = express.Router();

router.get('/', validateQuery, scrapeHandler);

module.exports = router;