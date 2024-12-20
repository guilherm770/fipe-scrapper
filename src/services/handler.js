const { launchBrowser } = require('./browser');
const { navigateToFipePage, selectCarroOption, selectFipeCode, selectYear, scrapeTableData } = require('./scrape');

const logger = require('../config/logger');

async function scrapeHandler(req, res) {
    const { fipeCode, year } = req.query;

    try {
        // Input validation
        if (!fipeCode || !year) {
            throw new Error('Missing required parameters: fipeCode and year');
        }

        const browser = await launchBrowser();
        try {
            logger.info('Creating browser instance')
            const page = await browser.newPage();
            await navigateToFipePage(page);
            await selectCarroOption(page);
            await selectFipeCode(page, fipeCode);
            await selectYear(page, year);

            // Click the search button
            await page.waitForSelector('#buttonPesquisarcarroPorCodigoFipe');
            await page.click('#buttonPesquisarcarroPorCodigoFipe');

            const CarCost = await scrapeTableData(page);
            
            // Log successful scraping
            logger.info('Scraping completed successfully');
            res.json({ success: true, data: CarCost });
        } catch (error) {
            logger.error('Error during scraping: ', error);
            res.status(500).json({ success: false, error: error.message });
        } finally {
            if (browser) await browser.close();
        }
    } catch (error) {
        // Log any errors in the main try-catch block
        logger.error('Error in scrapeHandler:', error);
        res.status(500).json({ success: false, error: 'An unexpected error occurred' });
    }
}

module.exports = { scrapeHandler };
