import { BAIDirectoryPickerQuery } from '../components/baiClient/FileExplorer/BAIDirectoryPickerModal';
import type { LegacyVFolder } from '../components/fragments/BAIVFolderMountConfigInput';
import { BAIClientProvider } from '../components/provider/BAIClientProvider';
import { convertToUUID, toGlobalId, toLocalId } from '../helper';
import {
  createMockVFolderFileClient,
  type MockVFolderFileTrees,
} from './mockVFolderFileTree';
import { mockAnonymousClientFactory } from './storybook-mock-utils';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Suspense, useState } from 'react';
import { RelayEnvironmentProvider } from 'react-relay';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';

const DEFAULT_PERMISSIONS = ['read_content', 'write_content', 'delete_content'];

export interface MockVFolder {
  name: string;
  row_id: string;
  /** Defaults to full read/write/delete content permissions. */
  permissions?: Array<string>;
}

export interface MockVFolderFileProvidersProps {
  vfolders?: Array<MockVFolder>;
  trees?: MockVFolderFileTrees | (() => MockVFolderFileTrees);
  /** Rows both `myVfolders` and the mocked REST `GET /folders` answer with. */
  folders?: Array<LegacyVFolder>;
  /** Fallback for a Suspense boundary around `children`; omit to render bare. */
  suspenseFallback?: React.ReactNode;
  children?: React.ReactNode;
}

/**
 * Everything a vfolder file-browsing story needs without a backend: a mock
 * Relay environment answering `myVfolders` from `folders` and
 * `vfolder_nodes` / `vfolder_node` from `vfolders`, and a mock `BAIClient`
 * whose file APIs read and write `trees` and whose signed `GET /folders`
 * request answers `folders`.
 */
const MockVFolderFileProviders: React.FC<MockVFolderFileProvidersProps> = ({
  folders,
  // A REST-fed story still needs the path picker's `vfolder_node` answered,
  // so the Relay folders default to the REST rows.
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
        folders,
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

    // The REST rows as `myVfolders` nodes — the inverse of `toLegacyVFolder`,
    // so the mount select reads the same fixture from either source.
    const MOUNT_LEVEL_BY_REST_PERMISSION: Record<string, string> = {
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
          permission:
            MOUNT_LEVEL_BY_REST_PERMISSION[folder.permission] ?? 'NONE',
          ownershipType: folder.ownership_type.toUpperCase(),
        },
        ownership: {
          userId: folder.user,
          projectId: folder.group,
          creatorEmail: folder.creator || null,
        },
      },
    }));

    const queuePickerOperation = (vfolderGlobalId: string) =>
      env.mock.queuePendingOperation(BAIDirectoryPickerQuery, {
        vfolderGlobalId,
      });

    const queueResolver = () => {
      env.mock.queueOperationResolver((operation) => {
        queueResolver();
        const { vfolderGlobalId } = operation.request.variables;
        const requestedRowId =
          typeof vfolderGlobalId === 'string'
            ? toLocalId(vfolderGlobalId)
            : undefined;
        // The picker PRELOADS its vfolder query, so answering an open also has
        // to re-arm the pending operation the next open will look for.
        if (typeof vfolderGlobalId === 'string') {
          queuePickerOperation(vfolderGlobalId);
        }
        const requested =
          vfolders.find((folder) => folder.row_id === requestedRowId) ??
          vfolders[0];
        return MockPayloadGenerator.generate(operation, {
          Query: () => ({
            myVfolders: {
              count: myVfolderEdges.length,
              edges: myVfolderEdges,
            },
            vfolder_nodes: { count: edges.length, edges },
            vfolder_node: requested
              ? {
                  name: requested.name,
                  permissions: requested.permissions ?? DEFAULT_PERMISSIONS,
                }
              : undefined,
          }),
        });
      });
    };

    queueResolver();
    edges.forEach(({ node }) => queuePickerOperation(node.id));
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
