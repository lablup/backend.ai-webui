import { createAdminApiContext, gqlAdmin } from '../utils/admin-api';
import {
  getClientProperty,
  skipUnlessManagerVersion,
} from '../utils/feature-gate-util';
import { withSharedStateLock } from '../utils/shared-state-lock';
import {
  loginAsAdmin,
  modifyConfigToml,
  webuiEndpoint,
} from '../utils/test-util';
import {
  test,
  expect,
  type APIRequestContext,
  type Locator,
  type Page,
} from '@playwright/test';

const BRANDING_COLOR_ITEM = 'Info Color';
const INFO_LIGHT_SEED_PATH = ['theme', 'families', 'default', 'seeds', 'info'];

type PublicConfigFragment = { config: Record<string, any> | null };

async function readPublicDomainConfig(api: APIRequestContext) {
  const data = await gqlAdmin<{
    scopedAppConfigFragmentsByNames: Array<PublicConfigFragment>;
  }>(
    api,
    `query { scopedAppConfigFragmentsByNames(scope: { scopeType: PUBLIC }, configNames: ["publicConfigByDomain"]) { config } }`,
  );
  return data.scopedAppConfigFragmentsByNames?.[0]?.config ?? {};
}

async function writeDomainAppearance(
  api: APIRequestContext,
  domainName: string,
  appearance: unknown,
) {
  // Re-read so other domains' slices written meanwhile survive the write.
  const doc = await readPublicDomainConfig(api);
  const next = { ...doc, [domainName]: { ...(doc[domainName] ?? {}) } };
  if (appearance === undefined) {
    delete next[domainName].appearance;
    if (Object.keys(next[domainName]).length === 0) delete next[domainName];
  } else {
    next[domainName].appearance = appearance;
  }
  const result = await gqlAdmin<{
    scopedUpsertAppConfigFragments: {
      failed: Array<{ configName: string; message: string }>;
    };
  }>(
    api,
    `mutation ($input: ScopedUpsertAppConfigFragmentsInput!) {
      scopedUpsertAppConfigFragments(input: $input) { failed { configName message } }
    }`,
    {
      input: {
        scope: { scopeType: 'PUBLIC' },
        items: [{ configName: 'publicConfigByDomain', config: next }],
      },
    },
  );
  const failed = result.scopedUpsertAppConfigFragments.failed;
  if (failed.length > 0) {
    throw new Error(`App config upsert failed: ${JSON.stringify(failed)}`);
  }
}

function getBrandingSettingItem(page: Page, title: string) {
  return page
    .locator('.bai-setting-item')
    .filter({ has: page.getByText(title, { exact: true }) });
}

