/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Shared stories for the `BAI<X>` form-control re-exports (ADR 0014): each
 control shown inside a `Form.Item`, with an error status and a disabled form.
*/
import { Form } from '../form-engine';
import React from 'react';

type FormControlStoryVariant = 'basic' | 'error' | 'disabled';

interface FormControlStoryFrameProps {
  /** The `Form.Item` label, which also names the control. */
  label: string;
  initialValue?: unknown;
  /** `checked` for a checkbox or switch. */
  valuePropName?: string;
  variant?: FormControlStoryVariant;
  children: React.ReactElement;
}

const FormControlStoryFrame: React.FC<FormControlStoryFrameProps> = ({
  label,
  initialValue,
  valuePropName,
  variant = 'basic',
  children,
}) => {
  'use memo';
  return (
    <Form
      layout="vertical"
      initialValues={{ field: initialValue }}
      disabled={variant === 'disabled'}
      style={{ maxWidth: 400 }}
    >
      <Form.Item
        name="field"
        label={label}
        valuePropName={valuePropName}
        {...(variant === 'error'
          ? {
              validateStatus: 'error' as const,
              help: 'This value is not valid.',
            }
          : {})}
      >
        {children}
      </Form.Item>
    </Form>
  );
};

const VARIANTS: Array<{
  key: 'Default' | 'ErrorState' | 'DisabledState';
  name: string;
  variant: FormControlStoryVariant;
  story: string;
}> = [
  {
    key: 'Default',
    name: 'Basic',
    variant: 'basic',
    story:
      'Inside a Form.Item: the item supplies value, onChange and the accessible name, and the control fills the item row.',
  },
  {
    key: 'ErrorState',
    name: 'ErrorState',
    variant: 'error',
    story:
      "The Form.Item's validation status reaches the control as its border; the message stays the item's.",
  },
  {
    key: 'DisabledState',
    name: 'DisabledState',
    variant: 'disabled',
    story: '`<Form disabled>` disables the control through the Form.Item.',
  },
];

/** The Basic, ErrorState and DisabledState stories of one form control. */
export const formControlStories = (
  frame: Omit<FormControlStoryFrameProps, 'variant' | 'children'>,
  renderControl: () => React.ReactElement,
) =>
  Object.fromEntries(
    VARIANTS.map(({ key, name, variant, story }) => [
      key,
      {
        name,
        parameters: { docs: { description: { story } } },
        render: () => (
          <FormControlStoryFrame {...frame} variant={variant}>
            {renderControl()}
          </FormControlStoryFrame>
        ),
      },
    ]),
  ) as Record<
    'Default' | 'ErrorState' | 'DisabledState',
    {
      name: string;
      parameters: { docs: { description: { story: string } } };
      render: () => React.ReactElement;
    }
  >;

/** The component description every form-control story file shares. */
export const formControlDocsDescription = (
  baiName: string,
  uiCommonName: string,
  usage: string,
) => `
**${baiName}** is ui-common's \`${uiCommonName}\` under its BAI name, re-exported unchanged (ADR 0014): the same component and props.

## Features
- Form.Item-aware: value, onChange, disabled, validation status and the accessible name come from the item
- Fills the Form.Item row by default
- Import from \`backend.ai-ui\`; ESLint blocks \`${uiCommonName}\` from the ui-common subpath in \`react/\`

## Usage
\`\`\`tsx
${usage}
\`\`\`

## Props
ui-common's \`${uiCommonName}Props\`, unchanged. Run \`ui-common component ${uiCommonName}\` for the full list.
`;
