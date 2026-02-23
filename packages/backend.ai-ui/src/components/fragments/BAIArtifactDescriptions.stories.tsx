import { BAIArtifactDescriptionsStoriesQuery } from '../../__generated__/BAIArtifactDescriptionsStoriesQuery.graphql';
import RelayResolver from '../../tests/RelayResolver';
import BAIFlex from '../BAIFlex';
import BAIArtifactDescriptions from './BAIArtifactDescriptions';
import { Meta, StoryObj } from '@storybook/react-vite';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { MemoryRouter } from 'react-router-dom';

/**
 * BAIArtifactDescriptions displays detailed information about an artifact.
 *
 * Key features:
 * - Shows artifact name, type, source, and description
 * - Artifact type displayed with BAIArtifactTypeTag
 * - Source as clickable link
 * - Displays "N/A" for empty descriptions
 *
 * @see BAIArtifactDescriptions.tsx for implementation details
 */
const meta: Meta<typeof BAIArtifactDescriptions> = {
  title: 'Fragments/BAIArtifactDescriptions',
  component: BAIArtifactDescriptions,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**BAIArtifactDescriptions** displays detailed information about an artifact in a descriptions layout.

## Features
- Displays artifact name, type, source, and description
- Artifact type shown with colored icon tag
- Source displayed as clickable external link
- Shows "N/A" for empty descriptions
- 2-column bordered layout

## Usage
\`\`\`tsx
<BAIArtifactDescriptions artifactFrgmt={artifact} />
\`\`\`

## Props
| Name | Type | Description |
|------|------|-------------|
| \`artifactFrgmt\` | \`BAIArtifactDescriptionsFragment$key\` | Relay fragment reference for artifact |
        `,
      },
    },
  },
  argTypes: {
    artifactFrgmt: {
      control: false,
      description: 'Relay fragment reference for artifact',
    },
  },
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof BAIArtifactDescriptions>;

const QueryResolver = () => {
  const { artifact } = useLazyLoadQuery<BAIArtifactDescriptionsStoriesQuery>(
    graphql`
      query BAIArtifactDescriptionsStoriesQuery {
        artifact(id: "test-id") {
          ...BAIArtifactDescriptionsFragment
        }
      }
    `,
    {},
  );
  return artifact && <BAIArtifactDescriptions artifactFrgmt={artifact} />;
};

/**
 * Default story showing artifact with complete information.
 */
export const Default: Story = {
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story:
          'Displays an artifact with complete information including name, type, source, and description.',
      },
    },
  },
  render: () => (
    <RelayResolver
      mockResolvers={{
        Artifact: () => ({
          name: 'ResNet-50 Image Classification Model',
          type: 'MODEL',
          description:
            'Deep residual learning model for image classification with 50 layers. Pre-trained on ImageNet dataset.',
          source: {
            name: 'Hugging Face',
            url: 'https://huggingface.co/models',
          },
        }),
      }}
    >
      <QueryResolver />
    </RelayResolver>
  ),
};

/**
 * Story showing artifact without description.
 */
export const WithoutDescription: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Displays "N/A" when artifact has no description.',
      },
    },
  },
  render: () => (
    <RelayResolver
      mockResolvers={{
        Artifact: () => ({
          name: 'TensorFlow Runtime Package',
          type: 'PACKAGE',
          description: null,
          source: {
            name: 'GitHub',
            url: 'https://github.com/tensorflow/tensorflow',
          },
        }),
      }}
    >
      <QueryResolver />
    </RelayResolver>
  ),
};

/**
 * Story showing artifact with long description.
 */
export const LongDescription: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Displays an artifact with a lengthy description text.',
      },
    },
  },
  render: () => (
    <RelayResolver
      mockResolvers={{
        Artifact: () => ({
          name: 'CUDA Container Image',
          type: 'IMAGE',
          description:
            'NVIDIA CUDA is a parallel computing platform and programming model developed by NVIDIA for general computing on graphical processing units (GPUs). With CUDA, developers can dramatically speed up computing applications by harnessing the power of GPUs. This container image includes the complete CUDA toolkit, cuDNN libraries, and NCCL for multi-GPU communication. It is optimized for deep learning frameworks and high-performance computing applications.',
          source: {
            name: 'NVIDIA NGC',
            url: 'https://catalog.ngc.nvidia.com/',
          },
        }),
      }}
    >
      <QueryResolver />
    </RelayResolver>
  ),
};

/**
 * Story showing multiple artifacts with different types.
 */
export const DifferentTypes: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Displays artifacts of different types (MODEL, PACKAGE, IMAGE) to show the variety of artifact information displays.',
      },
    },
  },
  render: () => {
    const artifacts = [
      {
        name: 'BERT Base Model',
        type: 'MODEL',
        description:
          'Pre-trained BERT model for natural language understanding.',
        source: { name: 'Hugging Face', url: 'https://huggingface.co/' },
      },
      {
        name: 'PyTorch Package',
        type: 'PACKAGE',
        description: 'Machine learning framework for Python.',
        source: { name: 'PyPI', url: 'https://pypi.org/project/torch/' },
      },
      {
        name: 'Ubuntu 22.04 Base Image',
        type: 'IMAGE',
        description: 'Official Ubuntu 22.04 LTS container image.',
        source: { name: 'Docker Hub', url: 'https://hub.docker.com/' },
      },
    ];

    return (
      <BAIFlex direction="column" gap="lg">
        {artifacts.map((artifactData, index) => (
          <RelayResolver
            key={index}
            mockResolvers={{
              Artifact: () => artifactData,
            }}
          >
            <QueryResolver />
          </RelayResolver>
        ))}
      </BAIFlex>
    );
  },
};
