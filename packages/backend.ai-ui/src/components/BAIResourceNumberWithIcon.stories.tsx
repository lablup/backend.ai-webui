import BAIFlex from './BAIFlex';
import BAIResourceNumberWithIcon from './BAIResourceNumberWithIcon';
import { BAIMetaDataProvider, type DeviceMetaData } from './provider';
import type { Meta, StoryObj } from '@storybook/react-vite';

// Mock device metadata for Storybook
const mockDeviceMetaData: DeviceMetaData = {
  // Base resources
  cpu: {
    slot_name: 'cpu',
    description: 'CPU',
    human_readable_name: 'CPU',
    display_unit: 'Core',
    number_format: { binary: false, round_length: 0 },
    display_icon: 'cpu',
  },
  mem: {
    slot_name: 'mem',
    description: 'Memory',
    human_readable_name: 'Memory',
    display_unit: 'GiB',
    number_format: { binary: true, round_length: 2 },
    display_icon: 'mem',
  },
  // NVIDIA
  'cuda.device': {
    slot_name: 'cuda.device',
    description: 'NVIDIA GPU',
    human_readable_name: 'GPU',
    display_unit: 'GPU',
    number_format: { binary: false, round_length: 0 },
    display_icon: 'nvidia',
  },
  'cuda.shares': {
    slot_name: 'cuda.shares',
    description: 'NVIDIA GPU (fractional)',
    human_readable_name: 'GPU',
    display_unit: 'FGPU',
    number_format: { binary: false, round_length: 2 },
    display_icon: 'nvidia',
  },
  // AMD
  'rocm.device': {
    slot_name: 'rocm.device',
    description: 'AMD GPU',
    human_readable_name: 'GPU',
    display_unit: 'GPU',
    number_format: { binary: false, round_length: 0 },
    display_icon: 'rocm',
  },
  // Google TPU
  'tpu.device': {
    slot_name: 'tpu.device',
    description: 'Google TPU',
    human_readable_name: 'TPU',
    display_unit: 'TPU',
    number_format: { binary: false, round_length: 0 },
    display_icon: 'tpu',
  },
  // Graphcore IPU
  'ipu.device': {
    slot_name: 'ipu.device',
    description: 'Graphcore IPU',
    human_readable_name: 'IPU',
    display_unit: 'IPU',
    number_format: { binary: false, round_length: 0 },
    display_icon: 'ipu',
  },
  // Intel Gaudi
  'gaudi2.device': {
    slot_name: 'gaudi2.device',
    description: 'Intel Gaudi2',
    human_readable_name: 'Gaudi2',
    display_unit: 'Gaudi2',
    number_format: { binary: false, round_length: 0 },
    display_icon: 'gaudi',
  },
  // FuriosaAI Warboy
  'warboy.device': {
    slot_name: 'warboy.device',
    description: 'FuriosaAI Warboy',
    human_readable_name: 'Warboy',
    display_unit: 'Warboy',
    number_format: { binary: false, round_length: 0 },
    display_icon: 'furiosa',
  },
  'rngd.device': {
    slot_name: 'rngd.device',
    description: 'FuriosaAI RNGD',
    human_readable_name: 'RNGD',
    display_unit: 'RNGD',
    number_format: { binary: false, round_length: 0 },
    display_icon: 'furiosa',
  },
  // Rebellions ATOM
  'atom.device': {
    slot_name: 'atom.device',
    description: 'Rebellions ATOM',
    human_readable_name: 'ATOM',
    display_unit: 'ATOM',
    number_format: { binary: false, round_length: 0 },
    display_icon: 'rebel',
  },
  'atom-plus.device': {
    slot_name: 'atom-plus.device',
    description: 'Rebellions ATOM+',
    human_readable_name: 'ATOM+',
    display_unit: 'ATOM+',
    number_format: { binary: false, round_length: 0 },
    display_icon: 'rebel',
  },
  'atom-max.device': {
    slot_name: 'atom-max.device',
    description: 'Rebellions ATOM Max',
    human_readable_name: 'ATOM Max',
    display_unit: 'ATOM Max',
    number_format: { binary: false, round_length: 0 },
    display_icon: 'rebel',
  },
  // Hyperaccel LPU
  'hyperaccel-lpu.device': {
    slot_name: 'hyperaccel-lpu.device',
    description: 'Hyperaccel LPU',
    human_readable_name: 'LPU',
    display_unit: 'LPU',
    number_format: { binary: false, round_length: 0 },
    display_icon: 'hyperaccel',
  },
  // TT-N300
  'tt-n300.device': {
    slot_name: 'tt-n300.device',
    description: 'Tenstorrent TT-N300',
    human_readable_name: 'TT-N300',
    display_unit: 'TT-N300',
    number_format: { binary: false, round_length: 0 },
    display_icon: 'tenstorrent',
  },
};

