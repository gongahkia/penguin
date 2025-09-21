import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Tests', () => {
  test('desktop accessibility', async ({ page }) => {
    await page.goto('/');

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('calculator accessibility', async ({ page }) => {
    await page.goto('/');
    await page.click('[data-app="calculator"]');

    const calcWindow = page.locator('[data-window-id*="calculator"]');
    await expect(calcWindow).toBeVisible();

    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('[data-window-id*="calculator"]')
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('terminal accessibility', async ({ page }) => {
    await page.goto('/');
    await page.click('[data-app="terminal"]');

    const terminalWindow = page.locator('[data-window-id*="terminal"]');
    await expect(terminalWindow).toBeVisible();

    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('[data-window-id*="terminal"]')
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('keyboard navigation', async ({ page }) => {
    await page.goto('/');

    // Test keyboard navigation through desktop icons
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Check if focus is visible
    const focusedElement = await page.locator(':focus');
    await expect(focusedElement).toBeVisible();

    // Test Enter key to open an app
    await page.keyboard.press('Enter');

    // Should open the focused application
    await page.waitForSelector('[data-window-id]', { timeout: 2000 });
  });

  test('screen reader compatibility', async ({ page }) => {
    await page.goto('/');

    // Check for proper ARIA labels and roles
    await expect(page.locator('[role="application"]')).toBeVisible();

    // Check desktop has proper labeling
    const desktop = page.locator('.desktop');
    await expect(desktop).toHaveAttribute('aria-label');

    // Check taskbar accessibility
    const taskbar = page.locator('[data-testid="taskbar"]');
    await expect(taskbar).toHaveAttribute('role', 'navigation');
  });

  test('color contrast', async ({ page }) => {
    await page.goto('/');

    // Run accessibility scan with color contrast rules
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();

    // Filter for color contrast violations
    const colorContrastViolations = accessibilityScanResults.violations.filter(
      violation => violation.id === 'color-contrast'
    );

    expect(colorContrastViolations).toEqual([]);
  });

  test('text scaling', async ({ page }) => {
    await page.goto('/');

    // Test 200% zoom
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.evaluate(() => {
      document.body.style.zoom = '2';
    });

    // Check that essential elements are still visible and usable
    await expect(page.locator('.desktop')).toBeVisible();
    await expect(page.locator('[data-testid="taskbar"]')).toBeVisible();
    await expect(page.locator('[data-testid="desktop-icons"]')).toBeVisible();

    // Test app functionality at 200% zoom
    await page.click('[data-app="calculator"]');
    const calcWindow = page.locator('[data-window-id*="calculator"]');
    await expect(calcWindow).toBeVisible();

    // Test calculator buttons are still clickable
    await page.click('[data-window-id*="calculator"] .calc-button:has-text("5")');
    await expect(page.locator('[data-window-id*="calculator"] .calc-display-text')).toHaveText('5');
  });

  test('high contrast mode', async ({ page }) => {
    await page.goto('/');

    // Simulate high contrast mode
    await page.addStyleTag({
      content: `
        @media (prefers-contrast: high) {
          * {
            background-color: black !important;
            color: white !important;
            border-color: white !important;
          }
        }
      `
    });

    // Test that the interface is still usable
    await expect(page.locator('.desktop')).toBeVisible();

    // Open calculator and test functionality
    await page.click('[data-app="calculator"]');
    const calcWindow = page.locator('[data-window-id*="calculator"]');
    await expect(calcWindow).toBeVisible();

    await page.click('[data-window-id*="calculator"] .calc-button:has-text("7")');
    await expect(page.locator('[data-window-id*="calculator"] .calc-display-text')).toHaveText('7');
  });

  test('reduced motion preference', async ({ page }) => {
    await page.goto('/');

    // Simulate reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });

    // Test that animations are reduced/disabled
    await page.click('[data-app="calculator"]');
    const calcWindow = page.locator('[data-window-id*="calculator"]');

    // Window should appear without animation (check it appears quickly)
    await expect(calcWindow).toBeVisible({ timeout: 500 });
  });
});