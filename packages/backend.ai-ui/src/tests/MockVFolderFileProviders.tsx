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

export interface MockVFolder {
  name: string;
  row_id: string;
  /** `VFolder.permissions` bits; defaults to read, write and delete. */
  permissions?: Array<string>;
}

/** The mount verbs a row's resolved level carries, as the manager sends them. */
const MOUNT_VERBS_FOR_LEVEL: Record<string, Array<string>> = {
  rw: ['mount_ro', 'mount_rw', 'mount_wd'],
  wd: ['mount_ro', 'mount_rw', 'mount_wd'],
  ro: ['mount_ro'],
  none: [],
};

export interface MockVFolderFileProvidersProps {
  vfolders?: Array<MockVFolder>;
  trees?: MockVFolderFileTrees | (() => MockVFolderFileTrees);
  /** Rows `vfolder_nodes` answers with, in the shape the mount select reads. */
  folders?: Array<LegacyVFolder>;
  /** Fallback for a Suspense boundary around `children`; omit to render bare. */
  suspenseFallback?: React.ReactNode;
  children?: React.ReactNode;
}

/**
 * Everything a vfolder file-browsing story needs without a backend: a mock
 * Relay environment answering `vfolder_nodes` / the picker's `vfolderV2` from
 * `vfolders`, and a mock `BAIClient` whose file APIs read and write `trees`.
 */
const MockVFolderFileProviders: React.FC<MockVFolderFileProvidersProps> = ({
  folders,
  // The path picker's `vfolderV2` is answered from the same rows.
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
    // A `folders` row's `permission` goes back as the mount verbs it implies.
    const nodesByRowId = new Map(
      (folders ?? []).map((folder) => [convertToUUID(folder.id), folder]),
    );
    const edges = vfolders.map((folder) => {
      const row = nodesByRowId.get(folder.row_id);
      return {
        node: {
          id: toGlobalId('VirtualFolderNode', folder.row_id),
          name: folder.name,
          row_id: folder.row_id,
          host: row?.host ?? 'local:volume1',
          status: row?.status ?? 'ready',
          usage_mode: row?.usage_mode ?? 'general',
          created_at: row?.created_at ?? '2026-07-01T11:20:00+00:00',
          user_email: row?.user_email ?? null,
          group: row?.group ?? null,
          group_name: row?.group_name ?? null,
          creator: row?.creator ?? '',
          ownership_type: row?.ownership_type ?? 'user',
          permissions: [
            ...DEFAULT_PERMISSIONS,
            ...(MOUNT_VERBS_FOR_LEVEL[row?.permission ?? 'rw'] ??
              MOUNT_VERBS_FOR_LEVEL.rw),
          ],
        },
      };
    });

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
                  metadata: { name: requested.name },
                  permissions: requested.permissions ?? DEFAULT_PERMISSIONS,
                }
              : undefined,
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
