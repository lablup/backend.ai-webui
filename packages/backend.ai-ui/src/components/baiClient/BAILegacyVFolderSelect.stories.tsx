import MockVFolderFileProviders from '../../tests/MockVFolderFileProviders';
import { mockLegacyVFolder } from '../../tests/mockVFolderFileTree';
import BAIFlex from '../BAIFlex';
import BAIText from '../BAIText';
import BAILegacyVFolderSelect from './BAILegacyVFolderSelect';
import type { Meta, StoryObj } from '@storybook/react-vite';
import * as _ from 'lodash-es';
import { useState } from 'react';

const DEMO_WIDTH = 520;
const PROJECT_ID = '99999999-9999-9999-9999-999999999999';
const OTHER_PROJECT_ID = '88888888-8888-8888-8888-888888888888';

// Only `local:volume1` grants `mount-in-session`, so `archive:cold` folders
// are dropped by the host gate even though the REST list returns them.
const ALLOWED_VFOLDER_HOSTS = {
  'local:volume1': ['mount-in-session', 'upload-file', 'download-file'],
  'archive:cold': ['upload-file', 'download-file'],
};

const REST_FOLDERS = [
  mockLegacyVFolder({
    id: 'aaaaaaaabbbbccccddddeeeeffff0001',
    name: 'my-project-data',
  }),
  mockLegacyVFolder({
    id: 'aaaaaaaabbbbccccddddeeeeffff0002',
    name: 'shared-datasets',
    ownership_type: 'group',
    type: 'group',
    group: PROJECT_ID,
    group_name: 'default',
  }),
  // Dotfile folder: reported through `onAutoMountedFoldersChange`, and hidden
  // from the option list by the story's `filter`.
  mockLegacyVFolder({
    id: 'aaaaaaaabbbbccccddddeeeeffff0003',
    name: '.local',
  }),
  // Host without `mount-in-session` — gated out.
  mockLegacyVFolder({
    id: 'aaaaaaaabbbbccccddddeeeeffff0004',
    name: 'cold-archive',
    host: 'archive:cold',
  }),
  // Owned by another project — dropped by the accessibility filter.
  mockLegacyVFolder({
    id: 'aaaaaaaabbbbccccddddeeeeffff0005',
    name: 'other-team-data',
    ownership_type: 'group',
    type: 'group',
    group: OTHER_PROJECT_ID,
    group_name: 'other-team',
  }),
];

const meta: Meta<typeof BAILegacyVFolderSelect> = {
  title: 'Input/BAILegacyVFolderSelect',
  component: BAILegacyVFolderSelect,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**BAILegacyVFolderSelect** picks folders from the REST \`GET /folders\` list instead of the \`vfolder_nodes\` connection, because the session launcher's mount gates cannot be expressed as a GraphQL filter:

- **Host gate** — a folder is offered only when its host carries \`mount-in-session\` in the merged \`allowed_vfolder_hosts\` of the domain, the current project and the keypair resource policy.
- **Project accessibility** — a user-owned folder, a folder with no group, or one owned by \`currentProjectId\`.
- **Display filter** — \`filter\` hides rows without shrinking the selection; an already-selected folder stays visible.

The value is the REST \`id\` (32 hex characters, no dashes) — run it through \`convertToUUID\` before handing it to anything typed as a UUID. Reach for [BAIVFolderSelect](/?path=/docs/fragments-baivfolderselect--docs) for every other folder field.

The mock list below has five folders; two of them are dropped by the gates, and \`.local\` is reported as auto-mounted instead of being listed.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BAILegacyVFolderSelect>;

const ControlledDemo = ({
  hideDotfiles = false,
}: {
  hideDotfiles?: boolean;
}) => {
  const [value, setValue] = useState<Array<string>>([]);
  const [autoMounted, setAutoMounted] = useState<Array<string>>([]);
  const [names, setNames] = useState<Record<string, string>>({});

  return (
    <BAIFlex
      direction="column"
      align="stretch"
      gap="sm"
      style={{ width: DEMO_WIDTH }}
    >
      <BAILegacyVFolderSelect
        multiple
        label="Folders to mount"
        currentProjectId={PROJECT_ID}
        filter={
          hideDotfiles ? (folder) => !folder.name.startsWith('.') : undefined
        }
        onAutoMountedFoldersChange={setAutoMounted}
        onResolvedNamesChange={setNames}
        value={value}
        onChange={(next) => setValue(_.castArray(next ?? []))}
      />
      <BAIText type="secondary">
        Selected keys: {value.length ? value.join(', ') : '(none)'}
      </BAIText>
      <BAIText type="secondary">
        Auto-mounted: {autoMounted.length ? autoMounted.join(', ') : '(none)'}
      </BAIText>
      <BAIText type="secondary">
        Resolved names: {Object.values(names).join(', ') || '(none)'}
      </BAIText>
    </BAIFlex>
  );
};

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The gates at work. `cold-archive` sits on `archive:cold`, whose permissions omit `mount-in-session`, and `other-team-data` belongs to another project — neither appears. `.local` is listed as an option here because no `filter` is set, and is also reported through `onAutoMountedFoldersChange`.',
      },
    },
  },
  render: () => (
    <MockVFolderFileProviders
      vfolders={[]}
      trees={{}}
      folders={REST_FOLDERS}
      allowedVFolderHosts={ALLOWED_VFOLDER_HOSTS}
      suspenseFallback="Loading..."
    >
      <ControlledDemo />
    </MockVFolderFileProviders>
  ),
};

export const HidingAutoMountedFolders: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The same list with `filter={(folder) => !folder.name.startsWith(".")}`. `.local` drops out of the options but is still reported as auto-mounted, which is exactly what a mount field wants: the user cannot pick it, and the caller can still warn about an alias colliding with it.',
      },
    },
  },
  render: () => (
    <MockVFolderFileProviders
      vfolders={[]}
      trees={{}}
      folders={REST_FOLDERS}
      allowedVFolderHosts={ALLOWED_VFOLDER_HOSTS}
      suspenseFallback="Loading..."
    >
      <ControlledDemo hideDotfiles />
    </MockVFolderFileProviders>
  ),
};

export const NoMountableHost: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'No host grants `mount-in-session`, so every folder is gated out and the popup shows the empty state — the case a launcher has to surface rather than letting the user pick a folder the session cannot mount.',
      },
    },
  },
  render: () => (
    <MockVFolderFileProviders
      vfolders={[]}
      trees={{}}
      folders={REST_FOLDERS}
      allowedVFolderHosts={{ 'local:volume1': ['upload-file'] }}
      suspenseFallback="Loading..."
    >
      <ControlledDemo />
    </MockVFolderFileProviders>
  ),
};
