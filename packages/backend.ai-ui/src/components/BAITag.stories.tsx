import BAIFlex from './BAIFlex';
import BAITag from './BAITag';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof BAITag> = {
  title: 'Tag/BAITag',
  component: BAITag,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**BAITag** keeps an [Ant Design Tag](https://ant.design/components/tag)-shaped prop surface (\`color\`, \`icon\`, \`closable\`, \`onClose\`, \`children\`) for call-site compatibility, but renders through Astryx \`Badge\` (or \`Token\` when \`closable\`) internally.

## Color Mapping
\`color\` is routed through a repo-global lookup (\`helper/astryxTagVariant\`) onto Astryx's closed \`Badge\`/\`Token\` variant enums — antd status presets (\`success\`/\`processing\`/\`error\`/\`warning\`) map to the matching semantic variant, and antd palette presets (\`blue\`, \`geekblue\`, \`magenta\`, ...) map onto the nearest Astryx hue.

This component has no additional props beyond the antd-shaped surface. Astryx's Badge appearance is closed and theme-owned (solid variants, not antd's transparent/outlined look — see \`BAITag.tsx\` for the full PILOT-DECISION history).
        `,
      },
    },
  },
  argTypes: {},
};

export default meta;
type Story = StoryObj<typeof BAITag>;

export const Default: Story = {
  args: {
    children: 'Default Tag',
  },
};

/*
 * This story originally rendered BAITag next to a raw `antd` `Tag` for visual
 * comparison. Now that `antd` is uninstalled entirely there is nothing left
 * to render on the "original" side, so the story instead demonstrates the
 * `color` mapping breadth: antd status presets alongside antd palette
 * presets that fold onto a neighbouring Astryx hue (see `astryxTagVariant.ts`
 * — `geekblue` -> `blue`, `magenta` -> `pink`).
 */
export const ColorMapping: Story = {
  name: 'Color Mapping (status + palette presets)',
  parameters: {
    docs: {
      description: {
        story:
          "BAITag keeps antd's `color` values working — status presets render their matching semantic Badge variant, and palette presets (including ones with no direct Astryx hue, like `geekblue`/`magenta`) fold onto the nearest supported variant via the shared `astryxTagVariant` lookup.",
      },
    },
  },
  render: () => (
    <BAIFlex direction="column" gap="lg">
      <BAIFlex direction="column" gap="sm">
        <strong>Status presets</strong>
        <BAIFlex gap="sm" wrap="wrap">
          <BAITag>Default</BAITag>
          <BAITag color="success">Success</BAITag>
          <BAITag color="processing">Processing</BAITag>
          <BAITag color="error">Error</BAITag>
          <BAITag color="warning">Warning</BAITag>
        </BAIFlex>
      </BAIFlex>
      <BAIFlex direction="column" gap="sm">
        <strong>Palette presets (including non-Astryx hues)</strong>
        <BAIFlex gap="sm" wrap="wrap">
          <BAITag color="blue">blue</BAITag>
          <BAITag color="geekblue">geekblue → blue</BAITag>
          <BAITag color="magenta">magenta → pink</BAITag>
          <BAITag color="cyan">cyan</BAITag>
          <BAITag color="purple">purple</BAITag>
        </BAIFlex>
      </BAIFlex>
    </BAIFlex>
  ),
};
