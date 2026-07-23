import { RelayResolverProps } from '../../tests/RelayResolver';
import BAIVFolderMountConfigInput, {
  BAIVFolderMountConfigInputProps,
  VFolderMountConfigValue,
  isVFolderMountConfigValid,
} from './BAIVFolderMountConfigInput';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, Form, Typography } from 'antd';
import { Suspense, useMemo, useState } from 'react';
import { RelayEnvironmentProvider } from 'react-relay';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';

/**
 * BAIVFolderMountConfigInput composes BAIVFolderSelect, which fires dual
 * GraphQL queries (ValueQuery + PaginatedQuery) and re-fetches on selection.
 * Queue enough resolvers to satisfy multiple operations during interaction.
 */
const VFolderRelayResolver = ({
  children,
  mockResolvers = {},
}: RelayResolverProps) => {
  // Memoize so toggling a Storybook control (disabled, aliasBasePath, …) does
  // not recreate the environment and reset the Relay store (Suspense re-flash).
  const environment = useMemo(() => {
    const env = createMockEnvironment();
    for (let i = 0; i < 20; i++) {
      env.mock.queueOperationResolver((operation) =>
        MockPayloadGenerator.generate(operation, mockResolvers),
      );
    }
    return env;
  }, [mockResolvers]);
  return (
    <RelayEnvironmentProvider environment={environment}>
      <Suspense fallback="Loading...">{children}</Suspense>
    </RelayEnvironmentProvider>
  );
};

const sampleVFolders = [
  { name: 'my-project-data', row_id: 'abcd1234-5678-90ef-1234-567890abcdef' },
  { name: 'shared-datasets', row_id: 'wxyz9876-5432-10ab-cdef-001122334455' },
  { name: 'model-checkpoints', row_id: 'aaaa1111-2222-3333-4444-555566667777' },
  { name: 'training-logs', row_id: 'bbbb2222-3333-4444-5555-666677778888' },
].map((folder) => ({
  // The component runs BAIVFolderSelect in `row_id` mode, so `row_id` is the
  // value used everywhere; `id` only needs to satisfy the query shape.
  node: {
    id: `vfolder-node-${folder.row_id}`,
    name: folder.name,
    row_id: folder.row_id,
  },
}));

const sampleQueryResolvers = {
  Query: () => ({
    vfolder_nodes: {
      count: sampleVFolders.length,
      edges: sampleVFolders,
    },
  }),
};

/**
 * Controlled wrapper that renders the component and prints the current
 * form value as text, so the emitted `VFolderMountConfigValue[]` is visible
 * while selecting folders and editing alias / subpath. `mountDestination` is
 * stored as the raw alias; the resolved full path is shown inline per row.
 */
const ControlledDemo = ({
  initialValue = [],
  ...props
}: BAIVFolderMountConfigInputProps & {
  initialValue?: VFolderMountConfigValue[];
}) => {
  const [value, setValue] = useState<VFolderMountConfigValue[]>(initialValue);
  return (
    <div style={{ width: 680 }}>
      <BAIVFolderMountConfigInput
        {...props}
        value={value}
        onChange={setValue}
      />
      <Typography.Paragraph style={{ marginTop: 24 }}>
        <Typography.Text strong>Form value (onChange result)</Typography.Text>
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
      </Typography.Paragraph>
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
  optional **subpath** input (which subfolder of the vfolder to mount as the source; empty = root).
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
      <VFolderRelayResolver mockResolvers={sampleQueryResolvers}>
        <Story />
      </VFolderRelayResolver>
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
 * each row's mount path and subpath. The live form value is shown below.
 */
export const Interactive: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Empty initial state. Select folders from the dropdown to add rows, then edit each row's mount path and subpath. The live form value is shown below — note `mountDestination` holds the raw alias you typed.",
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
          'Prefilled with three folders demonstrating each alias mode: a relative segment (`data` → `/home/work/data`), an absolute path (`/mnt/shared`, used as-is), and an empty alias (falls back to `/home/work/<name>`). The first also mounts a subpath.',
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
          <Button
            type="primary"
            onClick={() => {
              form
                .validateFields()
                .then(() => setResult('✅ Valid — form submitted.'))
                .catch(() => setResult('❌ Invalid — fix the flagged rows.'));
            }}
          >
            Validate &amp; submit
          </Button>
          {result ? (
            <Typography.Paragraph style={{ marginTop: 16 }}>
              {result}
            </Typography.Paragraph>
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
        story: 'Disabled state — selection and all row inputs are read-only.',
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
