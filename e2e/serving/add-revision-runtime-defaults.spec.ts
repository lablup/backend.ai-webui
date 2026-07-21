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
//   5. Old-manager fallback (readsVfolderConfigFiles omitted, name==='custom'):
//      see the `test.fixme` note below — not reachable from a fresh variant
//      selection because the shared BAIRuntimeVariantSelect coerces the omitted
//      flag to `false` before the modal can apply its name-based fallback.
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
import { test, expect, type Page } from '@playwright/test';

async function loginWithVariantMocks(
  page: Page,
  request: any,
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

        // reads=true → Service Configuration section + the Start Command input
        // are shown. Assert on the command input (`#startCommand`) rather than
        // the label text, whose <label> also wraps a tooltip icon.
        await expect(
          modal.getByText('Service Configuration', { exact: true }),
        ).toBeVisible();
        await expect(modal.locator('#startCommand').first()).toBeVisible();

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

        // Runtime Parameters section shows for a preset-driven variant.
        await expect(
          modal.getByText('Runtime Parameters', { exact: true }),
        ).toBeVisible({ timeout: 10000 });

        // The "default start command will be applied" warning note appears
        // (rendered as the Runtime select's warning-only validation message).
        await expect(
          modal.locator('.ant-form-item-explain-warning').filter({
            hasText:
              'The default start command for the selected inference runtime will be applied automatically.',
          }),
        ).toBeVisible({ timeout: 10000 });
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

        // The Start Command input carries the DB default command as its
        // placeholder (display-only) — NOT as its value.
        const startCommand = modal.locator('#startCommand').first();
        await expect(startCommand).toHaveAttribute(
          'placeholder',
          MOCK_DB_DEFAULT_COMMAND,
          { timeout: 10000 },
        );
        await expect(startCommand).toHaveValue('');

        // The Port input's placeholder is the DB default port (as a string).
        await expect(modal.locator('#commandPort').first()).toHaveAttribute(
          'placeholder',
          String(MOCK_DB_DEFAULT_PORT),
        );

        // The health-check "Max Retries" placeholder is the DB default (shown
        // once Health Check is enabled).
        await modal.getByText('Enable Health Check', { exact: true }).click();
        await expect(
          modal.locator('#commandMaxRetries').first(),
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
      // Note on granularity: because `parseModelDefinitionYaml` always returns a
      // fully-populated object, a present-and-parseable yaml wins on every field
      // it maps — the per-field DB fallback only surfaces when the vfolder read
      // yields null entirely (missing/invalid file, or a non-config-reading
      // variant), which the DB-baseline test above already exercises.
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
        await selectRevisionModalOption(page, '#modelFolderId', folderName);

        // Guard: the vfolder fixture values must actually DIFFER from the DB
        // mock, otherwise the override below would pass vacuously.
        expect(MOCK_VFOLDER_COMMAND).not.toBe(MOCK_DB_DEFAULT_COMMAND);
        expect(MOCK_VFOLDER_PORT).not.toBe(MOCK_DB_DEFAULT_PORT);
        expect(MOCK_VFOLDER_MAX_RETRIES).not.toBe(MOCK_DB_DEFAULT_MAX_RETRIES);

        // Command placeholder flips from the DB default to the vfolder command
        // (display-only — the value stays empty). Generous timeout absorbs the
        // vfolder download + parse round-trip.
        const startCommand = modal.locator('#startCommand').first();
        await expect(startCommand).toHaveAttribute(
          'placeholder',
          MOCK_VFOLDER_COMMAND,
          { timeout: 15000 },
        );
        await expect(startCommand).toHaveValue('');

        // Port placeholder = the vfolder port, overriding the DB default port.
        await expect(modal.locator('#commandPort').first()).toHaveAttribute(
          'placeholder',
          String(MOCK_VFOLDER_PORT),
          { timeout: 10000 },
        );

        // Health-check "Max Retries" placeholder = the vfolder max_retries,
        // overriding the DB default (shown once Health Check is enabled).
        await modal.getByText('Enable Health Check', { exact: true }).click();
        await expect(
          modal.locator('#commandMaxRetries').first(),
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

        const startCommand = modal.locator('#startCommand').first();
        await expect(startCommand).toHaveAttribute(
          'placeholder',
          MOCK_DB_DEFAULT_COMMAND,
          { timeout: 10000 },
        );

        // Expand Advanced Settings and type into the Model Definition File
        // Path. Its value must NOT feed back into the placeholders of the
        // command fields above it (the lower field is deliberately excluded
        // from the placeholder read).
        await modal.getByText('Advanced Settings', { exact: true }).click();
        const modelDefPath = modal.getByLabel('Model Definition File Path');
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
      // Not reachable via a fresh variant selection: the shared
      // `BAIRuntimeVariantSelect` populates `runtimeVariantMap` with
      // `readsVfolderConfigFiles: node.readsVfolderConfigFiles ?? false`, i.e.
      // it coerces the @since(26.8.0)-stripped (omitted) flag to `false`
      // BEFORE the modal ever reads it. The modal's legacy
      // `?? name === 'custom'` fallback only fires when the value is
      // `undefined`, which never happens through the select path — the
      // fallback is exercised only via the "Load current revision" prefill
      // (which sets the map directly from the revision fragment, preserving
      // undefined). Asserting it here would require mocking the entire
      // DeploymentDetailPageQuery + a current revision, which is out of scope
      // for these modal-focused mock specs.
      //
      // TODO(FR-3342): cover the name-based fallback via the prefill path once
      // a full DeploymentDetailPageQuery mock (with a currentRevision whose
      // variant name is `custom` and readsVfolderConfigFiles omitted) exists.
      test.fixme(true, 'name-based fallback unreachable from fresh select');
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
