import { expect, test } from '@playwright/test';

const urls = {
  baseUrl: 'http://localhost:3000',
};

const testIds = {
  registration: 'data-test-id=register',
  registrationUsername: 'data-test-id=registrationUsername',
  registrationPassword: 'data-test-id=registrationPassword',
  registrationButton: 'data-test-id=registrationButton',
  registrationUsernameError: 'data-test-id=registrationUsernameError',
  registrationPasswordError: 'data-test-id=registrationPasswordError',
};

test('user registration', async ({ page }) => {
  await page.goto(urls.baseUrl);

  await page.locator(testIds.registration).click();
  await page.waitForNavigation({ url: `${urls.baseUrl}/registration` });
  await expect(page.locator(testIds.registrationUsername)).toBeVisible();
  await expect(page.locator(testIds.registrationPassword)).toBeEditable();
  await expect(page.locator(testIds.registrationUsername)).toBeVisible();
  await expect(page.locator(testIds.registrationPassword)).toBeEditable();
  await page.locator(testIds.registrationUsername).fill('wantaiqsx');
  await expect(page.locator(testIds.registrationButton)).toBeVisible();
  await expect(
    page.locator(testIds.registrationUsernameError),
  ).not.toBeVisible();
  await expect(
    page.locator(testIds.registrationPasswordError),
  ).not.toBeVisible();
  await page.locator(testIds.registrationButton).click();
  await expect(page.locator(testIds.registrationPasswordError)).toBeVisible();
  await page.locator(testIds.registrationPassword).fill('123');
  await page.locator(testIds.registrationButton).click();

  await expect(page.locator(testIds.registrationPasswordError)).toHaveText(
    'Please choose password longer than 5 characters',
  );
});
