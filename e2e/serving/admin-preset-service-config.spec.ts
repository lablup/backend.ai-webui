// spec: FR-3474 — Admin Deployment Preset creation wizard's Service
// Configuration / Health Check / Pre-Start Actions section.
//
// PR #8333 (FR-3344) explicitly flagged this as uncovered: its specs drive
// the Add-Revision modal, not the preset form, and "it needs its own spec".
// This is that spec.
//
// Hybrid mock spec, same convention as add-revision-command-shell.spec.ts:
// a real login + real navigation to the wizard's create page render the
// actual form, while the page-internal GraphQL operations (runtime variant
// list, resource slot types, image select, create mutation) are stubbed by
// operation name so the wizard's `readsVfolderConfigFiles` branching and the
// outgoing mutation payload are both under deterministic test control.
//
// Behaviors asserted:
//   1. Service Configuration is shown for the (mocked) `custom` variant, with
//      Start Command / Port required (unlike the Add-Revision modal, where
//      Start Command is optional — the preset form requires it since a
//      preset is a reusable template).
//   2. Basic mode hides Execution/Shell; Advanced reveals them, mirroring the
//      Add-Revision modal's toggle.
//   3. A full Create submission carries the Service Configuration / Health
//      Check / Pre-Start Actions data in the expected nested
//      `modelDefinition.models[0].service` shape.
import { setupGraphQLMocks } from '../session/mocking/graphql-interceptor';
import { loginAsAdmin, navigateTo } from '../utils/test-util';
import {
  adminPresetCreateMutationMock,
  adminPresetImageSelectMocks,
  adminPresetResourceSlotTypesMock,
  adminPresetRuntimeVariantsMock,
  MOCK_IMAGE_CANONICAL_NAME,
} from './mocking/admin-preset-mock';
import { test, expect, type Locator, type Page } from '@playwright/test';

type Capture = { input: any };

/**
 * Force `model-service-command-string` on, persistently across full-page
 * reloads via `addInitScript`. Mirrors `add-revision-support.ts`'s
 * `installDeploymentFlagOverride` (not reused directly — that helper also
 * forces `model-card-v2`/`prometheus-auto-scaling-rule`, which are specific
 * to the deployment detail page this spec never visits).
 *
 * `model-service-command-string` is gated at manager version 26.8.0 exactly
 * (see `packages/backend.ai-client/src/client.ts`, FR-3205/BA-6551). The
 * shared e2e test backend runs `26.8.0rc1`, which sorts *before* `26.8.0`
 * under PEP440 (release candidates are pre-releases), so the flag is false
 * against it even though the feature is present — every Basic/Advanced/
 * Execution/Shell control this spec asserts on is gated behind it.
 */
async function installPresetFlagOverride(page: Page): Promise<void> {
  await page.addInitScript(() => {
    let clientRef: any;
    Object.defineProperty(window, 'backendaiclient', {
      get() {
        return clientRef;
      },
      set(value: any) {
        if (
          value &&
          typeof value.supports === 'function' &&
          !value.__depFlagPatched
        ) {
          const origSupports = value.supports.bind(value);
          value.supports = function (feature: string) {
            if (feature === 'model-service-command-string') return true;
            return origSupports(feature);
          };
          value.__depFlagPatched = true;
        }
        clientRef = value;
      },
      configurable: true,
    });
  });
}

/**
 * Select an option in a virtualized `BAISelect`-backed field, given the
 * search `<input>` itself as a `Locator` (rather than a CSS id string like
 * `deployment-fixtures.ts`'s `selectRevisionModalOption` expects). Needed
 * because `AdminDeploymentPresetSettingPageContent.tsx`'s `ImageSelectField`
 * wrapper only destructures `value`/`onChange` from its props, so it never
 * forwards the `id` Form.Item auto-injects — `#imageId` does not exist in the
 * DOM, and the visible "Select Image" text is a sibling placeholder node, not
 * the input's `placeholder` attribute. Same virtualized-option-row-has-zero-
 * width workaround (ArrowDown + Enter, not a direct option click).
 */
