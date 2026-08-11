/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import '../../__test__/matchMedia.mock.js';
import type { ImportArtifactRevisionToFolderModalTestQuery } from '../__generated__/ImportArtifactRevisionToFolderModalTestQuery.graphql';
import ImportArtifactRevisionToFolderModal from './ImportArtifactRevisionToFolderModal';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { Suspense } from 'react';
import {
  graphql,
  RelayEnvironmentProvider,
  useLazyLoadQuery,
} from 'react-relay';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import type { RelayMockEnvironment } from 'relay-test-utils/lib/RelayModernMockEnvironment';

/**
 * Contract tests for the explicit project contract (ADR-0001, FR-3415).
 *
 * This modal is derive-from-resource tier: an artifact import always lands in
 * a MODEL STORE project, so the destination comes from the model-store
 * projects the page passed in — never from the ambient current project, and
 * never by MUTATING the global project selection (the removed "Change
 * Project" confirmation).
 *
 * External behavior only: fragment data in → rendered output and the project
 * handed to the folder-creation modal out.
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

// Decoy ambient project + a spy on the global setter. Both must stay
// untouched: if any ambient path survived, the folder-creation probe below
// would report `ambient-project-id`, and `mockSetCurrentProject` would fire.
const mockSetCurrentProject = vi.fn();
vi.mock('../hooks/useCurrentProject', async (importOriginal) => {
  const originalModule =
    await importOriginal<typeof import('../hooks/useCurrentProject')>();
  return {
    ...originalModule,
    useCurrentProjectValue: () => ({
      id: 'ambient-project-id',
      name: 'ambient-project-name',
    }),
    useSetCurrentProject: () => mockSetCurrentProject,
  };
});

// Probe for the destination project of in-modal folder creation.
vi.mock('./FolderCreateModalV2', async () => {
  const React = await import('react');
  return {
    default: (props: any) =>
      React.createElement('div', {
        'data-testid': 'mock-folder-create-modal',
        'data-project-id': props.project?.id ?? '',
        'data-project-name': props.project?.name ?? '',
      }),
  };
});

// The folder picker surfaces the filter it was scoped to.
vi.mock('backend.ai-ui', async (importOriginal) => {
  const React = await import('react');
  const originalModule = await importOriginal<typeof import('backend.ai-ui')>();
  return {
    ...originalModule,
    BAIVFolderSelect: (props: any) =>
      React.createElement('div', {
        'data-testid': 'mock-vfolder-select',
        'data-filter': props.filter ?? '',
      }),
  };
});

type GroupMock = { id: string; name: string };

const TestRenderer: React.FC = () => {
  const data = useLazyLoadQuery<ImportArtifactRevisionToFolderModalTestQuery>(
    graphql`
      query ImportArtifactRevisionToFolderModalTestQuery @relay_test_operation {
        groups(is_active: true, type: ["MODEL_STORE"]) {
          ...ImportArtifactRevisionToFolderModalModelStoreProjectsFragment
        }
        artifact(id: "test-artifact-id") {
          revisions(limit: 1) {
            edges {
              node {
                ...ImportArtifactRevisionToFolderModalArtifactRevisionFragment
              }
            }
          }
        }
      }
    `,
    {},
  );
  const revisions = data.artifact?.revisions?.edges?.map((edge) => edge.node);
  if (!data.groups || !revisions) return null;
  return (
    <ImportArtifactRevisionToFolderModal
      open
      selectedArtifactRevisionFrgmt={revisions}
      modelStoreProjectsFrgmt={data.groups.filter((group) => !!group)}
    />
  );
};

const renderModal = (groups: Array<GroupMock>) => {
  const environment: RelayMockEnvironment = createMockEnvironment();
  environment.mock.queueOperationResolver((operation) =>
    MockPayloadGenerator.generate(operation, {
      // Pin the list length explicitly — the default generator would always
      // produce exactly one Group.
      Query: () => ({ groups }),
      ArtifactRevision: () => ({ id: 'test-revision-id' }),
    }),
  );
  render(
    <RelayEnvironmentProvider environment={environment}>
      <>
        <Suspense fallback={null}>
          <TestRenderer />
        </Suspense>
      </>
    </RelayEnvironmentProvider>,
  );
  return { environment };
};

const MODEL_STORE_PROJECT: GroupMock = {
  id: 'model-store-project-id',
  name: 'model-store-project-name',
};

describe('ImportArtifactRevisionToFolderModal destination project (ADR-0001, FR-3415)', () => {
  beforeEach(() => {
    mockSetCurrentProject.mockClear();
  });

  it('creates folders in the model-store project, not the ambient one', async () => {
    renderModal([MODEL_STORE_PROJECT]);

    const folderCreateModal = await screen.findByTestId(
      'mock-folder-create-modal',
    );
    expect(folderCreateModal).toHaveAttribute(
      'data-project-id',
      'model-store-project-id',
    );
    expect(folderCreateModal).toHaveAttribute(
      'data-project-name',
      'model-store-project-name',
    );
  });

  it('scopes the folder picker to the model-store project', async () => {
    renderModal([MODEL_STORE_PROJECT]);

    const folderSelect = await screen.findByTestId('mock-vfolder-select');
    expect(folderSelect.getAttribute('data-filter')).toContain(
      'model-store-project-id',
    );
    expect(folderSelect.getAttribute('data-filter')).not.toContain(
      'ambient-project-id',
    );
  });

  it('never writes the global project selection and offers no "Change Project" confirmation', async () => {
    renderModal([MODEL_STORE_PROJECT]);

    await screen.findByTestId('mock-folder-create-modal');
    expect(mockSetCurrentProject).not.toHaveBeenCalled();
    expect(screen.queryByText('button.ChangeProject')).not.toBeInTheDocument();
    expect(
      screen.queryByText(
        'importArtifactRevisionToFolderModal.ModelStoreProjectRequired',
      ),
    ).not.toBeInTheDocument();
  });

  it('exposes the destination project in an in-modal selector', async () => {
    renderModal([MODEL_STORE_PROJECT]);

    const projectSelect = await screen.findByTestId(
      'import-artifact-model-store-project-select',
    );
    expect(projectSelect).toBeInTheDocument();
    expect(
      screen.getByText('importArtifactRevisionToFolderModal.ModelStoreProject'),
    ).toBeInTheDocument();
  });

  it('disables in-modal folder creation when no model-store project is available', async () => {
    renderModal([]);

    const createButton = await screen.findByTestId(
      'import-artifact-create-folder-button',
    );
    expect(createButton).toBeDisabled();
    // …and the folder picker is not silently scoped to the ambient project.
    expect(
      screen.getByTestId('mock-vfolder-select').getAttribute('data-filter'),
    ).not.toContain('ambient-project-id');
  });
});
