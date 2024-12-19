const express = require('express');
const puppeteer = require('puppeteer');
const Joi = require('joi');

const app = express();
const PORT = 3000;

// Define the schema
const schema = Joi.object({
        fipeCode: Joi.string().required(),
        year: Joi.string().required()
    }
);

// Helper function to launch the browser
async function launchBrowser() {
    return puppeteer.launch({
        headless: true, // Use headless: true for production
        executablePath: '/usr/bin/google-chrome',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
}

// Helper function to navigate to the Fipe page
async function navigateToFipePage(page) {
    const url = 'https://veiculos.fipe.org.br/';
    await page.goto(url);
    await page.waitForSelector('.wrapper.mm-page.mm-slideout #front .content .tab.vertical.tab-veiculos');
}

// Helper function to select the 'carro' option
async function selectCarroOption(page) {
    const carro = await page.$('.wrapper.mm-page.mm-slideout #front .content .tab.vertical.tab-veiculos li[class="ilustra"] a[data-label="carro"]');
    if (carro) {
        await carro.click();
        console.log('Clicked on "carro"');
        return true;
    }
    console.log('Carro option not found');
    return false;
}

// Helper function to select Fipe code
async function selectFipeCode(page, fipeCode) {
    await page.waitForSelector('nav ul li a[data-slug="carro-codigo"]');
    await page.click('nav ul li a[data-slug="carro-codigo"]');
    
    // Insert the Fipe code
    await page.waitForSelector('#selectCodigocarroCodigoFipe');
    await page.type('#selectCodigocarroCodigoFipe', fipeCode);
}

// Helper function to select year from dropdown
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

// Helper function to scrape the table data
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

// Main scraping function
async function scrapeFipeData(fipeCode, year) {
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
        return tableData["Preço Médio"];

    } catch (error) {
        throw new Error(`Error during scraping: ${error.message}`);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// REST API endpoint to trigger the scraping
app.get('/scrape', async (req, res) => {
    const { fipeCode, year } = req.query;

    // Validate fipeCode and year presence
    if (!fipeCode || !year) {
        return res.status(400).json({ success: false, error: "Missing fipeCode or year in the query parameters." });
    }

    try {
        const data = await scrapeFipeData(fipeCode, year);
        res.json({ success: true, data });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// curl "http://localhost:3000/scrape?fipeCode=001531-8&year=2025%20Gasolina"
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});