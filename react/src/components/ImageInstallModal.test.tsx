/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import '../../__test__/matchMedia.mock.js';
import '../../__test__/resizeObserver.mock.js';
import ImageInstallModal from './ImageInstallModal';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from 'antd';

/**
 * Contract tests for the install session's explicit target (ADR-0001,
 * FR-3415).
 *
 * Installing an image is not "installing into a project": it enqueues a
 * throwaway batch session that pulls the image, and the pull happens on the
 * AGENT the scheduler binds that kernel to. So the axis that decides where the
 * image lands is the RESOURCE GROUP, and the project is the permission gate on
 * which resource groups are reachable plus the session's owner.
 *
 * Both are therefore required, explicit choices this modal owns:
 *
 * - it has NO `project` prop — the image list's project filter says which
 *   images are on screen, not where the install session runs;
 * - the resource group is never silently defaulted (the old code hardcoded
 *   `scaling_group: 'default'`, and `autoSelectDefault` is deliberately off);
 * - the project list is the MEMBER-project source, because the session is
 *   created as the admin's own session.
 *
 * External behavior only: interactions in → rendered selectors + install
 * payload out.
 */

// Typed with the real `install(name, architecture, resource, registry?,
// sessionName?)` signature so `mock.calls[i][4]` (the generated session name)
// type-checks below.
const mockInstall = vi.fn(
  (
    _name?: string,
    _architecture?: string,
    _resource?: unknown,
    _registry?: string,
    _sessionName?: string,
  ) => Promise.resolve({ sessionId: 'installed-session-id' }),
);
const mockUpsertSessionNotification = vi.fn(() => Promise.resolve([]));
const mockUpsertNotification = vi.fn();

vi.mock('react-i18next', async () => {
  const React = await import('react');
  return {
    useTranslation: () => ({
      t: (key: string) => key,
      i18n: { language: 'en', changeLanguage: () => new Promise(() => {}) },
      ready: true,
    }),
    Trans: (props: any) => React.createElement('span', null, props.i18nKey),
    initReactI18next: { type: '3rdParty', init: () => {} },
  };
});

vi.mock('../hooks', async (importOriginal) => {
  const originalModule = await importOriginal<typeof import('../hooks')>();
  return {
    ...originalModule,
    useSuspendedBackendaiClient: () => ({
      // Ambient decoy: the imperative client mirror still points somewhere
      // else. The modal must ignore it.
      current_group: 'ambient-project-name',
      current_group_id: () => 'ambient-project-id',
      _config: { domainName: 'default' },
      get_resource_slots: () => Promise.resolve({ cpu: 'count', mem: 'bytes' }),
      image: { install: mockInstall },
    }),
  };
});

vi.mock('../hooks/useBAINotification', async (importOriginal) => {
  const originalModule =
    await importOriginal<typeof import('../hooks/useBAINotification')>();
  return {
    ...originalModule,
    // Kept as a decoy: the old bespoke "installing... takes time" toast went
    // through this hook. If a regression brings it back, tests below assert
    // this spy stays uncalled.
    useSetBAINotification: () => ({
      upsertNotification: mockUpsertNotification,
    }),
  };
});

// Boundary for the standard session-creation notification (FR-3415). The
// modal must feed installed sessions into `upsertSessionNotification` instead
// of the removed bespoke toast; `useStartSession`'s own Relay/GraphQL wiring
// is out of scope here; the module boundary mirrors the other hook mocks
// above.
vi.mock('../hooks/useStartSession', () => ({
  useStartSession: () => ({
    upsertSessionNotification: mockUpsertSessionNotification,
  }),
}));

vi.mock('../hooks/usePainKiller', async (importOriginal) => {
  const originalModule =
    await importOriginal<typeof import('../hooks/usePainKiller')>();
  return {
    ...originalModule,
    usePainKiller: () => ({ relieve: (title: string) => title }),
  };
});

/**
 * The project selector is reduced to two buttons reporting fixed choices
 * through the same `onSelectProject` surface the real component uses.
 *
 * `data-disable-default-filter` is the assertion surface for the
 * member-project requirement: `ProjectSelect` lists MEMBER projects unless
 * `disableDefaultFilter` is set, in which case it lists every project of the
 * domain (`ProjectSelect.tsx`: `disableDefaultFilter ? groups : memberProjects`).
 */
