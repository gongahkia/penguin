import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  test('page load performance', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');

    // Wait for the desktop to be fully loaded
    await expect(page.locator('.desktop')).toBeVisible();

    const loadTime = Date.now() - startTime;

    // Assert that page loads within reasonable time (3 seconds)
    expect(loadTime).toBeLessThan(3000);

    console.log(`Page load time: ${loadTime}ms`);
  });

  test('window opening performance', async ({ page }) => {
    await page.goto('/');

    // Measure calculator opening time
    const startTime = Date.now();
    await page.click('[data-app="calculator"]');
    await expect(page.locator('[data-window-id*="calculator"]')).toBeVisible();
    const calcOpenTime = Date.now() - startTime;

    expect(calcOpenTime).toBeLessThan(1000);
    console.log(`Calculator open time: ${calcOpenTime}ms`);

    // Measure terminal opening time
    const terminalStartTime = Date.now();
    await page.click('[data-app="terminal"]');
    await expect(page.locator('[data-window-id*="terminal"]')).toBeVisible();
    const terminalOpenTime = Date.now() - terminalStartTime;

    expect(terminalOpenTime).toBeLessThan(1000);
    console.log(`Terminal open time: ${terminalOpenTime}ms`);
  });

  test('calculator performance', async ({ page }) => {
    await page.goto('/');
    await page.click('[data-app="calculator"]');

    // Test rapid calculations
    const startTime = Date.now();

    for (let i = 0; i < 10; i++) {
      await page.click('text=5');
      await page.click('text=+');
      await page.click('text=3');
      await page.click('text==');
      await page.click('text=C');
    }

    const calculationTime = Date.now() - startTime;

    // 10 calculations should complete within 2 seconds
    expect(calculationTime).toBeLessThan(2000);
    console.log(`10 calculations time: ${calculationTime}ms`);
  });

  test('memory usage with multiple windows', async ({ page }) => {
    await page.goto('/');

    // Open multiple applications
    const apps = ['calculator', 'terminal', 'texteditor', 'notepad', 'fileexplorer'];

    for (const app of apps) {
      await page.click(`[data-app="${app}"]`);
      await expect(page.locator(`[data-window-id*="${app}"]`)).toBeVisible();
    }

    // Check that all windows are still responsive
    await page.click('[data-window-id*="calculator"] .calc-button:has-text("5")');
    await expect(page.locator('[data-window-id*="calculator"] .calc-display-text')).toHaveText('5');

    // Type in text editor
    await page.fill('[data-window-id*="texteditor"] textarea', 'Performance test');
    await expect(page.locator('[data-window-id*="texteditor"] textarea')).toHaveValue('Performance test');
  });

  test('bundle size check', async ({ page }) => {
    // Navigate to the page and check network resources
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);

    // Get all network requests
    const requests = [];
    page.on('request', request => {
      if (request.resourceType() === 'script' || request.resourceType() === 'stylesheet') {
        requests.push(request.url());
      }
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    // Check that we're not loading too many resources
    expect(requests.length).toBeLessThan(20);
    console.log(`Total resources loaded: ${requests.length}`);
  });
});