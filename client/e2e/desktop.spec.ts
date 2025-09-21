import { test, expect } from '@playwright/test';

test('desktop loads correctly', async ({ page }) => {
  await page.goto('/');

  // Check if desktop components are loaded
  await expect(page.locator('.desktop')).toBeVisible();
  await expect(page.locator('[data-testid="taskbar"]')).toBeVisible();
  await expect(page.locator('[data-testid="desktop-icons"]')).toBeVisible();
});

test('can open calculator app', async ({ page }) => {
  await page.goto('/');

  // Click on calculator icon
  await page.click('[data-app="calculator"]');

  // Wait for calculator window to appear
  await expect(page.locator('[data-window-id*="calculator"]')).toBeVisible();

  // Check calculator display
  await expect(page.locator('.calc-display-text')).toHaveText('0');

  // Test basic calculation
  await page.click('text=5');
  await page.click('text=+');
  await page.click('text=3');
  await page.click('text==');

  await expect(page.locator('.calc-display-text')).toHaveText('8');
});

test('can open terminal app', async ({ page }) => {
  await page.goto('/');

  // Click on terminal icon
  await page.click('[data-app="terminal"]');

  // Wait for terminal window to appear
  await expect(page.locator('[data-window-id*="terminal"]')).toBeVisible();

  // Check terminal prompt
  await expect(page.locator('.terminal-prompt')).toBeVisible();
});

test('window management works', async ({ page }) => {
  await page.goto('/');

  // Open calculator
  await page.click('[data-app="calculator"]');
  const calcWindow = page.locator('[data-window-id*="calculator"]');
  await expect(calcWindow).toBeVisible();

  // Open terminal
  await page.click('[data-app="terminal"]');
  const terminalWindow = page.locator('[data-window-id*="terminal"]');
  await expect(terminalWindow).toBeVisible();

  // Close calculator
  await calcWindow.locator('.window-close').click();
  await expect(calcWindow).not.toBeVisible();

  // Terminal should still be open
  await expect(terminalWindow).toBeVisible();
});