import { Form } from '../../form-engine';
import { toGlobalId } from '../../helper';
import {
  createMockVFolderFileClient,
  mockVFolderFile as entry,
  type MockVFolderFileTrees,
} from '../../tests/mockVFolderFileTree';
import BAIButton from '../BAIButton';
import BAIText from '../BAIText';
import { BAIDirectoryPickerQuery } from '../baiClient/FileExplorer/BAIDirectoryPickerModal';
import { BAIClientContext } from '../provider/BAIClientProvider/context';
import BAIVFolderMountConfigInput, {
  BAIVFolderMountConfigInputProps,
  VFolderMountConfigValue,
  isVFolderMountConfigValid,
} from './BAIVFolderMountConfigInput';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Suspense, useState } from 'react';
import { RelayEnvironmentProvider } from 'react-relay';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';

const sampleVFolders = [
  { name: 'my-project-data', row_id: '11111111-1111-1111-1111-111111111111' },
  { name: 'shared-datasets', row_id: '22222222-2222-2222-2222-222222222222' },
  { name: 'model-checkpoints', row_id: '33333333-3333-3333-3333-333333333333' },
  { name: 'training-logs', row_id: '44444444-4444-4444-4444-444444444444' },
].map((folder) => ({
  // The component runs BAIVFolderSelect in `row_id` mode, so `row_id` is the
  // value used everywhere; the global `id` only needs to satisfy the query
  // shape and decode back to the same UUID.
  node: {
    id: toGlobalId('VirtualFolderNode', folder.row_id),
    name: folder.name,
    row_id: folder.row_id,
  },
}));

// Directory trees keyed by vfolder UUID, then by the path notation
// `useSearchVFolderFiles` uses ('.' = root, 'a/b' below it), so every row's
// subpath picker browses a real tree.
const createInitialTrees = (): MockVFolderFileTrees => ({
  [sampleVFolders[0].node.row_id]: {
    '.': [
      entry('dataset', 'DIRECTORY', '2026-07-21T14:02:00'),
      entry('scripts', 'DIRECTORY', '2026-07-18T09:45:00'),
      entry('README.md', 'FILE', '2026-07-01T11:20:00'),
    ],
    dataset: [
      entry('train', 'DIRECTORY', '2026-07-22T10:05:00'),
      entry('validation', 'DIRECTORY', '2026-07-22T10:05:00'),
    ],
    'dataset/train': [],
    'dataset/validation': [],
    scripts: [],
  },
  [sampleVFolders[1].node.row_id]: {
    '.': [
      entry('imagenet', 'DIRECTORY', '2026-07-10T08:00:00'),
      entry('LICENSE', 'FILE', '2026-07-02T12:00:00'),
    ],
    imagenet: [],
  },
  [sampleVFolders[2].node.row_id]: {
    '.': [entry('epoch-001', 'DIRECTORY', '2026-07-27T03:12:00')],
    'epoch-001': [],
  },
  [sampleVFolders[3].node.row_id]: { '.': [] },
});

/**
 * Everything the component needs without a backend:
 * - Relay for BAIVFolderSelect's dual queries (ValueQuery + PaginatedQuery,
 *   re-fetched on selection) and for the subpath picker's `vfolder_node`
 *   query, whose operation must also be queued as pending because the picker
 *   preloads it;
 * - a mock BAIClientContext client backed by an in-memory directory tree, for
 *   the directory modal's REST calls.
 */
const MockProviders = ({ children }: { children?: React.ReactNode }) => {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: false } } }),
  );
  const [clientPromise] = useState(() =>
    Promise.resolve(createMockVFolderFileClient(createInitialTrees())),
  );
  const [environment] = useState(() => {
    const env = createMockEnvironment();
    const pickerGlobalIds = sampleVFolders.map(({ node }) => node.id);
    for (let i = 0; i < 40; i++) {
      env.mock.queueOperationResolver((operation) => {
        const { vfolderGlobalId } = operation.request.variables;
        const requestedRowId =
          typeof vfolderGlobalId === 'string'
            ? atob(vfolderGlobalId).split(':')[1]
            : undefined;
        const requested =
          sampleVFolders.find(({ node }) => node.row_id === requestedRowId) ??
          sampleVFolders[0];
        return MockPayloadGenerator.generate(operation, {
          Query: () => ({
            vfolder_nodes: {
              count: sampleVFolders.length,
              edges: sampleVFolders,
            },
            vfolder_node: {
              name: requested.node.name,
              permissions: ['read_content', 'write_content', 'delete_content'],
            },
          }),
        });
      });
      pickerGlobalIds.forEach((vfolderGlobalId) =>
        env.mock.queuePendingOperation(BAIDirectoryPickerQuery, {
          vfolderGlobalId,
        }),
      );
    }
    return env;
  });

  return (
    <RelayEnvironmentProvider environment={environment}>
      <QueryClientProvider client={queryClient}>
        <BAIClientContext.Provider value={clientPromise}>
          <Suspense fallback="Loading...">{children}</Suspense>
        </BAIClientContext.Provider>
      </QueryClientProvider>
    </RelayEnvironmentProvider>
  );
};

