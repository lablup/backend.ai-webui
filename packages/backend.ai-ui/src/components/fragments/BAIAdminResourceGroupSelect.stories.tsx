import RelayResolver from '../../tests/RelayResolver';
import BAIAdminResourceGroupSelect from './BAIAdminResourceGroupSelect';
import { Meta, StoryObj } from '@storybook/react-vite/*';

type Story = StoryObj<typeof BAIAdminResourceGroupSelect>;

const meta: Meta<typeof BAIAdminResourceGroupSelect> = {
  title: 'Fragments/BAIAdminResourceGroupSelect',
  component: BAIAdminResourceGroupSelect,
  parameters: {
    layout: 'centered',
  },
};

export const Default: Story = {
  name: 'Default (3 items)',
  render: () => (
    <RelayResolver
      mockResolvers={{
        ScalingGroupV2Connection: () => ({
          count: 3,
          edges: [
            { node: { id: 'rg-1', name: 'default' } },
            { node: { id: 'rg-2', name: 'gpu-cluster' } },
            { node: { id: 'rg-3', name: 'cpu-only' } },
          ],
        }),
      }}
    >
      <div style={{ width: '300px' }}>
        <BAIAdminResourceGroupSelect />
      </div>
    </RelayResolver>
  ),
};

export const Empty: Story = {
  render: () => (
    <RelayResolver
      mockResolvers={{
        ScalingGroupV2Connection: () => ({
          count: 0,
          edges: [],
        }),
      }}
    >
      <div style={{ width: '300px' }}>
        <BAIAdminResourceGroupSelect />
      </div>
    </RelayResolver>
  ),
};

export const WithCustomPlaceholder: Story = {
  render: () => (
    <RelayResolver
      mockResolvers={{
        ScalingGroupV2Connection: () => ({
          count: 5,
          edges: [
            { node: { id: 'rg-1', name: 'development' } },
            { node: { id: 'rg-2', name: 'production' } },
            { node: { id: 'rg-3', name: 'staging' } },
            { node: { id: 'rg-4', name: 'testing' } },
            { node: { id: 'rg-5', name: 'demo' } },
          ],
        }),
      }}
    >
      <div style={{ width: '300px' }}>
        <BAIAdminResourceGroupSelect placeholder="Choose a resource group..." />
      </div>
    </RelayResolver>
  ),
};

export const Disabled: Story = {
  render: () => (
    <RelayResolver
      mockResolvers={{
        ScalingGroupV2Connection: () => ({
          count: 3,
          edges: [
            { node: { id: 'rg-1', name: 'default' } },
            { node: { id: 'rg-2', name: 'gpu-cluster' } },
            { node: { id: 'rg-3', name: 'cpu-only' } },
          ],
        }),
      }}
    >
      <div style={{ width: '300px' }}>
        <BAIAdminResourceGroupSelect disabled />
      </div>
    </RelayResolver>
  ),
};

export default meta;
