import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAICheckbox',
  displayName: 'BAI Checkbox',
  category: 'Data Input',
  keywords: [
    'checkbox',
    'check',
    'tick',
    'toggle',
    'boolean',
    'indeterminate',
    'form field',
  ],
  usage: {
    description:
      'The checkbox used inside Backend.AI forms. It renders Astryx CheckboxInput and adds two things the primitive cannot know about: it reads the surrounding FormItemInputContext so a field-level validation error actually paints the box (nothing else on the page knows the field errored), and it accepts the antd-shaped prop names the form engine injects — `checked` from `Form.Item valuePropName="checked"`, `children` as the inline label, `disabled` — mapping them onto Astryx `value`, `label` and `isDisabled`. `onChange` follows the Astryx signature `(checked, event)`, whose boolean first argument is exactly what rc-field-form stores. An instance with no visible label falls back to the translated generic accessible name rather than shipping an unnamed control.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Bind it through `Form.Item name={…} valuePropName="checked"` (or BAIBulkEditFormItem) and let the form own the value — the wrapper is built around that injection.',
      },
      {
        guidance: true,
        description:
          'Pass `label` whenever the meaning comes from a row or column header rather than from text next to the box, so screen readers get the real name instead of the generic fallback.',
      },
      {
        guidance: true,
        description:
          'Use `indeterminate` for a parent that is partly selected; it takes precedence over `checked` and `value` and renders the mixed state.',
      },
      {
        guidance: false,
        description:
          'Hand-paint an error state around it — the component reads the form item status itself and forwards it as the Astryx error status.',
      },
      {
        guidance: false,
        description:
          'Read `event.target.checked` in `onChange`; the boolean arrives as the first argument and the event is second.',
      },
    ],
  },
  props: [
    {
      name: 'checked',
      type: 'boolean',
      description:
        'The antd-shaped checked state. This is the name `Form.Item valuePropName="checked"` injects; it is mapped onto the Astryx value.',
    },
    {
      name: 'value',
      type: 'boolean',
      description:
        'The default form-engine value prop. Takes precedence over `checked` when both are present.',
    },
    {
      name: 'indeterminate',
      type: 'boolean',
      description:
        'Renders the mixed state, overriding `checked` and `value`. Use it for a parent checkbox over a partly selected set.',
    },
    {
      name: 'disabled',
      type: 'boolean',
      description: 'Blocks interaction; maps to the Astryx `isDisabled` prop.',
    },
    {
      name: 'children',
      type: 'ReactNode',
      description:
        'The antd-style inline label. It is flattened to text for the accessible name, so rich nodes lose their markup here.',
    },
    {
      name: 'label',
      type: 'string',
      description:
        'Explicit accessible name, used when there is no inline label. Without it — and without `children` — the control falls back to a translated generic name and hides the label.',
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description:
        'Keeps the label as the accessible name but removes it visually. Defaults to hidden whenever no inline label was supplied.',
    },
    {
      name: 'onChange',
      type: '(checked: boolean, e: ChangeEvent<HTMLInputElement>) => void',
      description:
        'Fired with the new boolean first and the DOM event second. The boolean is what the form engine stores.',
    },
    {
      name: 'className',
      type: 'string',
      description: 'Class forwarded to the underlying Astryx CheckboxInput.',
    },
    {
      name: 'style',
      type: 'React.CSSProperties',
      description:
        'Inline style forwarded to the underlying Astryx CheckboxInput.',
    },
  ],
  examples: [
    {
      label: 'Inside a form item',
      code: `<Form.Item
  name={key}
  valuePropName="checked"
  initialValue={grantedKeys.has(key)}
  style={{ marginBottom: 0 }}
>
  <BAICheckbox onChange={() => clearCellError(key)} />
</Form.Item>`,
    },
    {
      label: 'Standalone with an inline label',
      code: `<BAICheckbox
  checked={isAgreed}
  onChange={(checked) => setIsAgreed(checked)}
>
  {t('session.launcher.EnableCallback')}
</BAICheckbox>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