/**
 * Controlled wrapper that renders the component and prints the current
 * form value as text, so the emitted `VFolderMountConfigValue[]` is visible
 * while selecting folders and picking aliases / subpaths. `mountDestination`
 * is stored as the raw alias; the resolved full path is shown inline per row.
 */
const ControlledDemo = ({
  initialValue = [],
  ...props
}: BAIVFolderMountConfigInputProps & {
  initialValue?: VFolderMountConfigValue[];
}) => {
  const [value, setValue] = useState<VFolderMountConfigValue[]>(initialValue);
  return (
    <div style={{ width: 760 }}>
      <BAIVFolderMountConfigInput
        {...props}
        value={value}
        onChange={setValue}
      />
      <div style={{ marginTop: 24 }}>
        <BAIText strong>Form value (onChange result)</BAIText>
        <pre
          style={{
            marginTop: 8,
            padding: 12,
            background: 'rgba(0,0,0,0.04)',
            borderRadius: 6,
            fontSize: 12,
          }}
        >
          {JSON.stringify(value, null, 2)}
        </pre>
      </div>
    </div>
  );
};

const meta: Meta<typeof BAIVFolderMountConfigInput> = {
  title: 'Fragments/BAIVFolderMountConfigInput',
  component: BAIVFolderMountConfigInput,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**BAIVFolderMountConfigInput** is a reusable, schema-agnostic controlled input
for configuring vfolder mounts.

- Composes [BAIVFolderSelect](/?path=/docs/fragments-baivfolderselect--docs) to pick
  vfolders (\`row_id\` mode, so the value is the vfolder UUID).
- Each selected folder appears as a row with a **mount path (alias)** input and an
  optional **subpath** picker (which subfolder of the vfolder to mount as the source; \`/\` = root),
  which opens a directory browser instead of accepting typed text.
- \`mountDestination\` stores the **raw alias** the user typed — \`''\` mounts at the default
  \`/home/work/<name>\`, a relative segment like \`data\` resolves to \`/home/work/data\`, and an
  absolute path like \`/data\` is used as-is. Resolve it with the exported \`inputToMountDestination\`.
- \`autoMountedFolderNames\` are folded into the overlap check (a user alias colliding with an
  auto-mounted folder is flagged) and shown as read-only tags at the bottom.
- Emits a single \`VFolderMountConfigValue[]\`. The inline per-row errors are advisory UX; to gate a
  form, wrap the component in one named \`Form.Item\` and call \`isVFolderMountConfigValid\` from a
  \`rules\` validator (see the **WithFormValidation** story).

The stories below use a mocked Relay environment so multiple sample folders can be selected.
`,
      },
    },
  },
  decorators: [
    (Story) => (
      <MockProviders>
        <Story />
      </MockProviders>
    ),
  ],
  argTypes: {
    value: {
      description: 'Controlled list of vfolder mount configurations',
      table: { type: { summary: 'VFolderMountConfigValue[]' } },
    },
    onChange: {
      action: 'changed',
      description: 'Called with the updated mount configuration list',
    },
    currentProjectId: {
      control: { type: 'text' },
      description: 'Project ID to scope vfolder selection',
      table: { type: { summary: 'string' } },
    },
    filter: {
      control: { type: 'text' },
      description: 'Additional filter string passed to BAIVFolderSelect',
      table: { type: { summary: 'string' } },
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Disable selection and all row inputs',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    aliasBasePath: {
      control: { type: 'text' },
      description: 'Base path prepended to a relative alias input',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '/home/work/' },
      },
    },
    autoMountedFolderNames: {
      control: { type: 'object' },
      description:
        'Names of auto-mounted folders: folded into the overlap check and shown as read-only tags',
      table: { type: { summary: 'string[]' } },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BAIVFolderMountConfigInput>;

/**
 * Empty initial state. Select folders from the dropdown to add rows, then edit
 * each row's mount path and browse its subpath. The live form value is shown
 * below.
 */
export const Interactive: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Empty initial state. Select folders from the dropdown to add rows, then type each row's mount path and click its subpath field to browse the folder. New rows start at the folder root, shown as `/`. The live form value is shown below — note `mountDestination` holds the raw alias you typed, while `subpath` only ever comes from the picker.",
      },
    },
  },
  render: (args) => <ControlledDemo {...args} />,
};

/**
 * Prefilled showing all three alias modes: a relative alias, an absolute path,
 * and an empty alias that falls back to the default mount path.
 */
