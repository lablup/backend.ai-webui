import type { BAIDirectoryPickerModalQuery } from '../../../__generated__/BAIDirectoryPickerModalQuery.graphql';
import { Form } from '../../../form-engine';
import { toGlobalId } from '../../../helper';
import BAIFlex from '../../BAIFlex';
import BAIUnmountAfterClose from '../../BAIUnmountAfterClose';
import BAIVFolderSelectAstryx from '../../fragments/BAIVFolderSelectAstryx';
import { BAIClientContext } from '../../provider/BAIClientProvider/context';
import type {
  BAIClient,
  VFolderFile,
} from '../../provider/BAIClientProvider/types';
import BAIDirectoryPickerModal, {
  BAIDirectoryPickerQuery,
} from './BAIDirectoryPickerModal';
import BAIVFolderPathPicker from './BAIVFolderPathPicker';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Button, Typography } from 'antd';
import { useState, useTransition } from 'react';
import { RelayEnvironmentProvider, useQueryLoader } from 'react-relay';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';

/**
 * The stories mock two data sources so every interaction works end-to-end
 * without a backend:
 * - Relay (the directory modal's `vfolder_node` query and the external
 *   BAIVFolderSelectAstryx in the Form story) → mock Relay environment returning
 *   SAMPLE_VFOLDERS;
 * - the directory modal's REST calls through BAIClientContext
 *   (`vfolder.list_files` / `mkdir` / `rename_file` / `delete_files`) → mock
 *   client backed by an in-memory directory tree.
 */

const MOCK_VFOLDERS = [
  {
    label: 'my-workspace',
    uuid: '11111111-1111-1111-1111-111111111111',
    permissions: ['read_content', 'write_content', 'delete_content'],
  },
  {
    // Read-only folder — demonstrates permission gating: folder CRUD
    // (create / rename / delete) is disabled inside the picker modal.
    label: 'team-shared-data',
    uuid: '22222222-2222-2222-2222-222222222222',
    permissions: ['read_content'],
  },
];

// Relay global ids must decode to the UUIDs the mock REST client is keyed by.
const SAMPLE_VFOLDERS = MOCK_VFOLDERS.map(({ label, uuid }) => ({
  node: {
    id: btoa(`VFolderNode:${uuid}`),
    name: label,
    row_id: uuid,
  },
}));

const entry = (
  name: string,
  type: VFolderFile['type'],
  modified: string,
): VFolderFile => ({
  name,
  type,
  size: type === 'FILE' ? 4096 : 0,
  mode: 0o755,
  created: modified,
  modified,
});

// Directory trees keyed by vfolder UUID, then by the same path notation
// `useSearchVFolderFiles` uses ('.' = root, 'a/b' below it).
const createInitialTrees = (): Record<
  string,
  Record<string, Array<VFolderFile>>
> => ({
  [MOCK_VFOLDERS[0].uuid]: {
    '.': [
      entry('models', 'DIRECTORY', '2026-07-21T14:02:00'),
      entry('datasets', 'DIRECTORY', '2026-07-18T09:45:00'),
      entry('outputs', 'DIRECTORY', '2026-07-28T22:10:00'),
      entry('README.md', 'FILE', '2026-07-01T11:20:00'),
      entry('train.py', 'FILE', '2026-07-25T16:33:00'),
    ],
    models: [
      entry('checkpoints', 'DIRECTORY', '2026-07-27T03:12:00'),
      entry('llama-3-ft', 'DIRECTORY', '2026-07-26T19:40:00'),
      entry('model_definition.yaml', 'FILE', '2026-07-22T10:05:00'),
    ],
    'models/checkpoints': [
      entry('epoch-001', 'DIRECTORY', '2026-07-27T03:12:00'),
      entry('epoch-002', 'DIRECTORY', '2026-07-27T09:47:00'),
      entry('latest.pt', 'FILE', '2026-07-27T09:47:00'),
    ],
    'models/checkpoints/epoch-001': [],
    'models/checkpoints/epoch-002': [],
    'models/llama-3-ft': [
      entry('adapter_config.json', 'FILE', '2026-07-26T19:40:00'),
    ],
    datasets: [
      entry('raw', 'DIRECTORY', '2026-07-18T09:45:00'),
      entry('cleaned.parquet', 'FILE', '2026-07-19T08:00:00'),
    ],
    'datasets/raw': [],
    outputs: [],
  },
  [MOCK_VFOLDERS[1].uuid]: {
    '.': [
      entry('shared-corpus', 'DIRECTORY', '2026-07-10T08:00:00'),
      entry('LICENSE', 'FILE', '2026-07-02T12:00:00'),
    ],
    'shared-corpus': [],
  },
});

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const splitJoinedPath = (joined: string) => {
  const parts = joined.split('/').filter((p) => p !== '');
  const name = parts.pop() ?? '';
  const parentParts = parts.filter((p) => p !== '.');
  return {
    parent: parentParts.length === 0 ? '.' : parentParts.join('/'),
    name,
  };
};

