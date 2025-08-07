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
  title: 'Components/BAITable',
  component: BAITable,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    loading: {
      control: { type: 'boolean' },
    },
    size: {
      control: { type: 'select' },
      options: ['large', 'middle', 'small'],
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
    defaultHidden: true,
    width: 120,
  },
  {
    title: 'Address',
    dataIndex: 'address',
    key: 'address',
    defaultHidden: true,
    ellipsis: true,
  },
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
    defaultHidden: true,
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
  args: {
    columns: sampleColumns,
    dataSource: [],
    pagination: {
      total: 0,
      pageSize: 10,
    },
  },
};
