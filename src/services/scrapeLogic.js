/**
 * Navigate to the FIPE page.
 * @param {object} page - Puppeteer page instance.
 */
async function navigateToFipePage(page) {
    const url = 'https://veiculos.fipe.org.br/';
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    console.log('Navigated to FIPE page');
}

/**
 * Select the "Carro" option.
 * @param {object} page - Puppeteer page instance.
 * @returns {boolean} - Whether the selection was successful.
 */
async function selectCarroOption(page) {
    try {
        await page.waitForSelector('.tab.vertical.tab-veiculos li[class="ilustra"] a[data-label="carro"]');
        await page.click('.tab.vertical.tab-veiculos li[class="ilustra"] a[data-label="carro"]');
        console.log('Selected "Carro" option');
        return true;
    } catch (error) {
        console.error('Error selecting "Carro" option:', error);
        return false;
    }
}

/**
 * Input the FIPE code.
 * @param {object} page - Puppeteer page instance.
 * @param {string} fipeCode - The FIPE code.
 */
async function selectFipeCode(page, fipeCode) {
    try {
        await page.waitForSelector('nav ul li a[data-slug="carro-codigo"]');
        await page.click('nav ul li a[data-slug="carro-codigo"]');
    
        // Insert the Fipe code
        await page.waitForSelector('#selectCodigocarroCodigoFipe');
        await page.type('#selectCodigocarroCodigoFipe', fipeCode);
        return true;
    } catch (error) {
        console.error('Error selecting "FipeCode" Entry:', error);
        return false;
    }
}

/**
 * Select the year.
 * @param {object} page - Puppeteer page instance.
 * @param {string} year - The year to select.
 * @returns {boolean} - Whether the year was successfully selected.
 */
async function selectYear(page, year) {
    // Wait for the select element to be available
    await page.waitForSelector('#selectCodigoAnocarroCodigoFipe');
    
    // Click on the dropdown to trigger the list to populate
    await page.click('#selectCodigoAnocarroCodigoFipe');

    // Wait for options to be populated by monitoring changes in the number of options
    await page.waitForFunction(() => {
        const options = document.querySelectorAll('#selectCodigoAnocarroCodigoFipe option');
        return options.length > 1; // Wait until more than 1 option is available
    });

    // Retrieve the populated options
    const options = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('#selectCodigoAnocarroCodigoFipe option')).map(option => ({
            text: option.textContent.trim(),
            value: option.value
        }));
    });

    // Find and select the option that matches the desired year
    const option = options.find(o => o.text === year);
    if (option) {
        await page.select('#selectCodigoAnocarroCodigoFipe', option.value);
        console.log(`Selected: ${year}`);
        return true;
    } else {
        console.log(`${year} not found in options.`);
        return false;
    }
}

/**
 * Scrape table data from the page.
 * @param {object} page - Puppeteer page instance.
 * @returns {object} - Extracted data.
 */
async function scrapeTableData(page) {
    await page.waitForSelector('#resultadocarroCodigoFipe');
    
    return await page.evaluate(() => {
        const result = {};
        const rows = document.querySelectorAll('#resultadocarroCodigoFipe table tbody tr');
        rows.forEach(row => {
            const key = row.querySelector('td:first-child p').innerText.trim().replace(/:$/, '');
            const value = row.querySelector('td:nth-child(2) p').innerText.trim();
            result[key] = value;
        });
        return result;
    });
}

module.exports = {
    navigateToFipePage,
    selectCarroOption,
    selectFipeCode,
    selectYear,
    scrapeTableData,
};