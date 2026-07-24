// spec: FR-3205 — custom deployment Start Command redesign (shell/exec modes).
//
// Hybrid mock spec: a real no-revision deployment shell is created on the live
// backend so the real `/deployments/:id` page + Add-Revision modal render, and
// only the modal-internal runtime-variant / manual-image / add-mutation GraphQL
// ops are stubbed by operation name. The Runtime select is pinned to a single
// mocked `custom` variant (readsVfolderConfigFiles=true) so the Service
// Configuration section — which hosts the Start Command controls — is shown.
//
// Behaviors asserted (FR-3205):
//   1. Custom-mode Start Command is present and OPTIONAL (empty submit allowed).
//   2. Basic mode shows just a command input; Advanced reveals Execution
//      (Shell vs Exec) + a Shell input; Exec hides the Shell input and relabels
//      the command to "Command (argv)".
//   3. Shell mode submits ModelServiceConfigInput.shell = the selected shell;
//      Basic mode OMITS shell; Exec mode submits shell = null.
//   4. command is sent as the RAW string (no client tokenization).
//   5. "Model Definition File Path" is restored, lives UNDER Advanced Settings,
//      and is optional.
import { setupGraphQLMocks } from '../session/mocking/graphql-interceptor';
import {
  cleanupDeploymentFixtures,
  cleanupDeploymentSafely,
  provisionDeploymentModelFolder,
  selectRevisionModalOption,
} from '../utils/deployment-fixtures';
import { loginAsAdmin, modifyConfigToml } from '../utils/test-util';
import {
  createDeploymentAndOpenPage,
  disableAutoApply,
  fillManualImageName,
  installDeploymentFlagOverride,
  openAddRevisionAdvanced,
  selectRuntimeVariant,
  submitAddRevision,
} from './add-revision-support';
import {
  addRevisionMutationMock,
  manualImageResolveMock,
  MOCK_MANUAL_IMAGE_REFERENCE,
  MOCK_RESOLVED_IMAGE_UUID,
  runtimeVariantSelectMocks,
  variantDefaultModelDefinitionMock,
} from './mocking/add-revision-mock';
import { test, expect, type Locator, type Page } from '@playwright/test';

// Records the outgoing addModelRevision `input` for payload assertions.
type Capture = { input: any };

/**
 * Common setup for a Custom-mode command scenario: enable the manual-image
 * field, log in, optionally provision a uniquely-named model folder on the live
 * backend (so the required Model Folder field can be filled deterministically
 * rather than depending on whatever folders happen to exist), stub the
 * modal-internal ops (Runtime select pinned to `custom` reads=true, manual-image
 * resolver, add mutation), then create a fresh deployment and open the modal in
 * Advanced mode with the `custom` variant selected.
 *
 * Returns the modal, the mutation capture, and `folderName` — the provisioned
 * folder's name when `withModelFolder` is set (the caller selects it via
 * `selectRevisionModalOption` and MUST tear it down via
 * `cleanupDeploymentFixtures(page, { folderName })`), otherwise `undefined`. The
 * two control-only tests (which never submit) skip provisioning to stay fast.
 */
