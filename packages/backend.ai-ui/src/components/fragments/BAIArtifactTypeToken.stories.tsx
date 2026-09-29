import { BAIArtifactTypeTokenStoriesQuery } from '../../__generated__/BAIArtifactTypeTokenStoriesQuery.graphql';
import RelayResolver from '../../tests/RelayResolver';
import BAIFlex from '../BAIFlex';
import BAIArtifactTypeToken from './BAIArtifactTypeToken';
import { Meta, StoryObj } from '@storybook/react-vite';
import { graphql, useLazyLoadQuery } from 'react-relay';

/**
 * BAIArtifactTypeToken displays the type of an artifact with an icon.
 *
 * Key features:
 * - Displays artifact type (MODEL, PACKAGE, IMAGE) with colored icons
 * - Uses lucide-react icons (Brain, Package, Container)
 * - Consumes Relay fragment for data
 *
 * @see BAIArtifactTypeToken.tsx for implementation details
 */
const meta: Meta<typeof BAIArtifactTypeToken> = {
  title: 'Fragments/BAIArtifactTypeToken',
  component: BAIArtifactTypeToken,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**BAIArtifactTypeToken** displays the type of an artifact with a visual icon.

## Features
- Displays artifact type as a Token with icon
- Three types: MODEL (Brain icon), PACKAGE (Package icon), IMAGE (Container icon)
- Color-coded icons: MODEL (blue), PACKAGE (green), IMAGE (orange)
- Uses Relay fragment for data fetching

## Usage
\`\`\`tsx
<BAIArtifactTypeToken artifactTypeFrgmt={artifact} />
\`\`\`

## Props
| Name | Type | Description |
|------|------|-------------|
| \`artifactTypeFrgmt\` | \`BAIArtifactTypeTokenFragment$key\` | Relay fragment reference for artifact |
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BAIArtifactTypeToken>;

const QueryResolver = () => {
  const { artifact } = useLazyLoadQuery<BAIArtifactTypeTokenStoriesQuery>(
    graphql`
      query BAIArtifactTypeTokenStoriesQuery {
        artifact(id: "test-id") {
          ...BAIArtifactTypeTokenFragment
        }
      }
    `,
    {},
  );
  return artifact && <BAIArtifactTypeToken artifactTypeFrgmt={artifact} />;
};

/**
 * Default story showing MODEL type.
 */
export const Default: Story = {
  name: 'Model',
  parameters: {
    docs: {
      description: {
        story: 'Displays an artifact with MODEL type (Brain icon, blue color).',
      },
    },
  },
  render: () => {
    return (
      <RelayResolver
        mockResolvers={{
          Artifact: () => ({ type: 'MODEL' }),
        }}
      >
        <QueryResolver />
      </RelayResolver>
    );
  },
};

/**
 * Story showing PACKAGE type.
 */
export const Package: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Displays an artifact with PACKAGE type (Package icon, green color).',
      },
    },
  },
  render: () => {
    return (
      <RelayResolver
        mockResolvers={{
          Artifact: () => ({ type: 'PACKAGE' }),
        }}
      >
        <QueryResolver />
      </RelayResolver>
    );
  },
};

/**
 * Story showing IMAGE type.
 */
export const Image: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Displays an artifact with IMAGE type (Container icon, orange color).',
      },
    },
  },
  render: () => {
    return (
      <RelayResolver
        mockResolvers={{
          Artifact: () => ({ type: 'IMAGE' }),
        }}
      >
        <QueryResolver />
      </RelayResolver>
    );
  },
};

/**
 * Story showing all type variants together.
 */
export const AllTypes: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Displays all available artifact type variants with their respective icons and colors.',
      },
    },
  },
  render: () => {
    const types = ['MODEL', 'PACKAGE', 'IMAGE'] as const;

    return (
      <BAIFlex direction="column" gap="md">
        {types.map((type) => (
          <RelayResolver
            key={type}
            mockResolvers={{
              Artifact: () => ({ type }),
            }}
          >
            <QueryResolver />
          </RelayResolver>
        ))}
      </BAIFlex>
    );
  },
};
