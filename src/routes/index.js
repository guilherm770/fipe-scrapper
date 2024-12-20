const express = require('express');
const scrapeRoute = require('./scrape');

const router = express.Router();

router.use('/scrape', scrapeRoute);

module.exports = router;