import { Form } from '../../form-engine';
import { convertToUUID } from '../../helper';
import MockVFolderFileProviders from '../../tests/MockVFolderFileProviders';
import {
  MOCK_LEGACY_PROJECT_ID,
  MOCK_MOUNTABLE_HOSTS,
  mockLegacyVFolder,
  mockLegacyVFolders,
  mockVFolderFile as entry,
  type MockVFolderFileTrees,
} from '../../tests/mockVFolderFileTree';
import BAIButton from '../BAIButton';
import BAIText from '../BAIText';
import BAIVFolderMountConfigInput, {
  BAIVFolderMountConfigInputProps,
  VFolderMountConfigValue,
  useVFolderMountConfigFormRule,
} from './BAIVFolderMountConfigInput';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

const DEMO_WIDTH = 760;

// The shared REST fixture exercises every gate the select applies; a third
// mountable folder is added here so the alias modes fit on one screen.
const legacyFolders = [
  ...mockLegacyVFolders,
  mockLegacyVFolder({
    id: 'aaaaaaaabbbbccccddddeeeeffff0006',
    name: 'model-checkpoints',
  }),
];

// The REST fixture keys folders by the 32-hex `id`; the select emits the
// dashed UUID, which is what the row's path picker browses by.
const folderId = (index: number) => convertToUUID(legacyFolders[index].id);
const folderName = (index: number) => legacyFolders[index].name;

// Directory trees keyed by vfolder UUID, then by the path notation
// `useSearchVFolderFiles` uses ('.' = root, 'a/b' below it), so every row's
// subpath picker browses a real tree.
const createTrees = (): MockVFolderFileTrees => ({
  [folderId(0)]: {
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
  [folderId(1)]: {
    '.': [
      entry('imagenet', 'DIRECTORY', '2026-07-10T08:00:00'),
      entry('LICENSE', 'FILE', '2026-07-02T12:00:00'),
    ],
    imagenet: [],
  },
  [folderId(5)]: {
    '.': [entry('epoch-001', 'DIRECTORY', '2026-07-27T03:12:00')],
    'epoch-001': [],
  },
});

/**
 * Controlled wrapper that renders the component the way the session launcher
 * does — scoped to a project, with the host-supplied mount gates — and prints
 * the current form value as text, so the emitted `VFolderMountConfigValue[]`
 * is visible while selecting folders and picking aliases / subpaths.
 * `mountDestination` is stored as the raw alias; the resolved full path is
 * shown inline per row.
 */
const ControlledDemo = ({
  initialValue = [],
  ...props
}: Partial<BAIVFolderMountConfigInputProps> & {
  initialValue?: VFolderMountConfigValue[];
}) => {
  const [value, setValue] = useState<VFolderMountConfigValue[]>(initialValue);
  return (
    <div style={{ width: DEMO_WIDTH }}>
      <BAIVFolderMountConfigInput
        currentProjectId={MOCK_LEGACY_PROJECT_ID}
        mountableHosts={MOCK_MOUNTABLE_HOSTS}
        {...props}
        value={value}
        onChange={(next) => {
          setValue(next);
          props.onChange?.(next);
        }}
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

// Two folders aliased to the same `shared` segment, so both resolve to
// `/home/work/shared` and are flagged as overlapping.
const overlappingSharedAliases: VFolderMountConfigValue[] = [
  {
    vfolderId: folderId(0),
    name: folderName(0),
    mountDestination: 'shared',
    subpath: '',
  },
  {
    vfolderId: folderId(1),
    name: folderName(1),
    mountDestination: 'shared',
    subpath: '',
  },
];

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

- Picks folders from the REST \`GET /folders\` list rather than the \`vfolder_nodes\`
  connection, because the session launcher's mount gates cannot be expressed as a
  GraphQL filter: the host must be in \`mountableHosts\` (those granting
  \`mount-in-session\`), the folder must be reachable from \`currentProjectId\`, and
  names in \`autoMountedFolderNames\` are dropped — the session mounts them anyway.
  \`filter\` hides rows on top of that without shrinking the selection.
- It **suspends** on that list, so the consumer owns the Suspense boundary. An entry
  the mount gates reject is dropped from the value with a warning toast; one that
  merely became auto-mounted is kept, since it is mounted anyway.
- Each selected folder appears as a row with a **mount path (alias)** input and an
  optional **subpath** picker (which subfolder of the vfolder to mount as the source; \`/\` = root),
  which opens a directory browser instead of accepting typed text.
- \`mountDestination\` stores the **raw alias** the user typed — \`''\` mounts at the default
  \`/home/work/<name>\`, a relative segment like \`data\` resolves to \`/home/work/data\`, and an
  absolute path like \`/data\` is used as-is. Resolve it with the exported \`inputToMountDestination\`.
- \`autoMountedFolderNames\` drop out of the offered folder options, join the overlap check (a user
  alias colliding with an auto-mounted folder is flagged) and are shown as read-only tags at the bottom.
- Emits a single \`VFolderMountConfigValue[]\`. The inline per-row errors are advisory UX; to gate a
  form, wrap the component in one named \`Form.Item\` whose \`rules\` carry
  \`useVFolderMountConfigFormRule\` (see the **WithFormValidation** story).

The stories below mock the REST folder list behind the providers' \`suspenseFallback\`,
so of the six fixture folders \`cold-archive\` is dropped (its host is not in
\`mountableHosts\`), \`other-team-data\` belongs to another project, and \`.config\` is
dropped in the **WithAutoMountedFolders** story.
`,
      },
    },
  },
  decorators: [
    (Story) => (
      <MockVFolderFileProviders
        folders={legacyFolders}
        trees={createTrees}
        suspenseFallback="Loading..."
      >
        <Story />
      </MockVFolderFileProviders>
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
    ownerEmail: {
      control: { type: 'text' },
      description: "Lists this user's folders instead of the caller's own",
      table: { type: { summary: 'string' } },
    },
    filter: {
      control: false,
      description: 'Display-only folder filter, applied after the mount gates',
      table: { type: { summary: '(folder: LegacyVFolder) => boolean' } },
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
        'Names of auto-mounted folders: dropped from the offered folder options, folded into the overlap check and shown as read-only tags',
      table: { type: { summary: 'string[]' } },
    },
    mountableHosts: {
      control: { type: 'object' },
      description:
        'Hosts granting `mount-in-session`, supplied by the host app',
      table: { type: { summary: 'string[]' } },
    },
  },
  args: {
    mountableHosts: MOCK_MOUNTABLE_HOSTS,
    autoMountedFolderNames: [],
  },
};

