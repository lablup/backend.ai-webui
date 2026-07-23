import BAIFlex from './BAIFlex';
import BAINumberWithUnit from './BAINumberWithUnit';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card } from 'antd';

const meta: Meta<typeof BAINumberWithUnit> = {
  title: 'Statistic/BAINumberWithUnit',
  component: BAINumberWithUnit,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**BAINumberWithUnit** is a component that converts and displays numbers with size units in binary or decimal format.

## Features
- Binary (1024-based) or Decimal (1000-based) unit conversion
- Automatic unit selection when value rounds to 0 in target unit
- Styled unit display with secondary text color
- Optional postfix support

## Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`numberUnit\` | \`string\` | - | Input value with unit (e.g., "1024m", "2g", "512") |
| \`targetUnit\` | \`SizeUnit\` | - | Target unit: '', 'k', 'm', 'g', 't', 'p', 'e' |
| \`unitType\` | \`'binary' or 'decimal'\` | - | Binary (1024) or Decimal (1000) conversion |
| \`postfix\` | \`string\` | - | Optional postfix to append after number |

## Unit Types
- **Binary**: Base 1024 (KiB, MiB, GiB, TiB, PiB, EiB)
- **Decimal**: Base 1000 (KB, MB, GB, TB, PB, EB)
        `,
      },
    },
  },
  argTypes: {
    numberUnit: {
      control: { type: 'text' },
      description: 'Input value with unit (e.g., "1024m", "2g")',
      table: {
        type: { summary: 'string' },
      },
    },
    targetUnit: {
      control: { type: 'select' },
      options: ['', 'k', 'm', 'g', 't', 'p', 'e'],
      description: 'Target unit for conversion',
      table: {
        type: { summary: 'SizeUnit' },
      },
    },
    unitType: {
      control: { type: 'radio' },
      options: ['binary', 'decimal'],
      description: 'Binary (1024) or Decimal (1000) conversion',
      table: {
        type: { summary: "'binary' | 'decimal'" },
      },
    },
    postfix: {
      control: { type: 'text' },
      description: 'Optional postfix to append after number',
      table: {
        type: { summary: 'string' },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BAINumberWithUnit>;

export const Default: Story = {
  name: 'Basic',
  args: {
    numberUnit: '1024m',
    targetUnit: 'g',
    unitType: 'binary',
  },
};

export const BinaryVsDecimal: Story = {
  render: () => (
    <BAIFlex direction="column" gap="md">
      <Card size="small" title="1024 units: Binary vs Decimal">
        <BAIFlex direction="column" gap="sm">
          <div>
            <strong>1024m (Binary → GiB):</strong>{' '}
            <BAINumberWithUnit
              numberUnit="1024m"
              targetUnit="g"
              unitType="binary"
            />
          </div>
          <div>
            <strong>1024m (Decimal → GB):</strong>{' '}
            <BAINumberWithUnit
              numberUnit="1024m"
              targetUnit="g"
              unitType="decimal"
            />
          </div>
        </BAIFlex>
      </Card>
      <Card size="small" title="2048 units: Binary vs Decimal">
        <BAIFlex direction="column" gap="sm">
          <div>
            <strong>2048g (Binary → TiB):</strong>{' '}
            <BAINumberWithUnit
              numberUnit="2048g"
              targetUnit="t"
              unitType="binary"
            />
          </div>
          <div>
            <strong>2048g (Decimal → TB):</strong>{' '}
            <BAINumberWithUnit
              numberUnit="2048g"
              targetUnit="t"
              unitType="decimal"
            />
          </div>
        </BAIFlex>
      </Card>
      <Card size="small" title="Various conversions">
        <BAIFlex direction="column" gap="sm">
          <div>
            <strong>1024 bytes → KiB:</strong>{' '}
            <BAINumberWithUnit
              numberUnit="1024"
              targetUnit="k"
              unitType="binary"
            />
          </div>
          <div>
            <strong>1000 bytes → KB:</strong>{' '}
            <BAINumberWithUnit
              numberUnit="1000"
              targetUnit="k"
              unitType="decimal"
            />
          </div>
          <div>
            <strong>512m → GiB:</strong>{' '}
            <BAINumberWithUnit
              numberUnit="512m"
              targetUnit="g"
              unitType="binary"
            />
          </div>
        </BAIFlex>
      </Card>
    </BAIFlex>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Comparison showing the difference between binary (1024-based: KiB, MiB, GiB) and decimal (1000-based: KB, MB, GB) conversions.',
      },
    },
  },
};

export const AutoUnitFallback: Story = {
  render: () => (
    <BAIFlex direction="column" gap="md">
      <Card size="small" title="Automatic unit display when target rounds to 0">
        <BAIFlex direction="column" gap="sm">
          <div>
            <strong>100 bytes → GiB (shows auto):</strong>{' '}
            <BAINumberWithUnit
              numberUnit="100"
              targetUnit="g"
              unitType="binary"
            />
          </div>
          <div>
            <strong>512k → TiB (shows auto):</strong>{' '}
            <BAINumberWithUnit
              numberUnit="512k"
              targetUnit="t"
              unitType="binary"
            />
          </div>
          <div>
            <strong>10m → TB (shows auto):</strong>{' '}
            <BAINumberWithUnit
              numberUnit="10m"
              targetUnit="t"
              unitType="decimal"
            />
          </div>
        </BAIFlex>
      </Card>
    </BAIFlex>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'When the converted value rounds to 0 in the target unit, the component automatically displays the value in a more appropriate unit in parentheses.',
      },
    },
  },
};

export const WithPostfix: Story = {
  render: () => (
    <BAIFlex direction="column" gap="md">
      <Card size="small" title="Using postfix">
        <BAIFlex direction="column" gap="sm">
          <div>
            <strong>Memory usage:</strong>{' '}
            <BAINumberWithUnit
              numberUnit="6144m"
              targetUnit="g"
              unitType="binary"
              postfix=" / 8.00"
            />
          </div>
          <div>
            <strong>Storage used:</strong>{' '}
            <BAINumberWithUnit
              numberUnit="1500g"
              targetUnit="t"
              unitType="decimal"
              postfix=" used"
            />
          </div>
          <div>
            <strong>Quota remaining:</strong>{' '}
            <BAINumberWithUnit
              numberUnit="512m"
              targetUnit="g"
              unitType="binary"
              postfix=" remaining"
            />
          </div>
        </BAIFlex>
      </Card>
    </BAIFlex>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'The `postfix` prop adds custom text after the converted number, useful for displaying usage ratios or status.',
      },
    },
  },
};
