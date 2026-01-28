import { BAILocale } from '../../locale';
import { BAIConfigProvider } from '../provider';
import { BAIClient } from '../provider/BAIClientProvider';
import { BAIColumnsType, BAITableColumnOverrideItem } from './BAITable';
import BAITableSettingModal from './BAITableSettingModal';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from 'antd';
import enUS from 'antd/locale/en_US';
import koKR from 'antd/locale/ko_KR';
import { useState } from 'react';

// Mock BAIClient for Storybook
const mockClient = {} as BAIClient;
const mockClientPromise = Promise.resolve(mockClient);
const mockAnonymousClientFactory = () => mockClient;

// Simple locale setup for Storybook
const locales = {
  en: { lang: 'en', antdLocale: enUS },
  ko: { lang: 'ko', antdLocale: koKR },
} as const;

const meta: Meta<typeof BAITableSettingModal> = {
  title: 'Table/BAITableSettingModal',
  component: BAITableSettingModal,
  tags: ['autodocs'], // Enable autodocs for this component
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
BAITableSettingModal is a modal component for configuring table column settings.

## Key Features

### Column Visibility Management
- Toggle column visibility with checkboxes
- Required columns cannot be hidden
- Search functionality to filter columns

### Drag and Drop Reordering
- Reorder columns by dragging rows
- Can be disabled with \`disableSorter\` prop
- Drag handle with visual feedback

### Form Integration
- Integrated with Ant Design Form
- Validates and submits configuration changes
- Supports initial column order

### Responsive Design
- Fixed modal size with scrollable content
- Accessible drag handles and controls
        `,
      },
    },
  },
  argTypes: {
    open: {
      control: { type: 'boolean' },
      description: 'Whether the modal is open',
    },
    disableSorter: {
      control: { type: 'boolean' },
      description: 'Disable column reordering functionality',
    },
    columns: {
      control: { type: 'object' },
      description: 'Array of table column configurations',
    },
    columnOverrides: {
      control: { type: 'object' },
      description: 'Current column override settings',
    },
    initialColumnOrder: {
      control: { type: 'object' },
      description: 'Initial order of columns',
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

type Story = StoryObj<typeof BAITableSettingModal>;

const sampleColumns: BAIColumnsType<any> = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    required: true, // Cannot be hidden
  },
  {
    title: 'Age',
    dataIndex: 'age',
    key: 'age',
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
  },
  {
    title: 'Department',
    dataIndex: 'department',
    key: 'department',
    defaultHidden: true,
  },
  {
    title: 'Address',
    dataIndex: 'address',
    key: 'address',
    defaultHidden: true,
  },
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
    defaultHidden: true,
  },
  {
    title: 'Phone',
    dataIndex: 'phone',
    key: 'phone',
    defaultHidden: true,
  },
];

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Basic modal with column settings. Click the button to open the modal and test the column visibility controls.',
      },
    },
  },
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    const [columnOverrides, setColumnOverrides] = useState<
      Record<string, BAITableColumnOverrideItem>
    >({});

    return (
      <div>
        <Button type="primary" onClick={() => setIsOpen(true)}>
          Open Column Settings
        </Button>
        <BAITableSettingModal
          open={isOpen}
          onRequestClose={(formValues) => {
            setIsOpen(false);
            if (formValues) {
              console.log('Form submitted:', formValues);
              // Update column overrides based on form values
              if (formValues.selectedColumnKeys) {
                const newOverrides: Record<string, BAITableColumnOverrideItem> =
                  {};
                sampleColumns.forEach((col) => {
                  const key = col.key?.toString();
                  if (key) {
                    const shouldBeVisible =
                      formValues.selectedColumnKeys!.includes(key);
                    const defaultVisible = !col.defaultHidden;
                    if (shouldBeVisible !== defaultVisible) {
                      newOverrides[key] = { hidden: !shouldBeVisible };
                    }
                  }
                });
                setColumnOverrides(newOverrides);
              }
            }
          }}
          columns={sampleColumns}
          columnOverrides={columnOverrides}
        />
        <div style={{ marginTop: 16 }}>
          <h4>Current Column Overrides:</h4>
          <pre>{JSON.stringify(columnOverrides, null, 2)}</pre>
        </div>
      </div>
    );
  },
};

export const WithDisabledSorter: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Modal with disabled column reordering. The drag handles are hidden and drag functionality is disabled.',
      },
    },
  },
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div>
        <Button type="primary" onClick={() => setIsOpen(true)}>
          Open Column Settings (No Sorting)
        </Button>
        <BAITableSettingModal
          open={isOpen}
          onRequestClose={() => setIsOpen(false)}
          columns={sampleColumns}
          columnOverrides={{}}
          disableSorter={true}
        />
      </div>
    );
  },
};

export const WithPresetOverrides: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Modal with preset column overrides. Some columns are hidden by default, others are shown despite being marked as defaultHidden.',
      },
    },
  },
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    const presetOverrides = {
      age: { hidden: true }, // Hide age column
      department: { hidden: false }, // Show department (overrides defaultHidden)
      email: { hidden: false }, // Show email (overrides defaultHidden)
    };

    return (
      <div>
        <Button type="primary" onClick={() => setIsOpen(true)}>
          Open Column Settings (With Presets)
        </Button>
        <BAITableSettingModal
          open={isOpen}
          onRequestClose={(formValues) => {
            setIsOpen(false);
            if (formValues) {
              console.log('Form submitted with presets:', formValues);
            }
          }}
          columns={sampleColumns}
          columnOverrides={presetOverrides}
        />
        <div style={{ marginTop: 16 }}>
          <h4>Preset Column Overrides:</h4>
          <pre>{JSON.stringify(presetOverrides, null, 2)}</pre>
        </div>
      </div>
    );
  },
};

export const WithInitialColumnOrder: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Modal with custom initial column order. Columns are arranged in a specific order different from their definition order.',
      },
    },
  },
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    const customOrder = [
      'email',
      'name',
      'department',
      'age',
      'status',
      'address',
      'phone',
    ];

    return (
      <div>
        <Button type="primary" onClick={() => setIsOpen(true)}>
          Open Column Settings (Custom Order)
        </Button>
        <BAITableSettingModal
          open={isOpen}
          onRequestClose={(formValues) => {
            setIsOpen(false);
            if (formValues) {
              console.log('Form submitted with custom order:', formValues);
            }
          }}
          columns={sampleColumns}
          columnOverrides={{}}
          initialColumnOrder={customOrder}
        />
        <div style={{ marginTop: 16 }}>
          <h4>Initial Column Order:</h4>
          <pre>{JSON.stringify(customOrder, null, 2)}</pre>
        </div>
      </div>
    );
  },
};