const meta: Meta<typeof BAIResourceNumberWithIcon> = {
  title: 'Statistic/BAIResourceNumberWithIcon',
  component: BAIResourceNumberWithIcon,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**BAIResourceNumberWithIcon** displays a resource value with its corresponding icon and unit.

- **Automatic formatting**: Handles binary units (GiB, MiB) and decimal formats
- **Resource icons**: Shows appropriate icons for CPU, memory, and accelerators
- **Range display**: Supports min~max value ranges and unlimited (∞) resources
- **Device metadata**: Uses BAIMetaDataProvider for device-specific formatting

## Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`type\` | \`string\` | - | Resource type (e.g., 'cpu', 'mem', 'cuda.device') |
| \`value\` | \`string\` | - | Resource amount as string |
| \`max\` | \`string\` | \`undefined\` | Optional maximum value, supports 'Infinity' |
| \`hideTooltip\` | \`boolean\` | \`false\` | When true, hides the tooltip on the resource icon |
| \`opts\` | \`ResourceOpts\` | \`undefined\` | Additional options like shmem for memory |
| \`extra\` | \`React.ReactNode\` | \`undefined\` | Extra content to display after the number |
        `,
      },
    },
  },
  decorators: [
    (Story) => (
      <BAIMetaDataProvider deviceMetaData={mockDeviceMetaData}>
        <Story />
      </BAIMetaDataProvider>
    ),
  ],
  argTypes: {
    type: {
      control: { type: 'select' },
      options: [
        'cpu',
        'mem',
        'cuda.device',
        'cuda.shares',
        'rocm.device',
        'tpu.device',
        'ipu.device',
        'gaudi2.device',
        'warboy.device',
        'rngd.device',
        'atom.device',
        'atom-plus.device',
        'atom-max.device',
        'hyperaccel-lpu.device',
      ],
      description: 'Resource type',
      table: {
        type: { summary: 'string' },
      },
    },
    value: {
      control: { type: 'text' },
      description: 'Resource amount as string',
      table: {
        type: { summary: 'string' },
      },
    },
    max: {
      control: { type: 'text' },
      description: 'Optional maximum value, supports "Infinity"',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'undefined' },
      },
    },
    hideTooltip: {
      control: { type: 'boolean' },
      description: 'When true, hides the tooltip on the resource icon',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    opts: {
      control: { type: 'object' },
      description: 'Additional options like shmem for memory resources',
      table: {
        type: { summary: 'ResourceOpts' },
        defaultValue: { summary: 'undefined' },
      },
    },
    extra: {
      control: false,
      description: 'Extra content to display after the resource number',
      table: {
        type: { summary: 'React.ReactNode' },
        defaultValue: { summary: 'undefined' },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BAIResourceNumberWithIcon>;

export const Default: Story = {
  name: 'Basic Usage',
  args: {
    type: 'cpu',
    value: '4',
  },
};

export const ResourceTypes: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Shows all supported resource types with their respective icons and units.',
      },
    },
  },
  render: () => (
    <BAIFlex direction="column" gap="md" align="start">
      {/* Base Resources */}
      <BAIFlex gap="sm" align="center">
        <span style={{ width: 160 }}>CPU:</span>
        <BAIResourceNumberWithIcon type="cpu" value="8" />
      </BAIFlex>
      <BAIFlex gap="sm" align="center">
        <span style={{ width: 160 }}>Memory:</span>
        <BAIResourceNumberWithIcon type="mem" value="16000000000" />
      </BAIFlex>
      {/* NVIDIA */}
      <BAIFlex gap="sm" align="center">
        <span style={{ width: 160 }}>NVIDIA GPU:</span>
        <BAIResourceNumberWithIcon type="cuda.device" value="2" />
      </BAIFlex>
      <BAIFlex gap="sm" align="center">
        <span style={{ width: 160 }}>NVIDIA FGPU:</span>
        <BAIResourceNumberWithIcon type="cuda.shares" value="0.5" />
      </BAIFlex>
      {/* AMD */}
      <BAIFlex gap="sm" align="center">
        <span style={{ width: 160 }}>AMD GPU:</span>
        <BAIResourceNumberWithIcon type="rocm.device" value="1" />
      </BAIFlex>
      {/* Google TPU */}
      <BAIFlex gap="sm" align="center">
        <span style={{ width: 160 }}>Google TPU:</span>
        <BAIResourceNumberWithIcon type="tpu.device" value="4" />
      </BAIFlex>
      {/* Graphcore IPU */}
      <BAIFlex gap="sm" align="center">
        <span style={{ width: 160 }}>Graphcore IPU:</span>
        <BAIResourceNumberWithIcon type="ipu.device" value="2" />
      </BAIFlex>
      {/* Intel Gaudi */}
      <BAIFlex gap="sm" align="center">
        <span style={{ width: 160 }}>Intel Gaudi2:</span>
        <BAIResourceNumberWithIcon type="gaudi2.device" value="1" />
      </BAIFlex>
      {/* FuriosaAI */}
      <BAIFlex gap="sm" align="center">
        <span style={{ width: 160 }}>FuriosaAI Warboy:</span>
        <BAIResourceNumberWithIcon type="warboy.device" value="2" />
      </BAIFlex>
      <BAIFlex gap="sm" align="center">
        <span style={{ width: 160 }}>FuriosaAI RNGD:</span>
        <BAIResourceNumberWithIcon type="rngd.device" value="1" />
      </BAIFlex>
      {/* Rebellions */}
      <BAIFlex gap="sm" align="center">
        <span style={{ width: 160 }}>Rebellions ATOM:</span>
        <BAIResourceNumberWithIcon type="atom.device" value="2" />
      </BAIFlex>
      <BAIFlex gap="sm" align="center">
        <span style={{ width: 160 }}>Rebellions ATOM+:</span>
        <BAIResourceNumberWithIcon type="atom-plus.device" value="1" />
      </BAIFlex>
      <BAIFlex gap="sm" align="center">
        <span style={{ width: 160 }}>Rebellions ATOM Max:</span>
        <BAIResourceNumberWithIcon type="atom-max.device" value="1" />
      </BAIFlex>
      {/* Hyperaccel */}
      <BAIFlex gap="sm" align="center">
        <span style={{ width: 160 }}>Hyperaccel LPU:</span>
        <BAIResourceNumberWithIcon type="hyperaccel-lpu.device" value="4" />
      </BAIFlex>
      {/* Tenstorrent */}
      <BAIFlex gap="sm" align="center">
        <span style={{ width: 160 }}>Tenstorrent TT-N300:</span>
        <BAIResourceNumberWithIcon type="tt-n300.device" value="2" />
      </BAIFlex>
    </BAIFlex>
  ),
};

