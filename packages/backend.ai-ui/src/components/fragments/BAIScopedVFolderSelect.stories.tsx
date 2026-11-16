import {
  mountableVFolderFilter,
  notDeletedVFolderFilter,
} from '../../hooks/useMountableVFolders';
import MockVFolderFileProviders from '../../tests/MockVFolderFileProviders';
import {
  MOCK_MOUNT_SCOPE,
  MOCK_MOUNTABLE_HOSTS,
  MOCK_PROJECT_ID,
  mockMountFolder,
  mockMountFolders,
  type MockMountFolder,
} from '../../tests/mockVFolderFileTree';
import BAIButton from '../BAIButton';
import BAIFlex from '../BAIFlex';
import BAIText from '../BAIText';
import BAIScopedVFolderSelect, {
  type BAIScopedVFolderSelectRef,
  type ScopedVFolderResolution,
} from './BAIScopedVFolderSelect';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ComponentProps, useRef, useState } from 'react';
import { action } from 'storybook/actions';

const DEMO_WIDTH = 420;

// One folder per mount level and a model folder, newest first as the server
// orders them, ahead of the shared mount fixture.
const storyFolders: Array<MockMountFolder> = [
  mockMountFolder({
    id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeffff0014',
    name: 'llama-checkpoint',
    usageMode: 'MODEL',
    createdAt: '2026-08-05T09:00:00+00:00',
  }),
  mockMountFolder({
    id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeffff0013',
    name: 'invited-no-mount',
    permission: 'NONE',
    createdAt: '2026-08-04T09:00:00+00:00',
  }),
  mockMountFolder({
    id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeffff0012',
    name: 'team-scratch',
    permission: 'READ_WRITE',
    ownershipType: 'GROUP',
    projectId: MOCK_PROJECT_ID,
    creatorEmail: 'teammate@lablup.com',
    createdAt: '2026-08-03T09:00:00+00:00',
  }),
  mockMountFolder({
    id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeffff0011',
    name: 'read-only-reference',
    permission: 'READ_ONLY',
    createdAt: '2026-08-02T09:00:00+00:00',
  }),
  ...mockMountFolders,
];

// More than two pages of 20, so scrolling the list loads the next page.
const manyFolders: Array<MockMountFolder> = Array.from(
  { length: 45 },
  (_unused, index) => {
    const n = 45 - index;
    return mockMountFolder({
      id: `bbbbbbbb-0000-4000-8000-${String(n).padStart(12, '0')}`,
      name: `experiment-${String(n).padStart(2, '0')}`,
      createdAt: `2026-09-${String(Math.ceil(n / 2)).padStart(2, '0')}T09:00:00+00:00`,
    });
  },
);

const folderByName = (name: string) => {
  const folder = storyFolders.find((candidate) => candidate.name === name);
  if (!folder) {
    throw new globalThis.Error(`No story folder named "${name}"`);
  }
  return folder;
};

const mountFilter = mountableVFolderFilter(MOCK_MOUNTABLE_HOSTS);

type SandboxProps = Omit<
  ComponentProps<typeof BAIScopedVFolderSelect>,
  'value' | 'onChange' | 'onResolve' | 'ref' | 'scope'
> & {
  scope?: ComponentProps<typeof BAIScopedVFolderSelect>['scope'];
  initialValue?: string | Array<string> | null;
  folders?: Array<MockMountFolder>;
};

