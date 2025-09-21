import { test, expect } from '@playwright/test';

test.describe('Applications', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('text editor functionality', async ({ page }) => {
    await page.click('[data-app="texteditor"]');

    const editorWindow = page.locator('[data-window-id*="texteditor"]');
    await expect(editorWindow).toBeVisible();

    const textarea = editorWindow.locator('textarea');
    await textarea.fill('Hello, Penguin OS!');
    await expect(textarea).toHaveValue('Hello, Penguin OS!');
  });

  test('file explorer navigation', async ({ page }) => {
    await page.click('[data-app="fileexplorer"]');

    const explorerWindow = page.locator('[data-window-id*="fileexplorer"]');
    await expect(explorerWindow).toBeVisible();

    // Check if file list is present
    await expect(explorerWindow.locator('.file-list')).toBeVisible();
  });

  test('media player interface', async ({ page }) => {
    await page.click('[data-app="mediaplayer"]');

    const playerWindow = page.locator('[data-window-id*="mediaplayer"]');
    await expect(playerWindow).toBeVisible();

    // Check for media controls
    await expect(playerWindow.locator('.media-controls')).toBeVisible();
  });

  test('notepad functionality', async ({ page }) => {
    await page.click('[data-app="notepad"]');

    const notepadWindow = page.locator('[data-window-id*="notepad"]');
    await expect(notepadWindow).toBeVisible();

    const textarea = notepadWindow.locator('textarea');
    await textarea.fill('Test note content');
    await expect(textarea).toHaveValue('Test note content');
  });

  test('settings interface', async ({ page }) => {
    await page.click('[data-app="settings"]');

    const settingsWindow = page.locator('[data-window-id*="settings"]');
    await expect(settingsWindow).toBeVisible();

    // Check for settings sections
    await expect(settingsWindow.locator('.settings-section')).toBeVisible();
  });
});