async function selectByLocator(
  page: Page,
  input: Locator,
  optionName: string,
): Promise<void> {
  await input.click();
  await input.fill(optionName);
  const dropdown = page
    .locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)')
    .first();
  await expect(dropdown).toBeVisible({ timeout: 10000 });
  await expect(
    dropdown.getByRole('option', { name: optionName }).first(),
  ).toBeAttached({ timeout: 15000 });
  await input.press('ArrowDown');
  await input.press('Enter');
  await expect(dropdown).toBeHidden({ timeout: 5000 });
}

/**
 * Common setup: log in, stub the wizard-internal ops (runtime variant list
 * pinned to a single `custom` variant, resource slot types, image select,
 * create mutation), navigate to the create page, and fill the fields every
 * scenario needs regardless of what it goes on to test (Name, Runtime
 * Variant, CPU/Mem, Image). Every op used here is mocked, so — unlike the
 * Add-Revision modal specs — this never touches real backend state and needs
 * no fixture teardown.
 */
async function setupPresetCreatePage(
  page: Page,
  request: any,
): Promise<{ capture: Capture }> {
  const capture: Capture = { input: null };
  await installPresetFlagOverride(page);
  await loginAsAdmin(page, request);
  await setupGraphQLMocks(page, {
    AdminDeploymentPresetSettingPageRuntimeVariantsQuery:
      adminPresetRuntimeVariantsMock(),
    AdminDeploymentPresetSettingPageResourceSlotTypesQuery:
      adminPresetResourceSlotTypesMock(),
    ...adminPresetImageSelectMocks(),
    AdminDeploymentPresetSettingPageCreateMutation:
      adminPresetCreateMutationMock(capture),
  });

  await navigateTo(page, 'admin/deployments/deployment-presets/new');
  await expect(page.locator('#name')).toBeVisible({ timeout: 15000 });

  await page.locator('#name').fill(`e2e-fr3474-preset-${Date.now()}`);

  // The dropdown option row renders with a computed width of 0 (same idiom
  // as `selectRevisionModalOption`'s documented antd quirk), so a direct
  // `.click()` times out waiting for visibility — use keyboard navigation
  // instead. Only one option exists (the mock resolves exactly one variant).
  await page.locator('#runtimeVariantId').click();
  await expect(
    page.getByRole('option', { name: 'custom', exact: true }),
  ).toBeAttached({ timeout: 10000 });
  await page.locator('#runtimeVariantId').press('ArrowDown');
  await page.locator('#runtimeVariantId').press('Enter');

  // Service Configuration only renders once the variant resolves as
  // config-reading; wait for it before touching cpu/mem/image so field order
  // doesn't race the Select's async re-render.
  await expect(
    page.getByText('Service Configuration', { exact: true }),
  ).toBeVisible({ timeout: 10000 });

  await page.locator('#cpu').fill('4');
  await page.locator('#mem').fill('16');
  const imageInput = page
    .locator('.ant-form-item', {
      has: page.getByText('Image', { exact: true }),
    })
    .getByRole('combobox');
  await selectByLocator(page, imageInput, MOCK_IMAGE_CANONICAL_NAME);

  return { capture };
}

