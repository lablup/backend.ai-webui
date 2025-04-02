import { loginAsUser } from '../test-util';
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await loginAsUser(page);
});

// TODO: Create a test for creating model-type folder

// Create a test for service creation
// Test condition: executing simple-http-server
test('Service creation-with-cleanup', async ({ page }) => {
  // Create a service with random name
  const randomName = `model-service-${Math.random().toString(36).substring(2, 6)}`;
  await page.getByRole('link', { name: 'Start' }).click();
  await page.getByRole('button', { name: 'Start Service' }).click();
  await page.getByLabel('Service Name').click();
  await page.getByLabel('Service Name').fill(randomName);
  await page.getByLabel('Open To Public(optional)').click();
  await page.getByText('model-folder').click();
  await page.getByText('model-folder').nth(1).click();
  await page.locator('#react-root').getByTitle('model-folder').click();
  await page.getByLabel('Model Storage to mount').press('Escape');
  await page.getByText('Custom (Default)').click();
  await page
    .locator(
      'div:nth-child(7) > div > .ant-row > div:nth-child(2) > .ant-form-item-control-input > .ant-form-item-control-input-content > .ant-select > .ant-select-selector',
    )
    .first()
    .click();
  await page.getByTitle('default').nth(4).click();
  await page
    .locator(
      'div:nth-child(2) > .ant-row > div:nth-child(2) > .ant-form-item-control-input > .ant-form-item-control-input-content > .ant-select > .ant-select-selector',
    )
    .click();
  await page.getByRole('button', { name: 'Create' }).click();
  // Wait for the service to be created
  await page.waitForTimeout(3000);
  await page.getByRole('link', { name: randomName }).click();
  await expect(page.getByRole('cell', { name: randomName })).toContainText(
    randomName,
  );

  // Clean up
  await page.getByText('Routing Info').click();
  await page.locator('li').filter({ hasText: 'Routing Info' }).click();
  await page
    .getByRole('menuitem', { name: 'Serving' })
    .getByRole('link')
    .click();
  await page.getByRole('row', { name: randomName }).locator('div').click();
  await page.getByRole('button', { name: 'Delete', exact: true }).click();
  // Wait for the service to be created
  await page.waitForTimeout(3000);
  await page.locator('label').filter({ hasText: 'Destroyed' }).click();
  // Check whether the service is destroyed
  await expect(page.getByRole('cell', { name: randomName })).toContainText(
    randomName,
  );
  await page.getByRole('cell', { name: randomName }).click();
  await page.getByRole('cell', { name: 'DESTROYED' }).click();
  await expect(page.getByText('DESTROYED')).toBeVisible();
});

// TODO: Create a test for checking service status

// TODO: Create a test for service update

// TODO: Create a test for adding token for service

// TODO: Create a test for service deletion
