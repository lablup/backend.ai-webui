/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import '../../__test__/matchMedia.mock.js';
import '../../__test__/resizeObserver.mock.js';
import EnvironmentPage from './EnvironmentPage';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from 'antd';
import { NuqsTestingAdapter } from 'nuqs/adapters/testing';
import { MemoryRouter } from 'react-router-dom';

/**
 * Contract tests for the Environments page's explicit in-page project
 * selection (ADR-0001, FR-3415).
 *
 * The header project selector is not mounted on `/admin/environment` any
 * more, so the page owns the project decision: an explicit, URL-persisted
 * choice with NO default. Everything project-dependent below follows that
 * choice; nothing reads the ambient current project.
 *
 * External behavior only: URL in → what the page renders and which project it
 * hands to its children.
 */

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

// Decoy ambient project: the page must never seed its selection from it.
vi.mock('../hooks/useCurrentProject', async (importOriginal) => {
  const originalModule =
    await importOriginal<typeof import('../hooks/useCurrentProject')>();
  return {
    ...originalModule,
    useCurrentProjectValue: () => ({
      id: 'ambient-project-id',
      name: 'ambient-project-name',
    }),
  };
});

vi.mock('../hooks', async (importOriginal) => {
  const originalModule = await importOriginal<typeof import('../hooks')>();
  return {
    ...originalModule,
    useSuspendedBackendaiClient: () => ({
      is_superadmin: true,
      _config: { domainName: 'default' },
    }),
  };
});

vi.mock('../hooks/useAccessibleProjects', () => ({
  useAccessibleProjects: () => ({
    groups: [
      { id: 'p1', name: 'project-one' },
      { id: 'p2', name: 'project-two' },
    ],
    accessibleProjects: [],
  }),
}));

// Probes for the project each project-dependent child receives.
vi.mock('../components/ImageList', async () => {
  const React = await import('react');
  return {
    default: (props: any) =>
      React.createElement('div', {
        'data-testid': 'mock-image-list',
        'data-project-id': props.project?.id ?? '',
        'data-project-name': props.project?.name ?? '',
      }),
  };
});
vi.mock('../components/ResourcePresetList', async () => {
  const React = await import('react');
  return {
    default: (props: any) =>
      React.createElement('div', {
        'data-testid': 'mock-resource-preset-list',
        'data-project-id': props.project?.id ?? '',
        'data-project-name': props.project?.name ?? '',
      }),
  };
});
vi.mock('../components/ContainerRegistryList', async () => {
  const React = await import('react');
  return {
    default: () =>
      React.createElement('div', { 'data-testid': 'mock-registry-list' }),
  };
});

// The in-page selector is reduced to a button reporting a fixed choice via
// the same `onSelectProject` surface the real component uses.
vi.mock('../components/ProjectSelectForAdminPage', async () => {
  const React = await import('react');
  return {
    default: (props: any) =>
      React.createElement(
        'button',
        {
          'data-testid': 'mock-project-select',
          'data-value': props.value ?? '',
          type: 'button',
          onClick: () =>
            props.onSelectProject?.({
              label: 'project-two',
              value: 'p2',
              projectId: 'p2',
              projectName: 'project-two',
              projectResourcePolicy: null,
            }),
        },
        'select-project',
      ),
  };
});

const renderPage = (search: string) => {
  const onUrlUpdate = vi.fn();
  render(
    <MemoryRouter initialEntries={[`/admin/environment${search}`]}>
      <NuqsTestingAdapter searchParams={search} onUrlUpdate={onUrlUpdate}>
        <App>
          <EnvironmentPage />
        </App>
      </NuqsTestingAdapter>
    </MemoryRouter>,
  );
  return { onUrlUpdate };
};

describe('EnvironmentPage explicit project selection (ADR-0001, FR-3415)', () => {
  it('starts unselected — it never seeds the scope from the ambient project', async () => {
    renderPage('');

    expect(
      await screen.findByText('environment.SelectProjectToListImages'),
    ).toBeInTheDocument();
    expect(screen.queryByTestId('mock-image-list')).not.toBeInTheDocument();
    expect(screen.getByTestId('mock-project-select')).toHaveAttribute(
      'data-value',
      '',
    );
  });

  it('scopes the image list to the project named in the URL', async () => {
    renderPage('?project=p1');

    const imageList = await screen.findByTestId('mock-image-list');
    expect(imageList).toHaveAttribute('data-project-id', 'p1');
    expect(imageList).toHaveAttribute('data-project-name', 'project-one');
    expect(
      screen.queryByText('environment.SelectProjectToListImages'),
    ).not.toBeInTheDocument();
  });

  it('treats an unresolvable project id as unselected instead of scoping to it', async () => {
    renderPage('?project=deleted-project-id');

    expect(
      await screen.findByText('environment.SelectProjectToListImages'),
    ).toBeInTheDocument();
    expect(screen.queryByTestId('mock-image-list')).not.toBeInTheDocument();
  });

  it('persists the chosen project in the URL so it survives reload and is shareable', async () => {
    const user = userEvent.setup();
    const { onUrlUpdate } = renderPage('');

    await user.click(screen.getByTestId('mock-project-select'));

    expect(onUrlUpdate).toHaveBeenCalled();
    const lastCall = onUrlUpdate.mock.calls.at(-1)?.[0];
    expect(lastCall.queryString).toContain('project=p2');
  });

  it('hands the same project to the resource-preset list, and null when unselected', async () => {
    renderPage('?tab=preset&project=p1');
    expect(
      await screen.findByTestId('mock-resource-preset-list'),
    ).toHaveAttribute('data-project-id', 'p1');
  });

  it('renders the preset list without a project (presets are global)', async () => {
    renderPage('?tab=preset');
    const presetList = await screen.findByTestId('mock-resource-preset-list');
    expect(presetList).toHaveAttribute('data-project-id', '');
  });

  it('does not offer the project scope selector on the domain-wide registries tab', async () => {
    renderPage('?tab=registry&project=p1');
    expect(await screen.findByTestId('mock-registry-list')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-project-select')).not.toBeInTheDocument();
  });
});