async function setupCommandScenario(
  page: Page,
  request: any,
  deploymentName: string,
  options: { withModelFolder?: boolean } = {},
): Promise<{ modal: Locator; capture: Capture; folderName?: string }> {
  // Folder provisioning creates + uploads fixtures to a fresh vfolder; give the
  // whole scenario (provision + Suspense-heavy modal flow + teardown) room.
  if (options.withModelFolder) {
    test.setTimeout(240_000);
  }
  const capture: Capture = { input: null };
  // The "Image Name (Manual)" field only renders when this client flag is on.
  await modifyConfigToml(page, request, {
    general: { allowManualImageNameForSession: true },
  });
  await installDeploymentFlagOverride(page);
  await loginAsAdmin(page, request);

  // Seed a deterministic model folder before touching the modal. Provisioning
  // navigates to the Data page, so it must happen before the deployment page is
  // opened. If any later setup step fails, unwind the folder we just created so
  // the caller never inherits a leaked fixture it never received.
  const folderName = options.withModelFolder
    ? await provisionDeploymentModelFolder(page)
    : undefined;
  try {
    await setupGraphQLMocks(page, {
      ...runtimeVariantSelectMocks('custom', true),
      DeploymentAddRevisionModalVariantDefaultQuery:
        variantDefaultModelDefinitionMock(),
      DeploymentAddRevisionModalManualImageQuery: manualImageResolveMock(),
      DeploymentAddRevisionModalAddMutation: addRevisionMutationMock(capture),
    });

    await createDeploymentAndOpenPage(page, deploymentName);
    const modal = await openAddRevisionAdvanced(page);
    await selectRuntimeVariant(page, modal, 'custom');
    return { modal, capture, folderName };
  } catch (error) {
    if (folderName) {
      await cleanupDeploymentFixtures(page, { folderName });
    }
    throw error;
  }
}