export default meta;
type Story = StoryObj<typeof BAIVFolderMountConfigInput>;

export const Interactive: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Empty initial state. The dropdown offers only the mountable folders of the current project. Select one to add a row, then type its mount path and click its subpath field to browse the folder. New rows start at the folder root, shown as `/`. The live form value is shown below — note `mountDestination` holds the raw alias you typed, while `subpath` only ever comes from the picker.',
      },
    },
  },
  render: (args) => <ControlledDemo {...args} />,
};

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
          vfolderId: folderId(0),
          name: folderName(0),
          mountDestination: 'data',
          subpath: 'dataset/train',
        },
        {
          vfolderId: folderId(1),
          name: folderName(1),
          mountDestination: '/mnt/shared',
          subpath: '',
        },
        {
          vfolderId: folderId(5),
          name: folderName(5),
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
          'Two folders use the same alias (`shared`), so both resolve to `/home/work/shared` and are flagged with the overlap error. The third row types an alias the format check rejects. `isVFolderMountConfigValid` returns `false` for this value.',
      },
    },
  },
  render: (args) => (
    <ControlledDemo
      {...args}
      initialValue={[
        ...overlappingSharedAliases,
        {
          vfolderId: folderId(5),
          name: folderName(5),
          mountDestination: 'bad path!',
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
  args: {
    autoMountedFolderNames: ['.config'],
  },
  parameters: {
    docs: {
      description: {
        story:
          "`autoMountedFolderNames={['.config']}` drops that folder from the select and renders it as a read-only tag below the rows. The first folder aliases to `.config`, colliding with the auto-mounted `/home/work/.config`, so it shows the overlap error.",
      },
    },
  },
  render: (args) => (
    <ControlledDemo
      {...args}
      initialValue={[
        {
          vfolderId: folderId(0),
          name: folderName(0),
          mountDestination: '.config',
          subpath: 'dataset',
        },
        {
          vfolderId: folderId(5),
          name: folderName(5),
          mountDestination: 'checkpoints',
          subpath: '',
        },
      ]}
    />
  ),
};

/**
 * Demonstrates the recommended form-gate pattern: a single named `Form.Item`
 * wrapping the component, with `useVFolderMountConfigFormRule` in `rules` so
 * `form.validateFields()` rejects on invalid input.
 */
export const WithFormValidation: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The component is wrapped in one named `Form.Item` whose `rules` carry `useVFolderMountConfigFormRule`, so submitting with the two colliding `shared` aliases fails validation with the already-translated message. Fix the aliases and submit again to pass.',
      },
    },
  },
  render: (args) => {
    const FormValidationDemo = () => {
      const [form] = Form.useForm();
      const [result, setResult] = useState<string>('');
      const mountConfigRule = useVFolderMountConfigFormRule({
        aliasBasePath: args.aliasBasePath,
        autoMountedFolderNames: args.autoMountedFolderNames,
      });
      return (
        <Form
          form={form}
          layout="vertical"
          style={{ width: DEMO_WIDTH }}
          initialValues={{ mounts: overlappingSharedAliases }}
        >
          <Form.Item
            name="mounts"
            label="VFolder mounts"
            rules={[mountConfigRule]}
          >
            <BAIVFolderMountConfigInput
              currentProjectId={MOCK_LEGACY_PROJECT_ID}
              {...args}
            />
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

export const NoMountableHost: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`mountableHosts={[]}` — no host grants `mount-in-session`, so every folder is gated out and the popup shows the empty state. This is the case a launcher has to surface rather than letting the user pick a folder the session cannot mount.',
      },
    },
  },
  render: (args) => <ControlledDemo {...args} mountableHosts={[]} />,
};

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
          vfolderId: folderId(1),
          name: folderName(1),
          mountDestination: 'shared',
          subpath: '',
        },
      ]}
    />
  ),
};
