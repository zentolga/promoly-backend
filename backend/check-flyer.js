const { chromium } = require('playwright');

(async () => {
    // Attempt to locate chrome executable
    const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ||
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' ||
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';

    console.log('Launching browser...');
    // Try both with executablePath and without (autodetect)
    let browser;
    try {
        browser = await chromium.launch({ headless: true });
    } catch (e) {
        console.log('Default launch failed, trying system chrome...');
        try {
            browser = await chromium.launch({ headless: true, executablePath });
        } catch (e2) {
            console.error('Failed to launch browser:', e2.message);
            return;
        }
    }

    const page = await browser.newPage();
    console.log('Navigating to Editor...');
    // We assume backend is serving frontend at root or admin port?
    // Promoly V2 usually has admin on :5173 (dev) or served by backend :3000?
    // Let's try production URL: https://promoly-backend.onrender.com/kampagnen/17c680d4-07d6-4006-b7cc-838d1b672c6f
    // But this requires LOGIN.
    // So checking PUBLIC flyer page might be easier?
    // But user wants to check EDITOR.

    // If I cannot login via script easily, I can't check Editor.
    // Public flyer URL: /f/:id
    // Let's check public flyer first.

    const url = 'https://promoly-backend.onrender.com/f/17c680d4-07d6-4006-b7cc-838d1b672c6f';
    await page.goto(url, { waitUntil: 'networkidle' });

    console.log('Taking screenshot...');
    await page.screenshot({ path: 'check-flyer.png', fullPage: true });

    console.log('Done! Saved to check-flyer.png');
    await browser.close();
})();
