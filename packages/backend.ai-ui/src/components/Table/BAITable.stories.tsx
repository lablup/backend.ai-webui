import { BAILocale } from '../../locale';
import { BAIConfigProvider } from '../provider';
import { BAIClient } from '../provider/BAIClientProvider';
import BAITable, {
  BAIColumnsType,
  BAITableColumnOverrideItem,
} from './BAITable';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tag, Button, Space } from 'antd';
import enUS from 'antd/locale/en_US';
import koKR from 'antd/locale/ko_KR';
import React, { useState } from 'react';

// Mock BAIClient for Storybook
const mockClient = {} as BAIClient;
const mockClientPromise = Promise.resolve(mockClient);
const mockAnonymousClientFactory = () => mockClient;

// Simple locale setup for Storybook
const locales = {
  en: { lang: 'en', antdLocale: enUS },
  ko: { lang: 'ko', antdLocale: koKR },
} as const;

const meta: Meta<typeof BAITable> = {
  title: 'Table/BAITable',
  component: BAITable,
  tags: ['autodocs'], // Enable autodocs for this component
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
BAITable is an enhanced table component that extends Ant Design's Table with additional features:

- **Column Management**: Show/hide columns with persistent settings
- **Resizable Columns**: Drag column borders to resize
- **Enhanced Sorting**: String-based order support with callbacks
- **Custom Pagination**: Integrated pagination with extra content support
- **Settings Modal**: Built-in column visibility controls

## Key Features

### Column Visibility
Columns can be marked as \`defaultHidden\` or \`required\`. Users can toggle visibility through the settings modal (gear icon).

### Column Overrides
The component supports controllable column overrides that can be persisted to localStorage or any storage solution.

### Sorting
Uses order strings like \`'name'\` (ascending) or \`'-name'\` (descending) instead of Ant Design's sorter object.
        `,
      },
    },
  },
  argTypes: {
    loading: {
      control: { type: 'boolean' },
      description: 'Show loading state with reduced opacity',
    },
    size: {
      control: { type: 'select' },
      options: ['large', 'middle', 'small'],
      description: 'Size of the table',
    },
    resizable: {
      control: { type: 'boolean' },
      description: 'Enable column resizing by dragging column borders',
    },
    order: {
      control: { type: 'text' },
      description:
        'Sort order string (e.g., "name" for ascending, "-name" for descending)',
    },
    tableSettings: {
      control: { type: 'object' },
      description: 'Configuration for column visibility and settings modal',
    },
  },
  decorators: [
    (Story, context) => {
      const locale = context.globals.locale || 'en';
      const baiLocale: BAILocale =
        locales[locale as keyof typeof locales] || locales.en;

      return (
        <BAIConfigProvider
          locale={baiLocale}
          clientPromise={mockClientPromise}
          anonymousClientFactory={mockAnonymousClientFactory}
        >
          <Story />
        </BAIConfigProvider>
      );
    },
  ],
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
    required: true, // This column cannot be hidden
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
      return <Tag color={colors[status as keyof typeof colors]}>{status}</Tag>;
    },
    width: 100,
  },
  {
    title: 'Department',
    dataIndex: 'department',
    key: 'department',
    defaultHidden: true, // Hidden by default
    width: 120,
  },
  {
    title: 'Address',
    dataIndex: 'address',
    key: 'address',
    defaultHidden: true, // Hidden by default
    ellipsis: true,
  },
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
    defaultHidden: true, // Hidden by default
    ellipsis: true,
    width: 200,
  },
];

const sampleData = [
  {
    key: '1',
    name: 'John Brown',
    age: 32,
    address: 'New York No. 1 Lake Park',
    email: 'john.brown@example.com',
    status: 'active',
    department: 'Engineering',
  },
  {
    key: '2',
    name: 'Jim Green',
    age: 42,
    address: 'London No. 1 Lake Park',
    email: 'jim.green@example.com',
    status: 'inactive',
    department: 'Marketing',
  },
  {
    key: '3',
    name: 'Joe Black',
    age: 28,
    address: 'Sidney No. 1 Lake Park',
    email: 'joe.black@example.com',
    status: 'pending',
    department: 'Sales',
  },
  {
    key: '4',
    name: 'Alice Johnson',
    age: 35,
    address: 'Toronto No. 2 Lake Park',
    email: 'alice.johnson@example.com',
    status: 'active',
    department: 'HR',
  },
  {
    key: '5',
    name: 'Bob Smith',
    age: 29,
    address: 'Berlin No. 3 Lake Park',
    email: 'bob.smith@example.com',
    status: 'active',
    department: 'Engineering',
  },
];

