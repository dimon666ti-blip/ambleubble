import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('shows validation error and clears it after choosing an example', async ({ page }) => {
  await page.getByRole('button', { name: /Допоможи мені повернути контроль/ }).click();
  await expect(page.getByRole('alert')).toBeVisible();

  await page.getByRole('button', { name: 'Мені складно почати роботу над важливим проєктом' }).click();
  await expect(page.getByRole('alert')).toBeHidden();
});

test('generates advice, tracks progress and persists it across reload', async ({ page }) => {
  await page.getByRole('button', { name: 'У мене багато справ, і я не знаю, за що взятися' }).click();
  await page.getByRole('button', { name: 'Висока' }).click();
  await page.getByRole('button', { name: /Допоможи мені повернути контроль/ }).click();

  await expect(page.getByRole('heading', { name: 'Твої три кроки' })).toBeVisible({ timeout: 5_000 });
  await expect(page.locator('article')).toHaveCount(3);
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');

  const checkboxes = page.locator('article input[type="checkbox"]');
  await checkboxes.nth(0).check({ force: true });
  await checkboxes.nth(1).check({ force: true });
  await checkboxes.nth(2).check({ force: true });

  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
  await expect(page.getByText('Ти це зробив!')).toBeVisible();

  await page.reload();
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
  await expect(page.getByText('Уже зроблено кроків: 3')).toBeVisible();
});

test('keeps a running timer after reload', async ({ page }) => {
  await page.getByRole('button', { name: 'У мене багато справ, і я не знаю, за що взятися' }).click();
  await page.getByRole('button', { name: /Допоможи мені повернути контроль/ }).click();
  await expect(page.getByRole('heading', { name: 'Твої три кроки' })).toBeVisible({ timeout: 5_000 });

  await page.getByRole('button', { name: /Почати таймер кроку 1/ }).click();
  await page.waitForTimeout(1_200);
  await expect(page.getByRole('button', { name: /Пауза таймер кроку 1/ })).toBeVisible();

  await page.reload();
  await expect(page.getByRole('button', { name: /Пауза таймер кроку 1/ })).toBeVisible();
});

test('settings modal traps focus and restores it on close', async ({ page }) => {
  const settingsButton = page.getByRole('button', { name: 'Налаштування' });
  await settingsButton.click();

  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(page.locator('input[type="password"], input[type="text"]').first()).toBeFocused();

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(settingsButton).toBeFocused();
});

test('tracks mood before and after the steps and draws the chart', async ({ page }) => {
  await page.getByRole('button', { name: 'У мене багато справ, і я не знаю, за що взятися' }).click();

  const beforeSlider = page.getByRole('slider', { name: /Оцінка стану/ });
  await beforeSlider.focus();
  await beforeSlider.press('End');
  await expect(beforeSlider).toHaveValue('10');

  await page.getByRole('button', { name: /Допоможи мені повернути контроль/ }).click();
  await expect(page.getByRole('heading', { name: 'Твої три кроки' })).toBeVisible({ timeout: 5_000 });

  const afterSlider = page.getByRole('slider', { name: 'Мій стан зараз' });
  await afterSlider.focus();
  await afterSlider.press('Home');
  await afterSlider.press('ArrowRight');
  await afterSlider.press('ArrowRight');
  await afterSlider.press('ArrowRight');
  await expect(afterSlider).toHaveValue('4');

  await expect(page.getByText('Стало легше на 6 балів')).toBeVisible();
  await expect(page.getByText('10 → 4')).toBeVisible();
  await expect(page.locator('figure svg')).toBeVisible();

  await page.reload();
  await expect(page.getByText('10 → 4')).toBeVisible();
});

test('serves the new brand assets and manifest', async ({ page }) => {
  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute('href', '/manifest.webmanifest');
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute('href', '/favicon.svg');

  const manifestResponse = await page.request.get('/manifest.webmanifest');
  expect(manifestResponse.ok()).toBeTruthy();

  const iconResponse = await page.request.get('/favicon.svg');
  expect(iconResponse.ok()).toBeTruthy();
});
