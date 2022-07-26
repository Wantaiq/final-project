import { expect, test } from '@playwright/test';

const urls = {
  baseUrl: 'http://localhost:3000',
};

const testIds = {
  login: 'data-test-id=login',
  loginUsername: 'data-test-id=loginUsername',
  loginPassword: 'data-test-id=loginPassword',
  loginButton: 'data-test-id=loginButton',
  loginUsernameError: 'data-test-id=loginUsernameError',
  loginPasswordError: 'data-test-id=loginPasswordError',
  loginServerResponseError: 'data-test-id=loginServerResponseError',
};

test('user login', async ({ page }) => {
  await page.goto(urls.baseUrl);
  await page.locator(testIds.login).click();
  await page.waitForNavigation({ url: `${urls.baseUrl}/login` });
  await expect(page.locator(testIds.loginPassword)).toBeVisible();
  await expect(page.locator(testIds.loginPassword)).toBeEditable();
  await expect(page.locator(testIds.loginUsername)).toBeVisible();
  await expect(page.locator(testIds.loginUsername)).toBeEditable();
  await page.locator(testIds.loginUsername).fill('wantaiqsx');
  await expect(page.locator(testIds.loginButton)).toBeVisible();
  await expect(page.locator(testIds.loginUsernameError)).not.toBeVisible();
  await expect(page.locator(testIds.loginPasswordError)).not.toBeVisible();
  await page.locator(testIds.loginButton).click();
  await expect(page.locator(testIds.loginPasswordError)).toBeVisible();
  await page.locator(testIds.loginPassword).fill('123');
  await page.locator(testIds.loginButton).click();
  await expect(page.locator(testIds.loginServerResponseError)).toBeVisible();
  await expect(page.locator(testIds.loginServerResponseError)).toHaveText(
    'Invalid username or password',
  );
  await page.locator(testIds.loginPassword).fill('Hello!');
});