vi.mock('./ProjectSelect', async () => {
  const React = await import('react');
  return {
    default: (props: any) =>
      React.createElement(
        'div',
        null,
        React.createElement(
          'button',
          {
            'data-testid': 'mock-project-select',
            'data-value': props.value ?? '',
            'data-disable-default-filter': String(!!props.disableDefaultFilter),
            type: 'button',
            onClick: () =>
              props.onSelectProject?.({
                label: 'alpha-project-name',
                value: 'alpha-project-id',
                projectId: 'alpha-project-id',
                projectName: 'alpha-project-name',
                projectResourcePolicy: null,
              }),
          },
          'select-project-alpha',
        ),
        React.createElement(
          'button',
          {
            'data-testid': 'mock-project-select-other',
            type: 'button',
            onClick: () =>
              props.onSelectProject?.({
                label: 'beta-project-name',
                value: 'beta-project-id',
                projectId: 'beta-project-id',
                projectName: 'beta-project-name',
                projectResourcePolicy: null,
              }),
          },
          'select-project-beta',
        ),
      ),
  };
});

// The all-projects variant. It must NOT be what this modal renders: the
// install session belongs to the admin, and a project they are not a member of
// would produce a session they can neither see nor clean up.
vi.mock('./ProjectSelectForAdminPage', async () => {
  const React = await import('react');
  return {
    default: () =>
      React.createElement(
        'div',
        { 'data-testid': 'mock-admin-project-select' },
        'all-projects-select',
      ),
  };
});

/**
 * Resource groups are reachable PER PROJECT, so the stub derives its options
 * from `projectName` — the same scoping the real component gets from
 * `useProjectResourceGroups(projectName)`. `default` is present in one
 * project's list on purpose: a regression back to the hardcoded
 * `scaling_group: 'default'` would look plausible and must still fail the
 * payload assertions.
 */
const RESOURCE_GROUPS_BY_PROJECT: Record<string, string[]> = {
  'alpha-project-name': ['alpha-rg', 'default'],
  'beta-project-name': ['beta-rg'],
};

vi.mock('backend.ai-ui', async (importOriginal) => {
  const React = await import('react');
  const originalModule = await importOriginal<typeof import('backend.ai-ui')>();
  return {
    ...originalModule,
    BAIProjectResourceGroupSelect: (props: any) =>
      React.createElement(
        'div',
        {
          'data-testid': 'mock-resource-group-select',
          'data-project-name': props.projectName ?? '',
          'data-value': props.value ?? '',
          'data-disabled': String(!!props.disabled),
          'data-auto-select-default': String(!!props.autoSelectDefault),
        },
        ...(RESOURCE_GROUPS_BY_PROJECT[props.projectName] ?? []).map(
          (name: string) =>
            React.createElement(
              'button',
              {
                key: name,
                'data-testid': `mock-resource-group-option-${name}`,
                type: 'button',
                onClick: () => props.onChange?.(name),
              },
              name,
            ),
        ),
      ),
  };
});

const IMAGE = {
  id: 'image-1',
  registry: 'cr.backend.ai',
  namespace: 'testing/python',
  name: 'testing/python',
  tag: '3.11-ubuntu20.04',
  architecture: 'x86_64',
  installed: false,
  labels: [],
  resource_limits: [
    { key: 'cpu', min: '1', max: null },
    { key: 'mem', min: '256m', max: null },
  ],
} as any;

// A second, distinct image for the "N images installed in one action get N
// distinct session names" contract.
const IMAGE_2 = {
  id: 'image-2',
  registry: 'cr.backend.ai',
  namespace: 'testing/pytorch',
  name: 'testing/pytorch',
  tag: '2.1-ubuntu20.04',
  architecture: 'x86_64',
  installed: false,
  labels: [],
  resource_limits: [
    { key: 'cpu', min: '1', max: null },
    { key: 'mem', min: '256m', max: null },
  ],
} as any;

const renderModal = (
  images: any[] = [IMAGE],
  setInstallingImages = vi.fn(),
) => {
  const onRequestClose = vi.fn();
  render(
    <App>
      <ImageInstallModal
        open
        selectedRows={images}
        setInstallingImages={setInstallingImages}
        onRequestClose={onRequestClose}
      />
    </App>,
  );
  return { onRequestClose, setInstallingImages };
};

const installButton = () =>
  screen.getByText('environment.Install').closest('button');

