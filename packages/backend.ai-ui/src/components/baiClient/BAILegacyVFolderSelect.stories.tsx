import MockVFolderFileProviders from '../../tests/MockVFolderFileProviders';
import {
  MOCK_LEGACY_PROJECT_ID,
  MOCK_MOUNTABLE_HOSTS,
  mockLegacyVFolders,
} from '../../tests/mockVFolderFileTree';
import type { BAILabeledValue } from '../BAIComplexSelect';
import BAIFlex from '../BAIFlex';
import BAIText from '../BAIText';
import BAILegacyVFolderSelect from './BAILegacyVFolderSelect';
import type { Meta, StoryObj } from '@storybook/react-vite';
import * as _ from 'lodash-es';
import { useState } from 'react';

const DEMO_WIDTH = 520;

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

- **Host gate** — a folder is offered only when its host is in \`mountableHosts\`, the hosts granting \`mount-in-session\`. Merging the domain / project / keypair policies into that list is the host app's business, so it arrives as a prop.
- **Project accessibility** — a user-owned folder, a folder with no group, or one owned by \`currentProjectId\`.
- **Auto-mounted folders** — names in \`autoMountedFolderNames\` are dropped from the options; the session mounts them regardless.
- **Display filter** — \`filter\` hides rows without shrinking the selection; an already-selected folder stays visible.

The value is the dashed vfolder UUID (a stored 32-hex REST id is accepted and normalized). Reach for [BAIVFolderSelect](/?path=/docs/fragments-baivfolderselect--docs) for every other folder field.

The shared mock list below has five folders; two of them are dropped by the gates, and \`.config\` is passed as auto-mounted.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BAILegacyVFolderSelect>;

const ControlledDemo = ({
  mountableHosts = MOCK_MOUNTABLE_HOSTS,
  autoMountedFolderNames,
  hideGroupFolders = false,
  initialValue = [],
}: {
  mountableHosts?: Array<string>;
  autoMountedFolderNames?: Array<string>;
  hideGroupFolders?: boolean;
  initialValue?: Array<BAILabeledValue>;
}) => {
  const [value, setValue] = useState<Array<BAILabeledValue>>(initialValue);

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
        currentProjectId={MOCK_LEGACY_PROJECT_ID}
        mountableHosts={mountableHosts}
        autoMountedFolderNames={autoMountedFolderNames}
        filter={
          hideGroupFolders
            ? (folder) => folder.ownership_type === 'user'
            : undefined
        }
        value={value}
        onChange={(next) => setValue(next ? _.castArray(next) : [])}
      />
      <BAIText type="secondary">
        Selected value: {value.length ? JSON.stringify(value) : '(none)'}
      </BAIText>
    </BAIFlex>
  );
};

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The gates at work. `cold-archive` sits on `archive:cold`, which is not in `mountableHosts`, and `other-team-data` belongs to another project — neither appears. `.config` is listed here because no `autoMountedFolderNames` is passed.',
      },
    },
  },
  render: () => (
    <MockVFolderFileProviders
      folders={mockLegacyVFolders}
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
          'The same list with `autoMountedFolderNames={[".config"]}`. `.config` drops out of the options, which is exactly what a mount field wants: the session mounts it anyway, so offering it would only invite a duplicate mount path.',
      },
    },
  },
  render: () => (
    <MockVFolderFileProviders
      folders={mockLegacyVFolders}
      suspenseFallback="Loading..."
    >
      <ControlledDemo autoMountedFolderNames={['.config']} />
    </MockVFolderFileProviders>
  ),
};

export const DisplayFilter: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A display-only `filter` keeping user-owned folders, so the project folder `shared-datasets` is hidden. Select it first (in the **Default** story it is offered) and it would stay visible — `filter` never shrinks an existing selection.',
      },
    },
  },
  render: () => (
    <MockVFolderFileProviders
      folders={mockLegacyVFolders}
      suspenseFallback="Loading..."
    >
      <ControlledDemo hideGroupFolders />
    </MockVFolderFileProviders>
  ),
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
  render: () => (
    <MockVFolderFileProviders
      folders={mockLegacyVFolders}
      suspenseFallback="Loading..."
    >
      <ControlledDemo mountableHosts={[]} />
    </MockVFolderFileProviders>
  ),
};
