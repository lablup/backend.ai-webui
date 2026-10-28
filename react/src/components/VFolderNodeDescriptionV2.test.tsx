/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import '../../__test__/matchMedia.mock.js';
import '../../__test__/resizeObserver.mock.js';
import type { VFolderNodeDescriptionV2TestQuery } from '../__generated__/VFolderNodeDescriptionV2TestQuery.graphql';
import VFolderNodeDescriptionV2 from './VFolderNodeDescriptionV2';
import '@testing-library/jest-dom';
import { act, render, screen } from '@testing-library/react';
import { Suspense } from 'react';
import {
  graphql,
  RelayEnvironmentProvider,
  useLazyLoadQuery,
} from 'react-relay';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';

/**
 * #10647: the description list shows no mount permission to the folder's
 * owner (who always mounts read & write) and, to everyone else, the level
 * the manager's `resolve_mount_policy` gives them: their own
 * `vfolderMountPolicies` row, else the folder default
 * (`accessControl.permission`). `t` is identity-mapped, so the assertions
 * read as i18n keys.
 */

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en', changeLanguage: () => new Promise(() => {}) },
    ready: true,
  }),
  initReactI18next: { type: '3rdParty', init: () => {} },
}));

const CURRENT_USER = 'current-user-uuid';
vi.mock('../hooks/backendai', async (importOriginal) => {
  const originalModule =
    await importOriginal<typeof import('../hooks/backendai')>();
  return {
    ...originalModule,
    useCurrentUserInfo: () => [{ uuid: CURRENT_USER, email: 'me@example.com' }],
  };
});

// The path row has its own contract; keep it out of this one.
vi.mock('../hooks/useVirtualFolderNodePathV2', () => ({
  useVirtualFolderPathV2: () => ({ vfolderPath: '/home/work/test-folder' }),
}));
vi.mock('./VirtualFolderNodeItems/VirtualFolderPathV2', async () => {
  const React = await import('react');
  return {
    default: () => React.createElement('span', null, 'mock-path'),
  };
});
vi.mock('./VFolderNodesV2', () => ({
  formatBinarySizeInfo: () => null,
}));

const VFOLDER_ID = '01a156d6-7384-7dba-8016-79cde66f0a84';
const OWNER = 'owner-uuid';

const Harness: React.FC = () => {
  const data = useLazyLoadQuery<VFolderNodeDescriptionV2TestQuery>(
    graphql`
      query VFolderNodeDescriptionV2TestQuery($vfolderId: UUID!) {
        vfolderV2(vfolderId: $vfolderId) {
          ...VFolderNodeDescriptionV2Fragment
        }
      }
    `,
    { vfolderId: VFOLDER_ID },
  );
  return data.vfolderV2 ? (
    <VFolderNodeDescriptionV2 vfolderNodeFrgmt={data.vfolderV2} />
  ) : null;
};

type MountPermission = 'READ_ONLY' | 'READ_WRITE' | 'NONE';

const renderDescription = async ({
  ownerUserId,
  mountPermission = 'READ_ONLY',
  policyRows = [],
}: {
  ownerUserId: string;
  /** The folder default, `accessControl.permission`. */
  mountPermission?: MountPermission;
  /** The `vfolderMountPolicies` rows, one per user. */
  policyRows?: Array<{ userId: string; permission: MountPermission }>;
}) => {
  const environment = createMockEnvironment();
  const seenOperations: Array<string> = [];
  render(
    <RelayEnvironmentProvider environment={environment}>
      <Suspense fallback={null}>
        <Harness />
      </Suspense>
    </RelayEnvironmentProvider>,
  );
  await act(async () => {
    environment.mock.resolveMostRecentOperation((operation) => {
      seenOperations.push(operation.request.node.params.name);
      return MockPayloadGenerator.generate(operation, {
        VFolder: () => ({
          id: btoa(`VFolder:${VFOLDER_ID}`),
          host: 'local:volume1',
          status: 'READY',
          unmanagedPath: null,
          metadata: {
            name: 'test-folder',
            usageMode: 'GENERAL',
            cloneable: false,
            createdAt: '2026-10-20T01:04:17.275910+00:00',
            quotaScopeId: `user:${ownerUserId}`,
          },
          accessControl: {
            permission: mountPermission,
            ownershipType: 'USER',
          },
          quota: { maxFiles: 1000, maxSize: null },
          ownership: {
            userId: ownerUserId,
            projectId: 'project-id',
            creatorId: ownerUserId,
            user: { basicInfo: { email: 'owner@example.com' } },
            project: { basicInfo: { name: 'owner-project' } },
          },
        }),
      });
    });
  });
  await screen.findByText('data.folders.Ownership');
  // The mount permission row issues its own query once it mounts.
  if (environment.mock.getAllOperations().length > 0) {
    await act(async () => {
      environment.mock.resolveMostRecentOperation((operation) => {
        seenOperations.push(operation.request.node.params.name);
        return MockPayloadGenerator.generate(operation, {
          VFolderMountPoliciesPayload: () => ({
            items: policyRows.map((row, index) => ({
              id: `policy-${index}`,
              userId: row.userId,
              permission: row.permission,
            })),
          }),
        });
      });
    });
  }
  return { seenOperations };
};

describe('VFolderNodeDescriptionV2 mount permission row (#10647)', () => {
  it('shows no mount permission to the folder owner, without reading the policies', async () => {
    const { seenOperations } = await renderDescription({
      ownerUserId: CURRENT_USER,
    });

    expect(
      screen.queryByText('data.folders.MountPermission'),
    ).not.toBeInTheDocument();
    expect(seenOperations).not.toContain(
      'VFolderNodeDescriptionV2MountPolicyQuery',
    );
  });

  it('shows a shared user their own mount policy row over the folder default', async () => {
    await renderDescription({
      ownerUserId: OWNER,
      mountPermission: 'READ_WRITE',
      policyRows: [
        { userId: 'someone-else-uuid', permission: 'READ_WRITE' },
        { userId: CURRENT_USER, permission: 'READ_ONLY' },
      ],
    });

    expect(
      screen.getByText('data.folders.MountPermission'),
    ).toBeInTheDocument();
    expect(await screen.findByText('data.ReadOnly')).toBeInTheDocument();
    expect(screen.queryByText('data.ReadWrite')).not.toBeInTheDocument();
  });

  it('falls back to the folder default when the shared user has no policy row', async () => {
    await renderDescription({
      ownerUserId: OWNER,
      mountPermission: 'READ_WRITE',
      policyRows: [{ userId: 'someone-else-uuid', permission: 'NONE' }],
    });

    expect(await screen.findByText('data.ReadWrite')).toBeInTheDocument();
  });

  it('names a NONE level as no mount permission', async () => {
    await renderDescription({
      ownerUserId: OWNER,
      mountPermission: 'READ_WRITE',
      policyRows: [{ userId: CURRENT_USER, permission: 'NONE' }],
    });

    expect(
      await screen.findByText('data.folders.NoMountPermission'),
    ).toBeInTheDocument();
  });
});
