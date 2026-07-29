import BAIFlex from '../../BAIFlex';
import BAIUnmountAfterClose from '../../BAIUnmountAfterClose';
import { BAIClientContext } from '../../provider/BAIClientProvider/context';
import type {
  BAIClient,
  VFolderFile,
} from '../../provider/BAIClientProvider/types';
import BAIDirectoryPickerModal from './BAIDirectoryPickerModal';
import BAIVFolderPathPicker from './BAIVFolderPathPicker';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App, Button, Form, Typography } from 'antd';
import { Suspense, useState } from 'react';
import { RelayEnvironmentProvider } from 'react-relay';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';

/**
 * The picker composes two data sources, both mocked here so every interaction
 * works end-to-end without a backend:
 * - the embedded BAIVFolderSelect fetches vfolders via Relay → mock Relay
 *   environment returning SAMPLE_VFOLDERS;
 * - the directory modal talks to the REST API through BAIClientContext
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
 * Wraps stories with everything the integrated picker needs: a mock Relay
 * environment (for the embedded BAIVFolderSelect queries) and a mock
 * BAIClientContext client (for the directory modal's REST calls).
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
    // The select re-fetches on open/selection; queue enough resolvers.
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
    }
    return environment;
  });

  return (
    <RelayEnvironmentProvider environment={relayEnvironment}>
      <QueryClientProvider client={queryClient}>
        <App>
          <BAIClientContext.Provider value={clientPromise}>
            <Suspense fallback="Loading...">{children}</Suspense>
          </BAIClientContext.Provider>
        </App>
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
**BAIVFolderPathPicker** is an integrated "vfolder + sub path" picker: an embedded [BAIVFolderSelect](/?path=/docs/fragments-baivfolderselect--docs) next to a read-only path field that opens a directory-only picker modal.

The value is a single **name-based** path string — \`"my-workspace"\` for the vfolder root, \`"my-workspace/sub/path"\` below it — so it plugs directly into a Form.Item; \`value\`/\`onChange\` follow the controllable-state convention, so the component works both controlled and uncontrolled. The vfolder's id is tracked internally for the modal's REST calls and is not part of the value. Files are visible but disabled inside the picker; only directories can be entered and chosen. Folder CRUD (create / rename / delete) stays available via \`BAIFileExplorer\`'s \`directoryPicker\` mode.

## BAI-Specific Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`value\` | \`string\` | - | Selected path; first segment is the vfolder's name, the rest is the sub path |
| \`defaultValue\` | \`string\` | - | Initial value for uncontrolled usage |
| \`onChange\` | \`(selectedPath?: string) => void\` | - | Fired on vfolder change (path restarts at its root), clear (\`undefined\`), and path confirmation |
| \`selectProps\` | \`BAIVFolderSelectProps\` subset | - | Forwarded to the embedded vfolder select (\`currentProjectId\`, \`filter\`, \`excludeDeleted\`, …) |
| \`inputProps\` | \`InputProps\` subset | - | Forwarded to the sub path trigger field |

> The stories run against a mock Relay environment and a mock \`BAIClientContext\` client, so vfolder search, browsing, mkdir, rename and delete all work without a backend. The second folder (\`team-shared-data\`) is read-only — pick it to see permission gating disable folder CRUD inside the modal.
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
          <BAIVFolderPathPicker onChange={setLastChange} />
          <Typography.Text type="secondary">
            onChange:{' '}
            <Typography.Text code>{lastChange ?? 'undefined'}</Typography.Text>
          </Typography.Text>
        </BAIFlex>
      </MockProviders>
    );
  },
};

export const WithinForm: Story = {
  name: 'Within Form (controlled by Form.Item)',
  parameters: {
    docs: {
      description: {
        story:
          'The path string plugs straight into a Form.Item — the Form injects `value`/`onChange` and the required rule validates it.',
      },
    },
  },
  render: () => {
    const [submitted, setSubmitted] = useState<string>();

    return (
      <MockProviders>
        <Form<{ destination?: string }>
          layout="vertical"
          style={{ width: 560 }}
          onFinish={(values) => {
            setSubmitted(JSON.stringify(values.destination));
          }}
        >
          <Form.Item
            name="destination"
            label="Destination"
            rules={[{ required: true }]}
          >
            <BAIVFolderPathPicker />
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

export const PickerModalOnly: Story = {
  name: 'Directory Picker Modal',
  parameters: {
    docs: {
      description: {
        story:
          '`BAIDirectoryPickerModal` can also be driven directly — pass a vfolder UUID and receive the chosen sub path via `onRequestClose` (`undefined` when cancelled).',
      },
    },
  },
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    const [lastResult, setLastResult] = useState<string | undefined>();

    return (
      <MockProviders>
        <BAIFlex direction="column" gap="md" align="start">
          <Button type="primary" onClick={() => setIsOpen(true)}>
            Open directory picker
          </Button>
          <Typography.Text type="secondary">
            Last selection:{' '}
            <Typography.Text code>
              {lastResult === undefined ? '(none)' : `/${lastResult}`}
            </Typography.Text>
          </Typography.Text>
          <BAIUnmountAfterClose>
            <BAIDirectoryPickerModal
              open={isOpen}
              vfolderUuid={MOCK_VFOLDERS[0].uuid}
              vfolderName={MOCK_VFOLDERS[0].label}
              onRequestClose={(selectedSubPath) => {
                if (selectedSubPath !== undefined) {
                  setLastResult(selectedSubPath);
                }
                setIsOpen(false);
              }}
            />
          </BAIUnmountAfterClose>
        </BAIFlex>
      </MockProviders>
    );
  },
};
