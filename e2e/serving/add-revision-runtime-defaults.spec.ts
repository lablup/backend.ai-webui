// spec: FR-3342 — runtime-variant defaults drive the deployment add-revision
// model-definition placeholders + section branching (26.8.0-gated fields;
// fully mocked because no live backend exposes them yet).
//
// Hybrid mock spec: a real no-revision deployment shell is created on the live
// backend so the real page + Add-Revision modal render, and the Runtime select
// (BAIRuntimeVariantSelect*Query), the variant's DB defaultModelDefinition
// (DeploymentAddRevisionModalVariantDefaultQuery), and the add mutation are
// stubbed by operation name so `readsVfolderConfigFiles` + `defaultModelDefinition`
// are under test control.
//
// Behaviors asserted (FR-3342):
//   1. Variant with readsVfolderConfigFiles=true ('custom') → Service
//      Configuration section shows; runtime-parameter presets are hidden.
//   2. Variant with readsVfolderConfigFiles=false ('vllm') → runtime-parameter
//      presets show, the custom service config is hidden, and the
//      "default command applied" warning note appears.
//   3. The variant's defaultModelDefinition.models[0].service.{command,port,
//      healthCheck} populates the command / port / health-check PLACEHOLDERS
//      (display-only), not the values.
//   4. Typing into the Advanced "Model Definition File Path" does NOT change the
//      placeholders of the fields above it.
//   4.5. A partial model-definition.yaml (only `start_command` defined)
//      overrides just that placeholder; port/health-check fall back to the
//      DB baseline field-by-field, proving the merge is per-field and not
//      all-or-nothing.
//   5. Old-manager fallback (readsVfolderConfigFiles omitted, name==='custom'):
//      BAIRuntimeVariantSelect itself resolves the omitted (pre-26.8.0) flag
//      via `readsVfolderConfigFiles ?? name === 'custom'`, so this is
//      reachable directly from a fresh variant selection — no separate
//      "Load current revision" prefill path needed to exercise it.
import { setupGraphQLMocks } from '../session/mocking/graphql-interceptor';
import {
  cleanupDeploymentFixtures,
  cleanupDeploymentSafely,
  provisionDeploymentModelFolder,
  selectRevisionModalOption,
} from '../utils/deployment-fixtures';
import { loginAsAdmin } from '../utils/test-util';
import {
  createDeploymentAndOpenPage,
  installDeploymentFlagOverride,
  openAddRevisionAdvanced,
  selectRuntimeVariant,
} from './add-revision-support';
import {
  MOCK_DB_DEFAULT_COMMAND,
  MOCK_DB_DEFAULT_MAX_RETRIES,
  MOCK_DB_DEFAULT_PORT,
  MOCK_VFOLDER_COMMAND,
  MOCK_VFOLDER_MAX_RETRIES,
  MOCK_VFOLDER_PORT,
  runtimeVariantSelectMocks,
  variantDefaultModelDefinitionMock,
} from './mocking/add-revision-mock';
import {
  test,
  expect,
  type APIRequestContext,
  type Page,
} from '@playwright/test';

async function loginWithVariantMocks(
  page: Page,
  request: APIRequestContext,
  extraMocks: Record<
    string,
    (vars: Record<string, any>) => Record<string, any>
  >,
): Promise<void> {
  await installDeploymentFlagOverride(page);
  await loginAsAdmin(page, request);
  await setupGraphQLMocks(page, extraMocks);
}

