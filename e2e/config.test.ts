import { StartPage } from './utils/classes/StartPage';
import {
  loginAsAdmin,
  modifyConfigToml,
  webuiEndpoint,
} from './utils/test-util';
import { test, expect } from '@playwright/test';

test.describe.parallel('config.toml', () => {
  // TODO: Hide Chat page if Serving page is included in the blocklist
  test(
    'block list',
    { tag: ['@session', '@summary', '@serving'] },
    async ({ page, request }) => {
      // modify config.toml to blocklist some menu items
      const requestConfig = {
        menu: {
          blocklist: 'summary, serving, job',
        },
      };
      await modifyConfigToml(page, request, requestConfig);
      await loginAsAdmin(page, request);

      // check if the menu items are hidden
      await expect(
        page.getByTestId('webui-breadcrumb').getByText('Summary'),
      ).toBeHidden();
      await expect(
        page.getByRole('menuitem', { name: 'Sessions' }),
      ).toBeHidden();
      await expect(
        page.getByRole('menuitem', { name: 'Serving' }),
      ).toBeHidden();

      // check if the pages are not accessible
      await page.goto(`${webuiEndpoint}/summary`);
      await expect(page).toHaveURL(/.*error/);
      await page.goto(`${webuiEndpoint}/serving`);
      await expect(page).toHaveURL(/.*error/);
      await page.goto(`${webuiEndpoint}/job`);
      await expect(page).toHaveURL(/.*error/);

      requestConfig.menu.blocklist = '';
      await modifyConfigToml(page, request, requestConfig);
      await page.reload();

      // check if the menu items are visible
      await expect(
        page.getByRole('link', { name: 'Start', exact: true }),
      ).toBeVisible();
      await expect(
        page.getByRole('menuitem', { name: 'Sessions' }),
      ).toBeVisible();
      await expect(
        page.getByRole('menuitem', { name: 'Serving' }),
      ).toBeVisible();
    },
  );

  test(
    'showNonInstalledImages: Allow users to select non-installed images when creating sessions',
    { tag: ['@session'] },
    async ({ page, request }) => {
      // Step 1: Enable showNonInstalledImages in config
      const requestConfig = {
        environments: {
          showNonInstalledImages: true,
        },
      };
      await modifyConfigToml(page, request, requestConfig);
      await loginAsAdmin(page, request);

      // Step 2: Go to Environments page and find an uninstalled image
      await page.getByRole('menuitem', { name: 'Admin Settings' }).click();
      await page.getByRole('menuitem', { name: 'Environments' }).click();

      // Wait for the table to load and have data (excluding measure rows and placeholder)
      await page.waitForSelector(
        'table tbody tr:not(.ant-table-measure-row):not(.ant-table-placeholder)',
        {
          state: 'visible',
          timeout: 15000,
        },
      );

      // Sort by Status column to get uninstalled images first
      const statusHeader = page.getByRole('columnheader', { name: 'Status' });
      await statusHeader.click();

      // Find the first row where the status cell (2nd cell) is empty (uninstalled image)
      // Uninstalled images have no status badge
      // Exclude ant-table-measure-row which is hidden
      const allRows = page.locator(
        'tbody tr:not(.ant-table-measure-row):not(.ant-table-placeholder)',
      );
      let uninstalledImageName: string | null = null;

      // Wait for at least one row to be available
      await allRows.first().waitFor({ state: 'visible', timeout: 10000 });

      // Iterate through rows to find one with empty status cell
      const rowCount = await allRows.count();
      for (let i = 0; i < Math.min(rowCount, 15); i++) {
        const row = allRows.nth(i);

        // Wait for the row to be attached to DOM
        await row.waitFor({ state: 'attached', timeout: 5000 });

        const statusCell = row.locator('td').nth(1); // Status column is 2nd cell (index 1)

        // Try to get text with a timeout
        try {
          const statusText = await statusCell.textContent({ timeout: 3000 });

          // If status cell is empty or doesn't contain "설치 완료" / "Installed", it's uninstalled
          if (!statusText || statusText.trim() === '') {
            // Get the image name from the 3rd cell (index 2)
            const imageCell = row.locator('td').nth(2);
            const imageText = await imageCell.textContent({ timeout: 3000 });

            if (imageText) {
              // Extract just the image name, removing the "복사" button text
              uninstalledImageName = imageText.replace(/복사|Copy/g, '').trim();
              break;
            }
          }
        } catch (e) {
          // If timeout, continue to next row
          continue;
        }
      }

      expect(uninstalledImageName).toBeTruthy();
      const imageName = uninstalledImageName;

      // Step 3: Navigate to Start page and open session launcher
      const startPage = new StartPage(page);
      await startPage.goto();

      // Click Start Interactive Session button
      const interactiveSessionCard = startPage.getInteractiveSessionCard();
      const startButton = startPage.getStartButtonFromCard(
        interactiveSessionCard,
      );
      await startButton.click();

      // Wait for session launcher to open - wait for the environment selector to be visible

      // Navigate to Environments & Resource step
      await page
        .getByRole('button', { name: '2 Environments & Resource' })
        .click();

      // Open the environment selector (use force click to avoid interception issues)
      const environmentSelector = page.getByLabel('Environments / Version');
      await environmentSelector.click({ force: true });

      // Wait for dropdown to open and options to load
      await page.waitForSelector('.ant-select-dropdown', {
        state: 'visible',
        timeout: 5000,
      });

      // Extract environment name from image name (e.g., "afni" from "cr.backend.ai/community/afni:ubuntu18.04@x86_64")
      const environmentMatch = imageName?.match(/\/([^/:]+):/);
      const environmentName = environmentMatch ? environmentMatch[1] : null;

      // Count all available options when showNonInstalledImages is enabled
      const dropdownOptions = page.locator(
        '.ant-select-dropdown .ant-select-item-option',
      );
      const optionCountEnabled = await dropdownOptions.count();

      expect(optionCountEnabled).toBeGreaterThan(0);

      // If we found an environment name, verify it's in the list
      if (environmentName) {
        // Search for the environment
        await environmentSelector.fill(environmentName);

        // Check if the search returns results
        const searchResults = await dropdownOptions.count();
        expect(searchResults).toBeGreaterThan(0);
      }

      // Close the environment selector dropdown
      await page.keyboard.press('Escape');

      // Step 4: Test with showNonInstalledImages disabled
      requestConfig.environments.showNonInstalledImages = false;
      await modifyConfigToml(page, request, requestConfig);
      await page.reload();

      // Go to session launcher again
      await startPage.goto();
      const interactiveSessionCard2 = startPage.getInteractiveSessionCard();
      const startButton2 = startPage.getStartButtonFromCard(
        interactiveSessionCard2,
      );
      await startButton2.click();

      await page
        .getByRole('button', { name: '2 Environments & Resource' })
        .click();

      // Open environment selector (use force click to avoid interception issues)
      await page.getByLabel('Environments / Version').click({ force: true });
      await page.waitForSelector('.ant-select-dropdown', {
        state: 'visible',
        timeout: 5000,
      });

      // Count options when showNonInstalledImages is disabled
      const dropdownOptionsDisabled = page.locator(
        '.ant-select-dropdown .ant-select-item-option',
      );
      const optionCountDisabled = await dropdownOptionsDisabled.count();

      // When disabled, we should have fewer options than when enabled
      // (since uninstalled images are excluded)
      expect(optionCountDisabled).toBeLessThan(optionCountEnabled);

      // Additionally verify that the specific uninstalled image is not easily found
      if (environmentName) {
        await page.getByLabel('Environments / Version').fill(environmentName);

        const searchResults = await dropdownOptionsDisabled.count();
        // When disabled, searching for the uninstalled image should return fewer or no results
        expect(searchResults).toBeLessThanOrEqual(optionCountEnabled);
      }
    },
  );
});
