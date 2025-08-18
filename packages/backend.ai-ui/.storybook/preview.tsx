import type { Preview } from '@storybook/react-vite';
import { ConfigProvider, theme as antdTheme } from 'antd';
import React from 'react';

const preview: Preview = {
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ConfigProvider>
        <div style={{ padding: '16px' }}>
          <Story />
        </div>
      </ConfigProvider>
    ),
  ],
  parameters: {
    // Docs addon configuration
    docs: {
      extractComponentDescription: (_component: any, { notes }: any) => {
        return notes?.markdown || notes?.text || null;
      },
    },
    // Layout configuration
    layout: 'padded',
  },
};

export default preview;