test.describe(
  'Model Serving — Add Revision runtime-variant defaults (FR-3342)',
  { tag: ['@serving', '@deploy', '@functional', '@regression'] },
  () => {
    test.describe.configure({ mode: 'serial' });

    test('Admin sees the Service Configuration section for a config-reading variant (custom)', async ({
      page,
      request,
    }) => {
      const name = `e2e-fr3342-reads-true-${Date.now()}`;
      try {
        await loginWithVariantMocks(page, request, {
          ...runtimeVariantSelectMocks('custom', true),
          DeploymentAddRevisionModalVariantDefaultQuery:
            variantDefaultModelDefinitionMock(),
        });
        await createDeploymentAndOpenPage(page, name);
        const modal = await openAddRevisionAdvanced(page);
        await selectRuntimeVariant(page, modal, 'custom');

        // reads=true → Service Configuration section + the command input are
        // shown. Assert on the labeled command control ("Command" in the
        // default Shell mode) rather than the Form.Item label text, whose
        // <label> also wraps a tooltip icon.
        await expect(
          modal.getByText('Service Configuration', { exact: true }),
        ).toBeVisible();
        await expect(
          modal.getByRole('textbox', { name: 'Command', exact: true }),
        ).toBeVisible();

        // Runtime-parameter presets are hidden for a config-reading variant.
        await expect(
          modal.getByText('Runtime Parameters', { exact: true }),
        ).toHaveCount(0);
        // The "default command applied" warning is NOT shown for this variant.
        await expect(
          modal.getByText(
            'The default start command for the selected inference runtime will be applied automatically.',
          ),
        ).toHaveCount(0);
      } finally {
        await cleanupDeploymentSafely(page, name);
      }
    });

    test('Admin sees runtime-parameter presets and the default-command note for a non-config-reading variant (vllm)', async ({
      page,
      request,
    }) => {
      const name = `e2e-fr3342-reads-false-${Date.now()}`;
      try {
        await loginWithVariantMocks(page, request, {
          ...runtimeVariantSelectMocks('vllm', false),
        });
        await createDeploymentAndOpenPage(page, name);
        const modal = await openAddRevisionAdvanced(page);
        await selectRuntimeVariant(page, modal, 'vllm');

        // reads=false → Service Configuration (custom command) is hidden.
        await expect(
          modal.getByText('Service Configuration', { exact: true }),
        ).toHaveCount(0);

        // Runtime Parameters section shows for a preset-driven variant. Match
        // loosely (substring, not exact): RuntimeParameterFormSection renders
        // the title with a conditional trailing "(Optional)" span when the
        // manager lacks required-field support, so the element text can be
        // "Runtime Parameters (Optional)" — an { exact: true } match would miss
        // it and fail version-dependently.
        await expect(modal.getByText(/Runtime Parameters/).first()).toBeVisible(
          { timeout: 10000 },
        );

        // The "default start command will be applied" warning note appears
        // (rendered as the Runtime select's warning-only validation message,
        // in the form item's warning explain slot).
        await expect(
          modal.locator('[data-bai-form-item-explain-warning]').filter({
            hasText:
              'The default start command for the selected inference runtime will be applied automatically.',
          }),
        ).toBeVisible({ timeout: 10000 });

        // The "Model Definition File Path" points at the model-definition.yaml
        // the server reads, so it is gated on the variant reading the vfolder
        // config files and is NOT rendered at all for a non-config-reading
        // variant — regardless of the Advanced Settings collapse. (Its shown
        // counterpart is asserted for the custom variant in
        // add-revision-command-shell.spec.ts.)
        await expect(
          modal.getByLabel('Model Definition File Path'),
        ).toHaveCount(0);
      } finally {
        await cleanupDeploymentSafely(page, name);
      }
    });

    test('Admin sees the variant defaultModelDefinition fill the command / port / health-check placeholders', async ({
      page,
      request,
    }) => {
      const name = `e2e-fr3342-placeholders-${Date.now()}`;
      try {
        await loginWithVariantMocks(page, request, {
          ...runtimeVariantSelectMocks('custom', true),
          DeploymentAddRevisionModalVariantDefaultQuery:
            variantDefaultModelDefinitionMock(),
        });
        await createDeploymentAndOpenPage(page, name);
        const modal = await openAddRevisionAdvanced(page);
        await selectRuntimeVariant(page, modal, 'custom');

        // The command input carries the DB default command as its placeholder
        // (display-only) — NOT as its value.
        const startCommand = modal.getByRole('textbox', {
          name: 'Command',
          exact: true,
        });
        await expect(startCommand).toHaveAttribute(
          'placeholder',
          MOCK_DB_DEFAULT_COMMAND,
          { timeout: 10000 },
        );
        await expect(startCommand).toHaveValue('');

        // The Port input's placeholder is the DB default port (as a string).
        await expect(
          modal.getByRole('spinbutton', { name: 'Port', exact: true }),
        ).toHaveAttribute('placeholder', String(MOCK_DB_DEFAULT_PORT));

        // The health-check "Max Retries" placeholder is the DB default (shown
        // once Health Check is enabled).
        await modal
          .getByRole('checkbox', { name: 'Enable Health Check', exact: true })
          .check();
        await expect(
          modal.getByRole('spinbutton', { name: 'Max Retries', exact: true }),
        ).toHaveAttribute('placeholder', String(MOCK_DB_DEFAULT_MAX_RETRIES), {
          timeout: 10000,
        });
      } finally {
        await cleanupDeploymentSafely(page, name);
      }
    });

    test('Admin sees a selected model folder’s model-definition.yaml override the DB-default command / port / health-check placeholders', async ({
      page,
      request,
    }) => {
      // Placeholder precedence is a TWO-layer merge (DeploymentAddRevisionModal
      // ~L1588): DB `defaultModelDefinition` (low) < vfolder
      // `model-definition.yaml` (high). The previous test pins the LOW layer
      // (no folder selected → DB baseline shows). This one selects a real
      // provisioned folder whose seeded yaml carries values distinct from the
      // mocked DB baseline, proving the HIGH layer overrides the low one.
      //
      // Note on granularity: `useModelDefinitionDefaults` now parses the yaml
      // via `parseModelDefinitionYamlPartial`, which returns ONLY the fields the
      // yaml actually defines; the modal then merges field-by-field (DB baseline
      // < partial vfolder parse), rather than overwriting the whole object. The
      // seeded fixture yaml defines command, port, AND max_retries, so it
      // overrides all three placeholders asserted below — but any field the yaml
      // omitted would instead fall through to the DB baseline. That per-field
      // fallthrough is exercised separately by the next test, which uploads a
      // yaml defining only `start_command`.
      test.setTimeout(240_000);
      const name = `e2e-fr3342-vfolder-override-${Date.now()}`;
      let folderName: string | undefined;
      try {
        await loginWithVariantMocks(page, request, {
          ...runtimeVariantSelectMocks('custom', true),
          DeploymentAddRevisionModalVariantDefaultQuery:
            variantDefaultModelDefinitionMock(),
        });
        // Seed a real model folder (its model-definition.yaml differs from the
        // DB mock) BEFORE opening the deployment page — provisioning navigates
        // to the Data page.
        folderName = await provisionDeploymentModelFolder(page);

        await createDeploymentAndOpenPage(page, name);
        const modal = await openAddRevisionAdvanced(page);
        await selectRuntimeVariant(page, modal, 'custom');

        // Selecting the folder triggers the modal's `model-definition.yaml` read;
        // its parsed values become the high-priority placeholder layer.
        await selectRevisionModalOption(page, 'Model Folder', folderName);

        // Guard: the vfolder fixture values must actually DIFFER from the DB
        // mock, otherwise the override below would pass vacuously.
        expect(MOCK_VFOLDER_COMMAND).not.toBe(MOCK_DB_DEFAULT_COMMAND);
        expect(MOCK_VFOLDER_PORT).not.toBe(MOCK_DB_DEFAULT_PORT);
        expect(MOCK_VFOLDER_MAX_RETRIES).not.toBe(MOCK_DB_DEFAULT_MAX_RETRIES);

        // Command placeholder flips from the DB default to the vfolder command
        // (display-only — the value stays empty). Generous timeout absorbs the
        // vfolder download + parse round-trip.
        const startCommand = modal.getByRole('textbox', {
          name: 'Command',
          exact: true,
        });
        await expect(startCommand).toHaveAttribute(
          'placeholder',
          MOCK_VFOLDER_COMMAND,
          { timeout: 15000 },
        );
        await expect(startCommand).toHaveValue('');

        // Port placeholder = the vfolder port, overriding the DB default port.
        await expect(
          modal.getByRole('spinbutton', { name: 'Port', exact: true }),
        ).toHaveAttribute('placeholder', String(MOCK_VFOLDER_PORT), {
          timeout: 10000,
        });

        // Health-check "Max Retries" placeholder = the vfolder max_retries,
        // overriding the DB default (shown once Health Check is enabled).
        await modal
          .getByRole('checkbox', { name: 'Enable Health Check', exact: true })
          .check();
        await expect(
          modal.getByRole('spinbutton', { name: 'Max Retries', exact: true }),
        ).toHaveAttribute('placeholder', String(MOCK_VFOLDER_MAX_RETRIES), {
          timeout: 10000,
        });
      } finally {
        await cleanupDeploymentSafely(page, name);
        if (folderName) {
          await cleanupDeploymentFixtures(page, { folderName });
        }
      }
    });

    test('Admin sees a partial model-definition.yaml override only the fields it defines, falling back to the DB baseline for the rest', async ({
      page,
      request,
    }) => {
      // Exercises the field-by-field merge the previous test's fully-populated
      // fixture cannot: this yaml defines ONLY `start_command`, omitting
      // `port` and `health_check` entirely, so the command placeholder should
      // flip to the vfolder value while port/max_retries fall through to the
      // DB baseline untouched.
      test.setTimeout(240_000);
      const name = `e2e-fr3342-vfolder-partial-${Date.now()}`;
      let folderName: string | undefined;
      try {
        await loginWithVariantMocks(page, request, {
          ...runtimeVariantSelectMocks('custom', true),
          DeploymentAddRevisionModalVariantDefaultQuery:
            variantDefaultModelDefinitionMock(),
        });
        folderName = await provisionDeploymentModelFolder(page, {
          yamlContent: `models:
  - name: "mock-openai"
    model_path: "/models"
    service:
      start_command:
        - python3
        - /models/mock_openai_server.py
`,
        });

        await createDeploymentAndOpenPage(page, name);
        const modal = await openAddRevisionAdvanced(page);
        await selectRuntimeVariant(page, modal, 'custom');
        await selectRevisionModalOption(page, 'Model Folder', folderName);

        // Guard: same vacuous-pass concern as the full-override test.
        expect(MOCK_VFOLDER_COMMAND).not.toBe(MOCK_DB_DEFAULT_COMMAND);
        expect(MOCK_VFOLDER_PORT).not.toBe(MOCK_DB_DEFAULT_PORT);
        expect(MOCK_VFOLDER_MAX_RETRIES).not.toBe(MOCK_DB_DEFAULT_MAX_RETRIES);

        // Command: the yaml defines it, so it overrides the DB baseline.
        const startCommand = modal.getByRole('textbox', {
          name: 'Command',
          exact: true,
        });
        await expect(startCommand).toHaveAttribute(
          'placeholder',
          MOCK_VFOLDER_COMMAND,
          { timeout: 15000 },
        );

        // Port: the yaml omits it, so the placeholder stays the DB baseline
        // — NOT the (irrelevant, never-uploaded) vfolder port constant.
        await expect(
          modal.getByRole('spinbutton', { name: 'Port', exact: true }),
        ).toHaveAttribute('placeholder', String(MOCK_DB_DEFAULT_PORT), {
          timeout: 10000,
        });

        // Health-check max_retries: same field-by-field fallback, the yaml
        // omits `health_check` entirely.
        await modal
          .getByRole('checkbox', { name: 'Enable Health Check', exact: true })
          .check();
        await expect(
          modal.getByRole('spinbutton', { name: 'Max Retries', exact: true }),
        ).toHaveAttribute('placeholder', String(MOCK_DB_DEFAULT_MAX_RETRIES), {
          timeout: 10000,
        });
      } finally {
        await cleanupDeploymentSafely(page, name);
        if (folderName) {
          await cleanupDeploymentFixtures(page, { folderName });
        }
      }
    });

    test('Admin sees the Model Definition File Path leave the command placeholder unchanged', async ({
      page,
      request,
    }) => {
      const name = `e2e-fr3342-def-path-${Date.now()}`;
      try {
        await loginWithVariantMocks(page, request, {
          ...runtimeVariantSelectMocks('custom', true),
          DeploymentAddRevisionModalVariantDefaultQuery:
            variantDefaultModelDefinitionMock(),
        });
        await createDeploymentAndOpenPage(page, name);
        const modal = await openAddRevisionAdvanced(page);
        await selectRuntimeVariant(page, modal, 'custom');

        const startCommand = modal.getByRole('textbox', {
          name: 'Command',
          exact: true,
        });
        await expect(startCommand).toHaveAttribute(
          'placeholder',
          MOCK_DB_DEFAULT_COMMAND,
          { timeout: 10000 },
        );

        // Expand Advanced Settings and type into the Model Definition File
        // Path. Its value must NOT feed back into the placeholders of the
        // command fields above it (the lower field is deliberately excluded
        // from the placeholder read).
        await modal.getByRole('button', { name: 'Advanced Settings' }).click();
        const modelDefPath = modal.getByRole('textbox', {
          name: 'Model Definition File Path',
          exact: true,
        });
        await expect(modelDefPath).toBeVisible({ timeout: 10000 });
        await modelDefPath.fill('some-other-definition.yaml');

        // The command placeholder is still the DB-default command, unchanged.
        await expect(startCommand).toHaveAttribute(
          'placeholder',
          MOCK_DB_DEFAULT_COMMAND,
        );
      } finally {
        await cleanupDeploymentSafely(page, name);
      }
    });

    test('Admin sees the custom service config for an old-manager variant (readsVfolderConfigFiles omitted, name === custom)', async ({
      page,
      request,
    }) => {
      const name = `e2e-fr3342-oldmgr-${Date.now()}`;
      try {
        await loginWithVariantMocks(page, request, {
          ...runtimeVariantSelectMocks(
            'custom',
            true,
            /* omitReadsFlag */ true,
          ),
          DeploymentAddRevisionModalVariantDefaultQuery:
            variantDefaultModelDefinitionMock(),
        });
        await createDeploymentAndOpenPage(page, name);
        const modal = await openAddRevisionAdvanced(page);
        await selectRuntimeVariant(page, modal, 'custom');

        await expect(
          modal.getByText('Service Configuration', { exact: true }),
        ).toBeVisible();
      } finally {
        await cleanupDeploymentSafely(page, name);
      }
    });
  },
);
