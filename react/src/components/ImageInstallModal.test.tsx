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
 * Contract tests for the explicit project prop (ADR-0001, FR-3415).
 *
 * Installing an image enqueues a BATCH SESSION. It must land in a project the
 * operator chose deliberately — not in `baiClient.current_group`, which on a
 * project-agnostic admin page is an invisible leftover.
 *
 * MODAL TIER: the image list is domain-wide by default, so there is not always
 * a project to inherit. With `project={null}` this modal renders its OWN
 * required project selector and installs into that choice; with a project
 * passed (the list's optional filter is active) it shows no selector and
 * installs into the passed project.
 *
 * External behavior only: props in → rendered selector + install payload out.
 */

const mockInstall = vi.fn(() => Promise.resolve({}));

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
    useSetBAINotification: () => ({ upsertNotification: vi.fn() }),
  };
});

vi.mock('../hooks/usePainKiller', async (importOriginal) => {
  const originalModule =
    await importOriginal<typeof import('../hooks/usePainKiller')>();
  return {
    ...originalModule,
    usePainKiller: () => ({ relieve: (title: string) => title }),
  };
});

// The in-modal selector is reduced to a button reporting a fixed choice
// through the same `onSelectProject` surface the real component uses.
vi.mock('./ProjectSelectForAdminPage', async () => {
  const React = await import('react');
  return {
    default: (props: any) =>
      React.createElement(
        'button',
        {
          'data-testid': 'mock-install-project-select',
          'data-value': props.value ?? '',
          type: 'button',
          onClick: () =>
            props.onSelectProject?.({
              label: 'modal-project',
              value: 'modal-project-id',
              projectId: 'modal-project-id',
              projectName: 'modal-project-name',
              projectResourcePolicy: null,
            }),
        },
        'select-project',
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

describe('ImageInstallModal session project contract (ADR-0001, FR-3415)', () => {
  beforeEach(() => {
    mockInstall.mockClear();
  });

  it('enqueues the install session in exactly the project it was given, with no embedded selector', async () => {
    const user = userEvent.setup();
    render(
      <App>
        <ImageInstallModal
          open
          project={{ id: 'chosen-project-id', name: 'chosen-project-name' }}
          selectedRows={[IMAGE]}
          setInstallingImages={vi.fn()}
          onRequestClose={vi.fn()}
        />
      </App>,
    );

    expect(
      screen.queryByTestId('mock-install-project-select'),
    ).not.toBeInTheDocument();

    await user.click(await screen.findByText('environment.Install'));

    await waitFor(() => {
      expect(mockInstall).toHaveBeenCalledTimes(1);
    });
    const [, , imageResource] = mockInstall.mock.calls[0] as any[];
    expect(imageResource.group_name).toBe('chosen-project-name');
    expect(imageResource.group_name).not.toBe('ambient-project-name');
  });

  it('renders its own required project selector when no project is passed, and cannot install until one is picked', async () => {
    render(
      <App>
        <ImageInstallModal
          open
          project={null}
          selectedRows={[IMAGE]}
          setInstallingImages={vi.fn()}
          onRequestClose={vi.fn()}
        />
      </App>,
    );

    expect(
      await screen.findByTestId('mock-install-project-select'),
    ).toHaveAttribute('data-value', '');
    expect(screen.getByText('data.folders.TargetProject')).toBeInTheDocument();
    expect(
      screen.getByText('environment.Install').closest('button'),
    ).toBeDisabled();
  });

  it('installs into the project chosen inside the modal — never the ambient one', async () => {
    const user = userEvent.setup();
    render(
      <App>
        <ImageInstallModal
          open
          project={null}
          selectedRows={[IMAGE]}
          setInstallingImages={vi.fn()}
          onRequestClose={vi.fn()}
        />
      </App>,
    );

    await user.click(await screen.findByTestId('mock-install-project-select'));
    await user.click(screen.getByText('environment.Install'));

    await waitFor(() => {
      expect(mockInstall).toHaveBeenCalledTimes(1);
    });
    const [, , imageResource] = mockInstall.mock.calls[0] as any[];
    expect(imageResource.group_name).toBe('modal-project-name');
    expect(imageResource.group_name).not.toBe('ambient-project-name');
  });
});