const childKey = (parent: string, name: string) =>
  parent === '.' ? name : `${parent}/${name}`;

const createMockClient = (): BAIClient => {
  const trees = createInitialTrees();

  const mockVFolder = {
    list_files: async (path: string, id: string) => {
      await delay(250);
      return { items: trees[id]?.[path] ?? [] };
    },
    mkdir: async (path: string, id: string | null) => {
      await delay(250);
      const tree = trees[id ?? ''];
      const { parent, name } = splitJoinedPath(path);
      if (!tree || !name) throw new Error('Invalid path');
      if (tree[parent]?.some((item) => item.name === name)) {
        throw new Error(`Directory already exists: ${name}`);
      }
      tree[parent] = [
        entry(name, 'DIRECTORY', '2026-07-29T12:00:00'),
        ...(tree[parent] ?? []),
      ];
      tree[childKey(parent, name)] = [];
      return {};
    },
    rename_file: async (
      target_path: string,
      new_name: string,
      targetFolder: string,
    ) => {
      await delay(250);
      const tree = trees[targetFolder];
      const { parent, name } = splitJoinedPath(target_path);
      const item = tree?.[parent]?.find((i) => i.name === name);
      if (!tree || !item) throw new Error('Not found');
      item.name = new_name;
      const oldKey = childKey(parent, name);
      const newKey = childKey(parent, new_name);
      for (const key of Object.keys(tree)) {
        if (key === oldKey || key.startsWith(`${oldKey}/`)) {
          tree[key.replace(oldKey, newKey)] = tree[key];
          delete tree[key];
        }
      }
      return {};
    },
    delete_files: async (
      files: Array<string>,
      _recursive: boolean,
      id: string,
    ) => {
      await delay(250);
      const tree = trees[id];
      if (!tree) throw new Error('Not found');
      for (const file of files) {
        const { parent, name } = splitJoinedPath(file);
        tree[parent] = (tree[parent] ?? []).filter((i) => i.name !== name);
        const key = childKey(parent, name);
        for (const treeKey of Object.keys(tree)) {
          if (treeKey === key || treeKey.startsWith(`${key}/`)) {
            delete tree[treeKey];
          }
        }
      }
      return { bgtask_id: null };
    },
    request_download_token: async () => {
      throw new Error('Download is not available in Storybook');
    },
  };

  return {
    vfolder: mockVFolder,
    supports: () => false,
    _config: { isDirectorySizeVisible: false },
  } as unknown as BAIClient;
};

/**
 * Wraps stories with everything the picker needs: a mock Relay environment
 * (for the directory modal's `vfolder_node` query and the external
 * BAIVFolderSelectAstryx) and a mock BAIClientContext client (for the directory
 * modal's REST calls).
 */
