import { loginAsAdmin, modifyConfigToml, webuiEndpoint } from './test-util';
import { test, expect } from '@playwright/test';

test.describe.parallel('config.toml', () => {
  // TODO: Hide Chat page if Serving page is included in the blocklist
  test(
    'block list',
    { tag: ['@session', '@summary', '@serving'] },
    async ({ page, request }) => {
      // modify config.toml to blocklist some menu items
      let requestConfig = {
        menu: {
          blocklist: 'summary, serving, job',
        },
      };
      await modifyConfigToml(page, request, requestConfig);
      await loginAsAdmin(page);

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
        page.getByRole('link', { name: 'Summary', exact: true }),
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
    async ({ page, context, request }) => {
      // modify config.toml to show non-installed images
      const requestConfig = {
        environments: {
          showNonInstalledImages: true,
        },
      };
      await modifyConfigToml(page, request, requestConfig);

      await loginAsAdmin(page);

      await page
        .getByRole('group')
        .getByText('Environments', { exact: true })
        .click();
      await page
        .getByRole('columnheader', { name: 'Status' })
        .locator('div')
        .click();

      await page.getByRole('button', { name: 'Copy' }).first().click();

      await context.grantPermissions(['clipboard-read', 'clipboard-write']);

      const uninstalledImageString = await (
        await page.evaluateHandle(() => navigator.clipboard.readText())
      ).jsonValue();

      await page.goto(webuiEndpoint);
      // await page.getByLabel('power_settings_new').click();
      await page.getByRole('button', { name: 'Start Session' }).first().click();
      await page
        .getByRole('button', { name: '2 Environments & Resource' })
        .click();
      await page.getByLabel('Environments / Version').fill('AF');
      await page
        .locator('.rc-virtual-list-holder-inner > div:nth-child(2)')
        .click();

      await page
        .locator('span')
        .filter({ hasText: 'ubuntu18.04x86_64' })
        .locator('div')
        .first()
        .click();
      await page
        .locator(
          'div:nth-child(4) > .rc-virtual-list-holder > div > .rc-virtual-list-holder-inner > .ant-select-item > .ant-select-item-option-content > div',
        )
        .click();
      await page
        .getByRole('button', { name: 'Skip to review double-right' })
        .click();
      await page.getByRole('button', { name: 'Copy' }).click();

      await context.grantPermissions(['clipboard-read', 'clipboard-write']);

      const handle = await page.evaluateHandle(() =>
        navigator.clipboard.readText(),
      );
      const clipboardContent = await handle.jsonValue();

      expect(clipboardContent).toEqual(uninstalledImageString);
    },
  );
});
