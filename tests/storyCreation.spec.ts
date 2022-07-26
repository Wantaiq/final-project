import { expect, test } from '@playwright/test';

const testIds = {
  registration: 'data-test-id=register',
  registrationUsername: 'data-test-id=registrationUsername',
  registrationPassword: 'data-test-id=registrationPassword',
  registrationButton: 'data-test-id=registrationButton',
  noStoriesBanner: 'data-test-id=no-stories-banner',
  storyCreation: 'data-test-id=storyCreation',
  storyTitle: 'data-test-id=story-title',
  storyTitleError: 'data-test-id="story-title-error',
  storyDescription: 'data-test-id=story-description',
  storyDescriptionError: 'data-test-id="story-description-error',
  startNewStoryButton: 'data-test-id=start-story-button',
  coverImgError: 'data-test-id=coverImgError',
};

const urls = {
  baseUrl: 'http://localhost:3000',
};

test('storyCreation', async ({ page }) => {
  await page.goto(urls.baseUrl);

  await page.locator(testIds.registration).click();
  await page.waitForNavigation({ url: `${urls.baseUrl}/registration` });
  await expect(page.locator(testIds.registrationUsername)).toBeVisible();
  await expect(page.locator(testIds.registrationPassword)).toBeEditable();
  await expect(page.locator(testIds.registrationUsername)).toBeVisible();
  await expect(page.locator(testIds.registrationPassword)).toBeEditable();
  await page.locator(testIds.registrationUsername).fill('wantaisqsx!!');
  await page.locator(testIds.registrationPassword).fill('hejhej!');
  await expect(page.locator(testIds.registrationButton)).toBeVisible();
  await page.locator(testIds.registrationButton).click();
  await page.waitForNavigation({ url: `${urls.baseUrl}/profile` });
  await expect(page.locator(testIds.noStoriesBanner)).toBeVisible();
  await expect(page.locator(testIds.noStoriesBanner)).toHaveText(
    `You don't have any stories.`,
  );
  await expect(page.locator(testIds.storyCreation)).toBeVisible();
  await page.locator(testIds.storyCreation).click();
  await page.waitForNavigation({ url: `${urls.baseUrl}/profile/create-story` });
  await expect(page.locator(testIds.storyTitle)).toBeVisible();
  await expect(page.locator(testIds.storyTitle)).toBeEditable();
  await expect(page.locator(testIds.storyTitleError)).not.toBeVisible();
  await page.locator(testIds.storyTitle).fill('New Chapter');
  await expect(page.locator(testIds.storyDescription)).toBeVisible();
  await expect(page.locator(testIds.storyDescription)).toBeEditable();
  await expect(page.locator(testIds.storyDescriptionError)).not.toBeVisible();
  await page.locator(testIds.storyDescription).fill('Description');
  await page.locator(testIds.startNewStoryButton).click();
  await expect(page.locator(testIds.coverImgError)).toBeVisible();
  await expect(page.locator(testIds.coverImgError)).toHaveText(
    'Please choose cover image',
  );
});
