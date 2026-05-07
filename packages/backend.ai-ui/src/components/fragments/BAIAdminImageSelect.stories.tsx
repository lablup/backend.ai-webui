import BAIAdminImageSelect from './BAIAdminImageSelect';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Suspense, useMemo } from 'react';
import { RelayEnvironmentProvider } from 'react-relay';
import { createMockEnvironment } from 'relay-test-utils';

// Relay global ID format: btoa('TypeName:localId')
const makeImageId = (localId: string) => btoa(`ImageV2Node:${localId}`);

type ImageMockItem = { id: string; canonicalName: string };

const sampleImages: ImageMockItem[] = [
  {
    id: makeImageId('aaaa1111-1111-1111-1111-111111111111'),
    canonicalName: 'cr.backend.ai/stable/python:3.11-cuda12.1',
  },
  {
    id: makeImageId('bbbb2222-2222-2222-2222-222222222222'),
    canonicalName: 'cr.backend.ai/stable/pytorch:2.1-cuda12.1',
  },
  {
    id: makeImageId('cccc3333-3333-3333-3333-333333333333'),
    canonicalName: 'cr.backend.ai/stable/tensorflow:2.14-cuda12.1',
  },
  {
    id: makeImageId('dddd4444-4444-4444-4444-444444444444'),
    canonicalName: 'cr.backend.ai/stable/python:3.10-cpu',
  },
  {
    id: makeImageId('eeee5555-5555-5555-5555-555555555555'),
    canonicalName: 'cr.backend.ai/stable/jupyter:7.1-cuda12.1',
  },
];

const sampleManyImages: ImageMockItem[] = Array.from(
  { length: 15 },
  (_, i) => ({
    id: makeImageId(
      `image-${String(i + 1).padStart(4, '0')}-0000-0000-0000-000000000000`,
    ),
    canonicalName: `cr.backend.ai/stable/image-${i + 1}:latest`,
  }),
);

const makeEdge = ({ id, canonicalName }: ImageMockItem) => ({
  node: { __typename: 'ImageV2Node', id, identity: { canonicalName } },
});

/**
 * Direct-response resolver that bypasses MockPayloadGenerator.
 * MockPayloadGenerator defaults to 2 items for list fields regardless of
 * the mock resolver's edges array, so we return raw GraphQL responses instead.
 *
 * Additionally dispatches per operation name so that BAIAdminImageSelectValueQuery
 * returns only the image whose local ID matches the requested $id variable.
 * Without this, the ValueQuery would always return image-1 as the first result
 * regardless of which image the user selected.
 */
