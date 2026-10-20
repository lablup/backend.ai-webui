/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import '../../../__test__/matchMedia.mock.js';
import '../../../__test__/resizeObserver.mock.js';
import { renderLauncherPage } from './harness';
import {
  BASE_SLOT_DETAILS,
  pageRefs,
  resetScenario,
  scenario,
  spies,
} from './mockState';
import { act, screen, waitFor } from '@testing-library/react';

vi.mock('react-i18next', async () => (await import('./mockState')).i18nMock());
vi.mock('../../hooks', async (importOriginal) =>
  (await import('./mockState')).mockHooksModule(await importOriginal()),
);
vi.mock('../../hooks/backendai', async (importOriginal) =>
  (await import('./mockState')).mockBackendaiHooksModule(
    await importOriginal(),
  ),
);
vi.mock('../../hooks/hooksUsingRelay', async (importOriginal) =>
  (await import('./mockState')).mockHooksUsingRelayModule(
    await importOriginal(),
  ),
);
vi.mock('../../hooks/useCurrentProject', async (importOriginal) =>
  (await import('./mockState')).mockCurrentProjectModule(
    await importOriginal(),
  ),
);
vi.mock(
  '../../../../packages/backend.ai-ui/src/hooks/useProjectResourceGroups',
  async (importOriginal) =>
    (await import('./mockState')).mockProjectResourceGroupsModule(
      await importOriginal(),
    ),
);
vi.mock('../../hooks/useRecentSessionHistory', async () =>
  (await import('./mockState')).mockRecentSessionHistoryModule(),
);
vi.mock('../../hooks/useThemeMode', async (importOriginal) =>
  (await import('./mockState')).mockThemeModeModule(await importOriginal()),
);
vi.mock('../../app-shim', async (importOriginal) =>
  (await import('./mockState')).mockAppShimModule(await importOriginal()),
);
vi.mock(
  '../../components/MainLayout/MainLayout',
  async () => (await import('./pageStubs')).mainLayoutModule,
);
vi.mock(
  '../../components/SessionLauncherStorageStep',
  async () => (await import('./pageStubs')).storageStepModule,
);
vi.mock(
  '../../components/SessionTemplateModal',
  async () => (await import('./pageStubs')).templateModalModule,
);
vi.mock(
  '../../components/SessionLauncherPreview',
  async () => (await import('./pageStubs')).nullModule,
);
vi.mock(
  '../../components/SessionLauncherErrorTourProps',
  async () => (await import('./pageStubs')).nullModule,
);
vi.mock(
  '../../components/LaunchMultipleSessionsModal',
  async () => (await import('./pageStubs')).nullModule,
);

const pyImage = (
  tag: string,
  supported_accelerators: string[] = ['*'],
  extra: Record<string, unknown> = {},
) => ({
  id: `python-${tag}`,
  humanized_name: `python:${tag}`,
  tag,
  registry: 'cr.backend.ai',
  architecture: 'x86_64',
  digest: 'sha256:' + tag,
  installed: true,
  resource_limits: [
    { key: 'cpu', min: '1', max: null },
    { key: 'mem', min: '1g', max: null },
  ],
  labels: [],
  namespace: 'stable/python',
  base_image_name: 'python',
  tags: [],
  version: tag,
  supported_accelerators,
  ...extra,
});

const PY311 = 'cr.backend.ai/stable/python:3.11-ubuntu22.04@x86_64';
const PY39 = 'cr.backend.ai/stable/python:3.9-ubuntu20.04@x86_64';
const MOUNT = {
  vfolderId: 'f0f0f0f0-0000-0000-0000-000000000001',
  name: 'data',
};

const CUSTOM_RESOURCE = {
  allocationPreset: 'custom',
  resource: { cpu: 3, mem: '6g', shmem: '1g', accelerator: 0 },
};