/** Holds the value and prints it with the latest `onResolve` outcome. */
const Sandbox: React.FC<SandboxProps> = ({
  scope = MOCK_MOUNT_SCOPE,
  initialValue = null,
  folders = storyFolders,
  ...args
}) => {
  'use memo';
  const [value, setValue] = useState<string | Array<string> | null>(
    initialValue,
  );
  const [resolution, setResolution] = useState<ScopedVFolderResolution>();
  const selectRef = useRef<BAIScopedVFolderSelectRef>(null);
  return (
    <MockVFolderFileProviders folders={folders} suspenseFallback="Loading...">
      <BAIFlex direction="column" align="start" gap="md">
        <BAIScopedVFolderSelect
          width={DEMO_WIDTH}
          {...args}
          ref={selectRef}
          scope={scope}
          value={value}
          onChange={(next, option) => {
            setValue(next ?? null);
            action('onChange')(next, option);
          }}
          onResolve={(next) => {
            setResolution(next);
            action('onResolve')(next);
          }}
        />
        <BAIButton onClick={() => selectRef.current?.refetch()}>
          Refetch via ref
        </BAIButton>
        <BAIFlex direction="column" align="start" gap="xxs">
          <BAIText type="secondary" code>
            value: {JSON.stringify(value)}
          </BAIText>
          <BAIText type="secondary" code>
            resolved:{' '}
            {JSON.stringify(
              resolution?.resolved.map((folder) => folder.name) ?? [],
            )}
          </BAIText>
          <BAIText type="secondary" code>
            unresolved: {JSON.stringify(resolution?.unresolved ?? [])}
          </BAIText>
        </BAIFlex>
      </BAIFlex>
    </MockVFolderFileProviders>
  );
};

/**
 * Stories for the vfolder picker over `scopedVFoldersV2`, answered from an
 * in-memory folder list (`MockVFolderFileProviders`).
 */
const meta: Meta<typeof BAIScopedVFolderSelect> = {
  title: 'Fragments/BAIScopedVFolderSelect',
  component: BAIScopedVFolderSelect,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**BAIScopedVFolderSelect** — the virtual folder picker, built on \`BAIComplexSelect\` and paged through \`scopedVFoldersV2\` (manager 26.9.0; the selected-value lookup filters on \`VFolderFilter.entityId\`, which needs manager 26.10.0).

- \`scope\` (required): the \`VFolderScope\` input (\`user\`, \`project\`, \`domain\` lists, ORed). A scope whose lists are all empty reads nothing.
- \`filter\`: ANDed onto the options **and** the lookup of selected ids; a selected folder outside it is reported unresolved.
- \`optionFilter\`: ANDed onto the options only; a selected folder it hides stays selected and resolved.
- \`disableUnmountable\`: lists a folder whose mount level is \`NONE\` as disabled and reports a matching selection unresolved.
- \`fallbackLabels\` / \`onResolve\`: name an id the scope no longer reaches, and learn which selected ids are still reachable.
- The value is folder UUIDs (\`VFolder.entityId\`). The selected-value lookup suspends on first load, so the caller owns the Suspense boundary.

The options are read only once the popup opens, so click a select to see its list. The lines under each select show the value and the last \`onResolve\` outcome.
        `,
      },
    },
  },
  argTypes: {
    value: { control: false },
    onChange: { control: false },
    onResolve: { control: false },
    scope: { control: false },
    filter: { control: false },
    optionFilter: { control: false },
    fallbackLabels: { control: false },
    multiple: { control: { type: 'boolean' } },
    disableUnmountable: { control: { type: 'boolean' } },
  },
};

export default meta;

type Story = StoryObj<typeof BAIScopedVFolderSelect>;

export const Default: Story = {
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story:
          "The user folders and the current project's folders, newest first. Each option shows the creator, usage mode, host and creation date, and the caller's mount level as R/W/D tokens. `other-team-data` belongs to another project, so the scope leaves it out.",
      },
    },
  },
  render: (args) => <Sandbox {...args} label="Folder" />,
};

export const SessionMountFolders: Story = {
  name: 'Session mount folders',
  args: { multiple: true, disableUnmountable: true },
  parameters: {
    docs: {
      description: {
        story:
          'Folders a session may mount: `filter` keeps folders on hosts that grant `mount-in-session` (so `cold-archive` is gone), `optionFilter` hides dotfile folders and folders that are not ready, and `disableUnmountable` lists `invited-no-mount` disabled with the reason.',
      },
    },
  },
  render: (args) => (
    <Sandbox
      {...args}
      label="Folders"
      filter={mountFilter}
      optionFilter={{
        AND: [
          { status: { equals: 'READY' } },
          { name: { notStartsWith: '.' } },
        ],
      }}
    />
  ),
};