export const Default: Story = {
  name: 'Basic Table',
  parameters: {
    docs: {
      description: {
        story:
          'Basic table with sample data. Note that some columns are hidden by default (`defaultHidden: true`).',
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

export const WithColumnVisibilitySettings: Story = {
  name: 'Column Visibility Settings',
  parameters: {
    docs: {
      description: {
        story:
          'Table with column visibility settings enabled. Click the gear icon to open the settings modal where you can show/hide columns. Changes are tracked in the `columnOverrides` state.',
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
        tableSettings={{
          columnOverrides: columnOverrides,
          onColumnOverridesChange: (
            newOverrides: Record<string, BAITableColumnOverrideItem>,
          ) => {
            setColumnOverrides(newOverrides);
            console.log('Column overrides changed:', newOverrides);
          },
        }}
        pagination={{
          total: sampleData.length,
          pageSize: 10,
        }}
      />
    );
  },
};

export const WithPersistentColumnSettings: Story = {
  name: 'Persistent Column Settings',
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates persistent column settings using localStorage. Column visibility changes are automatically saved and restored. Use the "Reset" button to clear saved settings.',
      },
    },
  },
  render: () => {
    const STORAGE_KEY = 'storybook-bai-table-columns';

    const [columnOverrides, setColumnOverrides] = useState<
      Record<string, BAITableColumnOverrideItem>
    >(() => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : {};
      } catch {
        return {};
      }
    });

    return (
      <div>
        <Space style={{ marginBottom: 16 }}>
          <Button
            onClick={() => {
              localStorage.removeItem(STORAGE_KEY);
              setColumnOverrides({});
            }}
          >
            Reset Column Settings
          </Button>
          <Button
            onClick={() => {
              const settings = localStorage.getItem(STORAGE_KEY);
              alert(settings ? `Settings: ${settings}` : 'No settings saved');
            }}
          >
            Show Saved Settings
          </Button>
        </Space>
        <BAITable
          columns={sampleColumns}
          dataSource={sampleData}
          tableSettings={{
            columnOverrides: columnOverrides,
            onColumnOverridesChange: (
              newOverrides: Record<string, BAITableColumnOverrideItem>,
            ) => {
              setColumnOverrides(newOverrides);
              localStorage.setItem(STORAGE_KEY, JSON.stringify(newOverrides));
              console.log('Column overrides saved:', newOverrides);
            },
          }}
          pagination={{
            total: sampleData.length,
            pageSize: 5,
          }}
        />
      </div>
    );
  },
};

export const WithPresetHiddenColumns: Story = {
  name: 'Preset Hidden Columns',
  parameters: {
    docs: {
      description: {
        story:
          'Shows how to preset column visibility using `columnOverrides`. Some columns are hidden by default, while others override their `defaultHidden` setting.',
      },
    },
  },
  render: () => {
    const [columnOverrides, setColumnOverrides] = useState<
      Record<string, BAITableColumnOverrideItem>
    >({
      address: { hidden: true },
      email: { hidden: true },
      department: { hidden: false }, // Show department by default (overrides defaultHidden)
    });

    return (
      <BAITable
        columns={sampleColumns}
        dataSource={sampleData}
        tableSettings={{
          columnOverrides: columnOverrides,
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

export const Loading: Story = {
  name: 'Loading State',
  parameters: {
    docs: {
      description: {
        story: 'Table in loading state with reduced opacity and no data.',
      },
    },
  },
  args: {
    columns: sampleColumns,
    dataSource: [],
    loading: true,
    pagination: {
      total: 0,
      pageSize: 10,
    },
  },
};

export const SmallSize: Story = {
  name: 'Small Size table',
  parameters: {
    docs: {
      description: {
        story: 'Table with small size variant for compact displays.',
      },
    },
  },
  args: {
    columns: sampleColumns,
    dataSource: sampleData,
    size: 'small',
    pagination: {
      total: sampleData.length,
      pageSize: 10,
    },
  },
};

export const NoData: Story = {
  name: 'Empty State',
  parameters: {
    docs: {
      description: {
        story: 'Table with no data showing empty state.',
      },
    },
  },
  args: {
    columns: sampleColumns,
    dataSource: [],
    pagination: {
      total: 0,
      pageSize: 10,
    },
  },
};

export const ResizableColumns: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Table with resizable columns. Drag the column borders to resize them. Column widths are maintained in component state.',
      },
    },
  },
  args: {
    columns: sampleColumns,
    dataSource: sampleData,
    resizable: true,
    pagination: {
      total: sampleData.length,
      pageSize: 10,
    },
  },
};

export const WithSorting: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Table with sorting functionality. Uses order strings instead of Ant Design's default sorter format. Click column headers to sort.",
      },
    },
  },
  render: () => {
    const [order, setOrder] = useState<string | undefined>('name');
    const [sortedData, setSortedData] = useState(sampleData);

    React.useEffect(() => {
      if (order) {
        const isDescending = order.startsWith('-');
        const field = isDescending ? order.substring(1) : order;
        const sorted = [...sampleData].sort((a, b) => {
          const aVal = a[field as keyof typeof a];
          const bVal = b[field as keyof typeof b];
          if (aVal < bVal) return isDescending ? 1 : -1;
          if (aVal > bVal) return isDescending ? -1 : 1;
          return 0;
        });
        setSortedData(sorted);
      } else {
        setSortedData(sampleData);
      }
    }, [order]);

    return (
      <BAITable
        columns={sampleColumns}
        dataSource={sortedData}
        order={order}
        onChangeOrder={setOrder}
        pagination={{
          total: sortedData.length,
          pageSize: 10,
        }}
      />
    );
  },
};