const MockProviders: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: false } } }),
  );
  const [clientPromise] = useState(() => Promise.resolve(createMockClient()));
  const [relayEnvironment] = useState(() => {
    const environment = createMockEnvironment();
    const pickerGlobalIds = MOCK_VFOLDERS.map(({ uuid }) =>
      toGlobalId('VirtualFolderNode', uuid),
    );
    // Queue a resolver and a pending operation per mocked fetch; the picker's
    // preloaded query hangs unless its operation is registered up front.
    for (let i = 0; i < 20; i++) {
      environment.mock.queueOperationResolver((operation) => {
        // BAIDirectoryPickerModal queries `vfolder_node(id: $vfolderGlobalId)`
        // with a `VirtualFolderNode:<uuid>` global id — answer with the
        // matching mock folder's name and permissions.
        const { vfolderGlobalId } = operation.request.variables;
        const requestedUuid =
          typeof vfolderGlobalId === 'string'
            ? atob(vfolderGlobalId).split(':')[1]
            : undefined;
        const requestedVFolder =
          MOCK_VFOLDERS.find((v) => v.uuid === requestedUuid) ??
          MOCK_VFOLDERS[0];

        return MockPayloadGenerator.generate(operation, {
          Query: () => ({
            vfolder_nodes: {
              count: SAMPLE_VFOLDERS.length,
              edges: SAMPLE_VFOLDERS,
            },
            vfolder_node: {
              name: requestedVFolder.label,
              permissions: requestedVFolder.permissions,
            },
          }),
        });
      });
      pickerGlobalIds.forEach((vfolderGlobalId) =>
        environment.mock.queuePendingOperation(BAIDirectoryPickerQuery, {
          vfolderGlobalId,
        }),
      );
    }
    return environment;
  });

  return (
    <RelayEnvironmentProvider environment={relayEnvironment}>
      <QueryClientProvider client={queryClient}>
        <BAIClientContext.Provider value={clientPromise}>
          {/* No Suspense boundary here on purpose: every opener mounts
                BAIDirectoryPickerModal inside a transition (loadQuery + open
                wrapped in startTransition), so the suspension is absorbed by
                the transition and a host never needs a boundary. */}
          {children}
        </BAIClientContext.Provider>
      </QueryClientProvider>
    </RelayEnvironmentProvider>
  );
};

