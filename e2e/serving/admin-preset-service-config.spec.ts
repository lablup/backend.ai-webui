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
// list + selected-variant point lookup, resource slot types, image select,
// create mutation) are stubbed by operation name so the wizard's
// `readsVfolderConfigFiles` branching and the outgoing mutation payload are
// both under deterministic test control.
//
// The FR-3474 scenarios below target the latest (nullable-capable,
// `preset-model-config-type`, 26.9.0+/BA-7210) behavior: Service
// Configuration/Health Check/Pre-Start Actions render independently in
// Basic Info without Model Definition ever needing to be enabled. Legacy
// managers nest the same fields inside Model Definition instead — see
// AdminDeploymentPresetSettingPageContent.tsx, FR-3481 — covered by the
// dedicated legacy-manager describe block at the bottom of this file.
//
// Behaviors asserted:
//   1. Service Configuration is shown for the (mocked) `custom` variant, with
//      Start Command / Port both optional (BA-6613) — matching the
//      Add-Revision modal exactly. Execution and Shell are always visible
//      (no Basic/Advanced toggle — removed per devops sync feedback,
//      2026-08-07: hiding the always-shell-wrapped default mode behind an
//      "Advanced" switch made it look like it didn't run through a shell at
//      all). Shell is the only required field, and starts pre-filled with
//      the backend default (`/bin/bash`).
//   2. Switching Execution to Exec hides the Shell field and relabels
//      Command to "Command (argv)", mirroring the Add-Revision modal.
//   3. A full Create submission carries the Service Configuration / Health
//      Check / Pre-Start Actions data in the expected nested
//      `modelDefinition.models[0].service` shape.
//   4. Leaving Start Command and Port blank still submits successfully —
//      `command` is omitted and `port` is sent as `null` (BA-7210: the
//      server inherits the runtime variant baseline's port at revision
//      resolution), rather than being blocked by form validation.
import { setupGraphQLMocks } from '../session/mocking/graphql-interceptor';
import { loginAsAdmin, navigateTo } from '../utils/test-util';
import {
  adminPresetCreateMutationMock,
  adminPresetImageSelectMocks,
  adminPresetResourceSlotTypesMock,
  adminPresetRuntimeVariantsMock,
  adminPresetSelectedRuntimeVariantMock,
  MOCK_IMAGE_OPTION_LABEL,
} from './mocking/admin-preset-mock';
import {
  test,
  expect,
  type APIRequestContext,
  type Page,
} from '@playwright/test';

type Capture = { input: any };

/**
 * Force `model-service-command-string` and `preset-model-config-type` on,
 * persistently across full-page reloads via `addInitScript`. Mirrors
 * `add-revision-support.ts`'s `installDeploymentFlagOverride` (not reused
 * directly — that helper also forces `model-card-v2`/
 * `prometheus-auto-scaling-rule`, which are specific to the deployment
 * detail page this spec never visits).
 *
 * `model-service-command-string` is gated at manager version 26.8.0 exactly
 * (see `packages/backend.ai-client/src/client.ts`, FR-3205/BA-6551). The
 * shared e2e test backend runs `26.8.0rc1`, which sorts *before* `26.8.0`
 * under PEP440 (release candidates are pre-releases), so the flag is false
 * against it even though the feature is present — every Execution/Shell
 * control this spec asserts on is gated behind it.
 *
 * `preset-model-config-type` is gated at 26.9.0 (BA-7210), not yet released
 * on the shared test backend at all — forced here so this spec always
 * exercises the latest (nullable-capable) layout: Service
 * Configuration/Health Check/Pre-Start Actions render independently in
 * Basic Info without Model Definition needing to be enabled first. Without
 * this override the same fields render nested inside Model Definition
 * instead (legacy managers, FR-3481) — a different layout this spec
 * intentionally doesn't cover.
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
            if (
              feature === 'model-service-command-string' ||
              feature === 'preset-model-config-type'
            ) {
              return true;
            }
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
 * Force `model-service-command-string` on but `preset-model-config-type`
 * explicitly OFF, simulating a legacy (pre-BA-7210) manager. Complements
 * `installPresetFlagOverride` above (nullable-capable): on managers without
 * `preset-model-config-type`, Service Configuration/Health Check/Pre-Start
 * Actions render nested inside the Model Definition card (FR-3481) instead
 * of independently in Basic Info, and Model Name/Model Path stay required
 * — a layout `installPresetFlagOverride`'s scenarios don't exercise.
 */
