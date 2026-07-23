import BAIBackButton from './BAIBackButton';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

const meta: Meta<typeof BAIBackButton> = {
  title: 'Button/BAIBackButton',
  component: BAIBackButton,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**BAIBackButton** is a navigation button component that integrates with React Router.

## Features
- Uses \`useNavigate\` hook for programmatic navigation
- Displays left arrow icon (Lucide React)
- Text button style with transparent background

## Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`to\` | \`To\` | - | Target route path (string or location object) |
| \`options\` | \`NavigateOptions\` | - | React Router navigation options (replace, state, etc.) |

This is a BAI-specific component (not extending Ant Design).
        `,
      },
    },
  },
  argTypes: {
    to: {
      control: { type: 'text' },
      description: 'Target route path for navigation',
      table: {
        type: { summary: 'To (string | Partial<Path>)' },
      },
    },
    options: {
      control: false,
      description: 'React Router navigation options (replace, state, etc.)',
      table: {
        type: { summary: 'NavigateOptions' },
      },
    },
  },
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={['/current-page']}>
        <Routes>
          <Route path="/" element={<div>Home Page</div>} />
          <Route path="/current-page" element={<Story />} />
        </Routes>
      </MemoryRouter>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof BAIBackButton>;

export const Default: Story = {
  args: {
    to: '/',
  },
};
