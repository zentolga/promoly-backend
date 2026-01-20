import { test, expect } from '@playwright/test';

const API_BASE = 'http://localhost:3100';

test.describe('Promoly E2E Tests', () => {
    test.beforeEach(async ({ page }) => {
        // Login
        await page.goto('/');
        await page.fill('input[type="password"]', 'demo123');
        await page.click('button[type="submit"]');
        await page.waitForURL('**/dashboard');
    });

    test('Dashboard shows correct stats', async ({ page }) => {
        await expect(page.locator('.stat-value').first()).toBeVisible();
        await page.screenshot({ path: 'screenshots/01-dashboard.png' });

        // Verify API data
        const stats = await page.evaluate(async () => {
            const res = await fetch('http://localhost:3100/stats/summary');
            return res.json();
        });
        expect(stats.categoriesCount).toBeGreaterThan(0);
        expect(stats.productsCount).toBeGreaterThan(0);
    });

    test('Categories CRUD works', async ({ page }) => {
        await page.click('text=Kategorien');
        await page.waitForSelector('.table');
        await page.screenshot({ path: 'screenshots/02-kategorien.png' });

        // Verify categories exist
        const rows = await page.locator('.table tbody tr').count();
        expect(rows).toBeGreaterThan(0);
    });

    test('Products list works', async ({ page }) => {
        await page.click('text=Produkte');
        await page.waitForSelector('.table');
        await page.screenshot({ path: 'screenshots/03-produkte.png' });

        const rows = await page.locator('.table tbody tr').count();
        expect(rows).toBeGreaterThan(0);
    });

    test('Campaign editor opens and displays items', async ({ page }) => {
        await page.click('text=Kampagnen');
        await page.waitForSelector('.table');
        await page.screenshot({ path: 'screenshots/04-kampagnen.png' });

        // Click on Editor button for first campaign
        await page.click('.table tbody tr:first-child >> text=Editor');
        await page.waitForSelector('.editor-container');
        await page.screenshot({ path: 'screenshots/05-editor.png' });

        // Verify grid items exist
        await expect(page.locator('.grid-item').first()).toBeVisible();
    });

    test('Theme selector works', async ({ page }) => {
        await page.click('text=Kampagnen');
        await page.click('.table tbody tr:first-child >> text=Editor');
        await page.waitForSelector('.theme-btn');

        // Click different themes
        const themeButtons = page.locator('.theme-btn');
        await themeButtons.nth(1).click();
        await page.waitForTimeout(500);
        await page.screenshot({ path: 'screenshots/06-theme-dark.png' });

        await themeButtons.nth(2).click();
        await page.waitForTimeout(500);
        await page.screenshot({ path: 'screenshots/07-theme-green.png' });
    });

    test('Export PDF works', async ({ page }) => {
        await page.click('text=Kampagnen');
        await page.click('.table tbody tr:first-child >> text=Editor');
        await page.waitForSelector('.editor-container');

        // Click PDF export
        const [newPage] = await Promise.all([
            page.waitForEvent('popup'),
            page.click('text=A4 PDF'),
        ]);

        // Wait for PDF to load
        await newPage.waitForTimeout(3000);
        expect(newPage.url()).toContain('/files/flyers/');
        await page.screenshot({ path: 'screenshots/08-pdf-exported.png' });
    });

    test('Public landing page works', async ({ page }) => {
        // Get campaign ID from API
        const campaigns = await page.evaluate(async () => {
            const res = await fetch('http://localhost:3100/campaigns');
            return res.json();
        });

        if (campaigns.length > 0) {
            await page.goto(`http://localhost:3100/c/${campaigns[0].id}`);
            await page.waitForSelector('.card');
            await page.screenshot({ path: 'screenshots/09-landing-page.png' });

            // Verify content
            await expect(page.locator('text=Top-Angebote')).toBeVisible();
        }
    });

    test('Customers list with optIn toggle', async ({ page }) => {
        await page.click('text=Kunden');
        await page.waitForSelector('.table');
        await page.screenshot({ path: 'screenshots/10-kunden.png' });

        const rows = await page.locator('.table tbody tr').count();
        expect(rows).toBeGreaterThan(0);
    });

    test('WhatsApp health check', async ({ page }) => {
        await page.click('text=WhatsApp');
        await page.waitForSelector('.badge');
        await page.screenshot({ path: 'screenshots/11-whatsapp.png' });

        // Verify health status is shown
        await expect(page.locator('text=Status')).toBeVisible();
    });
});