async function installLegacyPresetFlagOverride(page: Page): Promise<void> {
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
            if (feature === 'preset-model-config-type') return false;
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
 * Select an option in a `BAIComplexSelect`-backed field (here: the Image
 * select, `BAIAdminImageSelect`). The Astryx ComplexSelector's field
 * trigger is a plain `<button>` whose accessible name is the field label
 * (`aria-haspopup="dialog"`, NOT a combobox); its popup is a `role="dialog"`
 * (aria-labelled with the same field label) hosting a search `TextInput` with
 * `role="combobox"` named "Search" and a `role="listbox"` of plain, clickable
 * `role="option"` rows — so the option is clicked directly.
 */
async function selectComplexSelectOption(
  page: Page,
  fieldLabel: string,
  optionLabel: string,
): Promise<void> {
  await page.getByRole('button', { name: fieldLabel, exact: true }).click();
  const popup = page.getByRole('dialog', { name: fieldLabel, exact: true });
  await expect(popup).toBeVisible({ timeout: 10000 });
  // Narrow the (server-side) search to the wanted option, then click it.
  await popup
    .getByRole('combobox', { name: 'Search', exact: true })
    .fill(optionLabel);
  const option = popup.getByRole('option', { name: optionLabel, exact: true });
  await expect(option).toBeVisible({ timeout: 15000 });
  await option.click();
  await expect(popup).toBeHidden({ timeout: 5000 });
  // The trigger renders the selected label once the selection committed.
  await expect(
    page.getByRole('button', { name: fieldLabel, exact: true }),
  ).toContainText(optionLabel, { timeout: 10000 });
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
  request: APIRequestContext,
): Promise<{ capture: Capture }> {
  const capture: Capture = { input: null };
  await installPresetFlagOverride(page);
  await loginAsAdmin(page, request);
  await setupGraphQLMocks(page, {
    AdminDeploymentPresetSettingPageRuntimeVariantsQuery:
      adminPresetRuntimeVariantsMock(),
    AdminDeploymentPresetSettingPageSelectedRuntimeVariantQuery:
      adminPresetSelectedRuntimeVariantMock(),
    AdminDeploymentPresetSettingPageResourceSlotTypesQuery:
      adminPresetResourceSlotTypesMock(),
    ...adminPresetImageSelectMocks(),
    AdminDeploymentPresetSettingPageCreateMutation:
      adminPresetCreateMutationMock(capture),
  });

  await navigateTo(page, 'admin/deployments/deployment-presets/new');
  const nameInput = page.getByRole('textbox', { name: 'Name', exact: true });
  await expect(nameInput).toBeVisible({ timeout: 15000 });

  await nameInput.fill(`e2e-fr3474-preset-${Date.now()}`);

  // The Runtime field is an Astryx Selector: its trigger is a plain <button>
  // named by the field label, and the popup hosts plain, clickable
  // `role="option"` rows. Only one option exists (the mock resolves exactly
  // one variant). Unlike the Add-Revision modal's Runtime select, this
  // BAIFormItem carries a tooltip, whose help glyph contributes " info" to the
  // trigger's accessible name — so the button is named "Runtime info", not
  // just "Runtime".
  await page.getByRole('button', { name: 'Runtime info', exact: true }).click();
  const customOption = page.getByRole('option', {
    name: 'custom',
    exact: true,
  });
  await expect(customOption).toBeVisible({ timeout: 10000 });
  await customOption.click();

  // Service Configuration only renders once the variant resolves as
  // config-reading; wait for it before touching cpu/mem/image so field order
  // doesn't race the selection's async re-render.
  await expect(
    page.getByText('Service Configuration', { exact: true }),
  ).toBeVisible({ timeout: 10000 });

  // The fixed cpu/mem quantity inputs live in the Resources card. The CPU
  // input is named by the slot type's displayName ("CPU"); the mem input is a
  // BAIDynamicUnitInputNumber, which (with no label/placeholder of its own)
  // falls back to BUI's generic "Select" accessible name — scope both to the
  // card to keep the queries unambiguous.
  const resourcesCard = page.locator('#preset-form-card-resources');
  await resourcesCard
    .getByRole('spinbutton', { name: 'CPU', exact: true })
    .fill('4');
  // The mem input (BAIDynamicUnitInputNumber) has no field label of its own;
  // its accessible name is BUI's doubled generic fallback "Select Select"
  // (group label + inner label). TODO: give the call site a real label.
  await resourcesCard
    .getByRole('spinbutton', { name: 'Select Select', exact: true })
    .fill('16');
  await selectComplexSelectOption(page, 'Image', MOCK_IMAGE_OPTION_LABEL);

  return { capture };
}

/**
 * Legacy-manager counterpart to {@link setupPresetCreatePage}: same wizard
 * setup, but under `installLegacyPresetFlagOverride` — so Service
 * Configuration is NOT independently visible in Basic Info here (it only
 * renders once Model Definition is enabled), matching the input form's
 * legacy layout (FR-3481).
 */
async function setupLegacyPresetCreatePage(
  page: Page,
  request: APIRequestContext,
): Promise<{ capture: Capture }> {
  const capture: Capture = { input: null };
  await installLegacyPresetFlagOverride(page);
  await loginAsAdmin(page, request);
  await setupGraphQLMocks(page, {
    AdminDeploymentPresetSettingPageRuntimeVariantsQuery:
      adminPresetRuntimeVariantsMock(),
    AdminDeploymentPresetSettingPageSelectedRuntimeVariantQuery:
      adminPresetSelectedRuntimeVariantMock(),
    AdminDeploymentPresetSettingPageResourceSlotTypesQuery:
      adminPresetResourceSlotTypesMock(),
    ...adminPresetImageSelectMocks(),
    AdminDeploymentPresetSettingPageCreateMutation:
      adminPresetCreateMutationMock(capture),
  });

  await navigateTo(page, 'admin/deployments/deployment-presets/new');
  const nameInput = page.getByRole('textbox', { name: 'Name', exact: true });
  await expect(nameInput).toBeVisible({ timeout: 15000 });
  await nameInput.fill(`e2e-fr3481-legacy-preset-${Date.now()}`);

  // Astryx Selector: plain trigger button + clickable option rows (same
  // idiom as setupPresetCreatePage above — incl. the tooltip glyph joining
  // the accessible name, so the trigger is 'Runtime info').
  await page.getByRole('button', { name: 'Runtime info', exact: true }).click();
  const customOption = page.getByRole('option', {
    name: 'custom',
    exact: true,
  });
  await expect(customOption).toBeVisible({ timeout: 10000 });
  await customOption.click();
  // Wait for the selection to commit before asserting the negative below —
  // otherwise "not visible yet" and "legacy layout" are indistinguishable.
  await expect(
    page.getByRole('button', { name: 'Runtime info', exact: true }),
  ).toContainText('custom', { timeout: 10000 });

  // Legacy: unlike the nullable-capable path, Service Configuration is NOT
  // independently visible in Basic Info — it only appears once Model
  // Definition is enabled (nested inside that card, asserted by the test).
  await expect(
    page.getByText('Service Configuration', { exact: true }),
  ).toHaveCount(0);

  const resourcesCard = page.locator('#preset-form-card-resources');
  await resourcesCard
    .getByRole('spinbutton', { name: 'CPU', exact: true })
    .fill('4');
  // Same doubled BUI fallback name as setupPresetCreatePage — see the note
  // there. TODO: real product-side label.
  await resourcesCard
    .getByRole('spinbutton', { name: 'Select Select', exact: true })
    .fill('16');
  await selectComplexSelectOption(page, 'Image', MOCK_IMAGE_OPTION_LABEL);

  return { capture };
}

test.describe(
  'Admin Deployment Preset — Service Configuration (FR-3474)',
  { tag: ['@serving', '@deploy', '@functional', '@regression'] },
  () => {
    test.describe.configure({ mode: 'serial', retries: 1 });

    test('Admin sees Service Configuration is optional, Execution/Shell always visible with Shell pre-filled, and Exec hides Shell', async ({
      page,
      request,
    }) => {
      await setupPresetCreatePage(page, request);

      // 1. Start Command and Port are present but optional — same as the
      //    Add-Revision modal (BA-6613). The command control is labeled
      //    "Command" in the default Shell mode.
      await expect(
        page.getByRole('textbox', { name: 'Command', exact: true }),
      ).toBeVisible();
      await expect(
        page.getByRole('spinbutton', { name: 'Port', exact: true }),
      ).toBeVisible();

      // 2. No Basic/Advanced toggle: Execution radios + Shell input are
      //    visible immediately, pre-filled with the backend default (not
      //    blank — a newly-added model seeds `shell: /bin/bash` so Shell
      //    mode never starts on an empty required field).
      await expect(
        page.getByRole('radio', { name: 'Shell', exact: true }),
      ).toBeVisible();
      await expect(
        page.getByRole('radio', { name: 'Exec', exact: true }),
      ).toBeVisible();
      const shellInputPrefill = page.getByRole('textbox', {
        name: 'Shell',
        exact: true,
      });
      await expect(shellInputPrefill).toBeVisible();
      await expect(shellInputPrefill).toHaveValue('/bin/bash');

      // 3. Switch to Exec → Shell input unmounts, command relabels. Assert on
      //    the labeled command control by role+name: a text match on "Command
      //    (argv)" strict-mode-violates because it resolves to BOTH the
      //    BAIFormItem <label> and the Astryx control's own internal field label.
      await page.getByRole('radio', { name: 'Exec', exact: true }).click();
      await expect(
        page.getByRole('textbox', { name: 'Shell', exact: true }),
      ).toHaveCount(0);
      await expect(
        page.getByRole('textbox', { name: 'Command (argv)', exact: true }),
      ).toBeVisible();
    });

    test('Admin creates a preset carrying Service Configuration, Health Check, and a Pre-Start Action', async ({
      page,
      request,
    }) => {
      const { capture } = await setupPresetCreatePage(page, request);

      // Shell is visible immediately (no Advanced toggle) — override the
      // default shell.
      const shellInput = page.getByRole('textbox', {
        name: 'Shell',
        exact: true,
      });
      await expect(shellInput).toBeVisible();
      await shellInput.fill('/bin/zsh');
      await shellInput.blur();

      const rawCommand = 'python -m server --arg "a b" && echo done';
      await page
        .getByRole('textbox', { name: 'Command', exact: true })
        .fill(rawCommand);
      await page
        .getByRole('spinbutton', { name: 'Port', exact: true })
        .fill('8000');

      // Health Check — enable and fill all 6 required detail fields.
      await page
        .getByRole('checkbox', { name: 'Enable Health Check', exact: true })
        .check();
      await page
        .getByRole('textbox', { name: 'Path', exact: true })
        .fill('/health');
      await page
        .getByRole('spinbutton', { name: 'Interval', exact: true })
        .fill('10');
      await page
        .getByRole('spinbutton', { name: 'Max Retries', exact: true })
        .fill('5');
      await page
        .getByRole('spinbutton', { name: 'Max Wait Time', exact: true })
        .fill('15');
      await page
        .getByRole('spinbutton', { name: 'Status Code', exact: true })
        .fill('200');
      await page
        .getByRole('spinbutton', { name: 'Startup Grace Period', exact: true })
        .fill('3');

      // Pre-Start Actions — add one row.
      await page.getByRole('button', { name: 'Add Pre-Start Action' }).click();
      await page
        .getByRole('textbox', { name: 'Action', exact: true })
        .fill('warm_cache');
      await page
        .getByRole('textbox', { name: 'Args (JSON)', exact: true })
        .fill('{"size": 128}');

      // Deployment Defaults — replicaCount is required with no default.
      await page
        .getByRole('spinbutton', { name: 'Replica Count', exact: true })
        .fill('1');

      // Skip Step 2 (all optional) straight to Review, then submit.
      await page.getByRole('button', { name: 'Skip to Review' }).click();
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

    test('Admin creates a preset with Start Command and Port left blank', async ({
      page,
      request,
    }) => {
      const { capture } = await setupPresetCreatePage(page, request);

      // Start Command and Port both left blank, but Health Check enabled —
      // hasServiceData must come from Health Check alone (not command/port)
      // for the model to still be submitted; leaving *everything* service-
      // related blank submits `modelDefinition: null` instead, which is a
      // different (also correct) case this test isn't about.
      await page
        .getByRole('checkbox', { name: 'Enable Health Check', exact: true })
        .check();
      await page
        .getByRole('textbox', { name: 'Path', exact: true })
        .fill('/health');
      await page
        .getByRole('spinbutton', { name: 'Interval', exact: true })
        .fill('10');
      await page
        .getByRole('spinbutton', { name: 'Max Retries', exact: true })
        .fill('5');
      await page
        .getByRole('spinbutton', { name: 'Max Wait Time', exact: true })
        .fill('15');
      await page
        .getByRole('spinbutton', { name: 'Status Code', exact: true })
        .fill('200');
      await page
        .getByRole('spinbutton', { name: 'Startup Grace Period', exact: true })
        .fill('3');

      await page
        .getByRole('spinbutton', { name: 'Replica Count', exact: true })
        .fill('1');
      await page.getByRole('button', { name: 'Skip to Review' }).click();
      await page.getByRole('button', { name: 'Create', exact: true }).click();

      await expect.poll(() => capture.input, { timeout: 15000 }).not.toBeNull();

      const service = capture.input?.modelDefinition?.models?.[0]?.service;
      expect(service).toBeTruthy();
      // Neither `command` nor `startCommand` is sent when the user leaves
      // Start Command blank — hasCommandData is false, so the whole
      // command/shell branch is omitted (buildModelDefinitionInput,
      // AdminDeploymentPresetSettingPage.tsx).
      expect(service.command).toBeUndefined();
      expect(service.startCommand).toBeUndefined();
      // BA-7210: omitted port is sent as `null` (not a fallback number) so
      // the server inherits the runtime variant baseline's port.
      expect(service.port).toBeNull();
      expect(service.healthCheck).toMatchObject({
        path: '/health',
        interval: 10,
        maxRetries: 5,
        maxWaitTime: 15,
        expectedStatusCode: 200,
        initialDelay: 3,
      });
    });
  },
);

test.describe(
  'Admin Deployment Preset — Service Configuration, legacy manager (FR-3481)',
  { tag: ['@serving', '@deploy', '@functional', '@regression'] },
  () => {
    test.describe.configure({ mode: 'serial', retries: 1 });

    test('Admin sees Service Configuration/Health Check/Pre-Start Actions nested inside Model Definition, and the mutation carries required name/modelPath', async ({
      page,
      request,
    }) => {
      const { capture } = await setupLegacyPresetCreatePage(page, request);

      // Deployment Defaults — replicaCount is required with no default, and
      // lives on Basic Info (Step 1); fill it before switching steps.
      await page
        .getByRole('spinbutton', { name: 'Replica Count', exact: true })
        .fill('1');

      // Enable Model Definition — legacy managers can only submit Service
      // Configuration/Health Check/Pre-Start Actions alongside a real
      // name/modelPath (PresetModelConfigInput.name/modelPath were
      // String!/min_length=1 pre-BA-7210), so the input form nests these
      // sections inside this card instead of Basic Info.
      await page.getByRole('button', { name: 'Model & Execution' }).click();
      await page
        .getByRole('switch', { name: 'Model Definition', exact: true })
        .click();

      const nameInput = page.getByRole('textbox', {
        name: 'Model Name',
        exact: true,
      });
      const modelPathInput = page.getByRole('textbox', {
        name: 'Model Path',
        exact: true,
      });
      await expect(nameInput).toBeVisible({ timeout: 10000 });
      await nameInput.fill('e2e-fr3481-legacy-model');
      await modelPathInput.fill('/models/e2e-fr3481-legacy-model');

      // The nested Service Configuration/Health Check/Pre-Start Actions use
      // the exact same field labels as the nullable-capable path's
      // independent Basic Info placement — only their position in the DOM
      // tree differs, not their accessible names.
      const shellInput = page.getByRole('textbox', {
        name: 'Shell',
        exact: true,
      });
      await expect(shellInput).toBeVisible();
      await expect(shellInput).toHaveValue('/bin/bash');

      const rawCommand = 'python -m server --legacy';
      await page
        .getByRole('textbox', { name: 'Command', exact: true })
        .fill(rawCommand);
      await page
        .getByRole('spinbutton', { name: 'Port', exact: true })
        .fill('9000');

      await page
        .getByRole('checkbox', { name: 'Enable Health Check', exact: true })
        .check();
      await page
        .getByRole('textbox', { name: 'Path', exact: true })
        .fill('/health');
      await page
        .getByRole('spinbutton', { name: 'Interval', exact: true })
        .fill('10');
      await page
        .getByRole('spinbutton', { name: 'Max Retries', exact: true })
        .fill('5');
      await page
        .getByRole('spinbutton', { name: 'Max Wait Time', exact: true })
        .fill('15');
      await page
        .getByRole('spinbutton', { name: 'Status Code', exact: true })
        .fill('200');
      await page
        .getByRole('spinbutton', { name: 'Startup Grace Period', exact: true })
        .fill('3');

      await page.getByRole('button', { name: 'Add Pre-Start Action' }).click();
      await page
        .getByRole('textbox', { name: 'Action', exact: true })
        .fill('warm_cache');
      await page
        .getByRole('textbox', { name: 'Args (JSON)', exact: true })
        .fill('{"size": 128}');

      await page.getByText('Skip to Review', { exact: true }).click();
      await page.getByRole('button', { name: 'Create', exact: true }).click();

      await expect.poll(() => capture.input, { timeout: 15000 }).not.toBeNull();

      const model = capture.input?.modelDefinition?.models?.[0];
      expect(model).toBeTruthy();
      // Legacy managers require real, non-empty name/modelPath — unlike the
      // nullable-capable path (which would send `null` for either field
      // left blank), so these must be the actual typed strings.
      expect(model.name).toBe('e2e-fr3481-legacy-model');
      expect(model.modelPath).toBe('/models/e2e-fr3481-legacy-model');

      const service = model.service;
      expect(service).toBeTruthy();
      expect(service.command).toBe(rawCommand);
      expect(service.shell).toBe('/bin/bash');
      expect(service.port).toBe(9000);
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
