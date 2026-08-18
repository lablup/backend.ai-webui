import BAITag from '../BAITag';
import BAITable from './BAITable';
import { BAITableColumnOverrideItem, BAIColumnsType } from './tableTypes';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type Key } from 'react';

/**
 * `BAITable` renders through Astryx's `Table` primitive + plugin pipeline,
 * behind the antd-shaped `columns` / `dataSource` contract the retired antd
 * engine had. That engine and its stories were deleted in to-astryx ticket
 * 30-D, so these are the table's only stories.
 */
const meta: Meta<typeof BAITable> = {
  title: 'Table/BAITable',
  component: BAITable,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**BAITable** renders through Astryx instead of the retired antd engine, keeping the same public contract:

- **Column visibility** via \`tableSettings\` (Astryx \`Dialog\` settings modal, not the antd one)
- **Resizable columns** — drag-to-resize, persisted into \`columnOverrides[key].width\`
- **Sorting** via \`order\`/\`onChangeOrder\` order strings
- **Pagination** — a custom bottom bar (not antd's pager). Client-side data is sliced here; a \`total\` larger than \`dataSource\` means the caller already sliced server-side (FR-3563)

- **Horizontal scroll** via antd-shaped \`scroll={{ x }}\` — width-less columns take their content's intrinsic width (FR-3500)
- **Vertical scroll** via \`scroll={{ y }}\` — the body is capped at \`y\` and the header row sticks (FR-3500)

## Dropped vs BAITable (see ticket 25 "Feature matrix" for the full list)
- \`loading\` dims rows but shows no spinner
- \`scroll.y\`'s sticky header loses its bottom rule while scrolled (a collapsed-border rule cannot travel with a sticky cell)
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
    scroll: {
      control: { type: 'object' },
      description:
        'antd-shaped `{ x?, y? }` — `x` sizes the table from its content, `y` caps the body height with a sticky header',
    },
  },
};

export default meta;

type Story = StoryObj<typeof BAITable>;

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

// Enough rows in the same shape to overflow a 240px body cap.
const verticalScrollData = Array.from({ length: 15 }, (_unused, index) => ({
  ...scrollData[index % scrollData.length],
  key: `n${index + 1}`,
}));

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

const clientPagedData = Array.from({ length: 42 }, (_unused, index) => ({
  ...sampleData[index % sampleData.length],
  key: `p${index + 1}`,
  name: `Person ${index + 1}`,
}));

export const ClientSidePagination: Story = {
  name: 'Client-side Pagination',
  parameters: {
    docs: {
      description: {
        story:
          'A whole list handed over at once, with no `total`: the table slices it and the pager walks all 42 rows. Passing a `total` larger than `dataSource` instead declares the rows already server-sliced, and the table leaves them alone (FR-3563).',
      },
    },
  },
  args: {
    columns: sampleColumns,
    dataSource: clientPagedData,
    pagination: {
      pageSize: 10,
    },
  },
};

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
    <div style={{ width: 560 }}>
      <BAITable
        scroll={{ x: 'max-content' }}
        columns={scrollColumns}
        dataSource={scrollData}
        pagination={{ total: scrollData.length, pageSize: 10 }}
      />
    </div>
  ),
};

export const VerticalScroll: Story = {
  name: 'Vertical Scroll (scroll.y)',
  parameters: {
    docs: {
      description: {
        story:
          "`scroll={{ x: 'max-content', y: 240 }}` — the shape an `x`+`y` call site passes. `y` caps the scroll container at 240px and sticks the header row over an opaque base, so all 15 rows render inside a fixed-height body instead of growing the page. Both axes scroll in the same container: the `Name` column stays pinned while scrolling sideways, and its header stays put while scrolling down.",
      },
    },
  },
  render: () => (
    <div style={{ width: 560 }}>
      <BAITable
        scroll={{ x: 'max-content', y: 240 }}
        columns={scrollColumns}
        dataSource={verticalScrollData}
        pagination={{ total: verticalScrollData.length, pageSize: 20 }}
      />
    </div>
  ),
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
      <BAITable
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
      <BAITable
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
      <BAITable
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
