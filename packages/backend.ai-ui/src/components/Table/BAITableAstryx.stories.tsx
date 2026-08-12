import BAITag from '../BAITag';
import BAITableAstryx from './BAITableAstryx';
import { BAITableColumnOverrideItem, BAIColumnsType } from './tableTypes';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type Key } from 'react';

/**
 * BAITableAstryx is the Astryx-native successor to BAITable (to-astryx
 * ticket 25). It keeps the SAME antd/BUI-shaped `columns`/`dataSource`
 * contract as the legacy `BAITable` — a consumer migrates by swapping the
 * import (`BAITable` -> `BAITableAstryx`), not by rewriting its column
 * model — but renders through Astryx's `Table` primitive + plugin pipeline
 * instead of antd's `Table`.
 *
 * The antd engine (and its `BAITable.stories.tsx`) was deleted in ticket 30-D
 * once the last consumer flipped; these are now the table's only stories.
 */
const meta: Meta<typeof BAITableAstryx> = {
  title: 'Table/BAITableAstryx',
  component: BAITableAstryx,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**BAITableAstryx** is the Astryx-engine successor to \`BAITable\` (ticket 25). Same public contract, different renderer:

- **Column visibility** via \`tableSettings\` (Astryx \`Dialog\` settings modal, not the antd one)
- **Resizable columns** — drag-to-resize, persisted into \`columnOverrides[key].width\`
- **Sorting** via \`order\`/\`onChangeOrder\` order strings (unchanged from \`BAITable\`)
- **Server-side pagination** — a custom bottom bar (not antd's pager)

- **Horizontal scroll** via antd-shaped \`scroll={{ x }}\` — width-less columns take their content's intrinsic width (FR-3500)

## Dropped vs BAITable (see ticket 25 "Feature matrix" for the full list)
- \`scroll.y\` (sticky-header body scroll)
- \`loading\` dims rows but shows no spinner
- Column groups (\`columns[].children\`) are flattened, not spanned
- Row virtualization (deferred, explicit product decision)
        `,
      },
    },
  },
  argTypes: {
    loading: {
      control: { type: 'boolean' },
      description: 'Dims the rows while a refetch is in flight (no spinner)',
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'middle', 'large'],
      description: 'Row density, mapped to Astryx `density`',
    },
    resizable: {
      control: { type: 'boolean' },
      description: 'Enable column resizing by dragging column borders',
    },
    bordered: {
      control: { type: 'boolean' },
      description: 'Grid dividers between cells (-> Astryx `dividers="grid"`)',
    },
    order: {
      control: { type: 'text' },
      description:
        'Sort order string (e.g. "name" ascending, "-name" descending)',
    },
  },
};

export default meta;

type Story = StoryObj<typeof BAITableAstryx>;

const sampleColumns: BAIColumnsType<any> = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    sorter: true,
    width: 150,
    required: true,
  },
  {
    title: 'Age',
    dataIndex: 'age',
    key: 'age',
    sorter: true,
    width: 80,
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: (status: string) => {
      const colors = {
        active: 'green',
        inactive: 'red',
        pending: 'orange',
      };
      return (
        <BAITag color={colors[status as keyof typeof colors]}>{status}</BAITag>
      );
    },
    width: 100,
  },
  {
    title: 'Department',
    dataIndex: 'department',
    key: 'department',
    defaultHidden: true,
    width: 120,
  },
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
    defaultHidden: true,
    width: 220,
  },
];

const sampleData = [
  {
    key: '1',
    name: 'John Brown',
    age: 32,
    email: 'john.brown@example.com',
    status: 'active',
    department: 'Engineering',
  },
  {
    key: '2',
    name: 'Jim Green',
    age: 42,
    email: 'jim.green@example.com',
    status: 'inactive',
    department: 'Marketing',
  },
  {
    key: '3',
    name: 'Joe Black',
    age: 28,
    email: 'joe.black@example.com',
    status: 'pending',
    department: 'Sales',
  },
  {
    key: '4',
    name: 'Alice Johnson',
    age: 35,
    email: 'alice.johnson@example.com',
    status: 'active',
    department: 'HR',
  },
  {
    key: '5',
    name: 'Bob Smith',
    age: 29,
    email: 'bob.smith@example.com',
    status: 'active',
    department: 'Engineering',
  },
];

// The FR-3500 shape: long unwrapped resource labels in width-less columns,
// inside a container far narrower than the content (the dashboard card).
const scrollColumns: BAIColumnsType<any> = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    width: 120,
    fixed: 'left',
  },
  { title: 'Allocation', dataIndex: 'allocation', key: 'allocation' },
  { title: 'Usage', dataIndex: 'usage', key: 'usage' },
  { title: 'Status', dataIndex: 'status', key: 'status' },
];

