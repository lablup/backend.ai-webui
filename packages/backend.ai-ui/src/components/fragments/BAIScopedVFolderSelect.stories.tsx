import { mountableVFolderFilter } from '../../hooks/useMountableVFolders';
import MockVFolderFileProviders from '../../tests/MockVFolderFileProviders';
import {
  MOCK_MOUNT_SCOPE,
  MOCK_MOUNTABLE_HOSTS,
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
    projectId: MOCK_MOUNT_SCOPE.project[0].value,
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

const folderByName = (name: string) =>
  storyFolders.find((folder) => folder.name === name)!;

const mountFilter = mountableVFolderFilter(MOCK_MOUNTABLE_HOSTS);

type SandboxProps = Omit<
  ComponentProps<typeof BAIScopedVFolderSelect>,
  'value' | 'onChange' | 'scope'
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
  const [value, setValue] = useState<string | Array<string> | null>(
    initialValue,
  );
  const [resolution, setResolution] = useState<ScopedVFolderResolution>();
  const selectRef = useRef<BAIScopedVFolderSelectRef>(null);
  return (
    <MockVFolderFileProviders folders={folders} suspenseFallback="Loading...">
      <BAIFlex
        direction="column"
        align="stretch"
        gap="md"
        style={{ width: DEMO_WIDTH }}
      >
        <BAIScopedVFolderSelect
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
        <BAIFlex gap="xs">
          <BAIButton onClick={() => selectRef.current?.refetch()}>
            Refetch via ref
          </BAIButton>
        </BAIFlex>
        <BAIText type="secondary" code>
          {JSON.stringify(
            {
              value,
              resolved: resolution?.resolved.map((folder) => folder.name),
              unresolved: resolution?.unresolved,
            },
            null,
            2,
          )}
        </BAIText>
      </BAIFlex>
    </MockVFolderFileProviders>
  );
};

const meta: Meta<typeof BAIScopedVFolderSelect> = {
  title: 'Fragments/BAIScopedVFolderSelect',
  component: BAIScopedVFolderSelect,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**BAIScopedVFolderSelect** — the virtual folder picker, built on \`BAIComplexSelect\` and paged through \`scopedVFoldersV2\` (manager 26.9.0).

- \`scope\` (required): the \`VFolderScope\` input (\`user\`, \`project\`, \`domain\` lists, ORed). A scope whose lists are all empty reads nothing.
- \`filter\`: ANDed onto the options **and** the lookup of selected ids; a selected folder outside it is reported unresolved.
- \`optionFilter\`: ANDed onto the options only; a selected folder it hides stays selected and resolved.
- \`disableUnmountable\`: lists a folder whose mount level is \`NONE\` as disabled and reports a matching selection unresolved.
- \`fallbackLabels\` / \`onResolve\`: name an id the scope no longer reaches, and learn which selected ids are still reachable.
- The value is folder UUIDs (\`VFolder.entityId\`). The selected-value lookup suspends on first load, so the caller owns the Suspense boundary.

The stories answer from an in-memory folder list; the panel under each select shows the value and the last \`onResolve\` outcome.
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
  parameters: {
    docs: {
      description: {
        story:
          "The session launcher's setup: `filter` keeps folders on hosts that grant `mount-in-session` (so `cold-archive` is gone), `optionFilter` hides dotfile folders, and `disableUnmountable` lists `invited-no-mount` disabled with the reason.",
      },
    },
  },
  render: (args) => (
    <Sandbox
      {...args}
      label="Folders"
      multiple
      filter={mountFilter}
      optionFilter={{
        AND: [
          { status: { equals: 'READY' } },
          { name: { notStartsWith: '.' } },
        ],
      }}
      disableUnmountable
    />
  ),
};

export const Multiple: Story = {
  name: 'Multiple Select',
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
      multiple
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
          'A single model folder, as a deployment form picks it: `filter` narrows the folders to `usageMode: MODEL`.',
      },
    },
  },
  render: (args) => (
    <Sandbox
      {...args}
      label="Model folder"
      filter={{ AND: [mountFilter, { usageMode: { equals: 'MODEL' } }] }}
    />
  ),
};

export const HiddenSelection: Story = {
  name: 'Selection hidden by optionFilter',
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
      multiple
      filter={mountFilter}
      optionFilter={{ name: { notStartsWith: '.' } }}
      initialValue={[folderByName('.config').id]}
    />
  ),
};

export const UnresolvedSelection: Story = {
  name: 'Unresolved selection',
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
      multiple
      filter={mountFilter}
      disableUnmountable
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
  parameters: {
    docs: {
      description: {
        story:
          'No folder matches — the popup shows the shared empty-state text.',
      },
    },
  },
  render: (args) => <Sandbox {...args} label="Folder" folders={[]} />,
};

export const Loading: Story = {
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
  parameters: {
    docs: {
      description: {
        story:
          'The error status a form item sets when its `required` rule fails.',
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