// Drives the modal through project + resource-group selection for the
// current selected images and clicks Install.
const chooseTargetsAndInstall = async (
  user: ReturnType<typeof userEvent.setup>,
) => {
  await user.click(await screen.findByTestId('mock-project-select'));
  await user.click(screen.getByTestId('mock-resource-group-option-alpha-rg'));
  await user.click(screen.getByText('environment.Install'));
};

describe('ImageInstallModal install session target contract (ADR-0001, FR-3415)', () => {
  beforeEach(() => {
    mockInstall.mockClear();
    mockUpsertSessionNotification.mockClear();
    mockUpsertNotification.mockClear();
  });

  it('always asks for both the session project and the target resource group, from the member-project source and with nothing pre-filled', async () => {
    renderModal();

    // No `project` prop exists to inherit a filter from, so both controls are
    // unconditional.
    const projectSelect = await screen.findByTestId('mock-project-select');
    expect(projectSelect).toHaveAttribute('data-value', '');
    expect(
      screen.getByText('environment.InstallSessionProject'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('environment.InstallTargetResourceGroup'),
    ).toBeInTheDocument();

    // Member projects only - the install session belongs to the admin, and a
    // project they are not in would produce an invisible, unclean-uppable
    // session.
    expect(projectSelect).toHaveAttribute(
      'data-disable-default-filter',
      'false',
    );
    expect(
      screen.queryByTestId('mock-admin-project-select'),
    ).not.toBeInTheDocument();

    // And the resource group is never silently defaulted.
    const resourceGroupSelect = screen.getByTestId(
      'mock-resource-group-select',
    );
    expect(resourceGroupSelect).toHaveAttribute(
      'data-auto-select-default',
      'false',
    );
    expect(resourceGroupSelect).toHaveAttribute('data-value', '');
  });

  it('cannot install until BOTH the project and the resource group are chosen', async () => {
    const user = userEvent.setup();
    renderModal();

    // Nothing chosen.
    expect(installButton()).toBeDisabled();
    expect(
      await screen.findByTestId('mock-resource-group-select'),
    ).toHaveAttribute('data-disabled', 'true');

    // Project only — still not enough, the resource group is the axis that
    // decides where the image is actually pulled.
    await user.click(screen.getByTestId('mock-project-select'));
    expect(installButton()).toBeDisabled();

    await user.click(screen.getByTestId('mock-resource-group-option-alpha-rg'));
    expect(installButton()).toBeEnabled();
  });

  it('scopes the resource-group options to the chosen project and drops a stale choice when the project changes', async () => {
    const user = userEvent.setup();
    renderModal();

    // Before a project is picked there is nothing to scope to.
    expect(
      await screen.findByTestId('mock-resource-group-select'),
    ).toHaveAttribute('data-project-name', '');

    await user.click(screen.getByTestId('mock-project-select'));
    expect(screen.getByTestId('mock-resource-group-select')).toHaveAttribute(
      'data-project-name',
      'alpha-project-name',
    );
    expect(
      screen.getByTestId('mock-resource-group-option-alpha-rg'),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId('mock-resource-group-option-beta-rg'),
    ).not.toBeInTheDocument();

    await user.click(screen.getByTestId('mock-resource-group-option-alpha-rg'));
    expect(screen.getByTestId('mock-resource-group-select')).toHaveAttribute(
      'data-value',
      'alpha-rg',
    );

    // Switching project must not keep a group that may be unreachable from the
    // new one — the choice resets and install is blocked again.
    await user.click(screen.getByTestId('mock-project-select-other'));
    const select = screen.getByTestId('mock-resource-group-select');
    expect(select).toHaveAttribute('data-project-name', 'beta-project-name');
    expect(select).toHaveAttribute('data-value', '');
    expect(
      screen.queryByTestId('mock-resource-group-option-alpha-rg'),
    ).not.toBeInTheDocument();
    expect(
      screen.getByTestId('mock-resource-group-option-beta-rg'),
    ).toBeInTheDocument();
    expect(installButton()).toBeDisabled();
  });

  it('enqueues the install session with exactly the chosen project and resource group', async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(await screen.findByTestId('mock-project-select'));
    await user.click(screen.getByTestId('mock-resource-group-option-alpha-rg'));
    await user.click(screen.getByText('environment.Install'));

    await waitFor(() => {
      expect(mockInstall).toHaveBeenCalledTimes(1);
    });
    const [, , imageResource] = mockInstall.mock.calls[0] as any[];
    expect(imageResource.group_name).toBe('alpha-project-name');
    expect(imageResource.config.scaling_group).toBe('alpha-rg');
    // Decoys: the ambient project and the removed hardcoded resource group.
    expect(imageResource.group_name).not.toBe('ambient-project-name');
    expect(imageResource.config.scaling_group).not.toBe('default');
  });

  it('follows the project switch through to the payload instead of stopping at the first choice', async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(await screen.findByTestId('mock-project-select'));
    await user.click(screen.getByTestId('mock-resource-group-option-alpha-rg'));
    await user.click(screen.getByTestId('mock-project-select-other'));
    await user.click(screen.getByTestId('mock-resource-group-option-beta-rg'));
    await user.click(screen.getByText('environment.Install'));

    await waitFor(() => {
      expect(mockInstall).toHaveBeenCalledTimes(1);
    });
    const [, , imageResource] = mockInstall.mock.calls[0] as any[];
    expect(imageResource.group_name).toBe('beta-project-name');
    expect(imageResource.config.scaling_group).toBe('beta-rg');
    expect(imageResource.config.scaling_group).not.toBe('alpha-rg');
  });
});

