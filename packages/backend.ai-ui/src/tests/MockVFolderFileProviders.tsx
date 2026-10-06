import { BAIDirectoryPickerQuery } from '../components/baiClient/FileExplorer/BAIDirectoryPickerModal';
import type { LegacyVFolder } from '../components/fragments/BAIVFolderMountConfigInput';
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
  /** Rows the mocked REST `GET /folders` request answers with. */
  folders?: Array<LegacyVFolder>;
  /** Fallback for a Suspense boundary around `children`; omit to render bare. */
  suspenseFallback?: React.ReactNode;
  children?: React.ReactNode;
}

/**
 * Everything a vfolder file-browsing story needs without a backend: a mock
 * Relay environment answering `vfolder_nodes` / the picker's `vfolderV2` from
 * `vfolders`, and a mock `BAIClient` whose file APIs read and write `trees`
 * and whose signed `GET /folders` request answers `folders`.
 */
const MockVFolderFileProviders: React.FC<MockVFolderFileProvidersProps> = ({
  folders,
  // A REST-fed story still needs the path picker's `vfolderV2` answered,
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
