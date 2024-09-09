import { loginAsAdmin, mockConfigToml, webuiEndpoint } from './test-util';
import { test, expect } from '@playwright/test';

test.describe('config read and test', () => {
  test('showNonInstalledImages', async ({ page, context }) => {
    // manipulate config file from mocked one
    await mockConfigToml(page, './config-test.toml');

    await loginAsAdmin(page);

    await page.getByRole('group').getByText('Environments').click();
    await page
      .getByRole('columnheader', { name: 'Status' })
      .locator('div')
      .click();
    await page
      .getByRole('columnheader', { name: 'Status' })
      .locator('div')
      .click();

    const registryCell = await page
      .locator('.ant-table-row > td:nth-child(3)')
      .first();
    const registry = await registryCell.textContent();

    const architectureCell = await page
      .locator('.ant-table-row > td:nth-child(4)')
      .first();
    const architecture = await architectureCell.textContent();

    const namespaceCell = await page
      .getByRole('cell', { name: 'community' })
      .first();
    const namespace = await namespaceCell.textContent();

    const languageCell = await page.getByRole('cell', { name: 'afni' }).first();
    const language = await languageCell.textContent();

    const versionCell = await page
      .getByRole('cell', { name: 'ubuntu18.04' })
      .first();
    const version = await versionCell.textContent();

    const uninstalledImageString = `${registry}/${namespace}/${language}:${version}@${architecture}`;

    await page.goto(webuiEndpoint);
    await page.getByLabel('power_settings_new').click();
    await page
      .getByRole('button', { name: '2 Environments & Resource' })
      .click();
    await page
      .locator(
        '.ant-form-item-control-input-content > .ant-select > .ant-select-selector',
      )
      .first()
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
  });
});
