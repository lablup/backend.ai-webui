/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import '../../__test__/matchMedia.mock.js';
import '../../__test__/resizeObserver.mock.js';
import ResourcePresetSettingModal from './ResourcePresetSettingModal';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { App } from 'antd';
import { RelayEnvironmentProvider } from 'react-relay';
import { createMockEnvironment } from 'relay-test-utils';

/**
 * Contract tests for the explicit project prop (ADR-0001, FR-3415).
 *
 * Resource presets are global; only the RESOURCE-GROUP options inside this
 * modal are project-keyed. They must follow the project the Environments page
 * selected, and with no selection the field is visibly disabled instead of
 * silently offering another project's resource groups.
 *
 * External behavior only: prop in → rendered field out.
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

vi.mock('../hooks', async (importOriginal) => {
  const originalModule = await importOriginal<typeof import('../hooks')>();
  return {
    ...originalModule,
    useSuspendedBackendaiClient: () => ({
      supports: (feature: string) =>
        feature === 'resource-presets-per-resource-group',
    }),
  };
});

vi.mock('../hooks/backendai', async (importOriginal) => {
  const originalModule =
    await importOriginal<typeof import('../hooks/backendai')>();
  return {
    ...originalModule,
    useResourceSlots: () => [{ cpu: 'count', mem: 'bytes' }],
    useResourceSlotsDetails: () => ({ mergedResourceSlots: {} }),
  };
});

// Decoy ambient project: if any ambient read survived, the resource-group
// probe below would report `ambient-project-name`.
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

vi.mock('backend.ai-ui', async (importOriginal) => {
  const React = await import('react');
  const originalModule = await importOriginal<typeof import('backend.ai-ui')>();
  return {
    ...originalModule,
    BAIProjectResourceGroupSelect: (props: any) =>
      React.createElement('div', {
        'data-testid': 'mock-project-resource-group-select',
        'data-project-name': props.projectName ?? '',
      }),
    BAISelect: (props: any) =>
      React.createElement('div', {
        'data-testid': 'mock-bai-select',
        'data-disabled': String(!!props.disabled),
        'data-tooltip': props.tooltip ?? '',
      }),
  };
});

const renderModal = (project: { id: string; name: string } | null) => {
  const environment = createMockEnvironment();
  render(
    <RelayEnvironmentProvider environment={environment}>
      <App>
        <ResourcePresetSettingModal
          open
          project={project}
          onRequestClose={vi.fn()}
        />
      </App>
    </RelayEnvironmentProvider>,
  );
};

describe('ResourcePresetSettingModal resource-group scope contract (ADR-0001, FR-3415)', () => {
  it('keys the resource-group options to exactly the project it was given', async () => {
    renderModal({ id: 'chosen-project-id', name: 'chosen-project-name' });

    const select = await screen.findByTestId(
      'mock-project-resource-group-select',
    );
    expect(select).toHaveAttribute('data-project-name', 'chosen-project-name');
    expect(select).not.toHaveAttribute(
      'data-project-name',
      'ambient-project-name',
    );
  });

  it('disables the resource-group field with an explanation when no project is selected', async () => {
    renderModal(null);

    expect(
      screen.queryByTestId('mock-project-resource-group-select'),
    ).not.toBeInTheDocument();
    const fallback = await screen.findByTestId('mock-bai-select');
    expect(fallback).toHaveAttribute('data-disabled', 'true');
    expect(fallback).toHaveAttribute(
      'data-tooltip',
      'resourcePreset.SelectProjectForResourceGroup',
    );
  });
});