test.describe(
  'Model Serving — Add Revision Start Command (FR-3205)',
  { tag: ['@serving', '@deploy', '@functional', '@regression'] },
  () => {
    // Serial: the submit tests share one live backend and drive a
    // Suspense-heavy form; one local retry absorbs the occasional
    // submit→mutation timing miss under sequential load (CI already retries).
    test.describe.configure({ mode: 'serial', retries: 1 });

    test('Admin sees Execution and Shell controls only after switching the command to Advanced mode', async ({
      page,
      request,
    }) => {
      const name = `e2e-fr3205-toggle-${Date.now()}`;
      try {
        const { modal } = await setupCommandScenario(page, request, name);

        // 1. Service Configuration section + the Start Command input are shown
        //    for the custom (config-reading) variant. Assert on the command
        //    input (`#startCommand`), not the label text whose <label> also
        //    wraps a tooltip icon.
        await expect(
          modal.getByText('Service Configuration', { exact: true }),
        ).toBeVisible();
        await expect(modal.locator('#startCommand').first()).toBeVisible();

        // 2. Basic mode (default): no Execution (Shell/Exec) radios and no
        //    Shell input are shown.
        await expect(
          modal.getByRole('radio', { name: 'Exec', exact: true }),
        ).toHaveCount(0);
        await expect(modal.locator('#commandShell')).toHaveCount(0);

        // 3. Toggle Advanced (the Basic/Advanced Segmented lives in the Service
        //    Configuration header) → the Execution radios (Shell/Exec) and the
        //    Shell input appear.
        await modal.getByText('Advanced', { exact: true }).click();
        await expect(
          modal.getByRole('radio', { name: 'Shell', exact: true }),
        ).toBeVisible();
        await expect(
          modal.getByRole('radio', { name: 'Exec', exact: true }),
        ).toBeVisible();
        await expect(modal.locator('#commandShell')).toBeVisible();

        // 4. Switch Execution to Exec → the Shell input is hidden and the
        //    command field is relabeled "Command (argv)". Non-exact text match:
        //    the Form.Item <label> wraps a tooltip icon so its text node is not
        //    exactly "Command (argv)"; the string is distinctive enough that a
        //    substring match is unambiguous.
        await modal.getByRole('radio', { name: 'Exec', exact: true }).click();
        await expect(modal.locator('#commandShell')).toHaveCount(0);
        await expect(modal.getByText('Command (argv)')).toBeVisible();
      } finally {
        await cleanupDeploymentSafely(page, name);
      }
    });

    test('Admin can add a revision with an empty Start Command (the command is optional)', async ({
      page,
      request,
    }) => {
      const name = `e2e-fr3205-optional-${Date.now()}`;
      let folderName: string | undefined;
      try {
        const setup = await setupCommandScenario(page, request, name, {
          withModelFolder: true,
        });
        folderName = setup.folderName;
        const { modal, capture } = setup;

        // Leave Start Command empty. Provide the other required fields —
        // selecting the deterministically-provisioned model folder by name.
        await selectRevisionModalOption(page, '#modelFolderId', folderName!);
        await fillManualImageName(modal, MOCK_MANUAL_IMAGE_REFERENCE);
        await disableAutoApply(modal);

        await submitAddRevision(modal);

        // Submission succeeds with no command → command optional (FR-3205).
        // Assert on the captured mutation input (the transient success toast
        // auto-dismisses too fast to catch against an instant mock). A generous
        // timeout absorbs the variable submit→mutation latency (validateFields
        // over the Suspense-loaded form + the manual-image resolve step) seen
        // under sequential load.
        await expect
          .poll(() => capture.input, { timeout: 30000 })
          .not.toBeNull();

        // The mutation carried the resolved image id and an empty command
        // string (Basic mode → shell omitted).
        expect(capture.input?.image?.id).toBe(MOCK_RESOLVED_IMAGE_UUID);
        const service = capture.input?.modelDefinition?.models?.[0]?.service;
        // modelDefinition is only sent when a command was typed; an empty
        // command in Basic mode yields no command-bearing modelDefinition.
        if (service) {
          expect(service.command ?? '').toBe('');
          expect('shell' in service).toBe(false);
        }
      } finally {
        await cleanupDeploymentSafely(page, name);
        if (folderName) {
          await cleanupDeploymentFixtures(page, { folderName });
        }
      }
    });

    test('Admin submits the raw command verbatim and omits shell in Basic mode', async ({
      page,
      request,
    }) => {
      const name = `e2e-fr3205-basic-${Date.now()}`;
      let folderName: string | undefined;
      try {
        const setup = await setupCommandScenario(page, request, name, {
          withModelFolder: true,
        });
        folderName = setup.folderName;
        const { modal, capture } = setup;

        // A command with a quoted argument + a shell operator: it must be sent
        // VERBATIM (no client-side tokenization / re-quoting).
        const rawCommand = 'python -m server --arg "a b" && echo done';
        await modal.locator('#startCommand').first().fill(rawCommand);

        await selectRevisionModalOption(page, '#modelFolderId', folderName!);
        await fillManualImageName(modal, MOCK_MANUAL_IMAGE_REFERENCE);
        await disableAutoApply(modal);
        await submitAddRevision(modal);

        await expect
          .poll(() => capture.input, { timeout: 30000 })
          .not.toBeNull();

        const service = capture.input?.modelDefinition?.models?.[0]?.service;
        expect(service).toBeTruthy();
        // Raw string, byte-for-byte (FR-3205 stop-tokenizing).
        expect(service.command).toBe(rawCommand);
        // Basic mode (default) → shell OMITTED so the backend applies its own
        // default (undefined is dropped from the Relay request entirely).
        expect('shell' in service).toBe(false);
      } finally {
        await cleanupDeploymentSafely(page, name);
        if (folderName) {
          await cleanupDeploymentFixtures(page, { folderName });
        }
      }
    });

    test('Admin submits shell = the chosen shell binary when Advanced Shell mode overrides it', async ({
      page,
      request,
    }) => {
      const name = `e2e-fr3205-advshell-${Date.now()}`;
      let folderName: string | undefined;
      try {
        const setup = await setupCommandScenario(page, request, name, {
          withModelFolder: true,
        });
        folderName = setup.folderName;
        const { modal, capture } = setup;

        // Select the model folder FIRST — before touching the Shell
        // AutoComplete — so that field's open suggestion dropdown never overlaps
        // the folder select's option list.
        await selectRevisionModalOption(page, '#modelFolderId', folderName!);

        await modal.locator('#startCommand').first().fill('run-server');
        // Advanced mode → Execution defaults to Shell → Shell input appears
        // prefilled with /bin/bash; override it with a non-default shell so the
        // submitted `shell` is the chosen value. The Shell field is an
        // AutoComplete text input (`#commandShell`); filling it sets the form
        // value directly. Do NOT click a suggestion option — selecting one
        // clears the combobox's displayed search text.
        await modal.getByText('Advanced', { exact: true }).click();
        const shellInput = modal.locator('#commandShell');
        await expect(shellInput).toBeVisible();
        await shellInput.fill('/bin/zsh');
        await expect(shellInput).toHaveValue('/bin/zsh');
        // Blur the AutoComplete so its value commits to the antd Form and its
        // suggestion dropdown closes before the next interaction (Tab keeps the
        // modal open, unlike Escape).
        await shellInput.blur();

        await fillManualImageName(modal, MOCK_MANUAL_IMAGE_REFERENCE);
        await disableAutoApply(modal);
        await submitAddRevision(modal);

        // The add mutation fires and its handler records the outgoing input.
        // Assert on that captured payload (the success toast is transient and
        // auto-dismisses too fast to catch reliably against an instant mock).
        await expect
          .poll(() => capture.input, { timeout: 30000 })
          .not.toBeNull();

        const service = capture.input?.modelDefinition?.models?.[0]?.service;
        expect(service).toBeTruthy();
        expect(service.command).toBe('run-server');
        // Advanced + Shell → the selected shell binary is submitted.
        expect(service.shell).toBe('/bin/zsh');
      } finally {
        await cleanupDeploymentSafely(page, name);
        if (folderName) {
          await cleanupDeploymentFixtures(page, { folderName });
        }
      }
    });

    test('Admin submits shell = null in Advanced Exec mode', async ({
      page,
      request,
    }) => {
      const name = `e2e-fr3205-exec-${Date.now()}`;
      let folderName: string | undefined;
      try {
        const setup = await setupCommandScenario(page, request, name, {
          withModelFolder: true,
        });
        folderName = setup.folderName;
        const { modal, capture } = setup;

        await modal.locator('#startCommand').first().fill('run-server');
        await modal.getByText('Advanced', { exact: true }).click();
        // Exec execution → no shell wrapping (shell submitted as null).
        await modal.getByRole('radio', { name: 'Exec', exact: true }).click();

        await selectRevisionModalOption(page, '#modelFolderId', folderName!);
        await fillManualImageName(modal, MOCK_MANUAL_IMAGE_REFERENCE);
        await disableAutoApply(modal);
        await submitAddRevision(modal);

        await expect
          .poll(() => capture.input, { timeout: 30000 })
          .not.toBeNull();

        const service = capture.input?.modelDefinition?.models?.[0]?.service;
        expect(service).toBeTruthy();
        expect(service.command).toBe('run-server');
        // Exec → shell is explicitly null (the key IS present, value null).
        expect('shell' in service).toBe(true);
        expect(service.shell).toBeNull();
      } finally {
        await cleanupDeploymentSafely(page, name);
        if (folderName) {
          await cleanupDeploymentFixtures(page, { folderName });
        }
      }
    });

    test('Admin finds the restored Model Definition File Path under Advanced Settings', async ({
      page,
      request,
    }) => {
      const name = `e2e-fr3205-modeldef-${Date.now()}`;
      try {
        const { modal } = await setupCommandScenario(page, request, name);

        // The field lives inside the collapsed "Advanced Settings" panel and
        // is not rendered/visible until the panel is expanded.
        await expect(
          modal.getByLabel('Model Definition File Path'),
        ).toHaveCount(0);

        await modal.getByText('Advanced Settings', { exact: true }).click();

        const modelDefPath = modal.getByLabel('Model Definition File Path');
        await expect(modelDefPath).toBeVisible({ timeout: 10000 });

        // It is optional (no required marker) and accepts free text.
        await modelDefPath.fill('custom-def.yaml');
        await expect(modelDefPath).toHaveValue('custom-def.yaml');
      } finally {
        await cleanupDeploymentSafely(page, name);
      }
    });
  },
);
