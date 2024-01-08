// Button.stories.ts|tsx
import DynamicStepInputNumber from './DynamicStepInputNumber';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof DynamicStepInputNumber> = {
  title: 'Input/DynamicStepInputNumber',
  component: DynamicStepInputNumber,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'centered',
  },
};

export default meta;

type Story = StoryObj<typeof DynamicStepInputNumber>;

export const MinMax: Story = {
  name: 'min 0, max 1028',
  args: {
    min: 0,
    max: 1028,
  },
};