export const WithMaxValue: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates resource ranges with minimum and maximum values.',
      },
    },
  },
  render: () => (
    <BAIFlex direction="column" gap="md" align="start">
      <BAIFlex gap="sm" align="center">
        <span style={{ width: 150 }}>CPU (4~8):</span>
        <BAIResourceNumberWithIcon type="cpu" value="4" max="8" />
      </BAIFlex>
      <BAIFlex gap="sm" align="center">
        <span style={{ width: 150 }}>Memory (8~16 GiB):</span>
        <BAIResourceNumberWithIcon
          type="mem"
          value="8000000000"
          max="16000000000"
        />
      </BAIFlex>
      <BAIFlex gap="sm" align="center">
        <span style={{ width: 150 }}>GPU (1~Unlimited):</span>
        <BAIResourceNumberWithIcon
          type="cuda.device"
          value="1"
          max="Infinity"
        />
      </BAIFlex>
    </BAIFlex>
  ),
};

export const WithSharedMemory: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Shows memory resources with shared memory (SHM) information.',
      },
    },
  },
  render: () => (
    <BAIFlex direction="column" gap="md" align="start">
      <BAIFlex gap="sm" align="center">
        <span style={{ width: 180 }}>Memory with SHM:</span>
        <BAIResourceNumberWithIcon
          type="mem"
          value="16000000000"
          opts={{ shmem: 1000000000 }}
        />
      </BAIFlex>
      <BAIFlex gap="sm" align="center">
        <span style={{ width: 180 }}>Memory without SHM:</span>
        <BAIResourceNumberWithIcon type="mem" value="16000000000" />
      </BAIFlex>
    </BAIFlex>
  ),
};

export const WithoutTooltip: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Compares resource display with and without icon tooltips.',
      },
    },
  },
  render: () => (
    <BAIFlex direction="column" gap="md" align="start">
      <BAIFlex gap="sm" align="center">
        <span style={{ width: 150 }}>With tooltip:</span>
        <BAIResourceNumberWithIcon type="cpu" value="8" hideTooltip={false} />
      </BAIFlex>
      <BAIFlex gap="sm" align="center">
        <span style={{ width: 150 }}>Without tooltip:</span>
        <BAIResourceNumberWithIcon type="cpu" value="8" hideTooltip={true} />
      </BAIFlex>
    </BAIFlex>
  ),
};
