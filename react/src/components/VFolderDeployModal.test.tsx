/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { VFolderDeployModalQuery } from '../__generated__/VFolderDeployModalQuery.graphql';
import VFolderDeployModal, { VFolderDeployQuery } from './VFolderDeployModal';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from 'antd';
import { Suspense } from 'react';
import { loadQuery, RelayEnvironmentProvider } from 'react-relay';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import type { RelayMockEnvironment } from 'relay-test-utils/lib/RelayModernMockEnvironment';

/**
 * Contract tests for the explicit project prop contract (ADR-0001, FR-3410).
 *
 * A deployment is always created inside one project, and every surface that
 * can reach this modal is itself project-scoped, so `project` is a required
 * non-null prop and the modal renders no project selector of its own. These
 * tests exercise external behavior only: rendered output and mutation
 * variables.
 */

vi.mock('react-i18next', async () => {
  const React = await import('react');
  return {
    useTranslation: () => ({
      t: (key: string) => key,
      i18n: {
        language: 'en',
        changeLanguage: () => new Promise(() => {}),
      },
      ready: true,
    }),
    Trans: (props: any) => React.createElement('span', null, props.i18nKey),
    initReactI18next: {
      type: '3rdParty',
      init: () => {},
    },
  };
});

vi.mock('../hooks', async (importOriginal) => {
  const originalModule = await importOriginal<typeof import('../hooks')>();
  return {
    ...originalModule,
    useWebUINavigate: () => vi.fn(),
  };
});

vi.mock('../hooks/useRouteScope', async (importOriginal) => {
  const originalModule =
    await importOriginal<typeof import('../hooks/useRouteScope')>();
  return {
    ...originalModule,
    useProjectPath: () => (path: string) => `/${path}`,
  };
});

// Preset detail modal drags in its own fragment; irrelevant to the contract.
vi.mock('./DeploymentPresetDetailModal', () => ({
  default: () => null,
}));

// Stub the REST-backed pieces from backend.ai-ui: the preset select and the
// resource-group select/hook fetch their own data internally. Two resource
// groups keep the auto-deploy scenario (single preset + single group) off so
// the selection UI is always rendered.
vi.mock('backend.ai-ui', async (importOriginal) => {
  const React = await import('react');
  const originalModule = await importOriginal<typeof import('backend.ai-ui')>();
  return {
    ...originalModule,
    useProjectResourceGroups: (projectName: string) => ({
      resourceGroups: projectName ? [{ name: 'rg-a' }, { name: 'rg-b' }] : [],
    }),
    BAIAvailablePresetSelect: () => null,
    BAIProjectResourceGroupSelect: (props: any) =>
      React.createElement(
        'button',
        {
          'data-testid': 'mock-resource-group-select',
          type: 'button',
          disabled: props.disabled,
          // Surfaced so a test can assert which project scopes the options.
          'data-project-name': props.projectName,
          onClick: () => props.onChange?.('rg-a'),
        },
        'select-resource-group',
      ),
  };
});

const PRESET_GLOBAL_ID = btoa('DeploymentRevisionPreset:preset-0000');

const PAGE_PROJECT = {
  id: 'page-project-id',
  name: 'page-project-name',
};

const renderModal = () => {
  const environment: RelayMockEnvironment = createMockEnvironment();
  const onClose = vi.fn();
  // Mirrors the opener: the query is started in the click event and the modal
  // receives only the resulting reference (render-as-you-fetch).
  const queryRef = loadQuery<VFolderDeployModalQuery>(
    environment,
    VFolderDeployQuery,
    {},
    { fetchPolicy: 'store-and-network' },
  );
  // `loadQuery` hits the mock network before the operation is registered as
  // pending, so `queueOperationResolver` would never see it — resolve the
  // already-started request explicitly instead.
  environment.mock.resolveMostRecentOperation((operation) =>
    MockPayloadGenerator.generate(operation, {
      DeploymentRevisionPreset: () => ({
        id: PRESET_GLOBAL_ID,
        name: 'mock-preset',
      }),
    }),
  );
  render(
    <RelayEnvironmentProvider environment={environment}>
      <App>
        <Suspense fallback={null}>
          <VFolderDeployModal
            open
            project={PAGE_PROJECT}
            vfolderId="vf-0000"
            queryRef={queryRef}
            onClose={onClose}
          />
        </Suspense>
      </App>
    </RelayEnvironmentProvider>,
  );
  return { environment, onClose };
};

describe('VFolderDeployModal project prop contract (ADR-0001)', () => {
  it('renders no project selector — the target project comes from the prop', async () => {
    renderModal();

    await waitFor(() => {
      expect(
        screen.getByTestId('mock-resource-group-select'),
      ).toBeInTheDocument();
    });
    expect(screen.queryByTestId('mock-project-select')).not.toBeInTheDocument();
    expect(
      screen.queryByText('data.folders.TargetProject'),
    ).not.toBeInTheDocument();
  });

  it('scopes the resource-group options to the passed project', async () => {
    renderModal();

    const resourceGroupSelect = await screen.findByTestId(
      'mock-resource-group-select',
    );
    expect(resourceGroupSelect).toHaveAttribute(
      'data-project-name',
      PAGE_PROJECT.name,
    );
    expect(resourceGroupSelect).toBeEnabled();
  });

  it('targets exactly the passed project in the deploy mutation', async () => {
    const user = userEvent.setup();
    const { environment } = renderModal();

    await user.click(await screen.findByTestId('mock-resource-group-select'));
    await user.click(screen.getByRole('button', { name: 'modelStore.Deploy' }));

    await waitFor(() => {
      const operation = environment.mock.getMostRecentOperation();
      expect(operation.request.node.params.name).toBe(
        'VFolderDeployModalMutation',
      );
    });
    const operation = environment.mock.getMostRecentOperation();
    // The mutation carries exactly the project the page passed in — never an
    // ambient one, and never one derived from the folder's ownership.
    expect(operation.request.variables.input.projectId).toBe(PAGE_PROJECT.id);
    expect(operation.request.variables.vfolderId).toBe('vf-0000');
    expect(operation.request.variables.input.resourceGroup).toBe('rg-a');
  });
});
