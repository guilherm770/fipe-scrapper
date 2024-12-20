const { launchBrowser } = require('./browser');
const { navigateToFipePage, selectCarroOption, selectFipeCode, selectYear, scrapeTableData } = require('./scrapeLogic');

const ERROR_LOG = require('loglevel');

async function scrapeHandler(req, res) {
    const { fipeCode, year } = req.query;

    try {
        // Input validation
        if (!fipeCode || !year) {
            throw new Error('Missing required parameters: fipeCode and year');
        }

        const browser = await launchBrowser();
        try {
            const page = await browser.newPage();
            await navigateToFipePage(page);

            const isCarroSelected = await selectCarroOption(page);
            if (!isCarroSelected) throw new Error('Failed to select "carro" option');

            await selectFipeCode(page, fipeCode);
            const isYearSelected = await selectYear(page, year);
            if (!isYearSelected) throw new Error(`Year "${year}" not available`);

            // Click the search button
            await page.waitForSelector('#buttonPesquisarcarroPorCodigoFipe');
            await page.click('#buttonPesquisarcarroPorCodigoFipe');

            const tableData = await scrapeTableData(page);
            
            // Log successful scraping
            ERROR_LOG.info('Scraping completed successfully');
            res.json({ success: true, data: tableData["Preço Médio"] });
        } catch (error) {
            ERROR_LOG.error('Error during scraping:', error);
            res.status(500).json({ success: false, error: error.message });
        } finally {
            if (browser) await browser.close();
        }
    } catch (error) {
        // Log any errors in the main try-catch block
        ERROR_LOG.error('Error in scrapeHandler:', error);
        res.status(500).json({ success: false, error: 'An unexpected error occurred' });
    }
}

module.exports = { scrapeHandler };
