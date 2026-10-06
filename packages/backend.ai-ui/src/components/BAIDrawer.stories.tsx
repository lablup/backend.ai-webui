import BAIButton from './BAIButton';
import BAIComplexSelect, {
  type BAIComplexSelectOption,
  type BAIComplexSelectValue,
} from './BAIComplexSelect';
import BAIDrawer from './BAIDrawer';
import BAIFlex from './BAIFlex';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

const meta: Meta<typeof BAIDrawer> = {
  title: 'Overlay/BAIDrawer',
  component: BAIDrawer,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          "The project's drawer: ui-common's lab `Drawer` fork with a `[X] Title …… [extra]` header. A scrimmed drawer renders through `BAIDrawerPortal`, so a modal, select or drawer opened inside it stacks above it and Escape closes only the topmost layer.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BAIDrawer>;

const options: Array<BAIComplexSelectOption> = [
  { value: 'alice', label: 'alice@example.com', description: 'Alice Kim' },
  { value: 'bob', label: 'bob@example.com', description: 'Bob Lee' },
  { value: 'carol', label: 'carol@example.com', description: 'Carol Park' },
];

const OwnerSelect = () => {
  'use memo';
  const [value, setValue] = useState<BAIComplexSelectValue>(options[1]);
  return (
    <BAIComplexSelect
      label="Owner"
      options={options}
      value={value}
      onChange={setValue}
      allowClear
    />
  );
};

export const Default: Story = {
  render: (args) => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <BAIButton onClick={() => setOpen(true)}>Open drawer</BAIButton>
        <BAIDrawer
          {...args}
          open={open}
          onClose={() => setOpen(false)}
          extra={<BAIButton size="small">Refresh</BAIButton>}
        >
          <BAIFlex direction="column" align="stretch" gap="md">
            <OwnerSelect />
          </BAIFlex>
        </BAIDrawer>
      </>
    );
  },
  args: {
    title: 'Session details',
  },
};

export const WithFooter: Story = {
  render: (args) => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <BAIButton onClick={() => setOpen(true)}>Open drawer</BAIButton>
        <BAIDrawer
          {...args}
          open={open}
          onClose={() => setOpen(false)}
          footer={
            <BAIFlex justify="end" gap="sm">
              <BAIButton onClick={() => setOpen(false)}>Cancel</BAIButton>
              <BAIButton type="primary" onClick={() => setOpen(false)}>
                Save
              </BAIButton>
            </BAIFlex>
          }
        >
          <OwnerSelect />
        </BAIDrawer>
      </>
    );
  },
  args: {
    title: 'Edit session',
  },
};

export const Nested: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    const [innerOpen, setInnerOpen] = useState(false);
    return (
      <>
        <BAIButton onClick={() => setOpen(true)}>Open drawer</BAIButton>
        <BAIDrawer
          title="Outer drawer"
          open={open}
          onClose={() => setOpen(false)}
          size={560}
        >
          <BAIFlex direction="column" align="stretch" gap="md">
            <OwnerSelect />
            <BAIButton onClick={() => setInnerOpen(true)}>
              Open nested drawer
            </BAIButton>
          </BAIFlex>
          <BAIDrawer
            title="Nested drawer"
            open={innerOpen}
            onClose={() => setInnerOpen(false)}
          >
            <OwnerSelect />
          </BAIDrawer>
        </BAIDrawer>
      </>
    );
  },
};