function getLightColorTrigger(item: Locator) {
  return item.getByRole('button', { name: /^#[0-9a-f]{6}$/ }).first();
}

async function pickLightColor(page: Page, item: Locator, hex: string) {
  await getLightColorTrigger(item).click();
  const hexInput = page.getByRole('textbox', { name: 'Hex value' });
  await hexInput.fill(hex);
  await page.keyboard.press('Escape');
  await expect(hexInput).toBeHidden();
  await expect(getLightColorTrigger(item)).toHaveText(hex);
}

function getConfirmDialog(page: Page, title: string) {
  return page.locator('[role=dialog],[role=alertdialog]').filter({
    hasText: title,
  });
}

test.describe(
  'Branding - Admin Domain Theme',
  {
    tag: ['@regression', '@functional', '@config', '@requires-manager-v26.9'],
  },
  () => {
    test.beforeEach(async ({ page, request }) => {
      await loginAsAdmin(page, request);
      await skipUnlessManagerVersion(
        page,
        '26.9.0',
        'Branding saves to the app config API added in manager 26.9',
      );
    });

    test('Admin can apply an edited Branding theme to the domain and reset an edit back to the applied value', async ({
      page,
      request,
    }) => {
      test.setTimeout(330_000);
      const domainName = (await getClientProperty(page, '_config').then(
        (config) => (config as { domainName: string }).domainName,
      )) as string;
      // The domain appearance is read at boot only when config.toml names
      // the domain, which webui-nightly's config.toml does not.
      await modifyConfigToml(page, request, {
        general: { apiDomainName: domainName },
      });

      await withSharedStateLock('public-domain-appearance', async () => {
        const api = await createAdminApiContext();
        let restoreError: unknown;
        const originalAppearance = (await readPublicDomainConfig(api))[
          domainName
        ]?.appearance;
        try {
          await page.goto(`${webuiEndpoint}/admin/branding`);
          const item = getBrandingSettingItem(page, BRANDING_COLOR_ITEM);
          await expect(getLightColorTrigger(item)).toBeVisible({
            timeout: 30_000,
          });
          const appliedBefore = (
            await getLightColorTrigger(item).innerText()
          ).trim();
          const editedColor =
            appliedBefore === '#1d4ed8' ? '#0f766e' : '#1d4ed8';
          await pickLightColor(page, item, editedColor);

          await page.evaluate(() => {
            (window as any).__e2eBeforeApply = true;
          });
          await page
            .getByRole('button', { name: 'Apply', exact: true })
            .click();
          const applyDialog = getConfirmDialog(page, 'Apply Theme to Domain');
          await expect(applyDialog).toBeVisible();
          await expect(applyDialog).toContainText(
            'This theme will be applied to every user in this domain.',
          );
          await applyDialog
            .getByRole('button', { name: 'Apply', exact: true })
            .click();

          // Apply ends in a full page reload that renders the applied document.
          await page.waitForFunction(
            () => !(window as any).__e2eBeforeApply,
            undefined,
            { timeout: 30_000 },
          );
          await expect(page).toHaveURL(/\/admin\/branding/);
          await expect(getLightColorTrigger(item)).toHaveText(editedColor, {
            timeout: 30_000,
          });
          const savedSeed = INFO_LIGHT_SEED_PATH.reduce<any>(
            (node, key) => node?.[key],
            (await readPublicDomainConfig(api))[domainName]?.appearance,
          );
          expect(
            String(Array.isArray(savedSeed) ? savedSeed[0] : savedSeed),
          ).toBe(editedColor);

          await pickLightColor(page, item, '#be123c');
          await item.hover();
          await item.getByRole('button', { name: 'Reset' }).click();
          const resetDialog = getConfirmDialog(
            page,
            'Do you want to reset your changes?',
          );
          await resetDialog
            .getByRole('button', { name: 'Reset', exact: true })
            .click();
          await expect(resetDialog).toBeHidden();
          await expect(getLightColorTrigger(item)).toHaveText(editedColor);
        } finally {
          restoreError = await writeDomainAppearance(
            api,
            domainName,
            originalAppearance,
          ).then(
            () => undefined,
            (error: unknown) => error,
          );
          if (restoreError) {
            console.error(
              `Failed to restore the ${domainName} domain appearance:`,
              restoreError,
            );
          }
          await api.dispose();
        }
        // Fail a passing run too: a missed restore leaves the test color
        // applied domain-wide.
        if (restoreError) throw restoreError;
      });
    });

    test('Admin is asked to confirm before leaving Branding with unapplied edits and stays on the page on cancel', async ({
      page,
    }) => {
      await page.goto(`${webuiEndpoint}/admin/branding`);
      const item = getBrandingSettingItem(page, BRANDING_COLOR_ITEM);
      await expect(getLightColorTrigger(item)).toBeVisible({ timeout: 30_000 });
      const appliedColor = (
        await getLightColorTrigger(item).innerText()
      ).trim();
      const editedColor = appliedColor === '#0f766e' ? '#7e22ce' : '#0f766e';
      await pickLightColor(page, item, editedColor);

      const informationLink = page.getByRole('link', {
        name: 'Information',
        exact: true,
      });
      const leaveDialog = getConfirmDialog(
        page,
        'Leave without applying the theme?',
      );
      await informationLink.click();
      await expect(leaveDialog).toBeVisible();
      await expect(leaveDialog).toContainText(
        'Your theme changes have not been applied to the domain and will be discarded.',
      );
      await leaveDialog
        .getByRole('button', { name: 'Cancel', exact: true })
        .click();
      await expect(leaveDialog).toBeHidden();
      await expect(page).toHaveURL(/\/admin\/branding/);
      await expect(getLightColorTrigger(item)).toHaveText(editedColor);

      await informationLink.click();
      await leaveDialog
        .getByRole('button', { name: 'Discard', exact: true })
        .click();
      await expect(page).toHaveURL(/\/admin\/information/);
    });
  },
);
