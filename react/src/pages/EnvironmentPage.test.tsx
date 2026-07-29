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
 * Contract tests for the Environments page's explicit project selection
 * (ADR-0001, FR-3415).
 *
 * The header project selector is not mounted on `/admin/environment` any
 * more, so the page owns the project decision: an explicit, URL-persisted
 * choice with NO default, handed to the ONE tab whose content is
 * project-scoped. Nothing reads the ambient current project.
 *
 * The selector itself is rendered by `ImageList` (it filters what that list
 * shows, so it is a content-scoped control that belongs in the list's own
 * filter row, not in the card header). This page therefore owns the URL state
 * and the resolution, not the widget.
 *
 * External behavior only: URL in → which project the page hands to each child.
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

// Probe for the project the image list receives, plus the callback it uses to
// report a new choice back to the page.
vi.mock('../components/ImageList', async () => {
  const React = await import('react');
  return {
    default: (props: any) =>
      React.createElement(
        'button',
        {
          'data-testid': 'mock-image-list',
          'data-project-id': props.project?.id ?? '',
          'data-project-name': props.project?.name ?? '',
          type: 'button',
          onClick: () =>
            props.onChangeProject?.({ id: 'p2', name: 'project-two' }),
        },
        'image-list',
      ),
  };
});
vi.mock('../components/ResourcePresetList', async () => {
  const React = await import('react');
  return {
    default: (props: any) =>
      React.createElement('div', {
        'data-testid': 'mock-resource-preset-list',
        // A preset has no project dimension at all; the page must not hand one
        // down, not even `null`.
        'data-has-project-prop': String('project' in props),
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

    const imageList = await screen.findByTestId('mock-image-list');
    expect(imageList).toHaveAttribute('data-project-id', '');
    expect(imageList).not.toHaveAttribute(
      'data-project-id',
      'ambient-project-id',
    );
  });

  it('scopes the image list to the project named in the URL', async () => {
    renderPage('?project=p1');

    const imageList = await screen.findByTestId('mock-image-list');
    expect(imageList).toHaveAttribute('data-project-id', 'p1');
    expect(imageList).toHaveAttribute('data-project-name', 'project-one');
  });

  it('treats an unresolvable project id as unselected instead of scoping to it', async () => {
    renderPage('?project=deleted-project-id');

    expect(await screen.findByTestId('mock-image-list')).toHaveAttribute(
      'data-project-id',
      '',
    );
  });

  it('persists the project chosen inside the list in the URL so it survives reload and is shareable', async () => {
    const user = userEvent.setup();
    const { onUrlUpdate } = renderPage('');

    await user.click(await screen.findByTestId('mock-image-list'));

    expect(onUrlUpdate).toHaveBeenCalled();
    const lastCall = onUrlUpdate.mock.calls.at(-1)?.[0];
    expect(lastCall.queryString).toContain('project=p2');
  });

  it('hands no project to the resource-preset tab — presets are project-independent', async () => {
    renderPage('?tab=preset&project=p1');

    expect(
      await screen.findByTestId('mock-resource-preset-list'),
    ).toHaveAttribute('data-has-project-prop', 'false');
  });

  it('renders the domain-wide registries tab without any project affordance', async () => {
    renderPage('?tab=registry&project=p1');

    expect(await screen.findByTestId('mock-registry-list')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-image-list')).not.toBeInTheDocument();
  });
});
