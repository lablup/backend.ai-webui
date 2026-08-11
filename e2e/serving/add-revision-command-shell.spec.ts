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
//   2. Execution (Shell vs Exec) + Shell are always visible (no Basic/Advanced
//      toggle — removed per devops sync feedback, 2026-08-07: hiding the
//      always-shell-wrapped default mode behind an "Advanced" switch made it
//      look like it didn't run through a shell at all); Shell starts
//      pre-filled with the backend default (/bin/bash). Exec hides the Shell
//      input and relabels the command to "Command (argv)".
//   3. Shell mode submits ModelServiceConfigInput.shell = the selected shell
//      (defaulting to /bin/bash when left unchanged); Exec mode submits
//      shell = null. When neither Start Command nor Port is set, the whole
//      service config is omitted from the mutation (the `shell` key is
//      absent, independent of Execution/Shell mode).
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
import {
  test,
  expect,
  type APIRequestContext,
  type Locator,
  type Page,
} from '@playwright/test';

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
  request: APIRequestContext,
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

    test('Admin sees Execution and Shell controls immediately, and Exec hides Shell', async ({
      page,
      request,
    }) => {
      const name = `e2e-fr3205-toggle-${Date.now()}`;
      try {
        const { modal } = await setupCommandScenario(page, request, name);

        // 1. Service Configuration section + the command input are shown for
        //    the custom (config-reading) variant. Assert on the labeled
        //    command control ("Command" in Shell mode) rather than the
        //    Form.Item label text, whose <label> also wraps a tooltip icon.
        await expect(
          modal.getByText('Service Configuration', { exact: true }),
        ).toBeVisible();
        await expect(
          modal.getByRole('textbox', { name: 'Command', exact: true }),
        ).toBeVisible();

        // 2. No Basic/Advanced toggle: the Execution radios (Shell/Exec) and
        //    the Shell input are visible immediately, pre-filled with the
        //    backend default (/bin/bash).
        await expect(
          modal.getByRole('radio', { name: 'Shell', exact: true }),
        ).toBeVisible();
        await expect(
          modal.getByRole('radio', { name: 'Exec', exact: true }),
        ).toBeVisible();
        const shellInput = modal.getByRole('textbox', {
          name: 'Shell',
          exact: true,
        });
        await expect(shellInput).toBeVisible();
        await expect(shellInput).toHaveValue('/bin/bash');

        // 2b. Execution defaults to Shell → the command control is a
        //     multi-line TextArea (shell scripts span lines) and the shell
        //     helper (operators allowed) is shown.
        await expect(
          modal.getByRole('textbox', { name: 'Command', exact: true }),
        ).toHaveJSProperty('tagName', 'TEXTAREA');
        await expect(
          modal.getByText(
            'Runs through the shell (e.g. bash -c "..."), so shell operators (; && | $VAR, redirection, etc.) work.',
            { exact: true },
          ),
        ).toBeVisible();

        // 3. Switch Execution to Exec → the Shell input is unmounted and the
        //    command field is relabeled "Command (argv)". Non-exact text match:
        //    the Form.Item <label> wraps a tooltip icon so its text node is not
        //    exactly "Command (argv)"; the string is distinctive enough that a
        //    substring match is unambiguous.
        await modal.getByRole('radio', { name: 'Exec', exact: true }).click();
        await expect(
          modal.getByRole('textbox', { name: 'Shell', exact: true }),
        ).toHaveCount(0);
        await expect(modal.getByText('Command (argv)')).toBeVisible();

        // 3b. Exec swaps the command control to a single-line input (argv is
        //     one token vector, not a script) — the accessible name flips from
        //     "Command" to "Command (argv)" and the element from TEXTAREA to
        //     INPUT — and switches the helper text to warn that shell
        //     operators are NOT interpreted.
        const execCommand = modal.getByRole('textbox', {
          name: 'Command (argv)',
          exact: true,
        });
        await expect(execCommand).toBeVisible();
        await expect(execCommand).toHaveJSProperty('tagName', 'INPUT');
        await expect(
          modal.getByRole('textbox', { name: 'Command', exact: true }),
        ).toHaveCount(0);
        await expect(
          modal.getByText(
            'Runs directly as arguments, without a shell — operators (; && | $VAR, redirection, etc.) are treated as literal text. Separate arguments with spaces; quote ones containing spaces (e.g. --name "my model").',
            { exact: true },
          ),
        ).toBeVisible();
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
        await selectRevisionModalOption(page, 'Model Folder', folderName!);
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
        // string (no Start Command and no Port → hasServiceConfig is false,
        // so `shell` is omitted regardless of Execution/Shell mode).
        expect(capture.input?.image?.id).toBe(MOCK_RESOLVED_IMAGE_UUID);
        const service = capture.input?.modelDefinition?.models?.[0]?.service;
        // modelDefinition is only sent when a command or port was set; empty
        // Start Command with no Port yields no command-bearing modelDefinition.
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

    test('Admin submits the raw command verbatim, with shell = /bin/bash (the default) when left unchanged', async ({
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
        await modal
          .getByRole('textbox', { name: 'Command', exact: true })
          .fill(rawCommand);

        // Leave Execution/Shell untouched — Shell mode + /bin/bash are the
        // form's initial values, no toggle needed to reach them.
        const shellInput = modal.getByRole('textbox', {
          name: 'Shell',
          exact: true,
        });
        await expect(shellInput).toHaveValue('/bin/bash');

        await selectRevisionModalOption(page, 'Model Folder', folderName!);
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
        // Shell mode, unchanged → DEFAULT_MODEL_SERVICE_SHELL is submitted
        // explicitly (no more implicit "Basic mode omits shell" state).
        expect(service.shell).toBe('/bin/bash');
      } finally {
        await cleanupDeploymentSafely(page, name);
        if (folderName) {
          await cleanupDeploymentFixtures(page, { folderName });
        }
      }
    });

    test('Admin submits shell = the chosen shell binary when Shell mode overrides the default', async ({
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

        // Select the model folder first, then fill the plain text fields.
        await selectRevisionModalOption(page, 'Model Folder', folderName!);

        await modal
          .getByRole('textbox', { name: 'Command', exact: true })
          .fill('run-server');
        // Shell mode is the default (visible without a toggle), prefilled
        // with /bin/bash; override it with a non-default shell so the
        // submitted `shell` is the chosen value. The Shell field is a plain
        // Astryx TextInput (the antd AutoComplete suggestion dropdown is gone;
        // known shells are surfaced in the placeholder instead), so filling it
        // sets the form value directly.
        const shellInput = modal.getByRole('textbox', {
          name: 'Shell',
          exact: true,
        });
        await expect(shellInput).toBeVisible();
        await shellInput.fill('/bin/zsh');
        await expect(shellInput).toHaveValue('/bin/zsh');
        // Release focus before the next interaction (the value itself commits
        // on change; Tab/blur keeps the modal open, unlike Escape).
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
        // Shell mode → the selected shell binary is submitted.
        expect(service.shell).toBe('/bin/zsh');
      } finally {
        await cleanupDeploymentSafely(page, name);
        if (folderName) {
          await cleanupDeploymentFixtures(page, { folderName });
        }
      }
    });

    test('Admin submits shell = null in Exec mode', async ({
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

        await modal
          .getByRole('textbox', { name: 'Command', exact: true })
          .fill('run-server');
        // Exec is visible without a toggle → no shell wrapping (shell
        // submitted as null).
        await modal.getByRole('radio', { name: 'Exec', exact: true }).click();

        await selectRevisionModalOption(page, 'Model Folder', folderName!);
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

        // The field lives inside the collapsed "Advanced Settings" panel.
        // Astryx Collapsible keeps collapsed content MOUNTED (display:none),
        // so assert on visibility, not existence.
        await expect(
          modal.getByRole('textbox', {
            name: 'Model Definition File Path',
            exact: true,
          }),
        ).not.toBeVisible();

        await modal.getByRole('button', { name: 'Advanced Settings' }).click();

        const modelDefPath = modal.getByRole('textbox', {
          name: 'Model Definition File Path',
          exact: true,
        });
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
