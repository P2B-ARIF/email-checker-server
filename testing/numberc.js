const puppeteer = require('puppeteer');

async function checkPhoneNumberVerification(email) {
    const browser = await puppeteer.launch({ headless: false }); // Set headless to true to run in headless mode
    const page = await browser.newPage();

    try {
        // Navigate to Gmail login page
        await page.goto('https://accounts.google.com/signin', { waitUntil: 'networkidle2' });

        // Enter the email
        await page.type('input[type="email"]', email);
        await page.click('#identifierNext');
        await page.waitForSelector('input[type="password"]', { timeout: 5000 });

        // Check if it asks for phone verification before password
        const phoneVerification = await page.$('input[type="tel"]');
        if (phoneVerification) {
            console.log('Phone number verification required.');
            return { email, phoneNumberVerification: true };
        }

        // Enter a dummy password to proceed further
        await page.type('input[type="password"]', 'dummyPassword');
        await page.click('#passwordNext');
        await page.waitForNavigation({ waitUntil: 'networkidle2' });

        // Check for phone verification step after entering password
        const phonePrompt = await page.$('input[type="tel"]');
        if (phonePrompt) {
            console.log('Phone number verification required.');
            return { email, phoneNumberVerification: true };
        }

        console.log('Phone number verification not required.');
        return { email, phoneNumberVerification: false };
    } catch (error) {
        console.error('Error during login process:', error);
        return { email, phoneNumberVerification: 'error', reason: error.message };
    } finally {
        await browser.close();
    }
}


// Example usage
checkPhoneNumberVerification('mohammadarif4319@gmail.com').then(result => {
    console.log(result);
});
