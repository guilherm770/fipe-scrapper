const express = require('express');
const { scrapeHandler } = require('../services/scrape');
const { validateQuery } = require('../utils/validation');

const router = express.Router();

router.get('/', validateQuery, scrapeHandler);

module.exports = router;