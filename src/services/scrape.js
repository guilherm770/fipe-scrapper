const { launchBrowser } = require('./browser');
const { navigateToFipePage, selectCarroOption, selectFipeCode, selectYear, scrapeTableData } = require('./scrapeLogic');

async function scrapeHandler(req, res) {
    const { fipeCode, year } = req.query;
    let browser;

    try {
        browser = await launchBrowser();
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
        res.json({ success: true, data: tableData["Preço Médio"]});

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    } finally {
        if (browser) await browser.close();
    }
}

module.exports = { scrapeHandler };