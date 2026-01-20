import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './tests',
    timeout: 60000,
    use: {
        baseURL: 'http://localhost:8081',
        screenshot: 'on',
        video: 'on-first-retry',
    },
    outputDir: './screenshots',
    projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
});