test.describe(
  'Admin Deployment Preset — Service Configuration (FR-3474)',
  { tag: ['@serving', '@deploy', '@functional', '@regression'] },
  () => {
    test.describe.configure({ mode: 'serial', retries: 1 });

    test('Admin sees Service Configuration required and Basic/Advanced toggle works for the custom variant', async ({
      page,
      request,
    }) => {
      await setupPresetCreatePage(page, request);

      // 1. Start Command and Port are present and required (unlike the
      //    Add-Revision modal's optional Start Command).
      await expect(
        page.locator('#modelDefinition_models_0_service_startCommand'),
      ).toBeVisible();
      await expect(
        page.locator('#modelDefinition_models_0_service_port'),
      ).toBeVisible();

      // 2. Basic mode (default): no Execution radios, no Shell input.
      await expect(
        page.getByRole('radio', { name: 'Exec', exact: true }),
      ).toHaveCount(0);
      await expect(
        page.locator('#modelDefinition_models_0_service_shell'),
      ).toHaveCount(0);

      // 3. Toggle Advanced → Execution radios + Shell input appear.
      await page.getByText('Advanced', { exact: true }).click();
      await expect(
        page.getByRole('radio', { name: 'Shell', exact: true }),
      ).toBeVisible();
      await expect(
        page.getByRole('radio', { name: 'Exec', exact: true }),
      ).toBeVisible();
      await expect(
        page.locator('#modelDefinition_models_0_service_shell'),
      ).toBeVisible();

      // 4. Switch to Exec → Shell input hides, command relabels.
      await page.getByRole('radio', { name: 'Exec', exact: true }).click();
      await expect(
        page.locator('#modelDefinition_models_0_service_shell'),
      ).toHaveCount(0);
      await expect(page.getByText('Command (argv)')).toBeVisible();
    });

    test('Admin creates a preset carrying Service Configuration, Health Check, and a Pre-Start Action', async ({
      page,
      request,
    }) => {
      const { capture } = await setupPresetCreatePage(page, request);

      // Advanced + Shell, overriding the default shell.
      await page.getByText('Advanced', { exact: true }).click();
      const shellInput = page.locator(
        '#modelDefinition_models_0_service_shell',
      );
      await expect(shellInput).toBeVisible();
      await shellInput.fill('/bin/zsh');
      await shellInput.blur();

      const rawCommand = 'python -m server --arg "a b" && echo done';
      await page
        .locator('#modelDefinition_models_0_service_startCommand')
        .fill(rawCommand);
      await page.locator('#modelDefinition_models_0_service_port').fill('8000');

      // Health Check — enable and fill all 6 required detail fields.
      await page
        .locator('#modelDefinition_models_0_service_enableHealthCheck')
        .check();
      await page
        .locator('#modelDefinition_models_0_service_healthCheck_path')
        .fill('/health');
      await page
        .locator('#modelDefinition_models_0_service_healthCheck_interval')
        .fill('10');
      await page
        .locator('#modelDefinition_models_0_service_healthCheck_maxRetries')
        .fill('5');
      await page
        .locator('#modelDefinition_models_0_service_healthCheck_maxWaitTime')
        .fill('15');
      await page
        .locator(
          '#modelDefinition_models_0_service_healthCheck_expectedStatusCode',
        )
        .fill('200');
      await page
        .locator('#modelDefinition_models_0_service_healthCheck_initialDelay')
        .fill('3');

      // Pre-Start Actions — add one row.
      await page.getByRole('button', { name: 'Add Pre-Start Action' }).click();
      await page
        .locator('#modelDefinition_models_0_service_preStartActions_0_action')
        .fill('warm_cache');
      await page
        .locator('#modelDefinition_models_0_service_preStartActions_0_args')
        .fill('{"size": 128}');

      // Deployment Defaults — replicaCount is required with no default.
      await page.locator('#replicaCount').fill('1');

      // Skip Step 2 (all optional) straight to Review, then submit.
      await page.getByText('Skip to Review', { exact: true }).click();
      await page.getByRole('button', { name: 'Create', exact: true }).click();

      await expect.poll(() => capture.input, { timeout: 15000 }).not.toBeNull();

      const service = capture.input?.modelDefinition?.models?.[0]?.service;
      expect(service).toBeTruthy();
      expect(service.command).toBe(rawCommand);
      expect(service.shell).toBe('/bin/zsh');
      expect(service.port).toBe(8000);
      expect(service.healthCheck).toMatchObject({
        path: '/health',
        interval: 10,
        maxRetries: 5,
        maxWaitTime: 15,
        expectedStatusCode: 200,
        initialDelay: 3,
      });
      expect(service.preStartActions).toEqual([
        { action: 'warm_cache', args: { size: 128 } },
      ]);
    });
  },
);
