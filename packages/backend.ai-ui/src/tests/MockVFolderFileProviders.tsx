import { BAIDirectoryPickerQuery } from '../components/baiClient/FileExplorer/BAIDirectoryPickerModal';
import { BAIClientProvider } from '../components/provider/BAIClientProvider';
import { toGlobalId } from '../helper';
import {
  createMockVFolderFileClient,
  type MockMountFolder,
  type MockVFolderFileTrees,
} from './mockVFolderFileTree';
import { mockAnonymousClientFactory } from './storybook-mock-utils';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as _ from 'lodash-es';
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
  /** Folders `scopedVFoldersV2` answers with, after its scope and filter. */
  folders?: Array<MockMountFolder>;
  /** Fallback for a Suspense boundary around `children`; omit to render bare. */
  suspenseFallback?: React.ReactNode;
  children?: React.ReactNode;
}

interface MockScope {
  project?: Array<{ value: string }>;
}

interface MockStringFilter {
  equals?: string;
  notEquals?: string;
  in?: Array<string>;
  notIn?: Array<string>;
  startsWith?: string;
  notStartsWith?: string;
  iContains?: string;
}

interface MockFilter {
  name?: MockStringFilter;
  host?: MockStringFilter;
  status?: MockStringFilter;
  usageMode?: MockStringFilter;
  entityId?: MockStringFilter;
  AND?: Array<MockFilter>;
  OR?: Array<MockFilter>;
  NOT?: Array<MockFilter>;
}

const matchesString = (value: string, filter?: MockStringFilter) =>
  !filter ||
  ((filter.equals == null || value === filter.equals) &&
    (filter.notEquals == null || value !== filter.notEquals) &&
    (filter.in == null || filter.in.includes(value)) &&
    (filter.notIn == null || !filter.notIn.includes(value)) &&
    (filter.startsWith == null || value.startsWith(filter.startsWith)) &&
    (filter.notStartsWith == null || !value.startsWith(filter.notStartsWith)) &&
    (filter.iContains == null ||
      value.toLowerCase().includes(filter.iContains.toLowerCase())));

/** The `VFolderFilter` subset the mount-folder queries send, evaluated in memory. */
const matchesVFolderFilter = (
  folder: MockMountFolder,
  filter?: MockFilter | null,
): boolean =>
  !filter ||
  (_.every(filter.AND, (f) => matchesVFolderFilter(folder, f)) &&
    (!filter.OR || _.some(filter.OR, (f) => matchesVFolderFilter(folder, f))) &&
    !_.some(filter.NOT, (f) => matchesVFolderFilter(folder, f)) &&
    matchesString(folder.name, filter.name) &&
    matchesString(folder.host, filter.host) &&
    matchesString(folder.status, filter.status) &&
    matchesString(folder.usageMode, filter.usageMode) &&
    matchesString(folder.id, filter.entityId));

/**
 * Everything a vfolder file-browsing story needs without a backend: a mock
 * Relay environment answering `scopedVFoldersV2` from `folders` and
 * `vfolder_nodes` / the picker's `vfolderV2` from `vfolders`, and a mock
 * `BAIClient` whose file APIs read and write `trees`.
 */
const MockVFolderFileProviders: React.FC<MockVFolderFileProvidersProps> = ({
  folders,
  // The path picker's `vfolderV2` is answered from the same rows by default.
  vfolders = (folders ?? []).map((folder): MockVFolder => ({
    name: folder.name,
    row_id: folder.id,
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

    const scopedVFolders = (variables: Record<string, unknown>) => {
      const projectIds = _.map(
        (variables.scope as MockScope | undefined)?.project,
        'value',
      );
      const matched = (folders ?? []).filter(
        (folder) =>
          (folder.ownershipType === 'USER' ||
            projectIds.includes(folder.projectId ?? '')) &&
          matchesVFolderFilter(folder, variables.filter as MockFilter),
      );
      const offset = (variables.offset as number | undefined) ?? 0;
      const limit = (variables.limit as number | undefined) ?? matched.length;
      return {
        count: matched.length,
        edges: matched.slice(offset, offset + limit).map((folder) => ({
          node: {
            id: toGlobalId('VFolder', folder.id),
            entityId: folder.id,
            status: folder.status,
            host: folder.host,
            metadata: {
              name: folder.name,
              usageMode: folder.usageMode,
              createdAt: folder.createdAt,
            },
            accessControl: {
              permission: folder.permission,
              ownershipType: folder.ownershipType,
            },
            ownership: { creatorEmail: folder.creatorEmail },
          },
        })),
      };
    };

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
            scopedVFoldersV2: scopedVFolders(operation.request.variables),
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
