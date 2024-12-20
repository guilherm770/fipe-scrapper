const puppeteer = require('puppeteer');
const puppeteerConfig = require('../config/puppeteer');

async function launchBrowser() {
    return puppeteer.launch(puppeteerConfig);
}

module.exports = { launchBrowser };