const ImageRelayResolver = ({
  children,
  images,
  totalCount,
}: {
  children: React.ReactNode;
  images: ImageMockItem[];
  totalCount: number;
}) => {
  const environment = useMemo(() => {
    const env = createMockEnvironment();

    const queueResolver = () => {
      env.mock.queueOperationResolver((operation) => {
        queueResolver();

        const opName = operation.request.node.params.name;
        const vars = operation.request.variables as Record<string, unknown>;

        if (opName === 'BAIAdminImageSelectValueQuery') {
          if (vars.skipSelected) return { data: {} };

          // Filter to only the image whose local ID matches $id
          const requestedLocalId = vars.id as string;
          const match = images.find(
            ({ id }) => atob(id).split(':')[1] === requestedLocalId,
          );
          return {
            data: {
              adminImagesV2: match
                ? { count: 1, edges: [makeEdge(match)] }
                : { count: 0, edges: [] },
            },
          };
        }

        // BAIAdminImageSelectPaginatedQuery — return all images
        return {
          data: {
            adminImagesV2: {
              count: totalCount,
              edges: images.map(makeEdge),
            },
          },
        };
      });
    };

    queueResolver();
    return env;
    // stable: images / totalCount are module-level constants per story
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <RelayEnvironmentProvider environment={environment}>
      <Suspense fallback="Loading...">{children}</Suspense>
    </RelayEnvironmentProvider>
  );
};

/**
 * BAIAdminImageSelect is a specialized select component for choosing admin images (ImageV2).
 *
 * Key features:
 * - Dual GraphQL queries for selected value label resolution and paginated list
 * - Search/filter functionality with debouncing
 * - Pagination support with infinite scroll
 * - Stores image UUID values for direct use in mutation inputs
 * - Skeleton loading state
 * - Exposes refetch() via ref
 *
 * @see BAIAdminImageSelect.tsx for implementation details
 */
const meta: Meta<typeof BAIAdminImageSelect> = {
  title: 'Fragments/BAIAdminImageSelect',
  component: BAIAdminImageSelect,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**BAIAdminImageSelect** is a Relay-backed select component that fetches images via \`adminImagesV2\` (ImageV2 API).

## BAI-Specific Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| \`filter\` | \`object\` | - | GraphQL filter to narrow the image list |
| \`filter.status\` | \`{ equals?: 'ALIVE' \\| 'DELETED' }\` | - | Filter by image status |
| \`filter.name\` | \`{ contains?: string }\` | - | Filter by image name (substring match) |
| \`filter.architecture\` | \`{ equals?: string }\` | - | Filter by architecture |
| \`filter.registryId\` | \`{ equals?: string }\` | - | Filter by registry ID |
| \`ref\` | \`React.Ref<BAIAdminImageSelectRef>\` | - | Ref exposing \`refetch()\` method |

## Features
- Fetches images from two GraphQL queries:
  - \`BAIAdminImageSelectValueQuery\`: Resolves label for the currently selected UUID
  - \`BAIAdminImageSelectPaginatedQuery\`: Fetches paginated available images
- Stores image UUID (via \`toLocalId\`) so callers can pass the value directly to \`UUID!\` mutation inputs
- Search functionality with debounced loading state
- Infinite scroll via \`endReached\` callback
- Total count footer with loading indicator
- Optimistic UI updates for smooth user experience
- Exposed \`refetch()\` method via ref

## Usage
\`\`\`tsx
// Basic usage
<BAIAdminImageSelect onChange={(value) => console.log(value)} />

// Filter to alive images only
<BAIAdminImageSelect
  filter={{ status: { equals: 'ALIVE' } }}
  onChange={(value) => console.log(value)}
/>

// With ref for refetching
const ref = useRef<BAIAdminImageSelectRef>(null);
<BAIAdminImageSelect ref={ref} onChange={(value) => console.log(value)} />
// Later: ref.current?.refetch()
\`\`\`

For all other props, refer to [BAISelect](/?path=/docs/components-baiselect--docs).
        `,
      },
    },
  },
  argTypes: {
    filter: {
      control: { type: 'object' },
      description: 'GraphQL filter to narrow the image list',
      table: {
        type: {
          summary:
            "{ status?: { equals?: 'ALIVE' | 'DELETED' }; name?: { contains?: string }; architecture?: { equals?: string }; registryId?: { equals?: string } }",
        },
      },
    },
    loading: {
      control: { type: 'boolean' },
      description: 'Shows loading state in the select',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    placeholder: {
      control: { type: 'text' },
      description: 'Placeholder text when no value is selected',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'i18n: comp:BAIImageSelect.SelectImage' },
      },
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Whether the select is disabled',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    allowClear: {
      control: { type: 'boolean' },
      description: 'Show clear button',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    onChange: {
      action: 'changed',
      description: 'Callback when selection changes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof BAIAdminImageSelect>;

export const Default: Story = {
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story:
          'Basic usage showing 5 images. Each option displays the canonical name. Search functionality is enabled by default.',
      },
    },
  },
  args: {},
  render: (args) => (
    <ImageRelayResolver images={sampleImages} totalCount={sampleImages.length}>
      <BAIAdminImageSelect {...args} style={{ width: '450px' }} />
    </ImageRelayResolver>
  ),
};

export const Empty: Story = {
  name: 'EmptyState',
  parameters: {
    docs: {
      description: {
        story: 'Shows the component when no images are returned from the API.',
      },
    },
  },
  args: {},
  render: (args) => (
    <ImageRelayResolver images={[]} totalCount={0}>
      <BAIAdminImageSelect {...args} style={{ width: '450px' }} />
    </ImageRelayResolver>
  ),
};

export const Disabled: Story = {
  name: 'DisabledState',
  parameters: {
    docs: {
      description: {
        story:
          'Shows the component in a disabled state where users cannot interact with it.',
      },
    },
  },
  args: { disabled: true },
  render: (args) => (
    <ImageRelayResolver images={sampleImages} totalCount={sampleImages.length}>
      <BAIAdminImageSelect {...args} style={{ width: '450px' }} />
    </ImageRelayResolver>
  ),
};

export const FilteredByStatus: Story = {
  name: 'FilteredByStatus',
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates filtering images by status using the filter prop. Only ALIVE images are shown (mock returns first 3).',
      },
    },
  },
  args: { filter: { status: { equals: 'ALIVE' as const } } },
  render: (args) => (
    <ImageRelayResolver images={sampleImages.slice(0, 3)} totalCount={3}>
      <BAIAdminImageSelect {...args} style={{ width: '450px' }} />
    </ImageRelayResolver>
  ),
};

export const ManyImages: Story = {
  name: 'ManyOptions',
  parameters: {
    docs: {
      description: {
        story:
          'Shows 15 images with total count footer. Scroll down inside the dropdown to see all items.',
      },
    },
  },
  args: { allowClear: true },
  render: (args) => (
    <ImageRelayResolver
      images={sampleManyImages}
      totalCount={sampleManyImages.length}
    >
      <BAIAdminImageSelect {...args} style={{ width: '450px' }} />
    </ImageRelayResolver>
  ),
};

export const MultipleSelection: Story = {
  name: 'MultipleSelection',
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates multiple image selection using mode="multiple". Each selected image UUID is stored in the value array.',
      },
    },
  },
  args: { mode: 'multiple', allowClear: true },
  render: (args) => (
    <ImageRelayResolver images={sampleImages} totalCount={sampleImages.length}>
      <BAIAdminImageSelect {...args} style={{ width: '450px' }} />
    </ImageRelayResolver>
  ),
};
