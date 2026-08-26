import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIUncontrolledInput',
  displayName: 'BAI Uncontrolled Input',
  category: 'Data Input',
  keywords: [
    'input',
    'text field',
    'textbox',
    'number input',
    'uncontrolled',
    'commit on enter',
    'blur',
  ],
  usage: {
    description:
      'A text or number field that reports its value only when the user finishes editing — on Enter or on blur — never on every keystroke. It renders Astryx `TextInput`, or `NumberInput` when `type` is `"number"`, and keeps the draft in local state because Astryx has no uncontrolled mode; changing `defaultValue` reseeds that draft and discards uncommitted edits. There is deliberately no `value` / `onChange` pair: the point of the component is that an expensive commit side effect (writing a theme token, persisting a setting) runs once per edit instead of once per character. Astryx requires an accessible name, so an absent `label` falls back to a translated generic that is visually hidden.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Do the persistence inside `onCommit` — that is the only moment the component reports a value.',
      },
      {
        guidance: true,
        description:
          'Pass `type="number"` for numeric settings so the field renders Astryx NumberInput with its own stepper rather than a text box holding digits.',
      },
      {
        guidance: true,
        description:
          'Give `label` whenever the field has no surrounding BAIFormItem or settings-row label, so the control is not left with the generic hidden name.',
      },
      {
        guidance: false,
        description:
          'Recompute `defaultValue` on every render from state that changes while the user types — each new value remounts the draft and throws away the edit in progress.',
      },
      {
        guidance: false,
        description:
          'Reach for it inside a BAIForm field that needs per-keystroke validation; use the form-bound Astryx text input there instead.',
      },
    ],
  },
  props: [
    {
      name: 'defaultValue',
      type: 'string',
      description:
        'Initial text. Changing it reseeds the internal draft, which discards any uncommitted edit — pass a value that only changes on an external update.',
    },
    {
      name: 'onCommit',
      type: '(value: string) => void',
      description:
        'Called with the current text when the user presses Enter or blurs the field. Always a string, including in number mode.',
    },
    {
      name: 'type',
      type: "'text' | 'number' | 'password' | 'email'",
      description:
        '`"number"` routes to Astryx NumberInput; `"password"` and `"email"` set the TextInput type, and anything else renders a plain text box.',
    },
    {
      name: 'placeholder',
      type: 'string',
      description: 'Empty-state text shown inside the field.',
    },
    {
      name: 'disabled',
      type: 'boolean',
      description:
        'Blocks interaction. Maps onto the Astryx `isDisabled` prop.',
    },
    {
      name: 'status',
      type: "'error' | 'warning' | ''",
      description:
        'Validation state in the antd spelling, reshaped into the Astryx status object. The empty string clears it.',
    },
    {
      name: 'label',
      type: 'string',
      description:
        'Accessible name for the field. Without it the component falls back to a translated generic and hides it, since the visible label usually lives on the surrounding form row.',
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description:
        'Whether the label is visually hidden. Defaults to hidden exactly when no `label` was given, so passing a real label also renders it.',
    },
    {
      name: 'style',
      type: 'CSSProperties',
      description: 'Inline style forwarded to the underlying Astryx input.',
    },
    {
      name: 'className',
      type: 'string',
      description: 'Class names forwarded to the underlying Astryx input.',
    },
  ],
  examples: [
    {
      label: 'Committing a setting on Enter or blur',
      code: `<BAIUncontrolledInput
  defaultValue={fontFamily}
  onCommit={(v) => {
    updateDefaultTheme('fontFamily', v || undefined);
  }}
  style={{ alignSelf: 'stretch' }}
/>`,
    },
    {
      label: 'Number field',
      code: `<BAIUncontrolledInput
  type="number"
  defaultValue={logoSizeConfig.width?.toString() ?? ''}
  onCommit={(v) => {
    updateDefaultTheme(\`\${sizeKey}.width\`, v ? Number(v) : undefined);
  }}
  style={{ maxWidth: 150 }}
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