const scrollData = [
  {
    key: 'a1',
    name: 'agent-node-with-a-deliberately-long-name-01',
    allocation: 'CPU 126.9 / 128 cores · MEM 972.3 / 1024 GiB',
    usage: 'CPU 87% (111.4 cores) · MEM 63% (645.1 GiB) · GPU 4/8 (fGPU 3.5)',
    status: 'ALIVE (schedulable)',
  },
  {
    key: 'a2',
    name: 'agent-node-02',
    allocation: 'CPU 12 / 64 cores · MEM 96 / 512 GiB',
    usage: 'CPU 12% (7.7 cores) · MEM 18% (92.2 GiB) · GPU 0/4 (fGPU 0)',
    status: 'ALIVE (schedulable)',
  },
];

export const HorizontalScroll: Story = {
  name: 'Horizontal Scroll (scroll.x)',
  parameters: {
    docs: {
      description: {
        story:
          "antd-shaped `scroll={{ x: 'max-content' }}` inside a 560px container: width-less columns (Allocation / Usage / Status) take their content's intrinsic width and the table scrolls horizontally; the pixel-width `Name` column stays 120px and still truncates. Without `scroll.x` the same table squeezes every column into the container and clips the labels (FR-3500).",
      },
    },
  },
  render: () => (
    <div style={{ width: 560, border: '1px dashed #999' }}>
      <BAITableAstryx
        scroll={{ x: 'max-content' }}
        columns={scrollColumns}
        dataSource={scrollData}
        pagination={false}
      />
    </div>
  ),
};

export const Default: Story = {
  name: 'Basic Table',
  parameters: {
    docs: {
      description: {
        story:
          'Basic table with sample data. `department` and `email` are hidden by default (`defaultHidden: true`) — open the settings gear to reveal them.',
      },
    },
  },
  args: {
    columns: sampleColumns,
    dataSource: sampleData,
    pagination: {
      total: sampleData.length,
      pageSize: 10,
    },
  },
};

export const WithColumnSettings: Story = {
  name: 'Column Visibility Settings',
  parameters: {
    docs: {
      description: {
        story:
          'Table with `tableSettings` wired to local state. Click the gear icon to open the Astryx settings dialog and toggle column visibility.',
      },
    },
  },
  render: () => {
    const [columnOverrides, setColumnOverrides] = useState<
      Record<string, BAITableColumnOverrideItem>
    >({});

    return (
      <BAITableAstryx
        columns={sampleColumns}
        dataSource={sampleData}
        resizable
        tableSettings={{
          columnOverrides,
          onColumnOverridesChange: setColumnOverrides,
        }}
        pagination={{
          total: sampleData.length,
          pageSize: 10,
        }}
      />
    );
  },
};

export const WithSorting: Story = {
  name: 'Sortable Columns',
  parameters: {
    docs: {
      description: {
        story:
          'Uses `order`/`onChangeOrder` order strings (e.g. `"name"`, `"-age"`) instead of an antd sorter object.',
      },
    },
  },
  render: () => {
    const [order, setOrder] = useState<string | null>('name');
    return (
      <BAITableAstryx
        columns={sampleColumns}
        dataSource={sampleData}
        order={order}
        onChangeOrder={(next) => setOrder(next ?? null)}
        pagination={false}
      />
    );
  },
};

export const RowSelection: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Checkbox row selection, same `rowSelection` shape as antd.',
      },
    },
  },
  render: () => {
    const [selectedRowKeys, setSelectedRowKeys] = useState<Array<Key>>([]);
    return (
      <BAITableAstryx
        columns={sampleColumns}
        dataSource={sampleData}
        rowKey="key"
        rowSelection={{
          selectedRowKeys,
          onChange: (keys) => setSelectedRowKeys([...keys]),
        }}
        pagination={false}
      />
    );
  },
};

export const Loading: Story = {
  name: 'Loading State',
  parameters: {
    docs: {
      description: {
        story:
          'Rows dim while `loading` is true. Unlike antd there is no centred spinner (ticket 25 PILOT-DECISION 4).',
      },
    },
  },
  args: {
    columns: sampleColumns,
    dataSource: sampleData,
    loading: true,
    pagination: false,
  },
};

export const EmptyState: Story = {
  parameters: {
    docs: {
      description: {
        story: 'No rows — renders the empty state in place of the body.',
      },
    },
  },
  args: {
    columns: sampleColumns,
    dataSource: [],
    pagination: false,
  },
};
