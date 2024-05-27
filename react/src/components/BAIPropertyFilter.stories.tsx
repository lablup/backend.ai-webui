// BAIPropertyFilter.stories.tsx
import BAIPropertyFilter from './BAIPropertyFilter';
import { StoryObj, Meta } from '@storybook/react';
import { fn } from '@storybook/test';

export default {
  title: 'Backend.AI UI/BAIPropertyFilter',
  component: BAIPropertyFilter,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'centered',
  },
} as Meta;

type Story = StoryObj<typeof BAIPropertyFilter>;

export const Default: Story = {
  name: 'hello',
  args: {
    filterProperties: [
      {
        key: 'property1',
        defaultOperator: '==',
        propertyLabel: 'Property 1',
      },
      {
        key: 'property2',
        defaultOperator: '!=',
        propertyLabel: 'Property 2',
      },
      {
        key: 'property3',
        propertyLabel: 'Property 3',
      },
    ],
    onChange: fn(),
  },
};