export const Prefilled: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Prefilled with three folders demonstrating each alias mode: a relative segment (`data` → `/home/work/data`), an absolute path (`/mnt/shared`, used as-is), and an empty alias (falls back to `/home/work/<name>`). The first mounts the `dataset/train` subpath; the other two mount the folder root, which the picker shows as `/`.',
      },
    },
  },
  render: (args) => (
    <ControlledDemo
      {...args}
      initialValue={[
        {
          vfolderId: sampleVFolders[0].node.row_id,
          name: sampleVFolders[0].node.name,
          mountDestination: 'data',
          subpath: 'dataset/train',
        },
        {
          vfolderId: sampleVFolders[1].node.row_id,
          name: sampleVFolders[1].node.name,
          mountDestination: '/mnt/shared',
          subpath: '',
        },
        {
          vfolderId: sampleVFolders[2].node.row_id,
          name: sampleVFolders[2].node.name,
          mountDestination: '',
          subpath: '',
        },
      ]}
    />
  ),
};

/**
 * Error state — two folders resolve to the same mount path, so both rows show
 * the overlap error.
 */
export const OverlappingPaths: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Two folders use the same alias (`shared`), so both resolve to `/home/work/shared` and are flagged with the overlap error. `isVFolderMountConfigValid` returns `false` for this value.',
      },
    },
  },
  render: (args) => (
    <ControlledDemo
      {...args}
      initialValue={[
        {
          vfolderId: sampleVFolders[0].node.row_id,
          name: sampleVFolders[0].node.name,
          mountDestination: 'shared',
          subpath: '',
        },
        {
          vfolderId: sampleVFolders[1].node.row_id,
          name: sampleVFolders[1].node.name,
          mountDestination: 'shared',
          subpath: '',
        },
      ]}
    />
  ),
};

/**
 * Auto-mounted folders are listed as read-only tags at the bottom, and a user
 * alias that collides with one of them is flagged as an overlap.
 */
export const WithAutoMountedFolders: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Passing `autoMountedFolderNames={[".local", ".config"]}` renders them as read-only tags below the rows. The first folder aliases to `.config`, colliding with the auto-mounted `/home/work/.config`, so it shows the overlap error.',
      },
    },
  },
  render: (args) => (
    <ControlledDemo
      {...args}
      autoMountedFolderNames={['.local', '.config']}
      initialValue={[
        {
          vfolderId: sampleVFolders[0].node.row_id,
          name: sampleVFolders[0].node.name,
          mountDestination: '.config',
          subpath: '',
        },
        {
          vfolderId: sampleVFolders[2].node.row_id,
          name: sampleVFolders[2].node.name,
          mountDestination: 'checkpoints',
          subpath: '',
        },
      ]}
    />
  ),
};

/**
 * Demonstrates the recommended form-gate pattern: a single named `Form.Item`
 * wrapping the component, with `isVFolderMountConfigValid` in a `rules`
 * validator so `form.validateFields()` rejects on invalid input.
 */
export const WithFormValidation: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The component is wrapped in one named `Form.Item`. The `rules` validator calls `isVFolderMountConfigValid`, so submitting with the two colliding `shared` aliases fails validation. Fix the aliases and submit again to pass.',
      },
    },
  },
  render: (args) => {
    const FormValidationDemo = () => {
      const [form] = Form.useForm();
      const [result, setResult] = useState<string>('');
      return (
        <Form
          form={form}
          layout="vertical"
          style={{ width: 680 }}
          initialValues={{
            mounts: [
              {
                vfolderId: sampleVFolders[0].node.row_id,
                name: sampleVFolders[0].node.name,
                mountDestination: 'shared',
                subpath: '',
              },
              {
                vfolderId: sampleVFolders[1].node.row_id,
                name: sampleVFolders[1].node.name,
                mountDestination: 'shared',
                subpath: '',
              },
            ],
          }}
        >
          <Form.Item
            name="mounts"
            label="VFolder mounts"
            rules={[
              {
                validator: (_rule, value) =>
                  isVFolderMountConfigValid(value, {
                    aliasBasePath: args.aliasBasePath,
                    autoMountedFolderNames: args.autoMountedFolderNames,
                  })
                    ? Promise.resolve()
                    : Promise.reject(
                        new Error(
                          'Some mounts have an invalid or overlapping path.',
                        ),
                      ),
              },
            ]}
          >
            <BAIVFolderMountConfigInput {...args} />
          </Form.Item>
          <BAIButton
            type="primary"
            onClick={() => {
              form
                .validateFields()
                .then(() => setResult('✅ Valid — form submitted.'))
                .catch(() => setResult('❌ Invalid — fix the flagged rows.'));
            }}
          >
            Validate &amp; submit
          </BAIButton>
          {result ? (
            <div style={{ marginTop: 16 }}>
              <BAIText>{result}</BAIText>
            </div>
          ) : null}
        </Form>
      );
    };
    return <FormValidationDemo />;
  },
};

/**
 * Disabled state — selection and inputs are read-only.
 */
export const Disabled: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Disabled state — the select, the alias input, the subpath picker and the remove button are all inert; the picked subpath stays readable.',
      },
    },
  },
  render: (args) => (
    <ControlledDemo
      {...args}
      disabled
      initialValue={[
        {
          vfolderId: sampleVFolders[1].node.row_id,
          name: sampleVFolders[1].node.name,
          mountDestination: 'shared',
          subpath: '',
        },
      ]}
    />
  ),
};