export const Multiple: Story = {
  name: 'Multiple Select',
  args: { multiple: true },
  parameters: {
    docs: {
      description: {
        story:
          'Multi-selection: the value is an array of folder UUIDs, and the selected ids are labelled by the value lookup before the popup is opened.',
      },
    },
  },
  render: (args) => (
    <Sandbox
      {...args}
      label="Folders"
      initialValue={[
        folderByName('my-project-data').id,
        folderByName('shared-datasets').id,
      ]}
    />
  ),
};

export const ModelFolder: Story = {
  name: 'Model folder',
  parameters: {
    docs: {
      description: {
        story:
          'A single model folder, as the deployment form picks it: `filter` leaves out deleted folders and keeps `usageMode: MODEL`.',
      },
    },
  },
  render: (args) => (
    <Sandbox
      {...args}
      label="Model folder"
      filter={{
        AND: [notDeletedVFolderFilter, { usageMode: { equals: 'MODEL' } }],
      }}
    />
  ),
};

export const HiddenSelection: Story = {
  name: 'Selection hidden by optionFilter',
  args: { multiple: true },
  parameters: {
    docs: {
      description: {
        story:
          '`.config` is selected but `optionFilter` keeps dotfile folders out of the list. The lookup still finds it within `filter`, so it keeps its name and is reported resolved.',
      },
    },
  },
  render: (args) => (
    <Sandbox
      {...args}
      label="Folders"
      filter={mountFilter}
      optionFilter={{ name: { notStartsWith: '.' } }}
      initialValue={[folderByName('.config').id]}
    />
  ),
};

export const UnresolvedSelection: Story = {
  name: 'Unresolved selection',
  args: { multiple: true, disableUnmountable: true },
  parameters: {
    docs: {
      description: {
        story:
          '`cold-archive` is on a host `filter` rejects and `invited-no-mount` fails `disableUnmountable`, so both are reported unresolved while `my-project-data` resolves. `fallbackLabels` keeps `cold-archive` from showing as a bare UUID; `invited-no-mount` is still found by the lookup, so it keeps its own name.',
      },
    },
  },
  render: (args) => (
    <Sandbox
      {...args}
      label="Folders"
      filter={mountFilter}
      initialValue={[
        folderByName('my-project-data').id,
        folderByName('cold-archive').id,
        folderByName('invited-no-mount').id,
      ]}
      fallbackLabels={{
        [folderByName('cold-archive').id]: 'cold-archive (stored)',
        [folderByName('invited-no-mount').id]: 'invited-no-mount (stored)',
      }}
    />
  ),
};

export const Paging: Story = {
  name: 'Paging and search',
  parameters: {
    docs: {
      description: {
        story:
          '45 folders, read 20 at a time: scrolling to the end of the list loads the next page. Typing in the search box filters on the server by name (`iContains`), e.g. `experiment-4`.',
      },
    },
  },
  render: (args) => <Sandbox {...args} label="Folder" folders={manyFolders} />,
};

export const NoScope: Story = {
  name: 'No scope yet',
  parameters: {
    docs: {
      description: {
        story:
          'A caller without a range yet passes empty scope lists and disables the select; nothing is read.',
      },
    },
  },
  render: (args) => (
    <Sandbox {...args} label="Folder" scope={{ project: [] }} isDisabled />
  ),
};

export const Empty: Story = {
  name: 'EmptyState',
  parameters: {
    docs: {
      description: {
        story:
          'No folder matches — opening the popup shows the shared empty-state text.',
      },
    },
  },
  render: (args) => <Sandbox {...args} label="Folder" folders={[]} />,
};

export const Loading: Story = {
  name: 'LoadingState',
  parameters: {
    docs: {
      description: {
        story:
          'Caller-side `isLoading`, which spins the trigger the same way the internal search debounce and refetch states do.',
      },
    },
  },
  render: (args) => <Sandbox {...args} label="Folder" isLoading isDisabled />,
};

export const Error: Story = {
  name: 'ErrorState',
  parameters: {
    docs: {
      description: {
        story:
          "The select's own `status`: a red border and the message under the control, for a caller that validates the pick itself. Inside a Form.Item the item shows its rule message instead.",
      },
    },
  },
  render: (args) => (
    <Sandbox
      {...args}
      label="Folder"
      status={{ type: 'error', message: 'Please select a folder.' }}
    />
  ),
};