/**
 * Notification contract (FR-3415).
 *
 * Installing an image enqueues a real session, so it must surface through the
 * app's standard session-creation notification - the same
 * `upsertSessionNotification` helper `FileBrowserButtonV2` /
 * `SFTPServerButtonV2` use - instead of the old bespoke "installing... takes
 * time" toast, which disappeared after 2 seconds and tracked nothing.
 *
 * The install session's name must also be a recognizable, unique,
 * image-name-free token (never embed the image name: it's already visible on
 * the image list, and image names are long and contain characters session
 * names can't hold) so N images installed together cannot collide.
 */
describe('ImageInstallModal session notification contract (FR-3415)', () => {
  beforeEach(() => {
    mockInstall.mockClear();
    mockUpsertSessionNotification.mockClear();
    mockUpsertNotification.mockClear();
  });

  it('feeds a successful install into the standard session notification, not the removed toast', async () => {
    const user = userEvent.setup();
    renderModal();

    await chooseTargetsAndInstall(user);

    await waitFor(() => {
      expect(mockUpsertSessionNotification).toHaveBeenCalledTimes(1);
    });
    const [successCreations] = mockUpsertSessionNotification.mock
      .calls[0] as any[];
    expect(successCreations).toHaveLength(1);
    expect(successCreations[0].status).toBe('fulfilled');
    expect(successCreations[0].value.sessionId).toBe('installed-session-id');

    // The bespoke "installing... takes time" toast must never fire again.
    expect(mockUpsertNotification).not.toHaveBeenCalled();
  });

  it('gives each of several images installed in one action its own notification with a distinct session name', async () => {
    const user = userEvent.setup();
    renderModal([IMAGE, IMAGE_2]);

    await chooseTargetsAndInstall(user);

    await waitFor(() => {
      expect(mockInstall).toHaveBeenCalledTimes(2);
    });
    // Session names generated for the two installs (5th positional arg to
    // `image.install`) must be distinct - collision is exactly what this
    // contract exists to prevent.
    const sessionNames = mockInstall.mock.calls.map((call: any[]) => call[4]);
    expect(new Set(sessionNames).size).toBe(2);

    await waitFor(() => {
      expect(mockUpsertSessionNotification).toHaveBeenCalledTimes(1);
    });
    const [successCreations] = mockUpsertSessionNotification.mock
      .calls[0] as any[];
    expect(successCreations).toHaveLength(2);
    const notifiedSessionNames = successCreations.map(
      (creation: any) => creation.value.sessionName,
    );
    expect(new Set(notifiedSessionNames).size).toBe(2);
  });

  it('generates an install session name that carries the install prefix and never embeds the image name', async () => {
    const user = userEvent.setup();
    renderModal();

    await chooseTargetsAndInstall(user);

    await waitFor(() => {
      expect(mockInstall).toHaveBeenCalledTimes(1);
    });
    const installSessionName = mockInstall.mock.calls[0][4] as string;
    expect(installSessionName).toMatch(/^install-image-/);
    expect(installSessionName).not.toContain('testing/python');
    expect(installSessionName).not.toContain(IMAGE.tag);

    await waitFor(() => {
      expect(mockUpsertSessionNotification).toHaveBeenCalledTimes(1);
    });
    const [successCreations] = mockUpsertSessionNotification.mock
      .calls[0] as any[];
    expect(successCreations[0].value.sessionName).toBe(installSessionName);
  });
});
