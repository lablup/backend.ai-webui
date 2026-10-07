import { BAIDirectoryPickerQuery } from '../components/baiClient/FileExplorer/BAIDirectoryPickerModal';
import type { VFolderListItem } from '../components/fragments/BAIVFolderMountConfigInput';
import { BAIClientProvider } from '../components/provider/BAIClientProvider';
import { convertToUUID, toGlobalId } from '../helper';
import {
  createMockVFolderFileClient,
  type MockVFolderFileTrees,
} from './mockVFolderFileTree';
import { mockAnonymousClientFactory } from './storybook-mock-utils';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Suspense, useState } from 'react';
import { RelayEnvironmentProvider } from 'react-relay';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';

const DEFAULT_PERMISSIONS = ['READ', 'UPDATE', 'SOFT_DELETE'];
const MOCK_HOST = 'local:volume1';
const MOCK_HOST_PERMISSIONS = [
  'CREATE_VFOLDER',
  'MODIFY_VFOLDER',
  'DELETE_VFOLDER',
  'UPLOAD_FILE',
  'DOWNLOAD_FILE',
];

export interface MockVFolder {
  name: string;
  row_id: string;
  /** `VFolder.permissions` bits; defaults to read, write and delete. */
  permissions?: Array<string>;
}

export interface MockVFolderFileProvidersProps {
  vfolders?: Array<MockVFolder>;
  trees?: MockVFolderFileTrees | (() => MockVFolderFileTrees);
  /** Rows `myVfolders` answers with. */
  folders?: Array<VFolderListItem>;
  /** Fallback for a Suspense boundary around `children`; omit to render bare. */
  suspenseFallback?: React.ReactNode;
  children?: React.ReactNode;
}

/**
 * Everything a vfolder file-browsing story needs without a backend: a mock
 * Relay environment answering `myVfolders` from `folders` and
 * `vfolder_nodes` / the picker's `vfolderV2` from `vfolders`, and a mock
 * `BAIClient` whose file APIs read and write `trees`.
 */
const MockVFolderFileProviders: React.FC<MockVFolderFileProvidersProps> = ({
  folders,
  // The path picker's `vfolderV2` is answered from the same rows by default.
  vfolders = (folders ?? []).map((folder): MockVFolder => ({
    name: folder.name,
    row_id: convertToUUID(folder.id),
  })),
  trees = {},
  suspenseFallback,
  children,
}) => {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: false } } }),
  );
  const [clientPromise] = useState(() =>
    Promise.resolve(
      createMockVFolderFileClient(
        typeof trees === 'function' ? trees() : trees,
      ),
    ),
  );
  const [environment] = useState(() => {
    const env = createMockEnvironment();
    const edges = vfolders.map((folder) => ({
      node: {
        id: toGlobalId('VirtualFolderNode', folder.row_id),
        name: folder.name,
        row_id: folder.row_id,
      },
    }));

    // The rows as `myVfolders` nodes, the inverse of `toVFolderListItem`.
    const MOUNT_LEVEL_BY_PERMISSION: Record<string, string> = {
      ro: 'READ_ONLY',
      rw: 'READ_WRITE',
      wd: 'RW_DELETE',
    };
    const myVfolderEdges = (folders ?? []).map((folder) => ({
      node: {
        id: toGlobalId('VFolder', convertToUUID(folder.id)),
        status: folder.status.toUpperCase().replace(/-/g, '_'),
        host: folder.host,
        metadata: {
          name: folder.name,
          usageMode: folder.usage_mode.toUpperCase(),
          quotaScopeId: folder.quota_scope_id,
          createdAt: folder.created_at,
          cloneable: folder.cloneable,
        },
        accessControl: {
          permission: MOUNT_LEVEL_BY_PERMISSION[folder.permission] ?? 'NONE',
          ownershipType: folder.ownership_type.toUpperCase(),
        },
        ownership: {
          userId: folder.user,
          projectId: folder.group,
          creatorEmail: folder.creator || null,
        },
      },
    }));

    const queuePickerOperation = (rowId: string) =>
      env.mock.queuePendingOperation(BAIDirectoryPickerQuery, {
        vfolderId: rowId,
      });

    const queueResolver = () => {
      env.mock.queueOperationResolver((operation) => {
        queueResolver();
        const { vfolderId } = operation.request.variables;
        // The picker PRELOADS its vfolder query, so answering an open also has
        // to re-arm the pending operation the next open will look for.
        if (typeof vfolderId === 'string') {
          queuePickerOperation(vfolderId);
        }
        const requested =
          vfolders.find((folder) => folder.row_id === vfolderId) ?? vfolders[0];
        return MockPayloadGenerator.generate(operation, {
          Query: () => ({
            myVfolders: {
              count: myVfolderEdges.length,
              edges: myVfolderEdges,
            },
            vfolder_nodes: { count: edges.length, edges },
            vfolderV2: requested
              ? {
                  id: btoa(`VFolder:${requested.row_id}`),
                  host: MOCK_HOST,
                  metadata: { name: requested.name },
                  permissions: requested.permissions ?? DEFAULT_PERMISSIONS,
                }
              : undefined,
            myStorageHostPermissions: {
              items: [{ host: MOCK_HOST, permissions: MOCK_HOST_PERMISSIONS }],
            },
          }),
        });
      });
    };

    queueResolver();
    edges.forEach(({ node }) => queuePickerOperation(node.row_id));
    return env;
  });

  return (
    <RelayEnvironmentProvider environment={environment}>
      <QueryClientProvider client={queryClient}>
        <BAIClientProvider
          clientPromise={clientPromise}
          anonymousClientFactory={mockAnonymousClientFactory}
        >
          {suspenseFallback === undefined ? (
            children
          ) : (
            <Suspense fallback={suspenseFallback}>{children}</Suspense>
          )}
        </BAIClientProvider>
      </QueryClientProvider>
    </RelayEnvironmentProvider>
  );
};

export default MockVFolderFileProviders;