/** What FileBrowserButtonV2 puts in `?formValues=` (with `step=4`). */
const FILE_BROWSER_VALUES = {
  sessionType: 'interactive',
  reuseIfExists: true,
  projectName: 'other-project',
  allocationPreset: 'minimum-required',
  cluster_mode: 'single-node',
  cluster_size: 1,
  vfolderMounts: [MOUNT],
};

/** Wait until the mount-time URL write has landed and stayed put for 600 ms. */
const waitForUrlSettled = async (
  read: { url: () => { formValues?: unknown } },
  drive: { settle: (ms?: number) => Promise<void> },
) => {
  let last = JSON.stringify(read.url().formValues);
  let stableFor = 0;
  for (let waited = 0; stableFor < 600 || !read.url().formValues;) {
    if (waited > 5000) throw new Error('URL formValues never settled');
    await drive.settle(100);
    waited += 100;
    const current = JSON.stringify(read.url().formValues);
    stableFor = current === last ? stableFor + 100 : 0;
    last = current;
  }
};

const validateAll = async (form: () => { validateFields: () => any }) => {
  await act(async () => {
    await form()
      .validateFields()
      .catch(() => {});
  });
};

describe('session launcher page characterization (SessionLauncherPage)', () => {
  afterAll(() => {
    vi.unstubAllGlobals();
  });

  beforeEach(() => {
    resetScenario();
    localStorage.clear();
    scenario.images = [pyImage('3.11-ubuntu22.04'), pyImage('3.9-ubuntu20.04')];
  });

  describe('URL restore and sync (P-01..P-04, H1, H22, H23)', () => {
    it('P-01 P-03 H1 [bug-compat] with no ?formValues the mount validation still writes formValues to the URL', async () => {
      const { read, drive } = await renderLauncherPage();
      await drive.flushUrl();
      expect(read.url().step).toBeNull();
      expect(read.url().formValues).toEqual({
        sessionType: 'interactive',
        environments: {
          environment: 'cr.backend.ai/stable/python',
          version: PY311,
        },
        resourceGroup: 'rg-a',
        allocationPreset: 'minimum-required',
        resource: { cpu: 1, mem: '1.0625g', shmem: '64m', accelerator: 0 },
        enabledAutomaticShmem: true,
        agent: 'auto',
        cluster_mode: 'multi-node',
        cluster_size: 1,
        hpcOptimization: { autoEnabled: true },
        envvars: [],
      });
    });

    it('P-03 URL values restore into the form (custom resource kept)', async () => {
      const { read } = await renderLauncherPage({
        formValues: {
          sessionType: 'batch',
          sessionName: 'restored',
          environments: { version: PY39 },
          ...CUSTOM_RESOURCE,
        },
      });
      expect(read.values().sessionType).toBe('batch');
      expect(read.values().sessionName).toBe('restored');
      expect(read.values().environments.version).toBe(PY39);
      expect(read.values().allocationPreset).toBe('custom');
      expect(read.values().resource).toEqual(CUSTOM_RESOURCE.resource);
    });

    it('P-03 H23 [bug-compat] a programmatic write reaches the URL only after a validate', async () => {
      const { read, drive, form } = await renderLauncherPage();
      await waitForUrlSettled(read, drive);
      await act(async () => {
        form().setFieldValue('sessionName', 'programmatic');
      });
      await drive.flushUrl();
      expect(read.values().sessionName).toBe('programmatic');
      expect(read.url().formValues.sessionName).toBeUndefined();
      await validateAll(form);
      await drive.flushUrl();
      expect(read.url().formValues.sessionName).toBe('programmatic');
    });

    it('P-03 a user edit reaches the URL after the 500 ms debounce', async () => {
      const { read, drive } = await renderLauncherPage();
      await drive.flushUrl();
      await drive.type('session.launcher.SessionName', 'typed');
      expect(read.url().formValues.sessionName).toBeUndefined();
      await drive.flushUrl();
      expect(read.url().formValues.sessionName).toBe('typed');
    });

    it('H22 [bug-compat] reuseIfExists / projectName stay in the store but drop from the URL', async () => {
      const { read, drive } = await renderLauncherPage({
        formValues: FILE_BROWSER_VALUES,
        step: 4,
      });
      await drive.flushUrl();
      expect(read.values().reuseIfExists).toBe(true);
      expect(read.values().projectName).toBe('other-project');
      expect(read.url().formValues.reuseIfExists).toBeUndefined();
      expect(read.url().formValues.projectName).toBeUndefined();
      // vfolderMounts are not pinned here: the storage step is stubbed.
    });

    it('H22 PAY-03 PAY-12 [bug-compat] a FileBrowser-style URL launches without reuseIfExists, in the ambient project', async () => {
      const { read, drive } = await renderLauncherPage({
        formValues: FILE_BROWSER_VALUES,
        step: 4,
      });
      await drive.clickButton('session.launcher.Launch');
      await waitFor(() => expect(read.payload()).toHaveLength(1));
      const [kernelName, , resources] = read.payload()[0] as [
        string,
        string,
        Record<string, any>,
      ];
      expect(kernelName).toBe('cr.backend.ai/stable/python:3.11-ubuntu22.04');
      expect(resources.reuseIfExists).toBe(false);
      expect(resources.group_name).toBe('project-a');
      expect(resources.cluster_mode).toBe('single-node');
      // mount_ids / mount_id_map are not pinned here: the storage step is stubbed.
    });

    it('P-04 [bug-compat] sensitive env values are blanked in the URL but kept in the form', async () => {
      const { read, drive, form } = await renderLauncherPage({
        formValues: {
          envvars: [
            { variable: 'MY_PASSWORD', value: 'secret' },
            { variable: 'PLAIN', value: '1' },
            { variable: 'SPINNER', value: 'x' },
          ],
        },
      });
      await validateAll(form);
      await drive.flushUrl();
      expect(read.values().envvars).toEqual([
        { variable: 'MY_PASSWORD', value: 'secret' },
        { variable: 'PLAIN', value: '1' },
        { variable: 'SPINNER', value: 'x' },
      ]);
      // `/PIN/` is over-broad: SPINNER is blanked too.
      expect(read.url().formValues.envvars).toEqual([
        { variable: 'MY_PASSWORD', value: '' },
        { variable: 'PLAIN', value: '1' },
        { variable: 'SPINNER', value: '' },
      ]);
    });

    it('P-04 reloading the sanitized URL restores blank sensitive values', async () => {
      const { read } = await renderLauncherPage({
        formValues: { envvars: [{ variable: 'MY_PASSWORD', value: '' }] },
      });
      expect(read.values().envvars).toEqual([
        { variable: 'MY_PASSWORD', value: '' },
      ]);
    });

    it('P-33 legacy mount_ids in the URL are migrated to vfolderMounts at parse', async () => {
      const { read } = await renderLauncherPage({
        formValues: {
          mount_ids: ['0123456789abcdef0123456789abcdef'],
          vfoldersNameMap: { '0123456789abcdef0123456789abcdef': 'legacy' },
        },
      });
      expect(read.values().vfolderMounts).toEqual([
        {
          vfolderId: '01234567-89ab-cdef-0123-456789abcdef',
          name: 'legacy',
          mountDestination: '',
          subpath: '',
        },
      ]);
      expect(read.values().mount_ids).toBeUndefined();
    });
  });

  describe('steps (H9, H13)', () => {
    it('H9 step=4 from a producer URL opens the review step', async () => {
      const { read } = await renderLauncherPage({ step: 4 });
      expect(read.buttonLabels()).toContain('session.launcher.Launch');
      expect(read.buttonLabels()).not.toContain('button.Next');
    });

    it('H9 H13 [bug-compat] inference + step=4 lands past the last step (storage step dropped)', async () => {
      const { read } = await renderLauncherPage({
        formValues: { sessionType: 'inference' },
        step: 4,
      });
      expect(read.buttonLabels()).not.toContain('session.launcher.Launch');
      expect(read.buttonLabels()).toContain('button.Next');
      expect(read.buttonLabels()).toContain('button.Previous');
    });

    it('H13 [bug-compat] inference requires an optionless model folder, so validation never passes', async () => {
      const { read, form } = await renderLauncherPage({
        formValues: { sessionType: 'inference' },
      });
      await validateAll(form);
      expect(read.fieldErrors(['inference', 'vFolderName'])).toHaveLength(1);
    });

    it('P-23 Skip to the last step writes step=4, shows Launch and validates the whole form', async () => {
      const { read, drive, form } = await renderLauncherPage({
        formValues: { sessionType: 'batch' },
      });
      expect(read.fieldErrors(['batch', 'command'])).toHaveLength(1);
      await act(async () => {
        form().setFieldsValue({ batch: { command: '' } });
      });
      expect(read.fieldErrors(['batch', 'command'])).toEqual([]);
      await drive.clickButton('session.launcher.SkipToConfirmAndLaunch');
      await drive.flushUrl();
      expect(read.url().step).toBe('4');
      expect(read.buttonLabels()).toContain('session.launcher.Launch');
      expect(read.fieldErrors(['batch', 'command'])).toHaveLength(1);
    });
  });

  describe('template restore and reset (H8, H10)', () => {
    it('H10 [bug-compat] a template without `resource` keeps the current resource and jumps to the last step', async () => {
      const { read, drive } = await renderLauncherPage({
        formValues: { environments: { version: PY39 }, ...CUSTOM_RESOURCE },
      });
      pageRefs.template = {
        sessionType: 'batch',
        sessionName: 'tpl',
        batch: { enabled: false, command: 'ls' },
        environments: { version: PY311 },
      };
      await drive.clickButton('session.launcher.RecentHistory');
      await act(async () => {
        screen.getByTestId('stub-template-apply').click();
      });
      await drive.flushUrl();
      expect(read.values().sessionType).toBe('batch');
      expect(read.values().sessionName).toMatch(/^tpl-[A-Za-z0-9]{4}$/);
      expect(read.values().batch.command).toBe('ls');
      expect(read.values().environments.version).toBe(PY311);
      expect(read.values().resource).toEqual(CUSTOM_RESOURCE.resource);
      expect(read.values().allocationPreset).toBe('custom');
      expect(read.values().vfolderMounts).toEqual([]);
      expect(read.values().reuseIfExists).toBe(false);
      expect(read.url().step).toBe('4');
    });

    it('P-21 H8 reset clears the URL params and restores the default form', async () => {
      const { read, drive } = await renderLauncherPage({
        formValues: { sessionName: 'before-reset', ...CUSTOM_RESOURCE },
      });
      await drive.clickButton('button.Reset');
      const confirmButtons = Array.from(
        document.querySelectorAll<HTMLElement>('button'),
      ).filter((b) => b.textContent?.trim() === 'button.Reset');
      await act(async () => {
        confirmButtons[confirmButtons.length - 1].click();
      });
      await drive.settle(100);
      expect(read.values().sessionName).toBeUndefined();
      expect(read.values().allocationPreset).toBe('minimum-required');
      expect(read.values().resource.cpu).toBe(1);
      await drive.flushUrl();
      expect(read.url().formValues?.sessionName).toBeUndefined();
    });
  });

  describe('cross-field validation (H1, H20, H23)', () => {
    it('P-01 H1 any ?formValues validates the whole form on mount (batch command error is shown at once)', async () => {
      const { read } = await renderLauncherPage({
        formValues: { sessionType: 'batch' },
      });
      expect(read.fieldErrors(['batch', 'command'])).toHaveLength(1);
    });

    it('H23 [bug-compat] a programmatic write silently clears a visible error', async () => {
      const { read, form } = await renderLauncherPage({
        formValues: { sessionType: 'batch' },
      });
      expect(read.fieldErrors(['batch', 'command'])).toHaveLength(1);
      await act(async () => {
        form().setFieldsValue({ batch: { command: '' } });
      });
      expect(read.fieldErrors(['batch', 'command'])).toEqual([]);
    });

    it('R-41 H20 a cluster-mode change validates the whole form (the cleared batch error comes back)', async () => {
      const { read, drive, form } = await renderLauncherPage({
        formValues: { sessionType: 'batch' },
      });
      await act(async () => {
        form().setFieldsValue({ batch: { command: '' } });
      });
      expect(read.fieldErrors(['batch', 'command'])).toEqual([]);
      await drive.clickRadio('single-node');
      await drive.settle(100);
      expect(read.values().cluster_mode).toBe('single-node');
      expect(read.fieldErrors(['batch', 'command'])).toHaveLength(1);
    });
  });

  describe('image resolution (E-02, H31)', () => {
    beforeEach(() => {
      scenario.images = [
        pyImage('3.11-ubuntu22.04', ['*']),
        pyImage('3.9-ubuntu20.04', ['cuda']),
      ];
    });

    it('E-02 H31 an env without tag resolves to the accelerator-dedicated image first (setting unset)', async () => {
      const { read } = await renderLauncherPage({
        formValues: {
          environments: { version: 'cr.backend.ai/stable/python' },
        },
      });
      expect(read.values().environments.version).toBe(PY39);
    });

    it('E-02 H31 with the dedicated-first setting off the newest image wins', async () => {
      localStorage.setItem(
        'backendaiwebui.settings.user.show_accelerator_dedicated_images_first',
        'false',
      );
      const { read } = await renderLauncherPage({
        formValues: {
          environments: { version: 'cr.backend.ai/stable/python' },
        },
      });
      expect(read.values().environments.version).toBe(PY311);
    });

    it('E-02 H31 with no URL image the first pick is dedicated-first too', async () => {
      const { read } = await renderLauncherPage();
      expect(read.values().environments.version).toBe(PY39);
    });
  });

  describe('HPC optimization (P-17, H23)', () => {
    it('P-17 H23 the HPC switch writes thread defaults via setFieldsValue, yet they reach the URL with no validate', async () => {
      const { read, drive } = await renderLauncherPage();
      await waitForUrlSettled(read, drive);
      expect(read.url().formValues.hpcOptimization).toEqual({
        autoEnabled: true,
      });
      await drive.toggleSwitch('session.launcher.SwitchOpenMPoptimization');
      const threads = {
        autoEnabled: false,
        OMP_NUM_THREADS: '1',
        OPENBLAS_NUM_THREADS: '1',
      };
      expect(read.values().hpcOptimization).toEqual(threads);
      expect(read.url().formValues.hpcOptimization).toEqual({
        autoEnabled: true,
      });
      // The switch's own user change fires onFormChange, and the trailing
      // debounce then reads the whole store, thread values included.
      await drive.flushUrl();
      expect(read.url().formValues.hpcOptimization).toEqual(threads);
    });
  });

  describe('SFTP resource groups (P-32, H35)', () => {
    beforeEach(() => {
      scenario.projectResourceGroups = [
        { name: 'rg-a' },
        { name: 'rg-b' },
        { name: 'rg-sftp' },
      ];
      scenario.sftpResourceGroups = ['rg-sftp'];
      scenario.slotsByRG['rg-sftp'] = BASE_SLOT_DETAILS;
    });

    it('P-32 H35 [bug-compat] a URL system session lists the SFTP RG; switching to interactive drops it and R-34 clears the RG', async () => {
      const { read, drive } = await renderLauncherPage({
        formValues: { sessionType: 'system', resourceGroup: 'rg-sftp' },
      });
      expect(read.values().resourceGroup).toBe('rg-sftp');
      expect(
        (await drive.options('session.ResourceGroup')).map((o) => o.label),
      ).toEqual(['rg-a', 'rg-b', 'rg-sftp']);
      await drive.clickRadio('interactive');
      await waitFor(() =>
        expect(read.values().sessionType).toBe('interactive'),
      );
      await waitFor(() => expect(read.values().resourceGroup).toBeUndefined());
      expect(
        (await drive.options('session.ResourceGroup')).map((o) => o.label),
      ).toEqual(['rg-a', 'rg-b']);
    });
  });

  describe('manual image name (E-03, E-04, PAY-01)', () => {
    const MANUAL = 'my.registry/ns/custom:1@aarch64';

    beforeEach(() => {
      scenario.config.allow_manual_image_name_for_session = true;
    });

    it('E-03 a URL version matching no image moves to manual and launches with it', async () => {
      const { read, drive } = await renderLauncherPage({
        formValues: { environments: { version: MANUAL } },
      });
      expect(read.values().environments.manual).toBe(MANUAL);
      expect(read.values().environments.version).toBeUndefined();
      await drive.clickButton('session.launcher.SkipToConfirmAndLaunch');
      await drive.clickButton('session.launcher.Launch');
      await waitFor(() => expect(read.payload()).toHaveLength(1));
      expect(read.payload()[0][0]).toBe('my.registry/ns/custom:1');
      expect(read.payload()[0][4]).toBe('aarch64');
    });

    it('E-04 with no image at all the URL version is copied to manual', async () => {
      scenario.images = [];
      const { read } = await renderLauncherPage({
        formValues: { environments: { version: PY311 } },
      });
      expect(read.values().environments.manual).toBe(PY311);
    });

    it('E-03 PAY-01 typing a manual name clears the picked version and launches the manual name', async () => {
      const { read, drive } = await renderLauncherPage();
      expect(read.values().environments.version).toBe(PY311);
      await drive.type('session.launcher.ManualImageName', 'my.registry/x:2');
      expect(read.values().environments.manual).toBe('my.registry/x:2');
      expect(read.values().environments.version).toBeUndefined();
      await drive.clickButton('session.launcher.SkipToConfirmAndLaunch');
      await drive.clickButton('session.launcher.Launch');
      await waitFor(() => expect(read.payload()).toHaveLength(1));
      expect(read.payload()[0][0]).toBe('my.registry/x:2');
      expect(read.payload()[0][4]).toBeUndefined();
    });
  });

  describe('launch (P-26, P-27)', () => {
    it('P-26 P-27 a launch (empty mounts confirmed) writes the global RG, records history and navigates to /job', async () => {
      const { read, drive } = await renderLauncherPage({
        formValues: { resourceGroup: 'rg-b', sessionName: 'go-session' },
        step: 4,
      });
      expect(read.errors()).toEqual({
        cluster_size: {
          errors: [],
          warnings: ['session.launcher.ClusterSizeOneMultiNodeConvertInfo'],
        },
      });
      await drive.clickButton('session.launcher.Launch');
      await waitFor(() => expect(read.payload()).toHaveLength(1));
      await waitFor(() => expect(spies.navigate).toEqual(['/job']));
      expect(spies.confirm).toHaveLength(1);
      expect(spies.confirm[0]).toMatchObject({
        title: 'session.launcher.NoFolderMounted',
      });
      expect(scenario.globalResourceGroup).toBe('rg-b');
      expect(pageRefs.historyPushes).toHaveLength(1);
      expect(read.payload()[0][1]).toBe('go-session');
      expect((read.payload()[0][2] as any).config.scaling_group).toBe('rg-b');
    });

    it('P-26 declining the empty-mounts confirm sends nothing, records nothing and stays', async () => {
      scenario.confirmLaunch = false;
      const { read, drive } = await renderLauncherPage({
        formValues: { resourceGroup: 'rg-b', sessionName: 'go-session' },
        step: 4,
      });
      await drive.clickButton('session.launcher.Launch');
      await waitFor(() => expect(spies.confirm).toHaveLength(1));
      await drive.settle(200);
      expect(read.payload()).toEqual([]);
      expect(spies.navigate).toEqual([]);
      expect(pageRefs.historyPushes).toEqual([]);
      expect(scenario.globalResourceGroup).toBe('rg-a');
    });
  });
});
