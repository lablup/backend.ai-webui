import { BAIArtifactStatusTagStoriesQuery } from '../../__generated__/BAIArtifactStatusTagStoriesQuery.graphql';
import RelayResolver from '../../tests/RelayResolver';
import BAIFlex from '../BAIFlex';
import BAIArtifactStatusTag from './BAIArtifactStatusTag';
import { Meta, StoryObj } from '@storybook/react-vite';
import { graphql, useLazyLoadQuery } from 'react-relay';

/**
 * BAIArtifactStatusTag displays the status of an artifact revision using a tag component.
 *
 * Key features:
 * - Displays artifact revision status (AVAILABLE, FAILED, NEEDS_APPROVAL, etc.)
 * - Uses BAITag for consistent styling
 * - Consumes Relay fragment for data
 *
 * @see BAIArtifactStatusTag.tsx for implementation details
 */
const meta: Meta<typeof BAIArtifactStatusTag> = {
  title: 'Fragments/BAIArtifactStatusTag',
  component: BAIArtifactStatusTag,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**BAIArtifactStatusTag** displays the status of an artifact revision.

## Features
- Displays artifact revision status as a tag
- Supports all artifact status types (AVAILABLE, FAILED, NEEDS_APPROVAL, PULLED, PULLING, REJECTED, SCANNED, VERIFYING)
- Uses Relay fragment for data fetching

## Usage
\`\`\`tsx
<BAIArtifactStatusTag artifactRevisionFrgmt={artifactRevision} />
\`\`\`

## Props
| Name | Type | Description |
|------|------|-------------|
| \`artifactRevisionFrgmt\` | \`BAIArtifactStatusTagFragment$key\` | Relay fragment reference for artifact revision |
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BAIArtifactStatusTag>;

const QueryResolver = () => {
  const { artifactRevision } =
    useLazyLoadQuery<BAIArtifactStatusTagStoriesQuery>(
      graphql`
        query BAIArtifactStatusTagStoriesQuery {
          artifactRevision(id: "test-id") {
            ...BAIArtifactStatusTagFragment
          }
        }
      `,
      {},
    );
  return (
    artifactRevision && (
      <BAIArtifactStatusTag artifactRevisionFrgmt={artifactRevision} />
    )
  );
};

/**
 * Default story showing AVAILABLE status.
 */
export const Default: Story = {
  name: 'Available',
  parameters: {
    docs: {
      description: {
        story: 'Displays an artifact revision with AVAILABLE status.',
      },
    },
  },
  render: () => {
    return (
      <RelayResolver
        mockResolvers={{
          ArtifactRevision: () => ({ status: 'AVAILABLE' }),
        }}
      >
        <QueryResolver />
      </RelayResolver>
    );
  },
};

/**
 * Story showing PULLING status.
 */
export const Pulling: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Displays an artifact revision with PULLING status.',
      },
    },
  },
  render: () => {
    return (
      <RelayResolver
        mockResolvers={{
          ArtifactRevision: () => ({ status: 'PULLING' }),
        }}
      >
        <QueryResolver />
      </RelayResolver>
    );
  },
};

/**
 * Story showing PULLED status.
 */
export const Pulled: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Displays an artifact revision with PULLED status.',
      },
    },
  },
  render: () => {
    return (
      <RelayResolver
        mockResolvers={{
          ArtifactRevision: () => ({ status: 'PULLED' }),
        }}
      >
        <QueryResolver />
      </RelayResolver>
    );
  },
};

/**
 * Story showing VERIFYING status.
 */
export const Verifying: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Displays an artifact revision with VERIFYING status.',
      },
    },
  },
  render: () => {
    return (
      <RelayResolver
        mockResolvers={{
          ArtifactRevision: () => ({ status: 'VERIFYING' }),
        }}
      >
        <QueryResolver />
      </RelayResolver>
    );
  },
};

/**
 * Story showing SCANNED status.
 */
export const Scanned: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Displays an artifact revision with SCANNED status.',
      },
    },
  },
  render: () => {
    return (
      <RelayResolver
        mockResolvers={{
          ArtifactRevision: () => ({ status: 'SCANNED' }),
        }}
      >
        <QueryResolver />
      </RelayResolver>
    );
  },
};

/**
 * Story showing NEEDS_APPROVAL status.
 */
export const NeedsApproval: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Displays an artifact revision with NEEDS_APPROVAL status.',
      },
    },
  },
  render: () => {
    return (
      <RelayResolver
        mockResolvers={{
          ArtifactRevision: () => ({ status: 'NEEDS_APPROVAL' }),
        }}
      >
        <QueryResolver />
      </RelayResolver>
    );
  },
};

/**
 * Story showing REJECTED status.
 */
export const Rejected: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Displays an artifact revision with REJECTED status.',
      },
    },
  },
  render: () => {
    return (
      <RelayResolver
        mockResolvers={{
          ArtifactRevision: () => ({ status: 'REJECTED' }),
        }}
      >
        <QueryResolver />
      </RelayResolver>
    );
  },
};

/**
 * Story showing FAILED status.
 */
export const Failed: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Displays an artifact revision with FAILED status.',
      },
    },
  },
  render: () => {
    return (
      <RelayResolver
        mockResolvers={{
          ArtifactRevision: () => ({ status: 'FAILED' }),
        }}
      >
        <QueryResolver />
      </RelayResolver>
    );
  },
};

/**
 * Story showing all status variants together.
 */
export const AllStatuses: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Displays all available artifact status variants.',
      },
    },
  },
  render: () => {
    const statuses = [
      'AVAILABLE',
      'PULLING',
      'PULLED',
      'VERIFYING',
      'SCANNED',
      'NEEDS_APPROVAL',
      'REJECTED',
      'FAILED',
    ] as const;

    return (
      <BAIFlex direction="column" gap="md">
        {statuses.map((status) => (
          <RelayResolver
            key={status}
            mockResolvers={{
              ArtifactRevision: () => ({ status }),
            }}
          >
            <QueryResolver />
          </RelayResolver>
        ))}
      </BAIFlex>
    );
  },
};