const meta: Meta<typeof BAIVFolderPathPicker> = {
  title: 'Input/BAIVFolderPathPicker',
  component: BAIVFolderPathPicker,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**BAIVFolderPathPicker** is a sub path picker for a given vfolder: a select-like trigger that opens a directory-only picker modal. The vfolder itself is chosen elsewhere (e.g. a \`BAIVFolderSelectAstryx\`) and passed in as \`vfolderUuid\`. The modal's vfolder query is preloaded from the open gesture (\`useQueryLoader\` + transition), so the trigger shows its own \`loading\` state while the data is in flight.

The value is the **sub path inside the vfolder** — \`''\` for the vfolder root, \`"sub/path"\` below it, \`undefined\` while nothing is picked — so it plugs directly into a Form.Item; \`value\`/\`onChange\` follow the controllable-state convention, so the component works both controlled and uncontrolled. Files are visible but disabled inside the picker; only directories can be entered and chosen. Folder CRUD (create / rename / delete) stays available via \`BAIFileExplorer\`'s \`directoryPicker\` mode. When the vfolder changes, reset the value — a sub path only makes sense within the vfolder it was picked from.

## BAI-Specific Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`vfolderUuid\` | \`string\` | - | UUID of the vfolder to browse; pair with \`disabled={!vfolderUuid}\` until one is selected |
| \`value\` | \`string\` | - | Selected sub path (\`''\` = vfolder root) |
| \`defaultValue\` | \`string\` | - | Initial value for uncontrolled usage |
| \`onChange\` | \`(selectedSubPath?: string) => void\` | - | Fired when a location is confirmed in the modal |
| \`selectProps\` | \`BAISelectProps\` subset | - | Forwarded to the sub path trigger select |

> The stories run against a mock Relay environment and a mock \`BAIClientContext\` client, so vfolder search, browsing, mkdir, rename and delete all work without a backend. The second folder (\`team-shared-data\`) is read-only — pick it in the Form story to see permission gating disable folder CRUD inside the modal.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BAIVFolderPathPicker>;

export const Default: Story = {
  name: 'Basic Usage (uncontrolled)',
  render: () => {
    const [lastChange, setLastChange] = useState<string | undefined>();

    return (
      <MockProviders>
        <BAIFlex
          direction="column"
          align="stretch"
          gap="md"
          style={{ width: 560 }}
        >
          <BAIVFolderPathPicker
            vfolderUuid={MOCK_VFOLDERS[0].uuid}
            onChange={setLastChange}
          />
          <Typography.Text type="secondary">
            onChange:{' '}
            <Typography.Text code>
              {lastChange === undefined
                ? 'undefined'
                : JSON.stringify(lastChange)}
            </Typography.Text>
          </Typography.Text>
        </BAIFlex>
      </MockProviders>
    );
  },
};

export const WithinForm: Story = {
  name: 'Within Form (with external BAIVFolderSelectAstryx)',
  parameters: {
    docs: {
      description: {
        story:
          'The intended composition: a separate `BAIVFolderSelectAstryx` (with `valuePropName="row_id"` so the field holds the UUID) feeds `vfolderUuid`, and the picker plugs into its own Form.Item with `disabled={!vfolderUuid}` until a folder is chosen. Changing the vfolder resets the path field, and the required rule uses a custom validator because `""` (the vfolder root) is a valid pick.',
      },
    },
  },
  render: () => {
    const [form] = Form.useForm<{
      vfolderUuid?: string;
      destination?: string;
    }>();
    const vfolderUuid = Form.useWatch('vfolderUuid', form);
    const [submitted, setSubmitted] = useState<string>();

    return (
      <MockProviders>
        <Form
          form={form}
          layout="vertical"
          style={{ width: 560 }}
          onFinish={(values) => {
            setSubmitted(JSON.stringify(values));
          }}
        >
          <Form.Item
            name="vfolderUuid"
            label="Folder"
            rules={[{ required: true }]}
          >
            <BAIVFolderSelectAstryx
              label="Folder"
              isLabelHidden
              valuePropName="row_id"
              onChange={() => {
                // A sub path belongs to the vfolder it was picked from.
                form.setFieldValue('destination', undefined);
              }}
            />
          </Form.Item>
          <Form.Item
            name="destination"
            label="Destination"
            required
            rules={[
              {
                // `''` (vfolder root) is a valid pick, so `required: true`
                // (which rejects empty strings) cannot be used here.
                validator: (_rule, value) =>
                  value === undefined
                    ? Promise.reject(new Error('Please select a path'))
                    : Promise.resolve(),
              },
            ]}
          >
            <BAIVFolderPathPicker
              vfolderUuid={vfolderUuid}
              disabled={!vfolderUuid}
            />
          </Form.Item>
          <BAIFlex direction="column" align="start" gap="sm">
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
            {submitted && (
              <Typography.Text type="secondary">
                submitted: <Typography.Text code>{submitted}</Typography.Text>
              </Typography.Text>
            )}
          </BAIFlex>
        </Form>
      </MockProviders>
    );
  },
};

/**
 * Drives `BAIDirectoryPickerModal` directly, the way a future wrapper (e.g. a
 * button component) would: preload `BAIDirectoryPickerQuery` in the click
 * handler via `useQueryLoader` **inside a transition** (the modal suspends on
 * the preloaded query, and the transition absorbs that suspension — surfaced
 * as the trigger's loading state), then pass the resulting `queryRef` to the
 * modal. Must live inside `MockProviders` so `useQueryLoader` finds the Relay
 * environment.
 */
const DirectoryPickerModalDemo: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenPending, startOpenTransition] = useTransition();
  const [lastResult, setLastResult] = useState<string | undefined>();
  const [queryRef, loadQuery] = useQueryLoader<BAIDirectoryPickerModalQuery>(
    BAIDirectoryPickerQuery,
  );

  return (
    <BAIFlex direction="column" gap="md" align="start">
      <Button
        type="primary"
        loading={isOpenPending}
        onClick={() => {
          startOpenTransition(() => {
            loadQuery(
              {
                vfolderGlobalId: toGlobalId(
                  'VirtualFolderNode',
                  MOCK_VFOLDERS[0].uuid,
                ),
              },
              { fetchPolicy: 'store-and-network' },
            );
            setIsOpen(true);
          });
        }}
      >
        Open directory picker
      </Button>
      <Typography.Text type="secondary">
        Last selection:{' '}
        <Typography.Text code>
          {lastResult === undefined ? '(none)' : `/${lastResult}`}
        </Typography.Text>
      </Typography.Text>
      {queryRef != null && (
        <BAIUnmountAfterClose>
          <BAIDirectoryPickerModal
            open={isOpen}
            vfolderUuid={MOCK_VFOLDERS[0].uuid}
            queryRef={queryRef}
            onRequestClose={(selectedSubPath) => {
              if (selectedSubPath !== undefined) {
                setLastResult(selectedSubPath);
              }
              setIsOpen(false);
            }}
          />
        </BAIUnmountAfterClose>
      )}
    </BAIFlex>
  );
};

export const PickerModalOnly: Story = {
  name: 'Directory Picker Modal',
  parameters: {
    docs: {
      description: {
        story:
          '`BAIDirectoryPickerModal` can also be driven directly — preload `BAIDirectoryPickerQuery` with `useQueryLoader` in the opening event (wrapped in a transition, since the modal suspends until the query resolves), pass the `queryRef`, and receive the chosen sub path via `onRequestClose` (`undefined` when cancelled).',
      },
    },
  },
  render: () => (
    <MockProviders>
      <DirectoryPickerModalDemo />
    </MockProviders>
  ),
};
