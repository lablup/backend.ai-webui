import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIColorPicker',
  displayName: 'BAI Color Picker',
  category: 'Data Input',
  keywords: [
    'color picker',
    'colour',
    'swatch',
    'hex',
    'palette',
    'theme color',
    'accent',
  ],
  usage: {
    description:
      'A hex colour field for theme and branding settings. Astryx ships no colour picker, so this one is composed here: an Astryx `Popover` holds the platform\'s native `<input type="color">` for the colour area, an Astryx `TextInput` for the hex value and an optional clear `Button`, while the trigger is a swatch button styled by `BAIColorPicker.css`. The value is a `#rrggbb` string on both edges — anything `toHexColor` can normalise (`#rgb`, `#rrggbbaa`, `rgb()`, `rgba()`) is accepted in, and `onChangeComplete` always emits six-digit hex. It is deliberately narrow: no gradient canvas, no preset palettes, no alpha and no format switch.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Treat `onChangeComplete` as the settled value — it fires on the native `change` event, on a complete typed hex, and on Enter, never on every pointer move during a drag, so it is safe to rebuild a theme from it.',
      },
      {
        guidance: true,
        description:
          'Pair `allowClear` with `onClear` when the colour is an optional override; closing the popover commits nothing, so a cleared value stays cleared.',
      },
      {
        guidance: true,
        description:
          'Give the trigger a `label` when the picker sits in a grid of several colours, since the visible caption beside it is not wired up as an accessible name.',
      },
      {
        guidance: false,
        description:
          'Expect an alpha channel — an eight-digit value is truncated to its RGB half on the way in and alpha never comes back out.',
      },
      {
        guidance: false,
        description:
          'Assume an unparseable `value` paints something; it renders the "unset" checkerboard swatch instead of silently falling back to black.',
      },
    ],
  },
  props: [
    {
      name: 'value',
      type: 'string | null',
      description:
        'Current colour. Hex, `rgb()` / `rgba()` or a three-digit shorthand are all normalised; anything else renders as unset.',
    },
    {
      name: 'onChangeComplete',
      type: '(hex: string) => void',
      description:
        'Called with a `#rrggbb` string when the user settles on a colour. Skipped when the new value normalises to the value already held.',
    },
    {
      name: 'showText',
      type: 'boolean',
      description:
        'Renders the hex string next to the swatch on the trigger, or a "no colour" label when unset. It also becomes the trigger\'s visible text, so no `aria-label` is applied in that case.',
    },
    {
      name: 'allowClear',
      type: 'boolean',
      description:
        'Adds a clear action inside the popover. Choosing it calls `onClear` and closes the popover without emitting a colour.',
    },
    {
      name: 'onClear',
      type: '() => void',
      description:
        'Called when the clear action is used. Reset the stored colour here; the component does not emit `onChangeComplete` for a clear.',
    },
    {
      name: 'disabled',
      type: 'boolean',
      description:
        'Disables the trigger, the colour area, the hex field and the clear button together.',
    },
    {
      name: 'label',
      type: 'string',
      description:
        'Accessible name for the trigger, the popover and the colour area. Falls back to a generic "select colour" string.',
    },
    {
      name: 'style',
      type: 'CSSProperties',
      description:
        'Applied to the trigger button — typically a `minWidth` so a row of pickers keeps a stable width as the hex text changes.',
    },
    {
      name: 'data-testid',
      type: 'string',
      description:
        'Test id for the trigger. The colour area, hex field, clear button and value text derive `-area`, `-hex`, `-clear` and `-value` suffixes from it.',
    },
  ],
  examples: [
    {
      label: 'Theme colour field with the hex shown',
      code: `<BAIColorPicker
  showText
  label={label}
  style={{ minWidth: 110 }}
  value={color}
  onChangeComplete={setColor}
/>`,
    },
    {
      label: 'Clearable accent colour',
      code: `<BAIColorPicker
  value={accentColor}
  allowClear
  onClear={() => setAccentColor(null)}
  onChangeComplete={(hex) => setAccentColor(hex)}
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
