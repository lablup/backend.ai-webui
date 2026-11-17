/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import '../../__test__/matchMedia.mock.js';
import '../../__test__/resizeObserver.mock.js';
import type { VFolderAutoMountMetadataSectionTestQuery } from '../__generated__/VFolderAutoMountMetadataSectionTestQuery.graphql';
import VFolderAutoMountMetadataSection from './VFolderAutoMountMetadataSection';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BAIAppProvider } from 'backend.ai-ui';
import { Suspense } from 'react';
import {
  graphql,
  RelayEnvironmentProvider,
  useLazyLoadQuery,
} from 'react-relay';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en', changeLanguage: () => new Promise(() => {}) },
    ready: true,
  }),
  initReactI18next: { type: '3rdParty', init: () => {} },
}));

vi.mock('../hooks', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../hooks')>()),
  useSuspendedBackendaiClient: () => ({ user_uuid: 'viewer-user-id' }),
}));

const TestRenderer: React.FC = () => {
  'use memo';
  const { vfolderV2 } =
    useLazyLoadQuery<VFolderAutoMountMetadataSectionTestQuery>(
      graphql`
        query VFolderAutoMountMetadataSectionTestQuery($vfolderId: UUID!)
        @relay_test_operation {
          vfolderV2(vfolderId: $vfolderId) {
            ...VFolderAutoMountMetadataSectionFragment
          }
        }
      `,
      { vfolderId: '00000000-0000-0000-0000-000000000001' },
    );
  return vfolderV2 ? (
    <VFolderAutoMountMetadataSection vfolderFrgmt={vfolderV2} />
  ) : null;
};

const renderSection = ({
  projectType,
  permissions,
}: {
  projectType: 'PERSONAL' | 'GENERAL';
  permissions: string[];
}) => {
  const environment = createMockEnvironment();
  const permissionVariables: Array<Record<string, unknown>> = [];
  environment.mock.queueOperationResolver((operation) =>
    MockPayloadGenerator.generate(operation, {
      VFolder: () => ({
        accessControl: { ownershipType: 'GROUP' },
        ownership: {
          userId: null,
          projectId: 'folder-project-id',
          creatorId: 'creator-user-id',
          project: { basicInfo: { type: projectType } },
        },
        vfolderAutoMounts: { edges: [] },
      }),
    }),
  );
  environment.mock.queueOperationResolver((operation) => {
    permissionVariables.push(operation.request.variables);
    return {
      data: { myScopePermissions: { item: { permissions } } },
    };
  });
  render(
    <RelayEnvironmentProvider environment={environment}>
      <BAIAppProvider>
        <Suspense fallback={null}>
          <TestRenderer />
        </Suspense>
      </BAIAppProvider>
    </RelayEnvironmentProvider>,
  );
  return { permissionVariables };
};

describe('VFolderAutoMountMetadataSection', () => {
  it("checks a personal project folder's permissions on its creator's user scope", async () => {
    const { permissionVariables } = renderSection({
      projectType: 'PERSONAL',
      permissions: ['READ', 'CREATE'],
    });
    await waitFor(() => expect(permissionVariables).toHaveLength(1));
    expect(permissionVariables[0]).toEqual({
      scopeType: 'user',
      scopeId: 'creator-user-id',
    });
  });

  it('disables adding when the project scope grants no CREATE', async () => {
    const { permissionVariables } = renderSection({
      projectType: 'GENERAL',
      permissions: ['READ'],
    });
    await waitFor(() => expect(permissionVariables).toHaveLength(1));
    expect(permissionVariables[0]).toEqual({
      scopeType: 'project',
      scopeId: 'folder-project-id',
    });
    // jsdom has no layout, so the cell folds every action into its menu.
    await userEvent.click(
      await screen.findByRole('button', {
        name: 'comp:BAINameActionCell.MoreActions',
      }),
    );
    const addItem = await screen.findByRole('menuitem', {
      name: /autoMount\.AddAutoMount/,
    });
    await waitFor(() =>
      expect(addItem).toHaveAttribute('aria-disabled', 'true'),
    );
  });
});
