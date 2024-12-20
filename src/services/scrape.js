const config = require('../config/handler');
const logger = require('../config/logger');

/**
 * Navigate to the FIPE page.
 * @param {object} page - Puppeteer page instance.
 */
async function navigateToFipePage(page) {
    const url = config.FIPE_URL;
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    logger.info('Navigated to FIPE page');
}

/**
 * Select the "Carro" option.
 * @param {object} page - Puppeteer page instance.
 */
async function selectCarroOption(page) {
    try {
        await page.waitForSelector(config.CARRO_ELEMENT);
        await page.click(config.CARRO_ELEMENT);
        logger.info('Searching for car value in FIPE table')
    } catch (error) {
        logger.error('Error selecting "Carro" option:', error);
    }
}

/**
 * Input the FIPE code.
 * @param {object} page - Puppeteer page instance.
 * @param {string} fipeCode - The FIPE code.
 */
async function selectFipeCode(page, fipeCode) {
    try {
        await page.waitForSelector(config.SELECT_FIPE_CODE);
        await page.click(config.SELECT_FIPE_CODE);
    
        // Insert the Fipe code
        await page.waitForSelector(config.INPUT_FIPE_CODE);
        await page.type(config.INPUT_FIPE_CODE, fipeCode);
        logger.info('Inserting desired FIPE code')
    } catch (error) {
        logger.error('Error typing "FipeCode":', error);
    }
}

/**
 * Select the year.
 * @param {object} page - Puppeteer page instance.
 * @param {string} year - The year to select.
 */
async function selectYear(page, year) {
    try {
        // Wait for the select element to be available
        await page.waitForSelector(config.YEAR_DROPDOWN);
        
        // Click on the dropdown to trigger the list to populate
        await page.click(config.YEAR_DROPDOWN);
        logger.info('Dropdown year options')

        // Wait for options to be populated by monitoring changes in the number of options
        await page.waitForFunction(() => {
            const options = document.querySelectorAll('#selectCodigoAnocarroCodigoFipe option');
            return options.length > 1; // Wait until more than 1 option is available
        });
        logger.info('Search for all mapped options')

        // Retrieve the populated options
        const options = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('#selectCodigoAnocarroCodigoFipe option')).map(option => ({
                text: option.textContent.trim(),
                value: option.value
            }));
        });
        logger.info('Retrieve all mapped options')

        // Find and select the option that matches the desired year
        const option = options.find(o => o.text === year);
        if (option) {
            await page.select(config.YEAR_DROPDOWN, option.value);
            logger.info(`The ${year} was selected`);
        } else {
            logger.info(`${year} not found in options.`);
        }
    } catch (error) {
        logger.error(`Error retrieving available years:`, error);
    }
}

/**
 * Scrape table data from the page.
 * @param {object} page - Puppeteer page instance.
 * @returns {object} - Extracted data.
 */
async function scrapeTableData(page) {
    await page.waitForSelector(config.TABLE_SELECTOR);
    
    return await page.evaluate(() => {
        const result = {};
        const rows = document.querySelectorAll('#resultadocarroCodigoFipe table tbody tr');
        rows.forEach(row => {
            const key = row.querySelector('td:first-child p').innerText.trim().replace(/:$/, '');
            const value = row.querySelector('td:nth-child(2) p').innerText.trim();
            result[key] = value;
        });
        return result["Preço Médio"];
    });
}

module.exports = {
    navigateToFipePage,
    selectCarroOption,
    selectFipeCode,
    selectYear,
    scrapeTableData,
};